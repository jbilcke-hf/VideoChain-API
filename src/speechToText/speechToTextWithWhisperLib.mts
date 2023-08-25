
import { nodewhisper } from "nodejs-whisper"

import { convertMp3ToWavFilePath } from "../utils/convertMp3ToWavFilePath.mts"

export async function speechToText(sound: string): Promise<string> {

  console.log("/speechToText: calling whisper binding..")

  // TODO try a wav? audio/wav
  const wavFilePath = await convertMp3ToWavFilePath(sound)

  const result = await nodewhisper(wavFilePath, {
    modelName: 'base.en', //Downloaded models name
  })

  console.log(result)

  return "TODO"

}