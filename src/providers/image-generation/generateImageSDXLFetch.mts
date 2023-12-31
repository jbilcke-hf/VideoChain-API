import { client } from "@gradio/client"

import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { getValidNumber } from "../../utils/validators/getValidNumber.mts"

// TODO add a system to mark failed instances as "unavailable" for a couple of minutes
// console.log("process.env:", process.env)

// note: to reduce costs I use the small A10s (not the large)
// anyway, we will soon not need to use this cloud anymore 
// since we will be able to leverage the Inference API
const instance = `${process.env.VC_SDXL_SPACE_API_URL || ""}`
const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

// console.log("DEBUG:", JSON.stringify({ instances, secretToken }, null, 2))

export async function generateImageSDXLAsBase64(options: {
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

  // the negative prompt CAN be missing, since we use a trick
  // where we make the interface mandatory in the TS doc,
  // but browsers might send something partial
  const negativePrompt = options?.negativePrompt || ""
  
  // we treat 0 as meaning "random seed"
  const seed = (options?.seed ? options.seed : 0) || generateSeed()

  const width = getValidNumber(options?.width, 256, 1024, 512)
  const height = getValidNumber(options?.height, 256, 1024, 512)
  const nbSteps = getValidNumber(options?.nbSteps, 5, 100, 20)
  // console.log("SEED:", seed)

  const positive = [

    // oh well.. is it too late to move this to the bottom?
    "beautiful",
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

  const res = await fetch(instance + (instance.endsWith("/") ? "" : "/") + "api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fn_index: 1, // <- important!
      data: [
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
        true, // boolean  in 'Apply refiner' Checkbox component,
        secretToken
      ],
    }),
    cache: "no-store",
  })

  const { data } = await res.json()

  // console.log("data:", data)
  // Recommendation: handle errors
  if (res.status !== 200 || !Array.isArray(data)) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data (status: ${res.status})`)
  }
  // console.log("data:", data.slice(0, 50))

  if (!data[0]) {
    throw new Error(`the returned image was empty`)
  }

  return data[0] as string
}
