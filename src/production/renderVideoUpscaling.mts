import { upscaleVideoToBase64URL } from "../providers/video-upscaling/upscaleVideoToBase64URL.mts"
import { RenderedScene, RenderRequest } from "../types.mts"

export async function renderVideoUpscaling(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {
  
  try {
    // note: this converts a base64 PNG to a base64 JPG (which is good, actually!)
    response.assetUrl = await upscaleVideoToBase64URL(response.assetUrl, request.prompt)
    // console.log(`upscaling worked on the first try!`)
  } catch (err) {
    // console.error(`upscaling failed the first time.. let's try again..`)
    try {
      response.assetUrl = await upscaleVideoToBase64URL(response.assetUrl, request.prompt)
      // console.log(`upscaling worked on the second try!`)
    } catch (err) {
      console.error(`upscaling failed on the second attempt.. let's keep the low-res image then :|`)
      // no need to log a catastrophic failure here, since we still have the original (low-res image)
      // to work with
    }
  }

  return response
}
