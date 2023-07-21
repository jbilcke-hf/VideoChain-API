
import { existsSync, promises as fs } from "node:fs"
import path from "node:path"

import tmpDir from "temp-dir"

import { VideoTask } from "../types.mts"
import { completedTasksDirFilePath, completedFilesDirFilePath, pendingTasksDirFilePath, pendingFilesDirFilePath } from "../config.mts"
import { deleteFileIfExists } from "../utils/deleteFileIfExists.mts"


export const deleteTask = async (task: VideoTask) => {
  const taskFileName = `${task.ownerId}_${task.id}.json`
  const videoFileName = task.fileName
  
  // .mp4 files
  const tmpFilePath = path.join(tmpDir, videoFileName)
  const pendingVideoPath = path.join(pendingFilesDirFilePath, videoFileName)
  const completedVideoPath = path.join(completedFilesDirFilePath, videoFileName)

  // .json files
  const pendingTaskPath = path.join(pendingTasksDirFilePath, taskFileName)
  const completedTaskPath = path.join(completedTasksDirFilePath, taskFileName)

  await deleteFileIfExists(tmpFilePath)
  await deleteFileIfExists(pendingVideoPath)
  await deleteFileIfExists(completedVideoPath)
  await deleteFileIfExists(pendingTaskPath)
  await deleteFileIfExists(completedTaskPath)

  // TODO: we didn't delete any audio file!
  console.log(`note: we didn't delete any audio file!`)
}