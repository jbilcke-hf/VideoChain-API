
import { RenderedScene, RenderRequest } from "../types.mts"

import { renderImage } from "./renderImage.mts"
import { renderVideo } from "./renderVideo.mts"

export async function renderContent(request: RenderRequest, response: RenderedScene) {
  const isVideo = request?.nbFrames > 1

  const renderContentFn = isVideo
    ? renderVideo
    : renderImage
 
  try {
    await renderContentFn(request, response)
  } catch (err) {
    // console.log(`renderContent() failed, trying a 2nd time..`)
    try {
      await renderContentFn(request, response)
    } catch (err2) {
      // console.log(`renderContent() failed, trying a 3th time..`)
      await renderContentFn(request, response)
    }
  }
}