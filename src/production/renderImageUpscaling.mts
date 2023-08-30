import { RenderedScene, RenderRequest } from "../types.mts"
import { upscaleImage } from "../utils/upscaleImage.mts"

export async function renderImageUpscaling(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {
  
  try {
    // note: this converts a base64 PNG to a base64 JPG (which is good, actually!)
    response.assetUrl = await upscaleImage(response.assetUrl, request.upscalingFactor)
    // console.log(`upscaling worked on the first try!`)
  } catch (err) {
    // console.error(`upscaling failed the first time.. let's try again..`)
    try {
      response.assetUrl = await upscaleImage(response.assetUrl, request.upscalingFactor)
      // console.log(`upscaling worked on the second try!`)
    } catch (err) {
      console.error(`upscaling failed on the second attempt.. let's keep the low-res image then :|`)
      // no need to log a catastrophic failure here, since we still have the original (low-res image)
      // to work with
    }
  }

  return response
}
