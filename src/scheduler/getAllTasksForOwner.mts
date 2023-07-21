import { VideoTask } from "../types.mts"
import { getCompletedTasks } from "./getCompletedTasks.mts"
import { getPendingTasks } from "./getPendingTasks.mts"

export const getAllTasksForOwner = async (ownerId: string): Promise<VideoTask[]> => {
  const pendingTasks = await getPendingTasks(ownerId)
  const completedTasks = await getCompletedTasks(ownerId)
  return [...pendingTasks, ...completedTasks]
}