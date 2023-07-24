import path from "node:path"
import { promises as fs } from "node:fs"

import { Video } from "../types.mts"
import { readVideoMetadataFile } from "./readVideoMetadataFile.mts"

export const readVideoMetadataFiles = async (videoMetadataDirFilePath: string, ownerId?: string): Promise<Video[]> => {

  let videosMetadataFiles: string[] = []
  try {
    const filesInDir = await fs.readdir(videoMetadataDirFilePath)
    // console.log("filesInDir:", filesInDir)

    // we only keep valid files (in UUID.json format)
    videosMetadataFiles = filesInDir.filter(fileName =>
      fileName.match(/[a-z0-9\-_]\.json/i) && (ownerId ? fileName.includes(ownerId): true)
    )

    // console.log("videosfiles:", videosFiles)
  } catch (err) {
    console.log(`failed to read videos: ${err}`)
  }

  const videos: Video[] = []

  for (const videoMetadataFileName of videosMetadataFiles) {
    // console.log("videoFileName:", videoFileName)
    const videoMetadataFilePath = path.join(videoMetadataDirFilePath, videoMetadataFileName)
    try {
      const videoMetadata = await readVideoMetadataFile(videoMetadataFilePath)
      videos.push(videoMetadata)
    } catch (parsingErr) {
      console.log(`failed to read ${videoMetadataFileName}: ${parsingErr}`)
      console.log(`deleting corrupted file ${videoMetadataFileName}`)
      try {
        await fs.unlink(videoMetadataFilePath)
      } catch (unlinkErr) {
        console.log(`failed to unlink ${videoMetadataFileName}: ${unlinkErr}`)
      }
    }
  }

  return videos
}
