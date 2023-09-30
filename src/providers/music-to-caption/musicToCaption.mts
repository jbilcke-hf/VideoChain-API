
import { client } from "@gradio/client"

import { generateSeed } from "../../utils/misc/generateSeed.mts"

export const state = {
  load: 0,
}

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_MUSIC_CAPTION_SPACE_API_URL_1 || ""}`,
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const musicToCaption = async (musicBlob: string) => {

  state.load += 1

  try {

    const instance = instances.shift()
    instances.push(instance)

    console.log("musicToCaption")

    const api = await client(instance, {
      hf_token: `${process.env.VC_HF_API_TOKEN}` as any
    })

    // const input = new Blob([wav], { type: 'audio/wav' })
    // const blob = new Blob([video], { type: 'video/mp4' })

    const rawResponse = await api.predict('/predict', [		
      musicBlob, // string  in 'Prompt' Textbox component		
     // secretToken,
    ]) as any
    
    console.log("rawResponse:", rawResponse)

    const { name } = rawResponse?.data?.[0]?.[0] as { name: string, orig_name: string }

    return "TODO"
  } catch (err) {
    throw err
  } finally {
    state.load -= 1
  }
}
