import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"

import { ImageSegment, RenderedScene, RenderRequest } from "../types.mts"
import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"
import { segmentImage } from "../utils/segmentImage.mts"
import { generateImageSDXLAsBase64 } from "../utils/generateImageSDXL.mts"
import { writeBase64ToFile } from "../utils/writeBase64ToFile.mts"

export async function renderStaticScene(scene: RenderRequest): Promise<RenderedScene> {

  let imageBase64 = ""
  let error = ""

  try {
    console.log(`calling generateImageSDXLAsBase64 with: `, JSON.stringify({
      positivePrompt: scene.prompt,
      seed: scene.seed || undefined,
      nbSteps: scene.nbSteps || undefined,
      width: 1024,
      height: 512
    }, null, 2))
    imageBase64 = await generateImageSDXLAsBase64({
      positivePrompt: scene.prompt,
      seed: scene.seed || undefined,
      nbSteps: scene.nbSteps || undefined,
      width: 1024,
      height: 512
    })
    console.log("successful generation!", imageBase64.slice(0, 30))
    error = ""
    if (!imageBase64?.length) {
      throw new Error(`the generated image is empty`)
    }
  } catch (err) {
    error = `failed to render scene: ${err}`
    return {
      assetUrl: imageBase64,
      error,
      maskBase64: "",
      segments: []
    } as RenderedScene
  }

  const actionnables = Array.isArray(scene.actionnables) ? scene.actionnables : []

  let mask = ""
  let segments: ImageSegment[] = []

  if (actionnables.length > 0) {
    console.log("we have some actionnables:", actionnables)
    console.log("going to grab the first frame")

    const tmpImageFilePath = path.join(tmpDir, `${uuidv4()}.png`)

    console.log("beginning:", imageBase64.slice(0, 100))
    await writeBase64ToFile(imageBase64, tmpImageFilePath)
    console.log("wrote the image to ", tmpImageFilePath)
  
    if (!tmpImageFilePath) {
      console.error("failed to get the image")
      error = "failed to segment the image"
    } else {
      console.log("got the first frame! segmenting..")
      const result = await segmentImage(tmpImageFilePath, actionnables)
      mask = result.pngInBase64
      segments = result.segments
      console.log("success!", {  segments })
    }
  } else {
    console.log("no actionnables: just returning the image, then")
  }

  error = ""

  return {
    assetUrl: imageBase64,
    error,
    maskBase64: mask,
    segments
  } as RenderedScene
}
