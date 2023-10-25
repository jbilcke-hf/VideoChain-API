import { VideoGenerationOptions } from "./types.mts"
import { getNegativePrompt, getPositivePrompt } from "./defaultPrompts.mts"
import { generateSeed } from "../../utils/misc/generateSeed.mts"

// we don't use replicas yet, because it ain't easy to get their hostname
const instance = `${process.env.VC_HOTSHOT_XL_GRADIO_SPACE_API_URL || ""}`
const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const generateVideo = async ({
  positivePrompt,
  negativePrompt = "",
  seed,
  nbFrames = 8, // for now the only values that make sense are 1 (for a jpg) or 8 (for a video)
  videoDuration = 1000, // for now Hotshot doesn't really supports anything else
  nbSteps = 30, // when rendering a final video, we want a value like 50 or 70 here
  size = "768x320",

  // for jbilcke-hf/sdxl-cinematic-2 it is "cinematic-2"
  triggerWord = "cinematic-2",

  huggingFaceLora = "jbilcke-hf/sdxl-cinematic-2",
}: VideoGenerationOptions) => {
  
  // pimp the prompt
  positivePrompt = getPositivePrompt(positivePrompt, triggerWord)
  negativePrompt = getNegativePrompt(negativePrompt)

  try {

    const res = await fetch(instance + (instance.endsWith("/") ? "" : "/") + "api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fn_index: 1, // <- important!
        data: [
          secretToken,
          positivePrompt,
          negativePrompt,
          huggingFaceLora,
          size,
          generateSeed(),
          nbSteps,
          nbFrames,
          videoDuration,
        ],
      }),
      cache: "no-store",
      // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
      // next: { revalidate: 1 }
    })
  
    const { data } = await res.json()
  
    // console.log("data:", data)
    // Recommendation: handle errors
    if (res.status !== 200 || !Array.isArray(data)) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error(`Failed to fetch data (status: ${res.status})`)
    }
    // console.log("data:", data.slice(0, 50))
  
    return data[0]
  } catch (err) {
    throw err
  }
}