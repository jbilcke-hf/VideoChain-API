
import { RenderedScene, RenderRequest } from "../types.mts"
import { analyzeImage } from "../providers/image-caption/analyzeImageWithIDEFICSAndNastyHack.mts"

export async function renderImageAnalysis(
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> {
  response.alt = request.prompt
  
  try {
    // note: this converts a base64 PNG to a base64 JPG (which is good, actually!)
    response.alt = await analyzeImage(response.assetUrl, request.prompt)
    console.log(`analysis worked on the first try!`)
  } catch (err) {
    console.error(`analysis failed the first time.. let's try again..`)
    try {
      response.alt = await analyzeImage(response.assetUrl, request.prompt)
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
