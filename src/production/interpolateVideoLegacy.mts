import { promises as fs } from "node:fs"
import path from "node:path"
import { Blob } from "buffer"

import { client } from "@gradio/client"
import tmpDir from "temp-dir"

import { downloadFileToTmp } from '../utils/downloadFileToTmp.mts'

const instances: string[] = [
  process.env.VC_VIDEO_INTERPOLATION_SPACE_API_URL
]

export const interpolateVideo = async (fileName: string, steps: number, fps: number) => {

  const inputFilePath = path.join(tmpDir, fileName)

  const instance = instances.shift()
  instances.push(instance)

  const api = await client(instance)

  const video = await fs.readFile(inputFilePath)

  const blob = new Blob([video], { type: 'video/mp4' })
  // const blob = blobFrom(filePath)
  const result = await api.predict(1, [
    blob, 	// blob in 'parameter_5' Video component		
    steps, // number (numeric value between 1 and 4) in 'Interpolation Steps' Slider component		
    fps, // string (FALSE! it's a number)  in 'FPS output' Radio component
  ])

  const data = (result as any).data[0]
  console.log('raw data:', data)
  const { orig_name, data: remoteFilePath } = data
  const remoteUrl = `${instance}/file=${remoteFilePath}`
  console.log("remoteUrl:", remoteUrl)
  await downloadFileToTmp(remoteUrl, fileName)
}