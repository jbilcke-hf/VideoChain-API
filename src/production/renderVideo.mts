import { RenderedScene, RenderRequest } from "../types.mts"
import { generateVideo } from "./generateVideo.mts"

export async function renderVideo(
  request: RenderRequest,
  response: RenderedScene
): Promise<RenderedScene> {

  const params = {
    seed: request.seed,
    nbFrames: request.nbFrames,
    nbSteps: request.nbSteps,
  }

  try {
    response.assetUrl = await generateVideo(request.prompt, params)
    // console.log("successfull generation")

    if (!response.assetUrl?.length) {
      throw new Error(`url for the generated video is empty`)
    }
  } catch (err) {
    console.error(`failed to render the video scene.. but let's try again!`)

    try {
      response.assetUrl = await generateVideo(request.prompt, params)
      // console.log("successfull generation")

      if (!response.assetUrl?.length) {
        throw new Error(`url for the generated video is empty`)
      }
      
    } catch (err) {
      console.error(`it failed the video for second time ${err}`)
      response.error = `failed to render video scene: ${err}`
      response.status = "error"
    }
  }

  return response
}