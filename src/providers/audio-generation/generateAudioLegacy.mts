import { client } from '@gradio/client'

import { generateSeed } from "../../utils/misc/generateSeed.mts"

export const state = {
  load: 0
}

const instances: string[] = [
  process.env.VC_AUDIO_GENERATION_SPACE_API_URL
]

export const generateAudio = async (prompt: string, options?: {
  seed: number;
  nbFrames: number;
  nbSteps: number;
}) => {

  if (state.load === instances.length) {
    throw new Error(`all audio generation servers are busy, try again later..`)
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
    ]) as any
    
    const { name } = rawResponse?.data?.[0]?.[0] as { name: string, orig_name: string }

    return `${instance}/file=${name}`
  } catch (err) {
    throw err
  } finally {
    state.load -= 1
  }
}