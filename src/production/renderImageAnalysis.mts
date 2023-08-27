import { analyzeImage } from "../analysis/analyzeImageWithIDEFICSAndNastyHack.mts"
import { RenderedScene, RenderRequest } from "../types.mts"
import { upscaleImage } from "../utils/upscaleImage.mts"

export async function renderImageAnalysis(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {
  response.alt = request.prompt
  
  try {
    // note: this converts a base64 PNG to a base64 JPG (which is good, actually!)
    response.assetUrl = await analyzeImage(response.assetUrl, response.assetUrl)
    console.log(`analysis worked on the first try!`)
  } catch (err) {
    console.error(`analysis failed the first time.. let's try again..`)
    try {
      response.assetUrl = await upscaleImage(response.assetUrl, request.upscalingFactor)
      console.log(`analysis worked on the second try!`)
    } catch (err) {
      console.error(`analysis failed on the second attempt.. let's keep the prompt as a fallback, then :|`)
      // no need to log a catastrophic failure here, since we still have the original (low-res image)
      // to work with
      response.alt = request.prompt
    }
  }

  return response
}
