import path from "node:path"
import { promises as fs } from "node:fs"

import tmpDir from "temp-dir"
import { pendingFilesDirFilePath } from "../config.mts"
import { moveFile } from "./moveFile.mts"

// a function to copy a video to the pending video directory
// this implementation is safe to use on a Hugging Face Space
// for instance when copying from one disk to another
// (we cannot use fs.rename in that case)
export const copyVideoFromTmpToPending = async (tmpFileName: string, pendingFileName?: string) => {
  if (!pendingFileName) {
    pendingFileName = tmpFileName
  }
  const tmpFilePath = path.join(tmpDir, tmpFileName)
  const pendingFilePath = path.join(pendingFilesDirFilePath, pendingFileName)

  await fs.copyFile(tmpFilePath, pendingFilePath)
  console.log(`copied file from ${tmpFilePath} to ${pendingFilePath}`)
}