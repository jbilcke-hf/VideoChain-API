import path from "node:path"
import tmpDir from "temp-dir"
import { pendingFilesDirFilePath } from "../config.mts"
import { moveFile } from "./moveFile.mts"

// a function to move a file to the pending file directory
// this implementation is safe to use on a Hugging Face Space
// for instance when copying from one disk to another
// (we cannot use fs.rename in that case)
export const moveFileFromTmpToPending = async (tmpFileName: string, pendingFileName?: string) => {
  if (!pendingFileName) {
    pendingFileName = tmpFileName
  }
  const tmpFilePath = path.join(tmpDir, tmpFileName)
  const pendingFilePath = path.join(pendingFilesDirFilePath, pendingFileName)

  await moveFile(tmpFilePath, pendingFilePath)
}