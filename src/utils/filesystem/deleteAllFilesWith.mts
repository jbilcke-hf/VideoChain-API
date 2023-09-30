import { promises as fs } from "node:fs"
import path from "node:path"

export const deleteFilesWithName = async (dir: string, name: string) => {
  for (const file of await fs.readdir(dir)) {
    if (file.includes(name)) {
      const filePath = path.join(dir, file)
      try {
        await fs.unlink(filePath)
      } catch (err) {
        console.error(`failed to unlink file in ${filePath}: ${err}`)
      }
    }
  }
}
