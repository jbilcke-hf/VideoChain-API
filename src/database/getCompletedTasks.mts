import { VideoTask } from "../types.mts"
import { completedTasksDirFilePath } from "./constants.mts"
import { readTasks } from "./readTasks.mts"

export const getCompletedTasks = async (): Promise<VideoTask[]> => {
  const completedTasks = await readTasks(completedTasksDirFilePath)

  return completedTasks
}