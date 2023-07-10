import { promises as fs } from 'fs'

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

  const token = `${query.token || ''}`
  if (token !== process.env.VS_SECRET_ACCESS_TOKEN) {
    res.write(JSON.stringify({ error: true, message: 'access denied' }))
    res.end()
    return
  }

  const shotPrompt = `${query.shotPrompt || ''}`
  if (shotPrompt.length) {
    res.write(JSON.stringify({ error: true, message: 'prompt too short' }))
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
  const durationStr = Number(`${query.duration || ''}`)
  const maybeDuration = Number(durationStr)
  const duration = Math.min(3, Math.max(1, isNaN(maybeDuration) || !isFinite(maybeDuration) ? 3 : maybeDuration))
  
  const stepsStr = Number(`${query.steps || ''}`)
  const maybeSteps = Number(stepsStr)
  const nbSteps = Math.min(60, Math.max(1, isNaN(maybeSteps) || !isFinite(maybeSteps) ? 35 : maybeSteps))
  
  // const frames per second
  const fpsStr = Number(`${query.fps || ''}`)
  const maybeFps = Number(fpsStr)
  const fps = Math.min(60, Math.max(8, isNaN(maybeFps) || !isFinite(maybeFps) ? 24 : maybeFps))
  
  const resolutionStr = Number(`${query.resolution || ''}`)
  const maybeResolution = Number(resolutionStr)
  const resolution = Math.min(1080, Math.max(256, isNaN(maybeResolution) || !isFinite(maybeResolution) ? 576 : maybeResolution))
  

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
  const buffer = await fs.readFile(videoFileName)
  res.setHeader('Content-Type', 'media/mp4')
  res.setHeader('Content-Length', buffer.length)
  res.end(buffer)
})

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })