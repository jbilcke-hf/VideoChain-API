import path from "node:path"
import fs from "node:fs"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import ffmpeg from "fluent-ffmpeg"

export const postInterpolation = async (fileName: string, duration: number, nbFrames: number): Promise<string> => {
  return new Promise((resolve,reject) => {

    const tmpFileName = `${uuidv4()}.mp4`

    const filePath = path.join(tmpDir, fileName)
    const tmpFilePath = path.join(tmpDir, tmpFileName)


    ffmpeg.ffprobe(filePath, function(err, metadata) {
      if (err) { reject(err); return; }
      

      const currentVideoDuration = metadata.format.duration

      // compute a ratio ex. 0.3 = 30% of the total length
      const durationRatio = currentVideoDuration / duration

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
        await fs.promises.copyFile(tmpFilePath, filePath)
        try {
          await fs.promises.unlink(tmpFilePath)
        } catch (err) {
          console.log("failed to cleanup (no big deal..)")
        }

        resolve(fileName)
      })
      .on("error", (err) => {
        reject(err)
      })
    })
  })
}