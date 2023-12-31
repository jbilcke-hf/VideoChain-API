import { client } from "@gradio/client"

import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { getValidNumber } from "../../utils/validators/getValidNumber.mts"

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_SDXL_360_SPACE_API_URL_1 || ""}`,
 //  `${process.env.VC_SDXL_SPACE_API_URL_2 || ""}`,
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export async function generateImageSDXL360AsBase64(options: {
  positivePrompt: string;
  negativePrompt?: string;
  seed?: number;
  width?: number;
  height?: number;
  nbSteps?: number;
}): Promise<string> {

  const positivePrompt = options?.positivePrompt || ""
  if (!positivePrompt) {
    throw new Error("missing prompt")
  }
  const negativePrompt = options?.negativePrompt || ""
  
  // we treat 0 as meaning "random seed"
  const seed = (options?.seed ? options.seed : 0) || generateSeed()

  const width = getValidNumber(options?.width, 256, 1024, 512)
  const height = getValidNumber(options?.height, 256, 1024, 512)
  const nbSteps = getValidNumber(options?.nbSteps, 5, 100, 20)
  // console.log("SEED FOR 360:", seed)

  const instance = instances.shift()
  instances.push(instance)

  const positive = [
    "360 view",
    positivePrompt,
    "beautiful",
    // "intricate details",
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
    positive, // string  in 'Prompt 2' Textbox component		
    negative, // string  in 'Negative prompt 2' Textbox component		
    true, // boolean  in 'Use negative prompt' Checkbox component		
    false, // boolean  in 'Use prompt 2' Checkbox component		
    false, // boolean  in 'Use negative prompt 2' Checkbox component		
    seed, // number (numeric value between 0 and 2147483647) in 'Seed' Slider component		
    width, // number (numeric value between 256 and 1024) in 'Width' Slider component		
    height, // number (numeric value between 256 and 1024) in 'Height' Slider component		
    8, // number (numeric value between 1 and 20) in 'Guidance scale for base' Slider component		
    8, // number (numeric value between 1 and 20) in 'Guidance scale for refiner' Slider component		
    nbSteps, // number (numeric value between 10 and 100) in 'Number of inference steps for base' Slider component		
    nbSteps, // number (numeric value between 10 and 100) in 'Number of inference steps for refiner' Slider component		
    true, // boolean  in 'Apply refiner' Checkbox component
    secretToken,
  ])) as any
    
  const result = rawResponse?.data?.[0] as string
  if (!result?.length) {
    throw new Error(`the returned image was empty`)
  }
  return result
}
