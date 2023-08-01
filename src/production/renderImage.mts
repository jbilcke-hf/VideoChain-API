import { RenderedScene, RenderRequest } from "../types.mts"
import { generateImageSDXLAsBase64 } from "../utils/generateImageSDXL.mts"
import { generateImageSDXL360AsBase64 } from "../utils/generateImageSDXL360.mts"
import { generateSeed } from "../utils/generateSeed.mts"

export async function renderImage(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {

  const isSpherical = request.projection === 'spherical'

  const generateImageAsBase64 = isSpherical
    ? generateImageSDXL360AsBase64
    : generateImageSDXLAsBase64

  console.log(`going to generate an image using ${request.projection || "default (cartesian)"} projection`)
  
  const params = {
    positivePrompt: request.prompt,
    seed: request.seed,
    nbSteps: request.nbSteps,
    width: request.width,
    request: request.height
  }

  console.log(`calling generateImageAsBase64 with: `, JSON.stringify(params, null, 2))


  // first we generate a quick low quality version
  try {
    response.assetUrl = await generateImageAsBase64(params)
    console.log("successful generation!", response.assetUrl.slice(0, 30))
    if (!response.assetUrl?.length) {
      throw new Error(`the generated image is empty`)
    }
  } catch (err) {
    console.error(`failed to render.. but let's try again!`)
    try {
      response.assetUrl = await generateImageAsBase64(params)
      console.log("successful generation!", response.assetUrl.slice(0, 30))
      if (!response.assetUrl?.length) {
        throw new Error(`the generated image is empty`)
      }
    } catch (err) {
      console.error(`failed to generate the image, although ${err}`)
      response.error = `failed to render scene: ${err}`
      response.status = "error"
      response.assetUrl = ""
    }
  }

  return response
}
