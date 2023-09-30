import { promises as fs } from "node:fs"
import path from "node:path"

import { RenderRequest, RenderedScene } from "../../types.mts"
import { renderedDirFilePath } from "../../config.mts"
import { hashRequest } from "./hashRequest.mts"

export async function loadRenderedSceneFromCache(request?: RenderRequest, id?: string): Promise<RenderedScene> {
  
  let pattern = ""

  if (request?.prompt) {
    try {
      // note: this hashing function ignores the commands associated to cache and stuff
      const hash = hashRequest(request)
      pattern = `hash_${hash}`
    } catch (err) {
    }
  } else if (id) {
   pattern = `id_${id}` 
  }

  if (!pattern) {
    throw new Error("invalid request or id")
  }

  // console.log("pattern to find: " + pattern)

  for (const cachedFile of await fs.readdir(renderedDirFilePath)) {
    // console.log("evaluating " + cachedFile)
    if (cachedFile.includes(pattern)) {
      // console.log("matched with " + cachedFile)
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

  throw new Error(`couldn't find a cache file for pattern ${pattern}`)
}