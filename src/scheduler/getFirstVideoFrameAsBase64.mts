import fs from "node:fs"
import util from "node:util"
import path from "node:path"

import ffmpeg from "fluent-ffmpeg"
import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"

const unlinkAsync = util.promisify(fs.unlink)

export async function getFirstVideoFrameAsBase64(videoPath: string): Promise<string | void> {
  const tmpFileName = `${uuidv4()}.jpg`

  const tmpFilePath = path.resolve(tmpDir, tmpFileName)

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .outputOptions("-vframes 1")
            .output(tmpFilePath)
            .on("end", async () => {
                let base64;
                try {
                  base64 = await fs.promises.readFile(tmpFilePath, { encoding: "base64" });
                  await unlinkAsync(tmpFilePath)
                } catch(err) {
                   return reject(err)
                }
                resolve(base64)
            })
            .on("error", reject)
            .run()
    })
}
