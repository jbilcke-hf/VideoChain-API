
import { RenderedScene, RenderRequest } from "../types.mts"

import { saveRenderedSceneToCache } from "../utils/filesystem/saveRenderedSceneToCache.mts"
import { renderSegmentation } from "./renderSegmentation.mts"
import { renderUpscaling } from "./renderUpscaling.mts"
import { renderContent } from "./renderContent.mts"
import { renderAnalysis } from "./renderAnalysis.mts"

export async function renderPipeline(request: RenderRequest, response: RenderedScene) {
  await renderContent(request, response)

  await Promise.all([
    renderSegmentation(request, response),
    renderAnalysis(request, response),
    renderUpscaling(request, response)
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