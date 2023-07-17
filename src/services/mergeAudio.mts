import path from "node:path"

import tmpDir from "temp-dir"
import { v4 as uuidv4 } from "uuid"
import ffmpeg from "fluent-ffmpeg"

export const mergeAudio = async ({
  input1FileName, 
  input1Volume,
  input2FileName,
  input2Volume,
  outputFileName = ''
}: {
  input1FileName: string, 
  input1Volume: number,
  input2FileName: string,
  input2Volume: number,
  outputFileName?: string 
}): Promise<string> => {
  outputFileName = `${uuidv4()}.m4a`

  const input1FilePath = path.resolve(tmpDir, input1FileName)
  const input2FilePath = path.resolve(tmpDir, input2FileName)
  const outputFilePath = path.resolve(tmpDir, outputFileName)

  const input1Ffmpeg = ffmpeg(input1FilePath)
    .outputOptions("-map 0:a:0")
    .audioFilters([{ filter: 'volume', options: input1Volume }]); // set volume for main audio
  
  const input2Ffmpeg = ffmpeg(input2FilePath)
    .outputOptions("-map 1:a:0")
    .audioFilters([{ filter: 'volume', options: input2Volume }]); // set volume for additional audio

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(input1Ffmpeg)
      .input(input2Ffmpeg)
      .outputOptions("-c:a aac")   // use audio codec
      .outputOptions("-shortest")  // finish encoding when shortest input stream ends
      .output(outputFilePath)
      .on("end", resolve)
      .on("error", reject)
      .run()
  })

  console.log(`merged audio from ${input1FileName} and ${input2FileName} into ${outputFileName}`)

  return outputFileName
}