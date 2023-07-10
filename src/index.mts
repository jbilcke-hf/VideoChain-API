import { promises as fs } from 'fs'
import path from 'node:path'

import tmpDir from 'temp-dir'
import express from 'express'

import { generateVideo } from './services/generateVideo.mts'
import { downloadVideo } from './services/downloadVideo.mts'
import { upscaleVideo } from './services/upscaleVideo.mts'
import { generateSeed } from './services/generateSeed.mts'
import { MakeShot } from './types.mts'

const app = express()
const port = 7860

app.use(express.json())


app.post('/shot', async (req, res) => {
  const query = req.body as MakeShot

  console.log('received query:', query)
  const token = `${query.token || ''}`
  if (token !== process.env.VS_SECRET_ACCESS_TOKEN) {
    console.log("couldn't find access token in the query")
    res.write(JSON.stringify({ error: true, message: 'access denied' }))
    res.end()
    return
  }

  const shotPrompt = `${query.shotPrompt || ''}`
  if (shotPrompt.length < 5) {
    res.write(JSON.stringify({ error: true, message: 'prompt too short (must be at least 5 in length)' }))
    res.end()
    return
  }

  // optional video URL
  // const inputVideo = `${req.query.inputVideo || ''}`

  // optional audio prompt
  const audioPrompt = `${query.audioPrompt || ''}`

  // optional seed
  const seedStr = Number(`${query.seed || ''}`)
  const maybeSeed = Number(seedStr)
  const seed = isNaN(maybeSeed) || ! isFinite(maybeSeed) ? generateSeed() : maybeSeed
    

  // should we upscale or not?
  const upscale = `${query.upscale || 'false'}` === 'true'

  // duration of the prompt, in seconds
  const defaultDuration = 3
  const durationStr = Number(`${query.duration || defaultDuration}`)
  const maybeDuration = Number(durationStr)
  const duration = Math.min(3, Math.max(1, isNaN(maybeDuration) || !isFinite(maybeDuration) ? defaultDuration : maybeDuration))
  
  const defaultSteps = 35
  const stepsStr = Number(`${query.steps || defaultSteps}`)
  const maybeSteps = Number(stepsStr)
  const nbSteps = Math.min(60, Math.max(1, isNaN(maybeSteps) || !isFinite(maybeSteps) ? defaultSteps : maybeSteps))
  
  // const frames per second
  const defaultFps = 24
  const fpsStr = Number(`${query.fps || defaultFps}`)
  const maybeFps = Number(fpsStr)
  const fps = Math.min(60, Math.max(8, isNaN(maybeFps) || !isFinite(maybeFps) ? defaultFps : maybeFps))
  
  const defaultResolution = 576
  const resolutionStr = Number(`${query.resolution || defaultResolution}`)
  const maybeResolution = Number(resolutionStr)
  const resolution = Math.min(1080, Math.max(256, isNaN(maybeResolution) || !isFinite(maybeResolution) ? defaultResolution : maybeResolution))
  

  const shotFileName = `${Date.now()}.mp4`

  console.log('generating video with the following params:', {
    shotPrompt,
    audioPrompt,
    resolution,
    duration,
    nbSteps,
    fps,
    seed,
    upscale,
    shotFileName
  })
  console.log('generating base video ..')
  const generatedVideoUrl = await generateVideo(shotPrompt, {
    seed,
    nbFrames: 24, // if we try more eg 48 frames, this will crash the upscaler (not enough memory)
    nbSteps
  })


  console.log('downloading video..')
  const videoFileName = await downloadVideo(generatedVideoUrl, shotFileName)

  if (upscale) {
    console.log('upscaling video..')
    await upscaleVideo(videoFileName, shotPrompt)
  }

  // TODO call AudioLDM
  if (audioPrompt) {
    // const baseAudio = await callAudioLDM(audioPrompt)
    console.log('calling audio prompt')
  }

  console.log('returning result to user..')

  const filePath = path.resolve(tmpDir, videoFileName)

  const buffer = await fs.readFile(filePath)
  res.setHeader('Content-Type', 'media/mp4')
  res.setHeader('Content-Length', buffer.length)
  res.end(buffer)
})

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })