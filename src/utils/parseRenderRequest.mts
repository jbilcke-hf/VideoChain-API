import { RenderRequest } from "../types.mts"
import { generateSeed } from "./generateSeed.mts"
import { getValidBoolean } from "./getValidBoolean.mts"
import { getValidNumber } from "./getValidNumber.mts"

export function parseRenderRequest(request: RenderRequest) {

  try {
    request.nbFrames = getValidNumber(request.nbFrames, 1, 24, 16)

    const isVideo = request?.nbFrames === 1

    // important: we need a consistent seed for our multiple rendering passes
    request.seed = getValidNumber(request.seed, 0, 2147483647, generateSeed())
    request.nbSteps = getValidNumber(request.nbSteps, 5, 50, 10)

    if (isVideo) {
      request.width = getValidNumber(request.width, 256, 1024, 1024)
      request.height = getValidNumber(request.height, 256, 1024, 512)
    } else {
      request.width = getValidNumber(request.width, 256, 1280, 576)
      request.height = getValidNumber(request.height, 256, 720, 320)
    }

    request.useCache = getValidBoolean(request.useCache, false)
  } catch (err) {
    console.error(`failed to parse the render request: ${err}`)
  }
  return request
}