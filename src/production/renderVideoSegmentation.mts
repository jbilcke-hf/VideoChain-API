import { v4 as uuidv4 } from "uuid"

import { RenderedScene, RenderRequest } from "../types.mts"
import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"
import { getFirstVideoFrame } from "../utils/getFirstVideoFrame.mts"
import { segmentImage } from "../utils/segmentImage.mts"

export async function renderVideoSegmentation(
  request: RenderRequest,
  response: RenderedScene
): Promise<RenderedScene> {

  const actionnables = Array.isArray(request.actionnables) ? request.actionnables : []

  if (actionnables.length > 0) {
    console.log("we have some actionnables:", actionnables)
    if (request.segmentation === "firstframe") {
      console.log("going to grab the first frame")
      const tmpVideoFilePath = await downloadFileToTmp(response.assetUrl, `${uuidv4()}`)
      console.log("downloaded the first frame to ", tmpVideoFilePath)
      const firstFrameFilePath = await getFirstVideoFrame(tmpVideoFilePath)
      console.log("downloaded the first frame to ", firstFrameFilePath)
      
      if (!firstFrameFilePath) {
        console.error("failed to get the image")
        response.error = "failed to segment the image"
        response.status = "error"
      } else {
        console.log("got the first frame! segmenting..")
        const result = await segmentImage(firstFrameFilePath, actionnables, request.width, request.height)
        response.maskUrl = result.maskUrl
        response.segments = result.segments

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

  return response
}