import { updatePendingVideo } from "./updatePendingVideo.mts"
import { getVideo } from "./getVideo.mts"

export const markVideoAsPending = async (ownerId: string, videoId: string) => {
  try {
    const video = await getVideo(ownerId, videoId)
    if (video.status === "abort" ) {
      // actually, if we wanted to, we could ressurect it..
      console.log(`cannot mark video as pending: video ${videoId} is aborted`)
    } else if (video.status === "completed") {
      console.log(`video ${videoId} is already completed`)
    } else if (video.status === "delete") {
      console.log(`cannot mark video as pending: video ${videoId} is marked for deletion`)
    } else if (video.status === "pending") {
      console.log(`video ${videoId} is already pending`)
    } {
      video.status = "pending"
      await updatePendingVideo(video)
      return true
    }
  } catch (err) {
    console.error(`failed to mark video as pending ${videoId}`)
  }
  return false
}