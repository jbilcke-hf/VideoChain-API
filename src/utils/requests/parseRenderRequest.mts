import { RenderRequest } from "../../types.mts"
import { generateSeed } from "../misc/generateSeed.mts"
import { getValidBoolean } from "../validators/getValidBoolean.mts"
import { getValidNumber } from "../validators/getValidNumber.mts"

export function parseRenderRequest(request: RenderRequest) {

  // console.log("parseRenderRequest: "+JSON.stringify(request, null, 2))
  try {
    request.nbFrames = getValidNumber(request.nbFrames, 1, 24, 16)

    request.negativePrompt = request.negativePrompt || ""

    const isVideo = request?.nbFrames === 1

    // note that we accept a seed of 0
    // (this ensure we are able to cache the whole request by signing it)
    request.seed = getValidNumber(request.seed, 0, 2147483647, 0)

    // but obviously we will treat 0 as the random seed at a later stage

    request.upscalingFactor = getValidNumber(request.upscalingFactor, 0, 4, 0)

    request.nbSteps = getValidNumber(request.nbSteps, 1, 50, 10)

    request.analyze = request?.analyze ? true : false

    if (isVideo) {
      request.width = getValidNumber(request.width, 256, 2048, 576)
      request.height = getValidNumber(request.height, 256, 2048, 320)
    } else {
      request.width = getValidNumber(request.width, 256, 2048, 1024)
      request.height = getValidNumber(request.height, 256, 2048, 1024)
    }

    request.turbo = getValidBoolean(request.turbo, false)

    request.wait = request?.wait || false
    request.cache = request?.cache || "ignore"
  } catch (err) {
    console.error(`failed to parse the render request: ${err}`)
  }

  // console.log("parsed request: "+JSON.stringify(request, null, 2))
  return request
}