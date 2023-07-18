import { createReadStream, promises as fs } from "fs"

import express from "express"

import { VideoTask, VideoSequenceRequest } from "./types.mts"
import { requestToTask } from "./services/requestToTask.mts"
import { savePendingTask } from "./database/savePendingTask.mts"
import { getTask } from "./database/getTask.mts"
import { main } from "./main.mts"

main()

const app = express()
const port = 7860

app.use(express.json())

app.post("/", async (req, res) => {
  const request = req.body as VideoSequenceRequest
  
  const token = `${request.token || ""}`
  if (token !== process.env.VS_SECRET_ACCESS_TOKEN) {
    console.log("couldn't find access token in the query")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  let task: VideoTask = null

  console.log(`creating task from request..`)
  try {
    task = await requestToTask(request)
  } catch (err) {
    console.error(`failed to create task: ${task}`)
    res.status(400)
    res.write(JSON.stringify({ error: "query seems to be malformed" }))
    res.end()
    return
  }

  console.log(`saving task ${task.id}`)
  try {
    await savePendingTask(task)
    res.status(200)
    res.write(JSON.stringify(task))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ error: "couldn't save the task" }))
    res.end()
  }
})

app.get("/:id", async (req, res) => {
  try {
    const task = await getTask(req.params.id)
    delete task.finalFilePath
    delete task.tmpFilePath
    res.status(200)
    res.write(JSON.stringify(task))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(404)
    res.write(JSON.stringify({ error: "couldn't find this task" }))
    res.end()
  }
})

app.get("/video/:id\.mp4", async (req, res) => {
  if (!req.params.id) {
    res.status(400)
    res.write(JSON.stringify({ error: "please provide a valid video id" }))
    res.end()
    return
  }

  let task: VideoTask = null

  try {
    task = await getTask(req.params.id)
    console.log("returning result to user..")

    const filePath = task.finalFilePath || task.tmpFilePath || ''
    if (!filePath) {
      res.status(400)
      res.write(JSON.stringify({ error: "video exists, but cannot be previewed yet" }))
      res.end()
      return
    }
  } catch (err) {
    res.status(404)
    res.write(JSON.stringify({ error: "this video doesn't exist" }))
    res.end()
    return
  }

  // file path exists, let's try to read it
  try {
    // do we need this?
    // res.status(200)
    // res.setHeader("Content-Type", "media/mp4")
    console.log(`creating a video read stream from ${filePath}`)
    const stream = createReadStream(filePath)
  
    stream.on('close', () => {
      console.log(`finished streaming the video`)
      res.end()
    })
    
    stream.pipe(res)
  } catch (err) {
    console.error(`failed to read the video file at ${filePath}: ${err}`)
    res.status(500)
    res.write(JSON.stringify({ error: "failed to read the video file" }))
    res.end()
  }
})

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })