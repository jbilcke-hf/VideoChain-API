import path from 'node:path'
import { promises as fs } from 'node:fs'

import tmpDir from 'temp-dir'
import ffmpeg from 'fluent-ffmpeg'

export const addAudioToVideo = async (videoFilePath: string, audioFilePath: string): Promise<string> => {
  
  const tempOutputFilePath = `${videoFilePath.split('.')[0]}-temp.mp4`
  
  await new Promise((resolve, reject) => {
    ffmpeg(videoFilePath)
      .input(audioFilePath)
      .outputOptions('-c:v copy')  // use video copy codec
      .outputOptions('-c:a aac')   // use audio codec
      .outputOptions('-map 0:v:0') // map video from 0th to 0th
      .outputOptions('-map 1:a:0') // map audio from 1st to 0th
      .outputOptions('-shortest') // finish encoding when shortest input stream ends
      .output(tempOutputFilePath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })

  // Now we want to replace the original video file with the new file that has been created
  await fs.rename(tempOutputFilePath, videoFilePath)

  return videoFilePath
};