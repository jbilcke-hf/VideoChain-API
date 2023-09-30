import { promises as fs } from "node:fs"

// a function to move a file
// this implementation is safe to use on a Hugging Face Space
// for instance when copying from one disk to another
// (we cannot use fs.rename in that case)
export const moveFile = async (sourceFilePath: string, targetFilePath: string) => {
  await fs.copyFile(sourceFilePath, targetFilePath)
  console.log(`moved file from ${sourceFilePath} to ${targetFilePath}`)
  try {
    await fs.unlink(sourceFilePath)
  } catch (err) {
    console.log("moveFile: failed to cleanup (no big deal..)")
  }
}