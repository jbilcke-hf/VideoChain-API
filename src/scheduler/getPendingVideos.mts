import { Video } from "../types.mts"
import { pendingMetadataDirFilePath } from "../config.mts"
import { readVideoMetadataFiles } from "./readVideoMetadataFiles.mts"

export const getPendingVideos = async (ownerId?: string): Promise<Video[]> => {
  const pendingVideos = await readVideoMetadataFiles(pendingMetadataDirFilePath, ownerId)

  return pendingVideos
}