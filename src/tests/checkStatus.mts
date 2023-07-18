import { videoId, server } from "./config.mts"

console.log(`checking status of video ${videoId}`)
const response = await fetch(`${server}/${videoId}`, {
  method: "GET",
  headers: {
    "Accept": "application/json",
  }
});

console.log('response:', response)
const task = await response.json()

console.log("task:", JSON.stringify(task, null, 2))
