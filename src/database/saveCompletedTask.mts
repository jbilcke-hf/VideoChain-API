import { promises as fs } from "node:fs"
import path from "path"

import { VideoTask } from "../types.mts"
import { completedTasksDirFilePath, pendingTasksDirFilePath } from "./constants.mts"

export const saveCompletedTask = async (task: VideoTask) => {
  const fileName = `${task.id}.json`
  const pendingFilePath = path.join(pendingTasksDirFilePath, fileName)
  const completedFilePath = path.join(completedTasksDirFilePath, fileName)
  await fs.writeFile(completedFilePath, JSON.stringify(task, null, 2), "utf8")
  await fs.unlink(pendingFilePath)
}