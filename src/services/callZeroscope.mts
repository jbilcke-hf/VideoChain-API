import { client } from '@gradio/client'

import { getRandomInt } from "./generateSeed.mts"

const videoSpaceApiUrl = process.env.VS_VIDEO_SPACE_API_URL

export const callZeroscope = async (prompt: string, options?: {
  seed: number;
  nbFrames: number;
  nbSteps: number;
}) => {
  const seed = options?.seed || getRandomInt()
  const nbFrames = options?.nbFrames || 24 // we can go up to 48 frames, but then upscaling quill require too much memory!
  const nbSteps = options?.nbSteps || 35

  const api = await client(videoSpaceApiUrl)

  const rawResponse = await api.predict('/run', [		
    prompt, // string  in 'Prompt' Textbox component		
    seed, // number (numeric value between 0 and 2147483647) in 'Seed' Slider component		
    nbFrames, // 24 // it is the nb of frames per seconds I think?
    nbSteps, // 10, (numeric value between 10 and 50) in 'Number of inference steps' Slider component
  ]) as any
  
  const { name } = rawResponse?.data?.[0]?.[0] as { name: string, orig_name: string }

  return `${videoSpaceApiUrl}/file=${name}`
}
