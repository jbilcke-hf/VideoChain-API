import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import ffmpeg from "fluent-ffmpeg"
import { moveFileFromTmpToPending } from "../utils/moveFileFromTmpToPending.mts"

export const postInterpolation = async (fileName: string, durationMs: number, nbFrames: number): Promise<string> => {
  return new Promise((resolve,reject) => {

    const tmpFileName = `${uuidv4()}.mp4`

    const filePath = path.join(tmpDir, fileName)
    const tmpFilePath = path.join(tmpDir, tmpFileName)

    ffmpeg.ffprobe(filePath, function(err, metadata) {
      if (err) { reject(err); return; }
      
      const durationInSec = durationMs / 1000

      const currentVideoDurationInSec = metadata.format.duration
      
      console.log(`currentVideoDurationInSec in sec: ${currentVideoDurationInSec}s`)
    
      console.log(`target duration in sec: ${durationInSec}s (${durationMs}ms)`)
    
      // compute a ratio ex. 0.3 = 30% of the total length
      const durationRatio = currentVideoDurationInSec / durationInSec
      console.log(`durationRatio: ${durationRatio}`)

    ffmpeg(filePath)

      // convert to HD
      .size("1280x720")

      .videoFilters([
        `setpts=${durationRatio}*PTS`, // we make the video faster
        //'scale=-1:576:lanczos',
        // 'unsharp=5:5:0.2:5:5:0.2', // not recommended, this make the video more "pixely"
        'noise=c0s=10:c0f=t+u' // add a movie grain noise
      ])
      .outputOptions([
        `-r ${nbFrames}`,
      ])

      .save(tmpFilePath)
      .on("end", async () => {
        await moveFileFromTmpToPending(tmpFileName, fileName)

        resolve(fileName)
      })
      .on("error", (err) => {
        reject(err)
      })
    })
  })
}