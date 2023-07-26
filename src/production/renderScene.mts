import { v4 as uuidv4 } from "uuid"

import { ImageSegment, RenderAPIResponse, RenderRequest } from "../types.mts"
import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"
import { generateSeed } from "../utils/generateSeed.mts"
import { getValidNumber } from "../utils/getValidNumber.mts"
import { generateVideo } from "./generateVideo.mts"
import { getFirstVideoFrame } from "../utils/getFirstVideoFrame.mts"
import { segmentImage } from "../utils/segmentImage.mts"

const state = {
  isRendering: false
}

const seed = generateSeed()

export async function renderScene(scene: RenderRequest): Promise<RenderAPIResponse> {
  // console.log("renderScene")

  // let's disable this for now
  // this is only reliable if nothing crashes anyway..
  /*
  if (state.isRendering) {
    // console.log("renderScene: isRendering")
    return {
      videoUrl: "",
      error: "already rendering",
      maskBase64: "",
      segments: [],
    }
  }
  */

  // onsole.log("marking as isRendering")
  state.isRendering = true

  let url = ""
  let error = ""

  try {
    url = await generateVideo(scene.prompt, {
      seed: getValidNumber(scene.seed, 0, 4294967295, generateSeed()),
      nbFrames: getValidNumber(scene.nbFrames, 8, 24, 16), // 2 seconds by default
      nbSteps: getValidNumber(scene.nbSteps, 1, 50, 10), // use 10 by default to go fast, but not too sloppy
    })
    // console.log("successfull generation")
    error = ""
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
        const result = await segmentImage(firstFrameFilePath, actionnables)
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

  // console.log("marking as not rendering anymore")
  state.isRendering = false
  error = ""

  return {
    videoUrl: url,
    error,
    maskBase64: mask,
    segments
  } as RenderAPIResponse
}