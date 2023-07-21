import { VideoTask } from "../types.mts"
import { pendingTasksDirFilePath } from "../config.mts"
import { readTasks } from "./readTasks.mts"

export const getPendingTasks = async (ownerId?: string): Promise<VideoTask[]> => {
  const pendingTasks = await readTasks(pendingTasksDirFilePath, ownerId)

  return pendingTasks
}