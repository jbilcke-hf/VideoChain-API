import { initFolders } from "./initFolders.mts"
import { getPendingTasks } from "./scheduler/getPendingTasks.mts"
import { processTask } from "./scheduler/processTask.mts"

export const main = async () => {

  const tasks = await getPendingTasks()
  if (!tasks.length) {
    setTimeout(() => {
      main()
    }, 500)
    return
  }

  console.log(`there are ${tasks.length} pending tasks`)
  for (const task of tasks) {
    await processTask(task)
  }
  console.log(`processed ${tasks.length} tasks`)

  setTimeout(() => {
    main()
  }, 1000)
}