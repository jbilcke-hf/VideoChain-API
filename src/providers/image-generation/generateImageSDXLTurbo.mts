
import { client } from "@gradio/client"

import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { getValidNumber } from "../../utils/validators/getValidNumber.mts"
import { convertToWebp } from "../../utils/image/convertToWebp.mts"


const instance = `${process.env.VC_SDXL_TURBO_SPACE_API_URL || ""}`
const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

// console.log("DEBUG:", JSON.stringify({ instances, secretToken }, null, 2))

export async function generateImageSDXLTurboAsBase64(options: {
  positivePrompt: string;
  negativePrompt?: string;
  seed?: number;
  width?: number;
  height?: number;
  nbSteps?: number;
}): Promise<string> {

  // console.log("querying " + instance)
  const positivePrompt = options?.positivePrompt || ""
  if (!positivePrompt) {
    throw new Error("missing prompt")
  }

  // the negative prompt CAN be missing, since we use a trick
  // where we make the interface mandatory in the TS doc,
  // but browsers might send something partial
  const negativePrompt = options?.negativePrompt || ""
  
  // we treat 0 as meaning "random seed"
  const seed = (options?.seed ? options.seed : 0) || generateSeed()

  const maxRequestedResolution = 1024
  const maxModelResolution = 512

  const requestedWidth = getValidNumber(options?.width, 256, maxRequestedResolution, maxModelResolution)
  const requestedHeight = getValidNumber(options?.height, 256, maxRequestedResolution, maxModelResolution)

  // we try to preserve the original image ratio
  const ratioH = requestedHeight / requestedWidth
  const ratioW = requestedWidth / requestedHeight

  // we always try to ccrank the resolution to the max
  let width = ratioW < 1 ? Math.round(ratioW * maxModelResolution) : maxModelResolution
  let height = ratioH < 1 ? Math.round(ratioH * maxModelResolution) : maxModelResolution

  const positive = [

    // oh well.. is it too late to move this to the bottom?
    "beautiful",

    // too opinionated, so let's remove it
    // "intricate details",

    positivePrompt,

    "award winning",
    "high resolution"
  ].filter(word => word)
  .join(", ")

  const negative =  [
    negativePrompt,
    "watermark",
    "copyright",
    "blurry",
    // "artificial",
    // "cropped",
    "low quality",
    "ugly"
  ].filter(word => word)
  .join(", ")

  const api = await client(instance, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })

  const rawResponse = (await api.predict("/run", [		
    positive, // string  in 'Prompt' Textbox component		
    negative, // string  in 'Negative prompt' Textbox component		
    seed, // number (numeric value between 0 and 2147483647) in 'Seed' Slider component		
    width, // number (numeric value between 256 and 1024) in 'Width' Slider component		
    height, // number (numeric value between 256 and 1024) in 'Height' Slider component		
    secretToken
  ])) as any
    
  const result = rawResponse?.data?.[0] as string
  if (!result?.length) {
    throw new Error(`the returned image was empty`)
  }

  try {
    const finalImage = await convertToWebp(result)
    return finalImage
  } catch (err) {
    // console.log("err:", err)
    throw new Error(err)
  }
}