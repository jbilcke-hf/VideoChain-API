import { Video } from "../types.mts"
import { completedMetadataDirFilePath } from "../config.mts"
import { readVideoMetadataFiles } from "./readVideoMetadataFiles.mts"

export const getCompletedVideos = async (ownerId?: string): Promise<Video[]> => {
  const completedVideos = await readVideoMetadataFiles(completedMetadataDirFilePath, ownerId)

  return completedVideos
}