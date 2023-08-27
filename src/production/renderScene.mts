import { v4 as uuidv4 } from "uuid"

import { RenderedScene, RenderRequest } from "../types.mts"
import { renderPipeline } from "./renderPipeline.mts"

const cache: Record<string, RenderedScene> = {}
const cacheQueue: string[] = []
const maxCacheSize = 2000

export async function renderScene(request: RenderRequest): Promise<RenderedScene> {
  // const key = getCacheKey(scene)

  const renderId = uuidv4()

  const response: RenderedScene = {
    renderId,
    status: "pending",
    assetUrl: "",
    alt: request.prompt || "",
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

