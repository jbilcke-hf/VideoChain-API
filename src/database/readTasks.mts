import path from "node:path"
import { promises as fs } from "node:fs"

import { VideoTask } from "../types.mts"
import { readTask } from "./readTask.mts"


export const readTasks = async (taskDirFilePath: string): Promise<VideoTask[]> => {

  let tasksFiles: string[] = []
  try {
    const filesInDir = await fs.readdir(taskDirFilePath)

    // we only keep valid files (in UUID.json format)
    tasksFiles = filesInDir.filter(fileName => fileName.match(/[a-z0-9\-]\.json/i))
  } catch (err) {
    console.log(`failed to read tasks: ${err}`)
  }

  const tasks: VideoTask[] = []

  for (const taskFileName in tasksFiles) {
    const taskFilePath = path.join(taskDirFilePath, taskFileName)
    try {
      const task = await readTask(taskFilePath)
      tasks.push(task)
    } catch (parsingErr) {
      console.log(`failed to read ${taskFileName}: ${parsingErr}`)
      console.log(`deleting corrupted file ${taskFileName}`)
      try {
        await fs.unlink(taskFilePath)
      } catch (unlinkErr) {
        console.log(`failed to unlink ${taskFileName}: ${unlinkErr}`)
      }
    }
  }

  return tasks
}
