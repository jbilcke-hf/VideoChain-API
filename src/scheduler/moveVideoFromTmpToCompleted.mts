import path from "node:path"

import tmpDir from "temp-dir"

import { completedFilesDirFilePath } from "../config.mjs"
import { moveFile } from "../utils/filesystem/moveFile.mjs"

// a function to move a video to the completed video directory
// this implementation is safe to use on a Hugging Face Space
// for instance when copying from one disk to another
// (we cannot use fs.rename in that case)
export const moveVideoFromTmpToCompleted = async (tmpFileName: string, completedFileName?: string) => {
  if (!completedFileName) {
    completedFileName = tmpFileName
  }
  const tmpFilePath = path.join(tmpDir, tmpFileName)
  const completedFilePath = path.join(completedFilesDirFilePath, completedFileName)

  await moveFile(tmpFilePath, completedFilePath)
}