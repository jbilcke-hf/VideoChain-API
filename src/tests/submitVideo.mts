import { server, videoId } from "./config.mts"

console.log('submitting a new video..')
const response = await fetch(`${server}/`, {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    token: process.env.VC_SECRET_ACCESS_TOKEN,
    sequence: {
      id: videoId,
    },
    shots: []
  })
});


console.log('response:', response)
const video = await response.json()

console.log("video:", JSON.stringify(video, null, 2))
