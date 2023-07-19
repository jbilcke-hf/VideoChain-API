import path from "node:path"
import { promises as fs } from "node:fs"

import { completedTasksDirFilePath, pendingFilesDirFilePath } from "../config.mts"

export const copyVideoFromPendingToCompleted = async (pendingFileName: string, completedFileName?: string) => {
  if (!completedFileName) {
    completedFileName = pendingFileName
  }
  const pendingFilePath = path.join(pendingFilesDirFilePath, pendingFileName)
  const completedFilePath = path.join(completedTasksDirFilePath, completedFileName)

  await fs.copyFile(pendingFilePath, completedFilePath)
  console.log(`copied file from ${pendingFilePath} to ${completedFilePath}`)
}