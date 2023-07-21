import { saveCompletedTask } from "./saveCompletedTask.mts"
import { savePendingTask } from "./savePendingTask.mts"
import { updatePendingTask } from "./updatePendingTask.mts"
import { VideoShot, VideoTask } from "../types.mts"
import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"
import { generateVideo } from "../production/generateVideo.mts"
import { copyVideoFromTmpToPending } from "../utils/copyVideoFromTmpToPending.mts"
import { copyVideoFromTmpToCompleted } from "../utils/copyVideoFromTmpToCompleted.mts"
import { upscaleVideo } from "../production/upscaleVideo.mts"
import { interpolateVideo } from "../production/interpolateVideo.mts"
import { postInterpolation } from "../production/postInterpolation.mts"
import { moveVideoFromPendingToCompleted } from "../utils/moveVideoFromPendingToCompleted.mts"
import { assembleShots } from "../production/assembleShots.mts"
import { copyVideoFromPendingToCompleted } from "../utils/copyVideoFromPendingToCompleted.mts"

export const processTask = async (task: VideoTask) => {
  console.log(`processing video task ${task.id}`)

  // something isn't right, the task is already completed
  if (task.completed) {
    console.log(`video task ${task.id} is already completed`)
    await saveCompletedTask(task)
    return
  }

  // always count 1 more step, for the final assembly

  let nbTotalSteps = 1

  for (const shot of task.shots) {
    nbTotalSteps += shot.nbTotalSteps
  }

  let nbCompletedSteps = 0

  for (const shot of task.shots) {
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

        await copyVideoFromPendingToCompleted(shot.fileName, task.fileName)

        shot.hasGeneratedPreview = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        task.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

        await updatePendingTask(task)

      } catch (err) {
        console.error(`failed to generate preview for shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to generate preview for shot ${shot.id} (will try again later)`
        await updatePendingTask(task)
        break
      }

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
        task.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

        await copyVideoFromPendingToCompleted(shot.fileName, task.fileName)

        await updatePendingTask(task)
      } catch (err) {
        console.error(`failed to generate shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to generate shot ${shot.id} (will try again later)`
        await updatePendingTask(task)
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
        task.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

        await copyVideoFromPendingToCompleted(shot.fileName, task.fileName)

        await updatePendingTask(task)
      } catch (err) {
        console.error(`failed to upscale shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to upscale shot ${shot.id} (will try again later)`
        await updatePendingTask(task)
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
      const interpolationSteps = 3
      const interpolatedFramesPerSecond = 24
      console.log('creating slow-mo video (910x512 @ 24 FPS)')
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
        task.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

        await copyVideoFromPendingToCompleted(shot.fileName, task.fileName)

        await updatePendingTask(task)

      } catch (err) {
        console.error(`failed to interpolate shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to interpolate shot ${shot.id} (will try again later)`
        await updatePendingTask(task)
        break
      }
    }

      
    if (!shot.hasPostProcessedVideo) {
      console.log("post-processing video..")
     
    // with our current interpolation settings, the 3 seconds video generated by the model
    // become a 7 seconds video, at 24 FPS
  
    // so we want to scale it back to the desired duration length
    // also, as a last trick we want to upscale it (without AI) and add some FXs
    console.log('performing final scaling (1280x720 @ 24 FPS)')

      try {
        await postInterpolation(shot.fileName, shot.durationMs, shot.fps)
    
        shot.hasPostProcessedVideo = true
        shot.nbCompletedSteps++
        nbCompletedSteps++
        shot.progressPercent = Math.round((shot.nbCompletedSteps / shot.nbTotalSteps) * 100)
        task.progressPercent = Math.round((nbCompletedSteps / nbTotalSteps) * 100)

        await copyVideoFromPendingToCompleted(shot.fileName, task.fileName)

        await updatePendingTask(task)
      } catch (err) {
        console.error(`failed to post-process shot ${shot.id} (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to post-process shot ${shot.id} (will try again later)`
        await updatePendingTask(task)
        break
      }
    }

    shot.completed = true
    shot.completedAt = new Date().toISOString()
    shot.progressPercent = 100

    task.nbCompletedShots++

    await updatePendingTask(task)
  }

  console.log(`end of the loop:`)
  console.log(`nb completed shots: ${task.nbCompletedShots}`)
  console.log(`len of the shot array: ${task.shots.length}`)
  
  if (task.nbCompletedShots === task.shots.length) {
    console.log(`we have completed the whole video sequence!`)
    console.log(`assembling the video..`)

    if (task.shots.length === 1) {
      console.log(`we only have one shot, so this gonna be easy`)
      task.hasAssembledVideo = true

      // the single shot (so, the first) becomes the final movie
      await moveVideoFromPendingToCompleted(task.shots[0].fileName, task.fileName)

      await updatePendingTask(task)
    }

    if (!task.hasAssembledVideo) {
      console.log(`assembling the ${task.shots.length} shots together (might take a while)`)
      try {
        await assembleShots(task.shots, task.fileName)
        console.log(`finished assembling the ${task.shots.length} shots together!`)

        await moveVideoFromPendingToCompleted(task.fileName)

        task.hasAssembledVideo = true

        await updatePendingTask(task)
      } catch (err) {
        console.error(`failed to assemble the shots together (${err})`)
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to assemble the shots together (will try again later)`
        await updatePendingTask(task)
        return
      }
    }

    nbCompletedSteps++
    task.progressPercent = 100
    task.completed = true
    task.completedAt = new Date().toISOString()
    await updatePendingTask(task)

    console.log(`moving task to completed tasks..`)
    await saveCompletedTask(task)
  }
}