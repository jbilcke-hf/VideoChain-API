import { promises as fs } from "node:fs"
import path from "path"

import { Video } from "../types.mts"
import { pendingMetadataDirFilePath } from "../config.mts"

export const savePendingVideo = async (video: Video) => {
  const fileName = `${video.ownerId}_${video.id}.json`
  const filePath = path.join(pendingMetadataDirFilePath, fileName)
  await fs.writeFile(filePath, JSON.stringify(video, null, 2), "utf8")
}