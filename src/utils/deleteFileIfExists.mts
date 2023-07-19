import { existsSync, promises as fs } from "node:fs"

export const deleteFileIfExists = async (filePath: string) => {
  if (existsSync(filePath)) {
    try {
      await fs.unlink(filePath)
      return true
    } catch (err) {
      console.log(`failed to delete file ${filePath}`)
    }
  }
  return false
}