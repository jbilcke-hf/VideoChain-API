import { saveCompletedTask } from "../database/saveCompletedTask.mts";
import { savePendingTask } from "../database/savePendingTask.mts";
import { updatePendingTask } from "../database/updatePendingTask.mts";
import { VideoTask } from "../types.mts";
import { downloadVideo } from "./downloadVideo.mts";
import { generateVideo } from "./generateVideo.mts";

export const processTask = async (task: VideoTask) => {
  console.log(`processing video task ${task.id}`)

  // something isn't right, the task is already completed
  if (task.completed) {
    console.log(`video task ${task.id} is already completed`)
    await saveCompletedTask(task)
    return
  }

  let nbCompletedShots = 0
  for (const shot of task.shots) {
    // skip completed shots
    if (shot.completed) {
      nbCompletedShots++
      continue
    }

    console.log(`need to complete shot ${shot.id}`)

    const shotFileName = `${shot.id}.mp4`

    if (!shot.hasGeneratedVideo) {
      console.log("generating primordial pixel soup (raw video)..")
      let generatedVideoUrl = ""

      // currenty we cannot generate too many frames at once,
      // otherwise the upscaler will have trouble

      // so for now, we fix it to 24 frames
      // const nbFramesForBaseModel = Math.min(3, Math.max(1, Math.round(duration))) * 8
      const nbFramesForBaseModel = 24

      try {
        generatedVideoUrl = await generateVideo(shot.shotPrompt, {
          seed: shot.seed,
          nbFrames: nbFramesForBaseModel,
          nbSteps: shot.steps,
        })

        console.log("downloading video..")

        await downloadVideo(generatedVideoUrl, shotFileName)

      } catch (err) {
        // something is wrong, let's put the whole thing back into the queue
        task.error = `failed to generate shot ${shot.id} (will try again later)`
        await updatePendingTask(task)
        break
      }

      
    }

    if (!shot.hasUpscaledVideo) {

    }

  }

}