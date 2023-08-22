import { promises as fs } from "node:fs"
import path from "node:path"

import { RenderRequest, RenderedScene } from "../types.mts"
import { renderedDirFilePath } from "../config.mts"

import { hashRequest } from "./hashRequest.mts"

export async function saveRenderedSceneToCache(
  request: RenderRequest,
  scene: RenderedScene
): Promise<RenderedScene> {
  // console.log("saveRenderedSceneToCache")
  if (scene.status !== "completed") {
    throw new Error("sorry, it only makes sense to cache a *completed* scene, not a pending or failed one.")
  }

  //note: this hashing function ignores the commands associated to cache and stuff
  const hash = hashRequest(request)
  const id = scene.renderId

  const cacheFileName = `hash_${hash}_id_${id}.json`
  const cacheFilePath = path.join(renderedDirFilePath, cacheFileName)

  const renderedSceneJson = JSON.stringify(scene)

  /*
  console.log({
    request,
    hash,
    id,
    cacheFileName,
    cacheFilePath,
    scene
  })
  */

  await fs.writeFile(cacheFilePath, renderedSceneJson, "utf8")
  console.log(`saved result to cache`)

  return scene
}