import { promises as fs } from "fs"

import express from "express"

import { generateSeed } from "./services/generateSeed.mts"
import { Job, ShotQuery } from "./types.mts"
import { generateShot } from "./services/generateShot.mts"

const app = express()
const port = 7860

app.use(express.json())

const queue: Job[] = []

app.post("/shot", async (req, res) => {
  const query = req.body as ShotQuery

  const token = `${query.token || ""}`
  if (token !== process.env.VS_SECRET_ACCESS_TOKEN) {
    console.log("couldn't find access token in the query")
    res.write(JSON.stringify({ error: true, message: "access denied" }))
    res.end()
    return
  }

  const shotPrompt = `${query.shotPrompt || ""}`
  if (shotPrompt.length < 5) {
    res.write(JSON.stringify({ error: true, message: "prompt too short (must be at least 5 in length)" }))
    res.end()
    return
  }

  // optional video URL
  // const inputVideo = `${req.query.inputVideo || ""}`

  // optional background audio prompt
  const backgroundAudioPrompt = `${query.backgroundAudioPrompt || ""}`

  // optional foreground audio prompt
  const foregroundAudioPrompt = `${query.foregroundAudioPrompt || ""}`

  // optional seed
  const defaultSeed = generateSeed()
  const seedStr = Number(`${query.seed || defaultSeed}`)
  const maybeSeed = Number(seedStr)
  const seed = isNaN(maybeSeed) || ! isFinite(maybeSeed) ? defaultSeed : maybeSeed
  
  // in production we want those ON by default
  const upscale = `${query.upscale || "true"}` === "true"
  const interpolate = `${query.upscale || "true"}` === "true"
  const noise = `${query.noise || "true"}` === "true"


  const defaultDuration = 3
  const maxDuration = 5
  const durationStr = Number(`${query.duration || defaultDuration}`)
  const maybeDuration = Number(durationStr)
  const duration = Math.min(maxDuration, Math.max(1, isNaN(maybeDuration) || !isFinite(maybeDuration) ? defaultDuration : maybeDuration))
  
  const defaultSteps = 35
  const stepsStr = Number(`${query.steps || defaultSteps}`)
  const maybeSteps = Number(stepsStr)
  const nbSteps = Math.min(60, Math.max(1, isNaN(maybeSteps) || !isFinite(maybeSteps) ? defaultSteps : maybeSteps))
  
  // const frames per second
  const defaultFps = 24
  const fpsStr = Number(`${query.fps || defaultFps}`)
  const maybeFps = Number(fpsStr)
  const nbFrames = Math.min(60, Math.max(8, isNaN(maybeFps) || !isFinite(maybeFps) ? defaultFps : maybeFps))
  
  const defaultResolution = 576
  const resolutionStr = Number(`${query.resolution || defaultResolution}`)
  const maybeResolution = Number(resolutionStr)
  const resolution = Math.min(1080, Math.max(256, isNaN(maybeResolution) || !isFinite(maybeResolution) ? defaultResolution : maybeResolution))
  
  const actorPrompt = `${query.actorPrompt || ""}`

  const actorVoicePrompt = `${query.actorVoicePrompt || ""}`

  const actorDialoguePrompt = `${query.actorDialoguePrompt || ""}`


  const { filePath } = await generateShot({
    seed,
    actorPrompt,
    shotPrompt,
    backgroundAudioPrompt,
    foregroundAudioPrompt,
    actorDialoguePrompt,
    actorVoicePrompt,
    duration,
    nbFrames,
    resolution,
    nbSteps,
    upscale,
    interpolate,
    noise,
  })

  console.log(`generated video in ${filePath}`)

  console.log("returning result to user..")

  const buffer = await fs.readFile(filePath)

  res.setHeader("Content-Type", "media/mp4")
  res.setHeader("Content-Length", buffer.length)
  res.end(buffer)
})

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })