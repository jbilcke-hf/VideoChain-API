import path from "node:path"

import tmpDir from "temp-dir"
import { v4 as uuidv4 } from "uuid"
import ffmpeg from "fluent-ffmpeg"

import { pendingFilesDirFilePath } from "../../config.mts"
import { moveFileFromTmpToPending } from "../filesystem/moveFileFromTmpToPending.mts"

export const addAudioToVideo = async (
  videoFileName: string,
  audioFileName: string,

  /*
  * 0.0: mute the audio completely
  * 0.5: set the audio to 50% of original volume (half volume)
  * 1.0: maintain the audio at original volume (100% of original volume)
  * 2.0: amplify the audio to 200% of original volume (double volume - might cause clipping)
  */
  volume: number = 1.0
) => {
  const inputFilePath = path.join(pendingFilesDirFilePath, videoFileName)
  const audioFilePath = path.resolve(pendingFilesDirFilePath, audioFileName)

  const tmpFileName = `${uuidv4()}.mp4`
  const tempOutputFilePath = path.join(tmpDir, tmpFileName)

  await new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .input(audioFilePath)
      .audioFilters({ filter: 'volume', options: volume }) // add audio filter for volume
      .outputOptions("-c:v copy")  // use video copy codec
      .outputOptions("-c:a aac")   // use audio codec
      .outputOptions("-map 0:v:0") // map video from 0th to 0th
      .outputOptions("-map 1:a:0") // map audio from 1st to 0th
      .outputOptions("-shortest") // finish encoding when shortest input stream ends
      .output(tempOutputFilePath)
      .on("end", resolve)
      .on("error", reject)
      .run()
  })
  await moveFileFromTmpToPending(tmpFileName, videoFileName)
};