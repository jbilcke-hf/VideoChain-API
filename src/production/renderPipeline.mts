
import { RenderedScene, RenderRequest } from "../types.mts"

import { renderImage } from "./renderImage.mts"
import { renderVideo } from "./renderVideo.mts"
import { renderImageSegmentation } from "./renderImageSegmentation.mts"
import { renderVideoSegmentation } from "./renderVideoSegmentation.mts"
import { renderImageUpscaling } from "./renderImageUpscaling.mts"
import { saveRenderedSceneToCache } from "../utils/saveRenderedSceneToCache.mts"
import { renderImageAnalysis } from "./renderImageAnalysis.mts"

export async function renderPipeline(request: RenderRequest, response: RenderedScene) {
  const isVideo = request?.nbFrames > 1

  const renderContent = isVideo ? renderVideo : renderImage
  const renderSegmentation  = isVideo ? renderVideoSegmentation : renderImageSegmentation 

  if (isVideo) {
    // console.log(`rendering a video..`)
  } else {
    // console.log(`rendering an image..`)
  }

  try {
    await renderContent(request, response)
  } catch (err) {
    // console.log(`renderContent() failed, trying a 2nd time..`)
    try {
      await renderContent(request, response)
    } catch (err2) {
      // console.log(`renderContent() failed, trying a 3th time..`)
      await renderContent(request, response)
    }
  }

  // we upscale images with esrgan
  // and for videos, well.. let's just skip this part,
  // but later we could use Zeroscope V2 XL maybe?
  const optionalUpscalingStep = isVideo
    ? Promise.resolve()
    : renderImageUpscaling(request, response)

  const optionalAnalysisStep = request.analyze
    ? renderImageAnalysis(request, response)
    : Promise.resolve()

  await Promise.all([
    renderSegmentation(request, response),
    optionalAnalysisStep,
    optionalUpscalingStep
  ])

  /*
  this is the optimized pipeline
  However, right now it doesn't work because for some reason,
  asking to generate the same seed + prompt on different nb of steps
  doesn't generate the same image!

  // first we need to wait for the low quality pre-render
  await renderContent({
    ...request,

    // we are a bit more aggressive with the quality of the video preview
    nbSteps: isVideo ? 8 : 16
  }, response)

  // then we can run both the segmentation and the high-res render at the same time
  await Promise.all([
    renderSegmentation(request, response),
    renderContent(request, response)
  ])
  */

  response.status = "completed"
  response.error = ""

  if (!request.cache || request.cache === "ignore") {
    // console.log("client asked to not use the cache in the rendering pipeline")
    return
  }

  // console.log("client asked this for cache: "+request.cache)

  try {
    // since the request is now completed we cache it
    await saveRenderedSceneToCache(request, response)
    // console.log("successfully saved to cache")

    // we don't really need to remove it from the in-memory cache 
    // (the cache queue in src/production/renderScene.mts)
    // since this cache queue has already an automatic pruning
  } catch (err) {
    console.error(`failed to save to cache, but no big deal: ${err}`)
  }
}