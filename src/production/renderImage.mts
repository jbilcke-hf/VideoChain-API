import { generateImageLCMAsBase64 } from "../providers/image-generation/generateImageLCMGradio.mts"
import { generateImageSDXLTurboAsBase64 } from "../providers/image-generation/generateImageSDXLTurbo.mts"
import { generateImageSDXLAsBase64 } from "../providers/image-generation/generateImageSDXLGradio.mts"
import { generateImageSDXL360AsBase64 } from "../providers/image-generation/generateImageSDXL360.mts"
import { RenderedScene, RenderRequest } from "../types.mts"

export async function renderImage(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {

  const isSpherical = request.projection === 'spherical'

  // we don't want to switch too much between model types in VideoChain,
  // because for speed we need to pre-load the servers,
  // but there is no point in pre-loading many servers for many models
  const generateImageAsBase64 = isSpherical
    ? generateImageSDXL360AsBase64
    : request.turbo

    // turbo models are models that are slightly less beautiful
    // but much, much faster to run
    // for the moment we use SDXL + LCM, as it offers better scene coherence,
    // but we might switch to SDXL Turbo in the future if its quality improves
    ? generateImageLCMAsBase64 // generateImageSDXLTurboAsBase64 

    : generateImageSDXLAsBase64

  // console.log(`going to generate an image using ${request.projection || "default (cartesian)"} projection`)
  
  const params = {
    positivePrompt: request.prompt,
    negativePrompt: request.negativePrompt,
    seed: request.seed,
    nbSteps: request.nbSteps,
    width: request.width,
    height: request.height
  }

  // console.log(`calling generateImageAsBase64 with: `, JSON.stringify(params, null, 2))

  // we try at least 3 different servers
  try {
    response.assetUrl = await generateImageAsBase64(params)
    // console.log("successful generation!", response.assetUrl.slice(0, 30))
    if (!response.assetUrl?.length) {
      throw new Error(`the generated image is empty`)
    }
  } catch (err) {
    // console.error(`failed to render.. but let's try again!`)
    try {
      response.assetUrl = await generateImageAsBase64(params)
      // console.log("successful generation!", response.assetUrl.slice(0, 30))
      if (!response.assetUrl?.length) {
        throw new Error(`the generated image is empty`)
      }
    } catch (err) {
      try {
        response.assetUrl = await generateImageAsBase64(params)
        // console.log("successful generation!", response.assetUrl.slice(0, 30))
        if (!response.assetUrl?.length) {
          throw new Error(`the generated image is empty`)
        }
      } catch (err) {
        // console.error(`failed to generate the image, due to`, err)
        response.error = `failed to render scene: ${err}`
        response.status = "error"
        response.assetUrl = ""
      }
    }
  }

  return response
}
