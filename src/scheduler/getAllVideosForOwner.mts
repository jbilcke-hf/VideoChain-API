import { Video } from "../types.mts"
import { getCompletedVideos } from "./getCompletedVideos.mts"
import { getPendingVideos } from "./getPendingVideos.mts"

export const getAllVideosForOwner = async (ownerId: string): Promise<Video[]> => {
  const pendingVideos = await getPendingVideos(ownerId)
  const completedVideos = await getCompletedVideos(ownerId)
  return [...pendingVideos, ...completedVideos]
}