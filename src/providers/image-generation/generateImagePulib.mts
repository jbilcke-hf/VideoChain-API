
import { client } from "@gradio/client"

import { generateSeed } from "../../utils/misc/generateSeed.mts"
import { getValidNumber } from "../../utils/validators/getValidNumber.mts"
import { convertToWebp } from "../../utils/image/convertToWebp.mts"
import { addBase64HeaderToPng } from "../../utils/image/addBase64HeaderToPng.mts"

// TODO add a system to mark failed instances as "unavailable" for a couple of minutes
// console.log("process.env:", process.env)

// note: to reduce costs I use the small A10s (not the large)
// anyway, we will soon not need to use this cloud anymore 
// since we will be able to leverage the Inference API
const gradioSpaceApiUrl = `https://jbilcke-hf-ai-tube-model-pulid.hf.space`
const gradioSpace = `jbilcke-hf/ai-tube-model-pulid`
const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

// console.log("DEBUG:", JSON.stringify({ instances, secretToken }, null, 2))

export async function generateImagePulibAsBase64(options: {
  positivePrompt: string;
  negativePrompt?: string;
  identityImage?: string;
  seed?: number;
  width?: number;
  height?: number;
  nbSteps?: number;
}): Promise<string> {

  const positivePrompt = options?.positivePrompt || ""
  if (!positivePrompt) {
    throw new Error("missing prompt")
  }

  // the negative prompt CAN be missing, since we use a trick
  // where we make the interface mandatory in the TS doc,
  // but browsers might send something partial
  const negativePrompt = options?.negativePrompt || ""
  
  // we treat 0 as meaning "random seed"
  const seed = (options?.seed ? options.seed : 0) || generateSeed()

  const width = getValidNumber(options?.width, 256, 1024, 512)
  const height = getValidNumber(options?.height, 256, 1024, 512)
  const nbSteps = getValidNumber(options?.nbSteps, 1, 8, 4)
  // console.log("SEED:", seed)

  const identityImage = `${options.identityImage || ""}`

  const positive = [
    positivePrompt,
  ].filter(word => word)
  .join(", ")

  const negative =  [
    negativePrompt,
    "watermark",
    "copyright",
    "blurry",
    // "artificial",
    // "cropped",
    "low quality",
    "ugly",
    'flaws in the eyes',
    'flaws in the face',
    'flaws',
    'lowres',
    'non-HDRi',
    'low quality',
    'worst quality',
    'artifacts noise',
    'text',
    'glitch',
    'deformed',
    'mutated',
    'disfigured hands',
    'low resolution',
    'partially rendered objects',
    'deformed or partially rendered eyes',
    'ddeformed eyeballs',
    'cross-eyed',
  ].filter(word => word)
  .join(", ")

  const api = await client(gradioSpaceApiUrl, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })

  // we hardcode the number of steps to 4
  const steps = 4

  // console.log("querying " + gradioSpaceApiUrl + " with tons of params")

  const rawResponse = (await api.predict("/run", [
    secretToken, // # str in 'parameter_4' Textbox component
    identityImage || "", // 'ID image (main)' Image component
    "", // 'Additional ID image (auxiliary)' Image component
    "", // 'Additional ID image (auxiliary)' Image component
    "", // 'Additional ID image (auxiliary)' Image component
    positive, //  # str in 'Prompt' Textbox component
    negative, //   # str in 'Negative Prompt' Textbox component
    1.2, //  # int | float (numeric value between 1 and 1.5) in 'CFG, recommend value range [1, 1.5], 1 will be faster ' Slider component
    generateSeed(), //,  # int | float (numeric value between 0 and 4294967295) in 'Seed' Slider component
    steps, // # int | float (numeric value between 1 and 100) in 'Steps' Slider component
    height, // # int | float (numeric value between 512 and 1280) in 'Height' Slider component
    width, // # int | float (numeric value between 512 and 1280) in 'Width' Slider component
    0.8, // # int | float (numeric value between 0 and 5) in 'ID scale' Slider component
    "fidelity", // # str (Option from: ['fidelity', 'extremely style']) in 'mode' Dropdown component
    false, // 'ID Mix (if you want to mix two ID image, please turn this on, otherwise, turn this off)' Checkbox component
  ])) as any

  const result = rawResponse?.data?.[0] as string
  if (!result?.length) {
    throw new Error(`the returned image was empty`)
  }

  try {
    const finalImage = await convertToWebp(addBase64HeaderToPng(result))
    return finalImage
  } catch (err) {
    // console.log("err:", err)
    throw new Error(err)
  }
}