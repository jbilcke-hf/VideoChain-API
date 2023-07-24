import { updatePendingVideo } from "./updatePendingVideo.mts"
import { getVideo } from "./getVideo.mts"

export const markVideoAsToPause = async (ownerId: string, videoId: string) => {
  try {
    const video = await getVideo(ownerId, videoId)
    if (video.status === "abort" ) {
      console.log(`cannot pause: video ${videoId} is being aborted`)
    } else if (video.status === "completed") {
      console.log(`cannot pause: video ${videoId} is completed`)
    } else if (video.status === "delete") {
      console.log(`cannot pause: video ${videoId} is marked for deletion`)
    } else if (video.status === "pause") {
      console.log(`video ${videoId} is already paused`)
    } {
      video.status = "pause"
      await updatePendingVideo(video)
      return true
    }
  } catch (err) {
    console.error(`failed to mark video as paused ${videoId}`)
  }
  return false
}