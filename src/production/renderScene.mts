import { v4 as uuidv4 } from "uuid"

import { RenderedScene, RenderRequest } from "../types.mts"
import { generateSeed } from "../utils/generateSeed.mts"
import { getValidNumber } from "../utils/getValidNumber.mts"
import { renderPipeline } from "./renderPipeline.mts"

const cache: Record<string, RenderedScene> = {}
const cacheQueue: string[] = []
const maxCacheSize = 1000

export async function renderScene(request: RenderRequest): Promise<RenderedScene> {
  // const key = getCacheKey(scene)
  const renderId = uuidv4()

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

  const response: RenderedScene = {
    renderId,
    status: "pending",
    assetUrl: "",
    error: "",
    maskUrl: "",
    segments: []
  }

  cache[renderId] = response
  cacheQueue.push(renderId)
  if (cacheQueue.length > maxCacheSize) {
    const toRemove = cacheQueue.shift()
    delete cache[toRemove]
  }

  // this is a fire-and-forget asynchronous pipeline:
  // we start it, but we do not await for the response
  renderPipeline(request, response)

  console.log("renderScene: yielding the scene", response)
  return response
}

export async function getRenderedScene(renderId: string): Promise<RenderedScene> {
  const rendered = cache[renderId]
  if (!rendered) {
    throw new Error(`couldn't find any rendered scene with renderId ${renderId}`)
  }
  return cache[renderId]
}