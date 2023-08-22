import { promises as fs } from "node:fs"
import path from "node:path"

import { RenderRequest, RenderedScene } from "../types.mts"
import { renderedDirFilePath } from "../config.mts"

import { computeSha256 } from "./computeSha256.mts"

export async function saveRenderedSceneToCache(
  request: RenderRequest,
  scene: RenderedScene
): Promise<RenderedScene> {
  if (scene.status !== "completed") {
    throw new Error("sorry, it only makes sense to cache a *completed* scene, not a pending or failed one.")
  }

  const requestJson = JSON.stringify(request)
  const hash = computeSha256(requestJson)
  const id = scene.renderId

  const cacheFileName = `hash_${hash}_id_${id}.json`
  const cacheFilePath = path.join(renderedDirFilePath, cacheFileName)

  const renderedSceneJson = JSON.stringify(scene)

  await fs.writeFile(cacheFilePath, renderedSceneJson, "utf8")

  return scene
}