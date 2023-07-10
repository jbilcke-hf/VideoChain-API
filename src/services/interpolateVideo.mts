import { promises as fs } from "node:fs"
import path from "node:path"
import { Blob } from "buffer"
// import { blobFrom } from "fetch-blob"

import { client } from "@gradio/client"
import tmpDir from "temp-dir"

import { downloadVideo } from './downloadVideo.mts'

const instances: string[] = [
  process.env.VS_INTERPOLATION_SPACE_URL
]

export const interpolateVideo = async (fileName: string) => {

  const inputFilePath = path.join(tmpDir, fileName)

  const instance = instances.shift()
  instances.push(instance)

  const app = await client(instance)

  const video = await fs.readFile(inputFilePath)

  const blob = new Blob([video], { type: 'video/mp4' })
  // const blob = blobFrom(filePath)
  const result = await app.predict(1, [
    blob, 	// blob in 'parameter_5' Video component		
    1, // number (numeric value between 1 and 4) in 'Interpolation Steps' Slider component		
    24, // string  in 'FPS output' Radio component
  ])

  const data = (result as any).data[0]
  console.log('raw data:', data)
  const { orig_name, data: remoteFilePath } = data
  const remoteUrl = `${instance}/file=${remoteFilePath}`
  console.log("remoteUrl:", remoteUrl)
  await downloadVideo(remoteUrl, fileName)
}