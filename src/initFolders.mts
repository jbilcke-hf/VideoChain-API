import {
  metadataDirPath,
  pendingMetadataDirFilePath,
  completedMetadataDirFilePath,
  filesDirPath,
  pendingFilesDirFilePath,
  completedFilesDirFilePath
} from "./config.mts"
import { createDirIfNeeded } from "./utils/createDirIfNeeded.mts"

export const initFolders = () => {
  console.log(`initializing folders..`)
  createDirIfNeeded(metadataDirPath)
  createDirIfNeeded(pendingMetadataDirFilePath)
  createDirIfNeeded(completedMetadataDirFilePath)
  createDirIfNeeded(filesDirPath)
  createDirIfNeeded(pendingFilesDirFilePath)
  createDirIfNeeded(completedFilesDirFilePath)
}