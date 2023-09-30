
import path from "node:path"
import { nodewhisper } from "nodejs-whisper"

import { convertMp3ToWavFilePath } from "../utils/convertMp3ToWavFilePath.mts"

export async function speechToText(sound: string): Promise<string> {

  console.log("/speechToText: calling whisper binding..")

  // for some reason our mp3 is unreadable on Mac
  // (too short?)
  // but ffmpeg manages to convert it to a valid wav
  const wavFilePath = await convertMp3ToWavFilePath(sound)

  const result = await nodewhisper(wavFilePath, {
    modelName: "large", //Downloaded models name
    autoDownloadModelName: "large"
  })

  console.log("result:" + JSON.stringify(result, null, 2))

  return "TODO"

}

/*
async function warmup() {
  try {
    await nodewhisper("./", {
      modelName: "large", //Downloaded models name
      autoDownloadModelName: "large"
    })
  } catch (err) {

  }
}

setTimeout(() => {
  warmup()
}, 1000)
*/