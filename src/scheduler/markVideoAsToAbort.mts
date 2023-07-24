import { updatePendingVideo } from "./updatePendingVideo.mts"
import { getVideo } from "./getVideo.mts"

export const markVideoAsToAbort = async (ownerId: string, videoId: string) => {
  try {
    const video = await getVideo(ownerId, videoId)
    if (video.status === "abort" ) {
      console.log(`video ${videoId} is already aborted`)
    } else if (video.status === "delete") {
      console.log(`cannot abort: video ${videoId} is marked for deletion`)
    }  else if (video.status === "completed") {
      console.log(`cannot abort: video ${videoId} is completed`)
    } {
      video.status = "abort"
      await updatePendingVideo(video)
      return true
    }
  } catch (err) {
    console.error(`failed to abort video ${videoId}`)
  }
  return false
}