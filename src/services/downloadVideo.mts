import path from 'node:path'
import fs from 'node:fs'

import tmpDir from 'temp-dir'

export const downloadVideo = async (remoteUrl: string, fileName: string): Promise<string> => {

  const filePath = path.resolve(tmpDir, fileName)

  // download the video
  const response = await fetch(remoteUrl)

  // write it to the disk
  const arrayBuffer = await response.arrayBuffer()

  await fs.promises.writeFile(
    filePath,
    Buffer.from(arrayBuffer)
  )

  return fileName
}