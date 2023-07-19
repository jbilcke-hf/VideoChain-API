import path from "node:path"

export const storagePath = `${process.env.VS_STORAGE_PATH || './sandbox'}`

export const tasksDirPath = path.join(storagePath, "tasks")
export const pendingTasksDirFilePath = path.join(tasksDirPath, "pending")
export const completedTasksDirFilePath =  path.join(tasksDirPath, "completed")

export const videosDirPath = path.join(storagePath, "videos")
export const pendingVideosDirFilePath = path.join(videosDirPath, "pending")
export const completedVideosDirFilePath =  path.join(videosDirPath, "completed")

export const shotFormatVersion = 1
export const sequenceFormatVersion = 1
