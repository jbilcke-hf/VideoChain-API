import { Video } from "../types.mts"
import { deleteVideo } from "./deleteVideo.mts"
import { getVideoStatus } from "./getVideoStatus.mts"
import { saveCompletedVideo } from "./saveCompletedVideo.mts"
import { updatePendingVideo } from "./updatePendingVideo.mts"

export const saveAndCheckIfNeedToStop = async (video: Video): Promise<boolean> => {
  
  const status = await getVideoStatus(video)
  const isToDelete =  status === "delete"
  const isToAbort = status === "abort"
  const isToPause = status === "pause"

  // well, normally no other process is supported to mark a video as "completed"
  // while we are busy processing it
  // but maybe in the future, we can afford to waste procesing power to do the "who goes faster"..?
  // const isCompleted = status === "completed"
  
  const mustStop = isToAbort || isToPause || isToDelete

  // deletion is the most priority check, as we just need to ignore all the rest
  if (isToDelete) {
    await deleteVideo(video.ownerId, video.id)
    return mustStop
  }

  // then we give priority to the pending video: maybe it is done?
  if (video.completed) {
    console.log(`video ${video.id} is completed!`)
    video.progressPercent = 100
    video.completedAt = new Date().toISOString()
    video.status = "completed"
    await updatePendingVideo(video)
    await saveCompletedVideo(video)
    return mustStop
  }


  if (isToPause) {
    console.log(`we've been requested to pause the video`)
    video.status = "pause"
    await updatePendingVideo(video)
    return mustStop
  }
  
  if (isToAbort) {
    console.log(`we've been requested to cancel the video`)
    
    // we are not going to update the percentage, because we want to keep the
    // info that we aborted mid-course
    video.completed = true

    // watch what we do here: we mark the video as completed
    // that's because "abort" is a temporary status
    video.status = "completed"

    video.completedAt = new Date().toISOString()
    await updatePendingVideo(video)
    await saveCompletedVideo(video)

    return mustStop
  }

  await updatePendingVideo(video)
  
  // if we return "true", it means we will yield, which can be an interesting thing
  // for us, to increase parallelism
  return true
}
