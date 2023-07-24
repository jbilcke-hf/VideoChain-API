import path from "node:path"

import { completedMetadataDirFilePath, pendingMetadataDirFilePath } from "../config.mts"
import { readVideoMetadataFile } from "./readVideoMetadataFile.mts"

export const getVideo = async (ownerId: string, videoId: string) => {
  const videoFileName = `${ownerId}_${videoId}.json`

  const completedVideoMetadataFilePath = path.join(completedMetadataDirFilePath, videoFileName)
  const pendingVideoMetadataFilePath = path.join(pendingMetadataDirFilePath, videoFileName)

  try {
    const completedVideo = await readVideoMetadataFile(completedVideoMetadataFilePath)
    return completedVideo
  } catch (err) {
    try {
      const pendingVideo= await readVideoMetadataFile(pendingVideoMetadataFilePath)
      return pendingVideo
    } catch (err) {
      throw new Error(`couldn't find video ${videoId} for owner ${ownerId}`)
    }
  }
}