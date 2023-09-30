import { HfInference } from "@huggingface/inference"

import { getValidNumber } from "../../utils/validators/getValidNumber.mts"
import { generateSeed } from "../../utils/misc/generateSeed.mts"

const hf = new HfInference(process.env.VC_HF_API_TOKEN)

export async function generateImage(options: {
  positivePrompt: string;
  negativePrompt: string;
  seed?: number;
  width?: number;
  height?: number;
  nbSteps?: number;
}) {
  
  const positivePrompt = options?.positivePrompt || ""
  if (!positivePrompt) {
    throw new Error("missing prompt")
  }
  const negativePrompt = options?.negativePrompt || ""

  // we treat 0 as meaning "random seed"
  const seed = (options?.seed ? options.seed : 0) || generateSeed()

  const width = getValidNumber(options?.width, 256, 1024, 512)
  const height = getValidNumber(options?.height, 256, 1024, 512)
  const nbSteps = getValidNumber(options?.nbSteps, 5, 50, 25)

  const blob = await hf.textToImage({
    inputs: [
      positivePrompt,
      "bautiful",
      "award winning",
      "intricate details",
      "high resolution"
    ].filter(word => word)
    .join(", "),
    model: "stabilityai/stable-diffusion-2-1",
    parameters: {
      negative_prompt: [
        negativePrompt,
        "blurry",
        // "artificial",
       //  "cropped",
        "low quality",
        "ugly"
      ].filter(word => word)
      .join(", ")
    }
  })
  const buffer = Buffer.from(await blob.arrayBuffer())

  return buffer
}