import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"

import { ImageSegment, RenderedScene, RenderingJob, RenderRequest } from "../types.mts"
import { segmentImage } from "../utils/segmentImage.mts"
import { generateImageSDXLAsBase64 } from "../utils/generateImageSDXL.mts"
import { writeBase64ToFile } from "../utils/writeBase64ToFile.mts"


const pendingJobs: RenderingJob[] = []

export async function renderStaticScene(scene: RenderRequest): Promise<RenderedScene> {

  let imageBase64 = ""
  let error = ""

  const width = 1024
  const height = 512

  const params = {
    positivePrompt: scene.prompt,
    seed: scene.seed || undefined,
    nbSteps: scene.nbSteps || undefined,
    width,
    height
  }
  console.log(`calling generateImageSDXLAsBase64 with: `, JSON.stringify(params, null, 2))

  try {
    imageBase64 = await generateImageSDXLAsBase64(params)
    console.log("successful generation!", imageBase64.slice(0, 30))
    error = ""
    if (!imageBase64?.length) {
      throw new Error(`the generated image is empty`)
    }
  } catch (err) {
    console.error(`failed to render.. but let's try again!`)
    try {
      imageBase64 = await generateImageSDXLAsBase64(params)
      console.log("successful generation!", imageBase64.slice(0, 30))
      error = ""
      if (!imageBase64?.length) {
        throw new Error(`the generated image is empty`)
      }
    } catch (err) {
      console.error(`failed to generate the image, although ${err}`)
      error = `failed to render scene: ${err}`
      return {
        assetUrl: imageBase64,
        error,
        maskBase64: "",
        segments: []
      } as RenderedScene
    }
  }

  const actionnables = Array.isArray(scene.actionnables) ? scene.actionnables : []

  let mask = ""
  let segments: ImageSegment[] = []

  if (actionnables.length > 0) {
    console.log("we have some actionnables:", actionnables)
    console.log("going to grab the first frame")

    const tmpImageFilePath = path.join(tmpDir, `${uuidv4()}.png`)

    // console.log("beginning:", imageBase64.slice(0, 100))
    await writeBase64ToFile(imageBase64, tmpImageFilePath)
    console.log("wrote the image to ", tmpImageFilePath)
  
    if (!tmpImageFilePath) {
      console.error("failed to get the image")
      error = "failed to segment the image"
    } else {
      console.log("got the first frame! segmenting..")
      try {
        const result = await segmentImage(tmpImageFilePath, actionnables, width, height)
        mask = result.pngInBase64
        segments = result.segments
        console.log(`it worked the first time! got ${segments.length} segments`)
      } catch (err) {
        console.log("this takes too long :/ trying another server..")
        try {
          const result = await segmentImage(tmpImageFilePath, actionnables, width, height)
          mask = result.pngInBase64
          segments = result.segments
          console.log(`it worked the second time! got ${segments.length} segments`)
        } catch (err) {
          console.log("trying one last time, on a 3rd server..")
          try {
            const result = await segmentImage(tmpImageFilePath, actionnables, width, height)
            mask = result.pngInBase64
            segments = result.segments
            console.log(`it worked the third time! got ${segments.length} segments`)
          } catch (err) {
            console.log("yeah, all servers are busy it seems.. aborting")
          }
        }
      }
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
