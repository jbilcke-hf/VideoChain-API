import { promises as fs } from "node:fs"


console.log('generating shot..')
const response = await fetch("http://localhost:7860/shot", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    token: process.env.VS_SECRET_ACCESS_TOKEN,
    shotPrompt: "video of a dancing cat"
  })
});

console.log('response:', response)
const buffer = await (response as any).buffer()

fs.writeFile(`./test-juju.mp4`, buffer)

// if called from an API, we ùight want to use streams instead:
// https://stackoverflow.com/questions/15713424/how-can-i-download-a-video-mp4-file-using-node-js
