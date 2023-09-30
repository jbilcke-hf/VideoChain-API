
import { client } from "@gradio/client"

import { convertMp3ToWavBase64 } from "../../utils/audio/convertMp3ToWavBase64.mts"

const instances: string[] = [
  `${process.env.VC_SPEECH_TO_TEXT_SPACE_API_URL_1 || ""}`,
].filter(instance => instance?.length > 0)

export async function speechToText(sound: string): Promise<string> {

  const instance = instances.shift()
  instances.push(instance)

  const api = await client(instance, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })

  console.log("/speechToText: calling Space..")

  // TODO try a wav? audio/wav
  const wav = await convertMp3ToWavBase64(sound)

  // const input = sound
  // const input = Buffer.from(sound, "base64")
  // const input = new Blob([sound], { type: 'audio/mpeg' })
  const input = new Blob([wav], { type: 'audio/wav' })

  const result = await api.predict("/transcribe", [
    input,
  ])

  console.log(result)

  return "TODO"

}