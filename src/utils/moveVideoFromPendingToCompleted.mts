import path from "path"

import { completedFilesDirFilePath, pendingFilesDirFilePath } from "../config.mts"
import { moveFile } from "./moveFile.mts"

export const moveVideoFromPendingToCompleted = async (pendingFileName: string, completedFileName?: string) => {
  if (!completedFileName) {
    completedFileName = pendingFileName
  }
  const pendingFilePath = path.join(pendingFilesDirFilePath, pendingFileName)
  const completedFilePath = path.join(completedFilesDirFilePath, completedFileName)

  await moveFile(pendingFilePath, completedFilePath)
}