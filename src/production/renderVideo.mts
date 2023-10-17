import { RenderedScene, RenderRequest } from "../types.mts"
import { generateVideo } from "../providers/video-generation/generateVideoWithZeroscope.mts"

export async function renderVideo(
  request: RenderRequest,
  response: RenderedScene
): Promise<RenderedScene> {

  const params = {
    positivePrompt: request.prompt,
    seed: request.seed,
    nbFrames: request.nbFrames,
    nbSteps: request.nbSteps,
  }

  try {
    response.assetUrl = await generateVideo(params)
    // console.log("successfull generation")

    if (!response.assetUrl?.length) {
      throw new Error(`url for the generated video is empty`)
    }
  } catch (err) {
    console.error(`failed to render the video scene.. but let's try again!`)

    try {
      response.assetUrl = await generateVideo(params)
      // console.log("successfull generation")

      if (!response.assetUrl?.length) {
        throw new Error(`url for the generated video is empty`)
      }
      
    } catch (err) {
      try {
        response.assetUrl = await generateVideo(params)
        // console.log("successfull generation")
  
        if (!response.assetUrl?.length) {
          throw new Error(`url for the generated video is empty`)
        }
        
      } catch (err) {
        console.error(`it failed the video for third time ${err}`)
        response.error = `failed to render video scene: ${err}`
        response.status = "error"
      }
    }
  }

  return response
}