import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"

import { RenderedScene, RenderRequest } from "../types.mts"
import { segmentImage } from "../utils/segmentImage.mts"
import { writeBase64ToFile } from "../utils/writeBase64ToFile.mts"


export async function renderImageSegmentation(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {

  const actionnables = Array.isArray(request.actionnables) ? request.actionnables : []

  if (actionnables.length > 0) {
    console.log("we have some actionnables:", actionnables)
    console.log("going to grab the first frame")

    const tmpImageFilePath = path.join(tmpDir, `${uuidv4()}.png`)

    // console.log("beginning:", imageBase64.slice(0, 100))
    await writeBase64ToFile(response.assetUrl, tmpImageFilePath)
    console.log("wrote the image to ", tmpImageFilePath)
  
    if (!tmpImageFilePath) {
      console.error("failed to get the image")
      response.error = "failed to segment the image"
      response.status = "error"
    } else {
      console.log("got the first frame! segmenting..")
      try {
        const result = await segmentImage(tmpImageFilePath, actionnables, request.width, request.height)
        response.maskBase64 = result.pngInBase64
        response.segments = result.segments
  
        console.log(`it worked the first time! got ${response.segments.length} segments`)
      } catch (err) {
        console.log("this takes too long :/ trying another server..")
        try {
          const result = await segmentImage(tmpImageFilePath, actionnables, request.width, request.height)
          response.maskBase64 = result.pngInBase64
          response.segments = result.segments
         
          console.log(`it worked the second time! got ${response.segments.length} segments`)
        } catch (err) {
          console.log("trying one last time, on a 3rd server..")
          try {
            const result = await segmentImage(tmpImageFilePath, actionnables, request.width, request.height)
            response.maskBase64 = result.pngInBase64
            response.segments = result.segments
        
            console.log(`it worked the third time! got ${response.segments.length} segments`)
          } catch (err) {
            console.log("yeah, all servers are busy it seems.. aborting")
            response.error = "all servers are busy"
            response.status = "error"
          }
        }
      }
    }
  } else {
    console.log("no actionnables: just returning the image, then")
  }

  return response
}
