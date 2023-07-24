import { Video, VideoStatus } from "../types.mts"

import { getVideo } from "./getVideo.mts"

export const getVideoStatus = async (video: Video): Promise<VideoStatus> => {
  try {
    const { status } = await getVideo(video.ownerId, video.id)
    return status
  } catch (err) {
    console.log(`failed to get the video status.. weird`)
  }
  return "unknown"
}