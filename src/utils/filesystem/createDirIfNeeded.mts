import { existsSync, mkdirSync } from "node:fs"

export const createDirIfNeeded = (dirPath: string) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}