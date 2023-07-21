import { createReadStream, existsSync } from "node:fs"
import path from "node:path"

import express from "express"

import { VideoTask, VideoTaskRequest } from "./types.mts"
import { parseVideoRequest } from "./utils/parseVideoRequest.mts"
import { savePendingTask } from "./scheduler/savePendingTask.mts"
import { getTask } from "./scheduler/getTask.mts"
import { main } from "./main.mts"
import { completedFilesDirFilePath } from "./config.mts"
import { deleteTask } from "./scheduler/deleteTask.mts"
import { getPendingTasks } from "./scheduler/getPendingTasks.mts"
import { hasValidAuthorization } from "./utils/hasValidAuthorization.mts"

main()

const app = express()
const port = 7860

app.use(express.json())

app.post("/", async (req, res) => {
  const request = req.body as VideoTaskRequest

  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }
  
  let task: VideoTask = null

  console.log(`creating task from request..`)
  console.log(`request: `, JSON.stringify(request))
  try {
    task = await parseVideoRequest(request)
  } catch (err) {
    console.error(`failed to create task: ${task} (${err})`)
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

// get all pending tasks
app.get("/", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  try {
    const tasks = await getPendingTasks()
    res.status(200)
    res.write(JSON.stringify(tasks, null, 2))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ error: "couldn't get the tasks" }))
    res.end()
  }
})

app.get("/:id", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  try {
    const task = await getTask(req.params.id)
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

app.delete("/:id", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }


  let task: VideoTask = null
  try {
    task = await getTask(req.params.id)
  } catch (err) {
    console.error(err)
    res.status(404)
    res.write(JSON.stringify({ error: "couldn't find this task" }))
    res.end()
  }

  try {
    await deleteTask(task)
    res.status(200)
    res.write(JSON.stringify({ success: true }))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ success: false, error: "failed to delete the task" }))
    res.end()
  }
})

app.get("/video/:id\.mp4", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }


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
  } catch (err) {
    res.status(404)
    res.write(JSON.stringify({ error: "this video doesn't exist" }))
    res.end()
    return
  }

  const completedFilePath = path.join(completedFilesDirFilePath, task.fileName)

  // note: we DON'T want to use the pending file path, as there may be operations on it
  // (ie. a process might be busy writing stuff to it)
  const filePath = existsSync(completedFilePath) ? completedFilePath : ""
  if (!filePath) {
    res.status(400)
    res.write(JSON.stringify({ error: "video exists, but cannot be previewed yet" }))
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