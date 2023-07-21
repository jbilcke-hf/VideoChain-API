import { promises as fs } from "node:fs"

import { VideoTask } from "../types.mts"

export const readTask = async (taskFilePath: string): Promise<VideoTask> => {
  const task = JSON.parse(
    await fs.readFile(taskFilePath, 'utf8')
  ) as VideoTask

  return task
}
