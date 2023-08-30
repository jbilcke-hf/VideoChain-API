import { RenderRequest } from "../types.mts"
import { computeSha256 } from "./computeSha256.mts"

export function hashRequest(request: RenderRequest) {

  // we ignore the commands associated to cache and stuff
  const hashable = {
    version: 1,
    prompt: request.prompt,
    segmentation: request.segmentation,
    actionnables: request.actionnables,
    nbFrames: request.nbFrames,
    nbSteps: request.nbSteps,
    // seed: request.seed,
    width: request.width,
    height: request.height,
    projection: request.projection,
  }

  const requestJson = JSON.stringify(hashable)
  const hash = computeSha256(requestJson)

  return hash
}