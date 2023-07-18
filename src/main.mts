import { getPendingTasks } from "./database/getPendingTasks.mts"

export const main = async () => {
  const tasks = await getPendingTasks()
  if (!tasks.length) {
    setTimeout(() => {
      main()
    }, 500)
    return
  }

  console.log(`there are ${tasks.length} pending tasks`)
  
  setTimeout(() => {
    main()
  }, 1000)
}