import { promises as fs } from "node:fs"
import path from "node:path"
import tmpDir from "temp-dir"

import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.VS_HF_API_TOKEN)

export const generateActor = async (prompt: string, fileName: string, seed: number) => {
  const positivePrompt = [
    `profile photo of ${prompt || ""}`,
    "id picture",
    "photoshoot",
    "portrait photography",
    "neutral expression",
    "neutral background",
    "studio photo",
    "award winning",
    "high resolution",
    "photo realistic",
    "intricate details",
    "beautiful",
  ]
  const negativePrompt = [
    "anime",
    "drawing",
    "painting",
    "lowres",
    "blurry",
    "artificial"
  ]

  console.log(`generating actor: ${positivePrompt.join(", ")}`)

  const blob = await hf.textToImage({
    inputs: positivePrompt.join(", "),
    model: "stabilityai/stable-diffusion-2-1",
    parameters: {
      negative_prompt: negativePrompt.join(", "),
      // seed, no seed?
    }
  })

  const filePath = path.resolve(tmpDir, fileName)

  const buffer = Buffer.from(await blob.arrayBuffer())
  await fs.writeFile(filePath, buffer, "utf8")

  return filePath
}