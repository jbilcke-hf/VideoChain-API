import { RenderRequest } from "../types.mts"
import { computeSha256 } from "./computeSha256.mts"

export function hashRequest(request: RenderRequest) {

  // we ignore the commands associated to cache and stuff
  const hashable = {
    prompt: request.prompt,
    segmentation: request.segmentation,
    actionnables: request.actionnables,
    nbFrames: request.actionnables,
    nbSteps: request.actionnables,
    seed: request.actionnables,
    width: request.actionnables,
    height: request.actionnables,
    projection: request.actionnables,
  }

  const requestJson = JSON.stringify(hashable)
  const hash = computeSha256(requestJson)

  return hash
}