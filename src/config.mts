import path from "node:path"
import fs from "node:fs"

import dotenv from "dotenv"

dotenv.config()

try {
  if (fs.existsSync(".env.local")) {
    const result = dotenv.config({ path: ".env.local" })
    console.log("using .env.local")
    process.env = {
      ...process.env,
      ...result.parsed,
    }
  }
} catch (err) {
  // do nothing
  console.log("using .env")
}

export const storagePath = `${process.env.VC_STORAGE_PATH || './sandbox'}`

// those are persistent storage (we want to keep the data for months/years)
export const metadataDirPath = path.join(storagePath, "metadata")
export const pendingMetadataDirFilePath = path.join(metadataDirPath, "pending")
export const completedMetadataDirFilePath =  path.join(metadataDirPath, "completed")

export const filesDirPath = path.join(storagePath, "files")
export const pendingFilesDirFilePath = path.join(filesDirPath, "pending")
export const completedFilesDirFilePath =  path.join(filesDirPath, "completed")

// this is a semi-persistent storage (we will want to renew it from time to time)
export const cacheDirPath = path.join(storagePath, "cache")
export const renderedDirFilePath = path.join(cacheDirPath, "rendered")

export const shotFormatVersion = 1
export const sequenceFormatVersion = 1
