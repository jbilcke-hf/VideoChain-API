import { videoId, server } from "./config.mts"

console.log(`checking status of video ${videoId}`)
const response = await fetch(`${server}/${videoId}`, {
  method: "GET",
  headers: {
    "Accept": "application/json",
  }
});

console.log('response:', response)
const video = await response.json()

console.log("video:", JSON.stringify(video, null, 2))
