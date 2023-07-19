import { promises as fs } from "node:fs"
import path from "path"

import { VideoTask } from "../types.mts"
import { pendingTasksDirFilePath } from "../config.mts"

export const updatePendingTask = async (task: VideoTask) => {
  try {
    const fileName = `${task.id}.json`
    const filePath = path.join(pendingTasksDirFilePath, fileName)
    await fs.writeFile(filePath, JSON.stringify(task, null, 2), "utf8")
  } catch (err) {
    console.error(`Failed to update the task. Probably an issue with the serialized object or the file system: ${err}`)
    // we do not forward the exception, there is no need
    // we will just try again the job later (even if it means losing a bit of data)
  }
}