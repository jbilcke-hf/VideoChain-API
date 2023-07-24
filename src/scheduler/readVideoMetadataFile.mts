import { promises as fs } from "node:fs"

import { Video } from "../types.mts"

export const readVideoMetadataFile = async (videoMetadataFilePath: string): Promise<Video> => {
  const video = JSON.parse(
    await fs.readFile(videoMetadataFilePath, 'utf8')
  ) as Video

  return video
}
