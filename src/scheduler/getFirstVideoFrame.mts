import path from "node:path"

import ffmpeg from "fluent-ffmpeg"
import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"

export async function getFirstVideoFrame(videoFilePath: string): Promise<string | void> {
  const tmpFileName = `${uuidv4()}.jpg`

  const tmpFilePath = path.resolve(tmpDir, tmpFileName)

    return new Promise((resolve, reject) => {
        ffmpeg(videoFilePath)
            .outputOptions("-vframes 1")
            .output(tmpFilePath)
            .on("end", async () => {
                resolve(tmpFilePath)
            })
            .on("error", reject)
            .run()
    })
}
