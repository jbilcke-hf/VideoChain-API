import { existsSync, promises as fs } from "node:fs"

export const deleteFileIfExists = async (filePath: string) => {

  const safePath = filePath.trim()
  // just a sanity check
  if (safePath.includes("*") ||safePath === "/" || safePath === "~" || safePath === ".") {
    throw new Error(`lol, no.`)
  }

  if (existsSync(filePath)) {
    try {
      await fs.unlink(safePath)
      return true
    } catch (err) {
      console.log(`failed to delete file ${safePath}`)
    }
  }
  return false
}