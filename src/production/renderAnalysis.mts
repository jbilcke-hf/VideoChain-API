
import { RenderedScene, RenderRequest } from "../types.mts"

import { renderImageAnalysis } from "./renderImageAnalysis.mts"

export async function renderAnalysis(request: RenderRequest, response: RenderedScene) {
  
  if (request.analyze) {
    const isVideo = request?.nbFrames > 1

    // note: this only works on images for now,
    // but we could also analyze the first video frame to get ourselves an idea
    const optionalAnalysisFn = !isVideo
      ? renderImageAnalysis(request, response)
      : Promise.resolve()

    await optionalAnalysisFn
  }
}