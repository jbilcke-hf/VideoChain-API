import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import ffmpeg from "fluent-ffmpeg"

import { pendingFilesDirFilePath } from "../config.mts"

export const normalizePendingVideoToTmpFilePath = async (fileName: string): Promise<string> => {
  return new Promise((resolve,reject) => {

    const tmpFileName = `${uuidv4()}.mp4`

    const filePath = path.join(pendingFilesDirFilePath, fileName)
    const tmpFilePath = path.join(tmpDir, tmpFileName)

    ffmpeg.ffprobe(filePath, function(err,) {
      if (err) { reject(err); return; }

    ffmpeg(filePath)

      .size("1280x720")

      .save(tmpFilePath)
      .on("end", async () => {
        resolve(tmpFilePath)
      })
      .on("error", (err) => {
        reject(err)
      })
    })
  })
}