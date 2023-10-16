import { client } from "@gradio/client"

import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { VideoGenerationOptions } from "./types.mts"
import { getPositivePrompt } from "./defaultPrompts.mts"

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_1 || ""}`,
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_2 || ""}`,
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_3 || ""}`,
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_4 || ""}`,
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const generateVideo = async ({
  positivePrompt,
  seed,
  nbFrames = 8, // for now the only values that make sense are 1 (for a jpg) or 8 (for a video)
  nbSteps = 30, // when rendering a final video, we want a value like 50 or 70 here
}: VideoGenerationOptions) => {
  try {
    const instance = instances.shift()
    instances.push(instance)

    const api = await client(instance, {
      hf_token: `${process.env.VC_HF_API_TOKEN}` as any
    })

    const rawResponse = await api.predict('/run', [		
      getPositivePrompt(positivePrompt), // string  in 'Prompt' Textbox component	
      
      // we treat 0 as meaning "random seed"
      !isNaN(seed) && isFinite(seed) && seed > 0 ? seed : generateSeed(), // number (numeric value between 0 and 2147483647) in 'Seed' Slider component		
      nbFrames || 24, // 24 // it is the nb of frames per seconds I think?
      nbSteps || 35, // 10, (numeric value between 10 and 50) in 'Number of inference steps' Slider component
      secretToken,
    ]) as any
    
    // console.log("rawResponse:", rawResponse)

    const { name } = rawResponse?.data?.[0]?.[0] as { name: string, orig_name: string }

    return `${instance}/file=${name}`
  } catch (err) {
    throw err
  }
}
