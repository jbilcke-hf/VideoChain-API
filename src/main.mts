
import { getPendingVideos } from "./scheduler/getPendingVideos.mts"
import { processVideo } from "./scheduler/processVideo.mts"
import { sortPendingVideosByLeastCompletedFirst } from "./scheduler/sortPendingVideosByLeastCompletedFirst.mts"

export const main = async () => {

  const videos = await getPendingVideos()
  if (!videos.length) {
    // console.log(`no job to process.. going to try in 200 ms`)
    setTimeout(() => {
      main()
    }, 200)
    return
  }

  console.log(`there are ${videos.length} pending videos`)

  sortPendingVideosByLeastCompletedFirst(videos)

  let somethingFailed = ""
  await Promise.all(videos.map(async video => {
    try {
      const result = await processVideo(video)
      return result
    } catch (err) {
      somethingFailed = `${err}`
      // a video failed.. no big deal
      return Promise.resolve(somethingFailed)
    }
  }))

  if (somethingFailed) {
    console.error(`one of the jobs failed: ${somethingFailed}, let's wait 5 seconds`)
    setTimeout(() => { main() }, 5000)
  } else {
    console.log(`successfully worked on the jobs, let's immediately loop`)
    setTimeout(() => { main() }, 50)
  }

}