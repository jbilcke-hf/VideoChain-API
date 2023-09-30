import { Video } from "../types.mjs"

// used by the API, to return latest videos at the top
export function sortVideosByYoungestFirst(videos: Video[]) {
  videos.sort((a: Video, b: Video) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  return videos
}