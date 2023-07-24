import { promises as fs } from "node:fs"
import path from "path"

import { Video } from "../types.mts"
import { pendingMetadataDirFilePath } from "../config.mts"

export const updatePendingVideo = async (video: Video) => {
  try {
    const fileName = `${video.ownerId}_${video.id}.json`
    const filePath = path.join(pendingMetadataDirFilePath, fileName)
    await fs.writeFile(filePath, JSON.stringify(video, null, 2), "utf8")
  } catch (err) {
    console.error(`Failed to update the video. Probably an issue with the serialized object or the file system: ${err}`)
    // we do not forward the exception, there is no need
    // we will just try again the job later (even if it means losing a bit of data)
  }
}