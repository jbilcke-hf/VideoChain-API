import { tasksDirPath, pendingTasksDirFilePath, completedTasksDirFilePath, filesDirPath, pendingFilesDirFilePath, completedFilesDirFilePath } from "./config.mts"
import { createDirIfNeeded } from "./utils/createDirIfNeeded.mts"

export const initFolders = () => {
  console.log(`initializing folders..`)
  createDirIfNeeded(tasksDirPath)
  createDirIfNeeded(pendingTasksDirFilePath)
  createDirIfNeeded(completedTasksDirFilePath)
  createDirIfNeeded(filesDirPath)
  createDirIfNeeded(pendingFilesDirFilePath)
  createDirIfNeeded(completedFilesDirFilePath)
}