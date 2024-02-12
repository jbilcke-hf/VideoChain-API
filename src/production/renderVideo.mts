import { RenderedScene, RenderRequest, VideoGenerationParams } from "../types.mts"

// import { generateVideo } from "../providers/video-generation/generateVideoWithZeroscope.mts"
// import { generateVideo } from "../providers/video-generation/generateVideoWithHotshotGradioAPI.mts"
import { generateVideoWithAnimateLCM } from "../providers/video-generation/generateVideoWithAnimateLCM.mts"
import { generateSeed } from "../utils/misc/generateSeed.mts"

export async function renderVideo(
  request: RenderRequest,
  response: RenderedScene
): Promise<RenderedScene> {

  const params: VideoGenerationParams = {
    prompt: request.prompt,
    // image?: undefined, // can be empty (and thus, is empty)
    // lora?: string // hardcoded on "3D render"
    // style?: string // hardcoded on "3D render" for now
    orientation: "landscape",
    projection: "cartesian",
    width: 512,
    height: 256,
    
    // ok, now what about those? they are in the gradio, are not exposed yet in the API
    // nbFrames: request.nbFrames,
    // nbSteps: request.nbSteps,

    seed: request.seed || generateSeed(),
    debug: true,
  }

  response.assetUrl = await generateVideoWithAnimateLCM(params)

  return response
}