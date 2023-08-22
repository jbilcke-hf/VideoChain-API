import { promises as fs } from "node:fs"
import path from "node:path"

import { RenderRequest, RenderedScene } from "../types.mts"
import { renderedDirFilePath } from "../config.mts"
import { computeSha256 } from "./computeSha256.mts"

export async function loadRenderedSceneFromCache(request?: RenderRequest, id?: string): Promise<RenderedScene> {
  
  let pattern = ""

  if (request?.prompt) {
    try {
      const requestJson = JSON.stringify(request)
      const hash = computeSha256(requestJson)
      pattern = `hash_${hash}`
    } catch (err) {
    }
  } else if (id) {
   pattern = `id_${id}` 
  }

  if (!pattern) {
    throw new Error("invalid request or id")
  }

  for (const cachedFile of await fs.readdir(renderedDirFilePath)) {

    if (cachedFile.includes(pattern)) {

      const cacheFilePath = path.join(renderedDirFilePath, cachedFile)

      const scene = JSON.parse(
        await fs.readFile(cacheFilePath, 'utf8')
      ) as RenderedScene
    
      if (!scene.assetUrl) {
        throw new Error("there is something wrong with the cached rendered scene (url is empty)")
      }
    
      if (!scene.assetUrl) {
        throw new Error("there is something wrong with the cached rendered scene (statis is not completed)")
      }

      return scene
    }
  }

  throw new Error("couldn't find a cached scene with id entry")
}