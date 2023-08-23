import { existsSync, promises as fs } from "node:fs"

export const deleteFileIfExists = async (filePath: string) => {
  // this function scares me a bit, 
  if (filePath === "/" || filePath === "~" || filePath === ".") {
    throw new Error(`lol, no.`)
  }

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