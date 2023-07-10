import { promises as fs } from 'fs'

import express from 'express'

import { callZeroscope } from './services/callZeroscope.mts'
import { downloadVideo } from './services/downloadVideo.mts'
import { upscaleVideo } from './services/upscaleVideo.mts'

const app = express()
const port = 7860

app.post('/shot', async (req, res) => {
  const shotPrompt = `${req.query.shotPrompt || ''}`
  if (shotPrompt.length) {
    res.write(JSON.stringify({ error: true, message: 'prompt too short' }))
    res.end()
    return
  }

  // optional video URL
  const inputVideo = `${req.query.inputVideo || ''}`

  // optional audio prompt
  const audioPrompt = `${req.query.audioPrompt || ''}`

  // should we upscale or not?
  const upscale = `${req.query.audioPrompt || 'false'}` === 'true'

  // duration of the prompt, in seconds
  const durationStr = Number(`${req.query.audioPrompt || '3'}`)
  const maybeDuration = Number(durationStr)
  const duration = Math.min(3, Math.max(1, isNaN(maybeDuration) || isFinite(maybeDuration) ? 3 : maybeDuration))
  
  // const frames per second
  const fps = `${req.query.audioPrompt || 'false'}` === 'true'

  console.log('calling zeroscope..')
  const generatedVideoUrl = await callZeroscope(shotPrompt)

  const shotFileName = `${Date.now()}.mp4`

  
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