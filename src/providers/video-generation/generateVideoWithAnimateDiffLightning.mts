import { RenderedScene, RenderRequest } from "../../types.mts"
import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { tryApiCalls } from "../../utils/misc/tryApiCall.mts"
import { getValidNumber } from "../../utils/validators/getValidNumber.mts"

const accessToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

// @deprecated This endpoint has been decommissioned. Please use the AiTube API instead (check aitube.at/api/v1/render)
export const generateVideoWithAnimateDiffLightning = async (
  request: RenderRequest,
  response: RenderedScene,
): Promise<RenderedScene> => {
  
  throw new Error(`This endpoint has been decommissioned. Please use the AiTube API instead (check aitube.at/api/v1/render)`)
  const debug = true


  const actualFunction = async (): Promise<RenderedScene> => {

    const prompt = request.prompt || ""
    if (!prompt) {
      response.error = "prompt is empty"
      return response
    }
    
    // seed = seed || generateSeed()
    request.seed = request.seed || generateSeed()

    // see https://huggingface.co/spaces/jbilcke-hf/ai-tube-model-animatediff-lightning/blob/main/app.py#L15-L18
    const baseModel = "epiCRealism"

    // the motion LoRA - could be useful one day
    const motion = ""

    // can be 1, 2, 4 or 8
    // but values below 4 look bad
    const nbSteps = 4// getValidNumber(request.nbSteps, 1, 8, 4)
    const width = 512 // getValidNumber(request.width, 256, 1024, 512)
    const height = 288 // getValidNumber(request.height, 256, 1024, 256)

    const nbFrames = 16 // getValidNumber(request.nbFrames, 10, 60, 10)
    const nbFPS = 10 //  getValidNumber(request.nbFPS, 10, 60, 10)

    // by default AnimateDiff generates about 2 seconds of video at 10 fps
    // the Gradio API now has some code to optional fix that using FFmpeg,
    // but this will add some delay overhead, so use with care!
    const durationInSec = nbFrames / nbFPS
    // no, we need decimals
    // const durationInSec = Math.round(nbFrames / nbFPS)
    const framesPerSec = nbFPS

    try {
      if (debug) {
        console.log(`calling AnimateDiff Lightning API with params (some are hidden):`, {
          baseModel,
          motion,
          nbSteps,
          width,
          height,
          nbFrames,
          nbFPS,
          durationInSec,
          framesPerSec,
        })
      }

      const res = await fetch(`https://jbilcke-hf-ai-tube-model-animatediff.hf.space/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fn_index: 0, // <- important! it is currently 4, not 1!
          data: [
            accessToken,
            prompt,
            baseModel,
            width,
            height,
            motion,
            nbSteps,
            durationInSec,
            framesPerSec,
          ],
        }),
        cache: "no-store",
        // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
        // next: { revalidate: 1 }
      })

      // console.log("res:", res)

      const { data } = await res.json()

      // console.log("data:", data)
      // Recommendation: handle errors
      if (res.status !== 200 || !Array.isArray(data)) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error(`Failed to fetch data (status: ${res.status})`)
      }
      // console.log("data:", data.slice(0, 50))
    
      const base64Content = (data?.[0] || "") as string

      if (!base64Content) {
        throw new Error(`invalid response (no content)`)
      }

      response.assetUrl = base64Content

      // this API already emits a data-uri with a content type
      return response // addBase64HeaderToMp4(base64Content)
    } catch (err) {
      if (debug) {
        console.error(`failed to call the AnimateDiff Lightning API:`)
        console.error(err)
      }
      throw err
    }
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to call the AnimateDiff Lightning API"
  })
}