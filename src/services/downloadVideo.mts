import path from 'node:path'
import fs from 'node:fs'
import { pendingVideosDirFilePath } from '../config.mts'

export const downloadVideo = async (remoteUrl: string, fileName: string): Promise<string> => {

  const filePath = path.resolve(pendingVideosDirFilePath, fileName)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 60 * 1000) // 15 minutes

  // TODO finish the timeout?

  // download the video
  const response = await fetch(remoteUrl, {
    signal: controller.signal
  })

  // write it to the disk
  const arrayBuffer = await response.arrayBuffer()

  await fs.promises.writeFile(
    filePath,
    Buffer.from(arrayBuffer)
  )

  return fileName
}