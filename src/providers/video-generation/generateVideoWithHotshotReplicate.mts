"use server"

import Replicate from "replicate"

import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { sleep } from "../../utils/misc/sleep.mts"
import { getNegativePrompt, getPositivePrompt } from "./defaultPrompts.mts"
import { VideoGenerationOptions } from "./types.mts"

const replicateToken = `${process.env.VC_REPLICATE_API_TOKEN || ""}`
const replicateModel = `${process.env.VC_HOTSHOT_XL_REPLICATE_MODEL || ""}`
const replicateModelVersion = `${process.env.VC_HOTSHOT_XL_REPLICATE_MODEL_VERSION || ""}`

if (!replicateToken) {
  throw new Error(`you need to configure your VC_REPLICATE_API_TOKEN`)
}

const replicate = new Replicate({ auth: replicateToken })

/**
 * Generate a video with hotshot through Replicate
 * 
 * Note that if nbFrames == 1, then it will generate a jpg
 * 
 */
export async function generateVideoWithHotshotReplicate({
    positivePrompt,
    negativePrompt = "",
    seed,
    nbFrames = 8, // for now the only values that make sense are 1 (for a jpg) or 8 (for a video)
    videoDuration = 1000, // for now Hotshot doesn't really supports anything else
    nbSteps = 30, // when rendering a final video, we want a value like 50 or 70 here
    size = "768x320",

    // for a replicate LoRa this is always the same ("In the style of TOK")
    // triggerWord = "In the style of TOK",

    // for jbilcke-hf/sdxl-cinematic-2 it is "cinematic-2"
    triggerWord = "cinematic-2",

    huggingFaceLora = "jbilcke-hf/sdxl-cinematic-2",

    // url to the weight
    replicateLora,
  }: VideoGenerationOptions): Promise<string> {

  if (!positivePrompt?.length) {
    throw new Error(`prompt is too short!`)
  }

  if (!replicateModel) {
    throw new Error(`you need to configure your VC_HOTSHOT_XL_REPLICATE_MODEL`)
  }

  if (!replicateModelVersion) {
    throw new Error(`you need to configure your VC_HOTSHOT_XL_REPLICATE_MODEL_VERSION`)
  }

  // pimp the prompt
  positivePrompt = getPositivePrompt(positivePrompt, triggerWord)
  negativePrompt = getNegativePrompt(negativePrompt)

  const [width, height] = size.split("x").map(x => Number(x))
  
  // see an example here: 
  // https://replicate.com/p/incraplbv23g3zv6woinhgdira
  // for params and doc see https://replicate.com/cloneofsimo/hotshot-xl-lora-controlnet
  const prediction = await replicate.predictions.create({
    version: replicateModelVersion,
    input: {
      prompt: positivePrompt,
      negative_prompt: negativePrompt,

      // this is not a URL but a model name
      hf_lora_url: replicateLora?.length ? undefined : huggingFaceLora,

      // this is a URL to the .tar (we can get it from the "trainings" page)
      replicate_weights_url: huggingFaceLora?.length ? undefined : replicateLora,

      width,
      height,

      // those are used to create an upsampling or downsampling
      // original_width: width,
      // original_height: height,
      // target_width: width,
      // target_height: height,

      steps: nbSteps,
    
      
      // note: right now it only makes sense to use either 1 (a jpg)
      video_length: nbFrames, // nb frames

      video_duration: videoDuration, // video duration in ms
      
      seed: !isNaN(seed) && isFinite(seed) ? seed : generateSeed()
    }
  })
    
  // console.log("prediction:", prediction)

  // Replicate requires at least 30 seconds of mandatory delay
  await sleep(30000)

  let res: Response
  let pollingCount = 0
  do {
    // Check every 5 seconds
    await sleep(5000)

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

    // To prevent indefinite polling, we can stop after a certain number, here 30 (i.e. about 2 and half minutes)
    if (pollingCount >= 30) {
      throw new Error('Request time out.')
    }
  } while (true)
}