import { client } from "@gradio/client"

import { VideoGenerationOptions } from "./types.mts"
import { getNegativePrompt, getPositivePrompt } from "./defaultPrompts.mts"
import { generateSeed } from "../../utils/misc/generateSeed.mts"

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_HOTSHOT_XL_GRADIO_SPACE_API_URL_1 || ""}`,
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const generateVideo = async ({
  positivePrompt,
  negativePrompt = "",
  seed,
  nbFrames = 8, // for now the only values that make sense are 1 (for a jpg) or 8 (for a video)
  videoDuration = 1000, // for now Hotshot doesn't really supports anything else
  nbSteps = 30, // when rendering a final video, we want a value like 50 or 70 here
  size = "768x320",

  // for jbilcke-hf/sdxl-cinematic-2 it is "cinematic-2"
  triggerWord = "cinematic-2",

  huggingFaceLora = "jbilcke-hf/sdxl-cinematic-2",
}: VideoGenerationOptions) => {

  const instance = instances.shift()
  instances.push(instance)

  const api = await client(instance, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })
  
  // pimp the prompt
  positivePrompt = getPositivePrompt(positivePrompt, triggerWord)
  negativePrompt = getNegativePrompt(negativePrompt)

  try {

    const rawResponse = await api.predict('/run', [
      secretToken,
			positivePrompt, // string  in 'Prompt' Textbox component		
			negativePrompt || "", 
      huggingFaceLora?.length || undefined, // string  in 'Public LoRA ID' Textbox component		
			size || '512x512', // string (Option from: [('320x768', '320x768'), ('384x672', '384x672'), ('416x608', '416x608'), ('512x512', '512x512'), ('608x416', '608x416'), ('672x384', '672x384'), ('768x320', '768x320')]) in 'Size' Dropdown component		
      !isNaN(seed) && isFinite(seed) ? seed : generateSeed(), // number (numeric value between -1 and 423538377342) in 'Seed' Slider component, -1 to set to random
      nbSteps || 30, 
      nbFrames || 8,
      videoDuration || 1000,
    ]) as any

    // console.log("rawResponse:", rawResponse)

    console.log("data:", rawResponse?.data)
    const { name } = rawResponse?.data?.[0]?.[0] as { name: string, orig_name: string }

    return `${instance}/file=${name}`
  } catch (err) {
    throw err
  }
}
