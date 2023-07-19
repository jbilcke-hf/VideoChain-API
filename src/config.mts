import path from "node:path"

export const storagePath = `${process.env.VS_STORAGE_PATH || './sandbox'}`

export const tasksDirPath = path.join(storagePath, "tasks")
export const pendingTasksDirFilePath = path.join(tasksDirPath, "pending")
export const completedTasksDirFilePath =  path.join(tasksDirPath, "completed")

export const filesDirPath = path.join(storagePath, "files")
export const pendingFilesDirFilePath = path.join(filesDirPath, "pending")
export const completedFilesDirFilePath =  path.join(filesDirPath, "completed")

export const shotFormatVersion = 1
export const sequenceFormatVersion = 1
