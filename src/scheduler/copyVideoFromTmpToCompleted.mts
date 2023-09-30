import path from "node:path"
import { promises as fs } from "node:fs"

import tmpDir from "temp-dir"
import { completedFilesDirFilePath } from "../config.mts"

// a function to copy a video to the completed video directory
// this implementation is safe to use on a Hugging Face Space
// for instance when copying from one disk to another
// (we cannot use fs.rename in that case)
export const copyVideoFromTmpToCompleted = async (tmpFileName: string, completedFileName?: string) => {
  if (!completedFileName) {
    completedFileName = tmpFileName
  }
  const tmpFilePath = path.join(tmpDir, tmpFileName)
  const completedFilePath = path.join(completedFilesDirFilePath, completedFileName)

  await fs.copyFile(tmpFilePath, completedFilePath)
  console.log(`copied file from ${tmpFilePath} to ${completedFilePath}`)
}