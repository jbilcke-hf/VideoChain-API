import { RenderedScene, RenderRequest } from "../types.mts"
import { renderStaticScene } from "./renderStaticScene.mts"
import { renderVideoScene } from "./renderVideoScene.mts"

export async function renderScene(scene: RenderRequest): Promise<RenderedScene> {
  if (scene?.nbFrames === 1) {
    console.log(`calling renderStaticScene`)
    return renderStaticScene(scene)
  } else {
    console.log(`calling renderVideoScene`)
    return renderVideoScene(scene)
  }
}