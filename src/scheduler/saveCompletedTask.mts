import path from "path"

import { VideoTask } from "../types.mts"
import { completedTasksDirFilePath, pendingTasksDirFilePath } from "../config.mts"
import { moveFile } from "../utils/moveFile.mts"

export const saveCompletedTask = async (task: VideoTask) => {
  const fileName = `${task.ownerId}_${task.id}.json`
  const pendingFilePath = path.join(pendingTasksDirFilePath, fileName)
  const completedFilePath = path.join(completedTasksDirFilePath, fileName)
  await moveFile(pendingFilePath, completedFilePath)
}