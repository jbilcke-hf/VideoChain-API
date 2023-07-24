import { updatePendingVideo } from "./updatePendingVideo.mts"
import { getVideo } from "./getVideo.mts"
import { deleteVideo } from "./deleteVideo.mts"

export const markVideoAsToDelete = async (ownerId: string, videoId: string) => {
  try {
    const video = await getVideo(ownerId, videoId)
    if (video.status === "delete" ) {
      console.log(`video ${videoId} is already marked for deletion`)
    } else if (video.status === "completed" ) {
      console.log(`video ${videoId} is completed: we can delete immediately`)
      await deleteVideo(ownerId, videoId)
      return true
    } else {
      video.status = "delete"
      await updatePendingVideo(video)
      return true
    }
  } catch (err) {
    console.error(`failed to delete video ${videoId}`)
  }
  return false
}