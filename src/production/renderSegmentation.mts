
import { RenderedScene, RenderRequest } from "../types.mts"

import { renderImageSegmentation } from "./renderImageSegmentation.mts"
import { renderVideoSegmentation } from "./renderVideoSegmentation.mts"

export async function renderSegmentation(request: RenderRequest, response: RenderedScene) {
  
  if (request.segmentation === "firstframe" || request.segmentation === "allframes") {
    const isVideo = request?.nbFrames > 1

    const renderSegmentationFn = isVideo
      ? renderVideoSegmentation
      : renderImageSegmentation 

    await renderSegmentationFn(request, response)
  }
}