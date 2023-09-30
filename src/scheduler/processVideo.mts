import { v4 as uuidv4 } from "uuid"

import { Video, VideoShot } from "../types.mts"

import { generateVideo } from "../providers/video-generation/generateVideo.mts"
import { upscaleVideo } from "../providers/video-upscaling/upscaleVideo.mts"
import { interpolateVideo } from "../providers/video-interpolation/interpolateVideo.mts"
import { postInterpolation } from "../production/postInterpolation.mts"
import { generateAudio } from "../providers/audio-generation/generateAudio.mts"
import { addAudioToVideo } from "../utils/video/addAudioToVideo.mts"

import { downloadFileToTmp } from "../utils/download/downloadFileToTmp.mts"
import { copyVideoFromTmpToPending } from "./copyVideoFromTmpToPending.mts"

import { saveAndCheckIfNeedToStop } from "./saveAndCheckIfNeedToStop.mts"

import { updateShotPreview } from "./updateShotPreview.mts"
import { enrichVideoSpecsUsingLLM } from "../providers/language-model/enrichVideoSpecsUsingLLM.mts"

export const processVideo = async (video: Video) => {

  // just a an additional precaution, for consistency and robustness
  if (["pause", "completed", "abort", "delete"].includes(video.status)) { return }

  console.log(`processing video video ${video.id}`)

  // always count 2 more steps: 1 for the LLM, 1 for the final assembly

  let nbTotalSteps = 2

  for (const shot of video.shots) {
    nbTotalSteps += shot.nbTotalSteps
  }

  let nbCompletedSteps = 0

  if (!video.hasGeneratedSpecs) {
    try {
      await enrichVideoSpecsUsingLLM(video)
    } catch (err) {
      console.error(`LLM error: ${err}`)
      video.error = `LLM error: ${err}`
      video.status = "delete"
      if (await saveAndCheckIfNeedToStop(video)) { return }
    }

    nbCompletedSteps++
    video.hasGeneratedSpecs = true
    video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

    if (await saveAndCheckIfNeedToStop(video)) { return }
  }


  for (const shot of video.shots) {
    nbCompletedSteps += shot.nbCompletedSteps

    // skip shots completed previously
    if (shot.completed) {
      continue
    }

    console.log(`need to complete shot ${shot.id}`)

    // currenty we cannot generate too many frames at once,
    // otherwise the upscaler will have trouble

    // so for now, we fix it to 24 frames
    // const nbFramesForBaseModel = Math.min(3, Math.max(1, Math.round(duration))) * 8
    const nbFramesForBaseModel = 24


    if (!shot.hasGeneratedPreview) {
      console.log("generating a preview of the final result..")
      let generatedPreviewVideoUrl = ""
      try {
        generatedPreviewVideoUrl = await generateVideo(shot.shotPrompt, {
          seed: shot.seed,
          nbFrames: nbFramesForBaseModel,
          nbSteps: 10, // for the preview, we only give a rough approximation
        })

        console.log("downloading preview video..")

        // download to /tmp
        await downloadFileToTmp(generatedPreviewVideoUrl, shot.fileName)

        await copyVideoFromTmpToPending(shot.fileName)

        shot.hasGeneratedPreview = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)
       
        await updateShotPreview(video, shot)
    
        if (await saveAndCheckIfNeedToStop(video)) { return }
      } catch (err) {
        console.error(`failed to generate preview for shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        video.error = `failed to generate preview for shot ${shot.id} (will try again later)`
        if (await saveAndCheckIfNeedToStop(video)) { return }

        // always try to yield whenever possible
        return
      }

    }

    const notAllShotsHavePreview = video.shots.some(s => !s.hasGeneratedPreview)

    if (notAllShotsHavePreview) {
      console.log(`step 2 isn't unlocked yet, because not all videos have generated preview`)
      continue
    }

    if (!shot.hasGeneratedVideo) {
      console.log("generating primordial pixel soup (raw video)..")
      let generatedVideoUrl = ""


      const nbFramesForBaseModel = 24

      try {
        generatedVideoUrl = await generateVideo(shot.shotPrompt, {
          seed: shot.seed,
          nbFrames: nbFramesForBaseModel,
          nbSteps: shot.steps,
        })

        console.log("downloading video..")

        await downloadFileToTmp(generatedVideoUrl, shot.fileName)

        await copyVideoFromTmpToPending(shot.fileName)

        shot.hasGeneratedVideo = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

        await updateShotPreview(video, shot)

        if (await saveAndCheckIfNeedToStop(video)) { return }
      } catch (err) {
        console.error(`failed to generate shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        video.error = `failed to generate shot ${shot.id} (will try again later)`
        if (await saveAndCheckIfNeedToStop(video)) { return }

        break
      }

    }

    if (!shot.hasUpscaledVideo) {
      console.log("upscaling video..")
      try {
        await upscaleVideo(shot.fileName, shot.shotPrompt)

        shot.hasUpscaledVideo = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)
        
        await updateShotPreview(video, shot)
    
        if (await saveAndCheckIfNeedToStop(video)) { return }

      } catch (err) {
        console.error(`failed to upscale shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        video.error = `failed to upscale shot ${shot.id} (will try again later)`
        if (await saveAndCheckIfNeedToStop(video)) { return }

        break
      }
    }

    if (!shot.hasInterpolatedVideo) {
      console.log("interpolating video..")
      // ATTENTION 1:
      // the interpolation step always create a SLOW MOTION video
      // it means it can last a lot longer (eg. 2x, 3x, 4x.. longer)
      // than the duration generated by the original video model
  
      // ATTENTION 2:
      // the interpolation step generates videos in 910x512!
  
      // ATTENTION 3:
      // the interpolation step parameters are currently not passed to the space,
      // so changing those two variables below will have no effect!
      const interpolationSteps = 2
      const interpolatedFramesPerSecond = 30
      console.log('creating slow-mo video (910x512 @ 30 FPS)')
      try {
        await interpolateVideo(
          shot.fileName,
          interpolationSteps,
          interpolatedFramesPerSecond
        )

        shot.hasInterpolatedVideo = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)


        // note: showing the intermediary result isn't very interesting here 

        // with our current interpolation settings, the 3 seconds video generated by the model
        // become a 7 seconds video, at 30 FPS
      
        // so we want to scale it back to the desired duration length
        // also, as a last trick we want to upscale it (without AI) and add some FXs
        console.log('performing final scaling (1280x720 @ 30 FPS)')

        try {
          await postInterpolation(shot.fileName, shot.durationMs, shot.fps, shot.noiseAmount)
      
          shot.hasPostProcessedVideo = true
          shot.nbCompletedSteps++
          nbCompletedSteps++
          shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
          video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

          await updateShotPreview(video, shot)
      
          if (await saveAndCheckIfNeedToStop(video)) { return }
        } catch (err) {
          throw err
        }
      } catch (err) {
        console.error(`failed to interpolate and post-process shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        video.error = `failed to interpolate and shot ${shot.id} (will try again later)`
        if (await saveAndCheckIfNeedToStop(video)) { return }
        break
      }
    }


    let foregroundAudioFileName = `${video.ownerId}_${video.id}_${shot.id}_${uuidv4()}.m4a`

    if (!shot.hasGeneratedForegroundAudio) {
      if (shot.foregroundAudioPrompt) {
        console.log("generating foreground audio..")
    
        try {
          await generateAudio(shot.foregroundAudioPrompt, foregroundAudioFileName)

          shot.hasGeneratedForegroundAudio = true
          shot.nbCompletedSteps++
          nbCompletedSteps++
          shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
          video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

          await addAudioToVideo(shot.fileName, foregroundAudioFileName)

          await updateShotPreview(video, shot)

          if (await saveAndCheckIfNeedToStop(video)) { return }

        } catch (err) {
          console.error(`failed to generate foreground audio for ${shot.id} (${err})`)
          // something is wrong, let's put the whole thing back into the queue
          video.error = `failed to generate foreground audio ${shot.id} (will try again later)`
          if (await saveAndCheckIfNeedToStop(video)) { return }
          break
        }
      } else {
        shot.hasGeneratedForegroundAudio = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        video.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)
        if (await saveAndCheckIfNeedToStop(video)) { return }
      }
    }

    shot.completed = true
    shot.completedAt = new Date().toISOString()
    shot.progressPercent = 100

    video.nbCompletedShots++

    if (await saveAndCheckIfNeedToStop(video)) { return }
  }

  console.log(`end of the loop:`)
  console.log(`nb completed shots: ${video.nbCompletedShots}`)
  console.log(`len of the shot array: ${video.shots.length}`)
  
  // now time to check the end game


  if (video.nbCompletedShots === video.shots.length) {
    console.log(`we have finished each individual shot!`)

    if (!video.hasAssembledVideo) {
      video.hasAssembledVideo = true
    }
    /*
    console.log(`assembling the final..`)
    console.log(`note: this might be redundant..`)
  
    if (!video.hasAssembledVideo) {
      video.hasAssembledVideo = true
    if (video.shots.length === 1) {
      console.log(`we only have one shot, so this gonna be easy`)
      video.hasAssembledVideo = true

      // the single shot (so, the first) becomes the final movie
      await copyVideoFromPendingToCompleted(video.shots[0].fileName, video.fileName)

      if (await saveAndCheckIfNeedToStop(video)) { return }
    } else {
        console.log(`assembling ${video.shots.length} shots together, might take a while`)
        try {
          await assembleShots(video.shots, video.fileName)
          console.log(`finished assembling the ${video.shots.length} shots together!`)

          await copyVideoFromPendingToCompleted(video.fileName)

          video.hasAssembledVideo = true

          if (await saveAndCheckIfNeedToStop(video)) { return }
        } catch (err) {
          console.error(`failed to assemble the shots together (${err})`)
          // something is wrong, let's put the whole thing back into the queue
          video.error = `failed to assemble the shots together (will try again later)`
          if (await saveAndCheckIfNeedToStop(video)) { return }
        }
      }
    }
    */

    nbCompletedSteps++
    video.completed = true
    if (await saveAndCheckIfNeedToStop(video)) { return }
  }
}