import { initFolders } from "./initFolders.mts"
import { getPendingVideos } from "./scheduler/getPendingVideos.mts"
import { processVideo } from "./scheduler/processVideo.mts"
import { sortPendingVideosByLeastCompletedFirst } from "./utils/sortPendingVideosByLeastCompletedFirst.mts"

export const main = async () => {

  const videos = await getPendingVideos()
  if (!videos.length) {
    setTimeout(() => {
      main()
    }, 500)
    return
  }

  console.log(`there are ${videos.length} pending videos`)

  sortPendingVideosByLeastCompletedFirst(videos)

  for (const video of videos) {
    await processVideo(video)
  }
  console.log(`processed ${videos.length} videos`)

  setTimeout(() => {
    main()
  }, 1000)
}