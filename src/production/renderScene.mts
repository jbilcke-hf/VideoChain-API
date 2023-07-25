import { generateSeed } from "../utils/generateSeed.mts"
import { generateVideo } from "./generateVideo.mts"

const state = {
  isRendering: false
}

const seed = generateSeed()

export async function renderScene(prompt: string) {
  // console.log("renderScene")
  if (state.isRendering) {
    // console.log("renderScene: isRendering")
    return {
      url: "",
      error: "already rendering"
    }
  }

  // onsole.log("marking as isRendering")
  state.isRendering = true

  let url = ""
  let error = ""

  try {
    url = await generateVideo(prompt, {
      seed: generateSeed(),
      // seed,
      nbFrames: 16,
      nbSteps: 7,
    })
    // console.log("successfull generation")
    error = ""
  } catch (err) {
    error = `failed to render scene: ${err}`
  }

  // console.log("marking as not rendering anymore")
  state.isRendering = false
  error = ""

  return {
    url,
    error
  }
}