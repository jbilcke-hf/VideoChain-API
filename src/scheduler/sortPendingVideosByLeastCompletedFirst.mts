import { Video } from "../types.mjs"

export function sortPendingVideosByLeastCompletedFirst(videos: Video[]): Video[] {
  videos.sort((a: Video, b: Video) => a.progressPercent - b.progressPercent)
  return videos
}