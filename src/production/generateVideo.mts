import { client } from "@gradio/client"

import { generateSeed } from "../utils/generateSeed.mts"

export const state = {
  load: 0,
}

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_1 || ""}`,
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_2 || ""}`,
  // `${process.env.VC_ZEROSCOPE_SPACE_API_URL_3 || ""}`,
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const generateVideo = async (prompt: string, options?: {
  seed: number;
  nbFrames: number;
  nbSteps: number;
}) => {

  if (state.load === instances.length) {
    throw new Error(`all video generation servers are busy, try again later..`)
  }

  state.load += 1

  try {
    const seed = options?.seed || generateSeed()
    const nbFrames = options?.nbFrames || 24 // we can go up to 48 frames, but then upscaling quill require too much memory!
    const nbSteps = options?.nbSteps || 35

    const instance = instances.shift()
    instances.push(instance)

    const api = await client(instance, {
      hf_token: `${process.env.VC_HF_API_TOKEN}` as any
    })

    const rawResponse = await api.predict('/run', [		
      prompt, // string  in 'Prompt' Textbox component		
      seed, // number (numeric value between 0 and 2147483647) in 'Seed' Slider component		
      nbFrames, // 24 // it is the nb of frames per seconds I think?
      nbSteps, // 10, (numeric value between 10 and 50) in 'Number of inference steps' Slider component
      secretToken,
    ]) as any
    
    // console.log("rawResponse:", rawResponse)

    const { name } = rawResponse?.data?.[0]?.[0] as { name: string, orig_name: string }

    return `${instance}/file=${name}`
  } catch (err) {
    throw err
  } finally {
    state.load -= 1
  }
}
