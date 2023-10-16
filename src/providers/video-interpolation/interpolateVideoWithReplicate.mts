
// this looks really great!
// https://replicate.com/zsxkib/st-mfnet?prediction=bufijj3b45cjoe43pzloqkcghy

"use server"

import Replicate from "replicate"

import { sleep } from "../../utils/misc/sleep.mts"

const replicateToken = `${process.env.AUTH_REPLICATE_API_TOKEN || ""}`
const replicateModel = `${process.env.STMFNET_REPLICATE_MODEL || ""}`
const replicateModelVersion = `${process.env.STMFNET_REPLICATE_MODEL_VERSION || ""}`

if (!replicateToken) {
  throw new Error(`you need to configure your AUTH_REPLICATE_API_TOKEN`)
}

const replicate = new Replicate({ auth: replicateToken })

/**
 * Interpolate a video using Replicate
 * 
 * Important note: the video will lose its sound, if any!
 * 
 * With the current settingd, duration of the original video will be preserved
 * (but we could make slow-mo too)
 */
export async function interpolateVideoWithReplicate({
    video,

    // so arguably 60 would look smoother, but we are tying to reach for a "movie" kind of feel here
    nbFrames = 24,
  }: {
    video: string

    /**
     * Number of frame (duration of the original video will be preserved)
     */
    nbFrames?: number // min 1, max: 240
  }): Promise<string> {

  if (!video) {
    throw new Error(`no video provided`)
  }

  if (!replicateModel) {
    throw new Error(`you need to configure your STMFNET_REPLICATE_MODEL`)
  }

  if (!replicateModelVersion) {
    throw new Error(`you need to configure your STMFNET_REPLICATE_MODEL_VERSION`)
  }

  // for params and doc see https://replicate.com/zsxkib/st-mfnet
  const prediction = await replicate.predictions.create({
    version: replicateModelVersion,
    input: {
      mp4: video, // I think it should be a base64 object?
      framerate_multiplier: 2, // can be one of 2, 4, 8, 16, 32

      // note: for now we use the simplest setting, which is to keep the original video duration
      // if we don't keep the original duration, the video will look like a slow motion animation
      // which may be a desired effect, but let's keep it simple for now
      keep_original_duration: true, // false,
      custom_fps: nbFrames // min 1, max: 240
    }
  })
    
  // console.log("prediction:", prediction)

  // Replicate requires at least 8 seconds of mandatory delay
  await sleep(10000)

  let res: Response
  let pollingCount = 0
  do {
    // This is normally a fast model, so let's check every 2 seconds
    await sleep(2000)

    res = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      method: "GET",
      headers: {
        Authorization: `Token ${replicateToken}`,
      },
      cache: 'no-store',
    })

    if (res.status === 200) {
      const response = (await res.json()) as any
      const error = `${response?.error || ""}`
      if (error) {
        throw new Error(error)
      }
    }

    pollingCount++

    // To prevent indefinite polling, we can stop after a certain number
    if (pollingCount >= 30) {
      throw new Error('Request time out.')
    }
  } while (true)
}