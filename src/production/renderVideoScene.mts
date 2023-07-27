import { v4 as uuidv4 } from "uuid"

import { ImageSegment, RenderedScene, RenderRequest } from "../types.mts"
import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"
import { generateSeed } from "../utils/generateSeed.mts"
import { getValidNumber } from "../utils/getValidNumber.mts"
import { generateVideo } from "./generateVideo.mts"
import { getFirstVideoFrame } from "../utils/getFirstVideoFrame.mts"
import { segmentImage } from "../utils/segmentImage.mts"

export async function renderVideoScene(scene: RenderRequest): Promise<RenderedScene> {

  let url = ""
  let error = ""

  const width = 576
  const height = 320

  try {
    url = await generateVideo(scene.prompt, {
      seed: getValidNumber(scene.seed, 0, 2147483647, generateSeed()),
      nbFrames: getValidNumber(scene.nbFrames, 8, 24, 16), // 2 seconds by default
      nbSteps: getValidNumber(scene.nbSteps, 1, 50, 10), // use 10 by default to go fast, but not too sloppy
    })
    // console.log("successfull generation")
    error = ""
    if (!url?.length) {
      throw new Error(`url for the generated image is empty`)
    }
  } catch (err) {
    error = `failed to render scene: ${err}`
  }



  // TODO add segmentation here
  const actionnables = Array.isArray(scene.actionnables) ? scene.actionnables : []

  let mask = ""
  let segments: ImageSegment[] = []

  if (actionnables.length > 0) {
    console.log("we have some actionnables:", actionnables)
    if (scene.segmentation === "firstframe") {
      console.log("going to grab the first frame")
      const tmpVideoFilePath = await downloadFileToTmp(url, `${uuidv4()}`)
      console.log("downloaded the first frame to ", tmpVideoFilePath)
      const firstFrameFilePath = await getFirstVideoFrame(tmpVideoFilePath)
      console.log("downloaded the first frame to ", firstFrameFilePath)
      
      if (!firstFrameFilePath) {
        console.error("failed to get the image")
        error = "failed to segment the image"
      } else {
        console.log("got the first frame! segmenting..")
        const result = await segmentImage(firstFrameFilePath, actionnables, width, height)
        mask = result.pngInBase64
        segments = result.segments
        // console.log("success!", {  segments })
      }
      /*
      const jpgBase64 = await getFirstVideoFrame(tmpVideoFileName)
      if (!jpgBase64) {
        console.error("failed to get the image")
        error = "failed to segment the image"
      } else {
        console.log(`got the first frame (${jpgBase64.length})`)

        console.log("TODO: call segmentImage with the base64 image")
        await segmentImage()
      }
      */
    }
  }

  error = ""

  return {
    assetUrl: url,
    error,
    maskBase64: mask,
    segments
  } as RenderedScene
}