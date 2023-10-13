
import { RenderedScene, RenderRequest } from "../types.mts"

import { renderImageUpscaling } from "./renderImageUpscaling.mts"
import { renderVideoUpscaling } from "./renderVideoUpscaling.mts"

export async function renderUpscaling(request: RenderRequest, response: RenderedScene) {

  if (request.upscalingFactor > 1) {

    const isVideo = request?.nbFrames > 1

    // we upscale images with esrgan, and video with Zeroscope XL
    const renderFn = isVideo
      ? renderVideoUpscaling
      : renderImageUpscaling

    await renderFn(request, response)
  }
}