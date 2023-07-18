import { promises as fs } from "node:fs"

import { videoId, server } from "./config.mts"

console.log(`trying to download video ${videoId}`)

const response = await fetch(`${server}/${videoId}.mp4`, {
  method: "GET",
});

console.log('response:', response)
const buffer = await (response as any).buffer()

fs.writeFile(`./${videoId}.mp4`, buffer)

// if called from an API, we ùight want to use streams instead:
// https://stackoverflow.com/questions/15713424/how-can-i-download-a-video-mp4-file-using-node-js
