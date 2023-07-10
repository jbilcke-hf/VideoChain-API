import path from 'node:path'
import fs from 'node:fs'

import tmpDir from 'temp-dir'

export const downloadVideo = async (remoteUrl: string, fileName: string): Promise<string> => {

  const filePath = path.resolve(tmpDir, fileName)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 60 * 1000) // 15 minutes

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