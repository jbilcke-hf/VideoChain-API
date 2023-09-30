import {
  metadataDirPath,
  pendingMetadataDirFilePath,
  completedMetadataDirFilePath,
  filesDirPath,
  pendingFilesDirFilePath,
  completedFilesDirFilePath,
  cacheDirPath,
  renderedDirFilePath
} from "../../config.mts"
import { createDirIfNeeded } from "./createDirIfNeeded.mts"

export const initFolders = () => {
  console.log(`initializing folders..`)
  createDirIfNeeded(metadataDirPath)
  createDirIfNeeded(pendingMetadataDirFilePath)
  createDirIfNeeded(completedMetadataDirFilePath)
  createDirIfNeeded(filesDirPath)
  createDirIfNeeded(pendingFilesDirFilePath)
  createDirIfNeeded(completedFilesDirFilePath)
  createDirIfNeeded(cacheDirPath)
  createDirIfNeeded(renderedDirFilePath)
}