import path from "path"

import { Video } from "../types.mts"
import { completedMetadataDirFilePath, pendingMetadataDirFilePath } from "../config.mts"
import { moveFile } from "../utils/filesystem/moveFile.mts"

export const saveCompletedVideo = async (video: Video) => {
  const metadataFileName = `${video.ownerId}_${video.id}.json`
  const pendingMetadataFilePath = path.join(pendingMetadataDirFilePath, metadataFileName)
  const completedMetadataFilePath = path.join(completedMetadataDirFilePath, metadataFileName)
  await moveFile(pendingMetadataFilePath, completedMetadataFilePath)
}