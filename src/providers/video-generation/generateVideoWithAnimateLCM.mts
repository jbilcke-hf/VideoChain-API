import { VideoGenerationParams } from "../../types.mts"
import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { tryApiCalls } from "../../utils/misc/tryApiCall.mts"
import { addBase64HeaderToMp4 } from "./addBase64HeaderToMp4.mts"

import { getNegativePrompt, getPositivePrompt } from "./defaultPrompts.mts"

// const gradioApi = `${process.env.AI_TUBE_MODEL_ANIMATELCM_GRADIO_URL || ""}`
const gradioApi = "https://jbilcke-hf-ai-tube-model-animatelcm.hf.space"
const accessToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const generateVideoWithAnimateLCM = async ({
  prompt,
  orientation,
  projection,
  width,
  height,
  style = "",
  seed,
  debug,
}: VideoGenerationParams): Promise<string> => {
  

  const actualFunction = async () => {
    const negPrompt = ""
    prompt = prompt || ""
    seed = seed | generateSeed()

    // label="Sampling steps", value=6, minimum=1, maximum=25, step=1
    // we wanna keep this one low (this is LCM after all)
    // but values like 10 also give nice results
    const nbSteps = 50
  

    // label="LoRA alpha", value=0.8, minimum=0, maximum=2
    const loraAlpha = 0.8 // lora_alpha_slider,


            // label="LCM LoRA alpha", value=0.8, minimum=0.0, maximum=1.0
    const lcmLoraAlpha = 0.8 // spatial_lora_slider,

    // label="Width", value=512, minimum=256, maximum=1024, step=64)
    const width = 512

    // label="Animation length", value=16,  minimum=12,   maximum=20,   step=1)
    const nbFrames = 16

    // label="Height", value=512, minimum=256, maximum=1024, step=64)
    const height = 256 

    //  label="CFG Scale", value=1.5, minimum=1,   maximum=2)
    const cfgScale = 1.5

    // pimp the prompt

    // we put it at the start, to make sure it is always part of the prompt
    const positivePrompt = getPositivePrompt([
      style,
      prompt
    ].map(x => x.trim()).filter(x => x).join(", "))

    const negativePrompt = getNegativePrompt(negPrompt)

    try {
      if (debug) {
        console.log(`calling AnimateLCM API with params (some are hidden):`, {
          loraAlpha,
          lcmLoraAlpha,
          positivePrompt,
          negativePrompt,
          width,
          height,
          nbSteps,
          nbFrames,
          cfgScale,
          seed,
        })
      }

      const res = await fetch(gradioApi + (gradioApi.endsWith("/") ? "" : "/") + "api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fn_index: 4, // <- important! it is currently 4, not 1!
          data: [
            accessToken,

            // label="LoRA alpha", value=0.8, minimum=0, maximum=2
            loraAlpha, // lora_alpha_slider,


            // label="LCM LoRA alpha", value=0.8, minimum=0.0, maximum=1.0
            lcmLoraAlpha, // spatial_lora_slider,

            // 
            positivePrompt, // prompt_textbox,

            negativePrompt, // negative_prompt_textbox,
            
            // this is the scheduler
            // so.. LCM, it is
            "LCM", // sampler_dropdown,

            // label="Sampling steps", value=6, minimum=1, maximum=25, step=1
            // we wanna keep this one low (this is LCM after all)
            // but values like 10 also give nice results
            nbSteps, // sample_step_slider,

            // label="Width",            value=512, minimum=256, maximum=1024, step=64)
            width, // width_slider,

            // label="Animation length", value=16,  minimum=12,   maximum=20,   step=1)
            nbFrames, // length_slider,

            // label="Height",           value=512, minimum=256, maximum=1024, step=64)
            height, // height_slider,

            //  label="CFG Scale",        value=1.5, minimum=1,   maximum=2)
            cfgScale, // cfg_scale_slider,
            
            seed, // seed_textbox,
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
    
      const base64Content = (data?.[0] || "") as string

      if (!base64Content) {
        throw new Error(`invalid response (no content)`)
      }

      return addBase64HeaderToMp4(base64Content)
    } catch (err) {
      if (debug) {
        console.error(`failed to call the AnimateLCM API:`)
        console.error(err)
      }
      throw err
    }
  }

  return tryApiCalls({
    func: actualFunction,
    debug,
    failureMessage: "failed to call the AnimateLCM endpoint"
  })
}