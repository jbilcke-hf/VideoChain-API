import path from "node:path"

export const storagePath = `${process.env.VC_STORAGE_PATH || './sandbox'}`

export const metadataDirPath = path.join(storagePath, "metadata")
export const pendingMetadataDirFilePath = path.join(metadataDirPath, "pending")
export const completedMetadataDirFilePath =  path.join(metadataDirPath, "completed")

export const filesDirPath = path.join(storagePath, "files")
export const pendingFilesDirFilePath = path.join(filesDirPath, "pending")
export const completedFilesDirFilePath =  path.join(filesDirPath, "completed")

export const shotFormatVersion = 1
export const sequenceFormatVersion = 1
