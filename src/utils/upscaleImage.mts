
import { client } from "@gradio/client"

import { getValidNumber } from "./getValidNumber.mts"

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_UPSCALING_SPACE_API_URL_1 || ""}`,
  `${process.env.VC_UPSCALING_SPACE_API_URL_2 || ""}`,
  `${process.env.VC_UPSCALING_SPACE_API_URL_3 || ""}`,
].filter(instance => instance?.length > 0)

// this doesn't work because of this error.. I think the version of Gradio is too old/young?
// ReferenceError: addEventListener is not defined
//    at file:///Users/jbilcke/Projects/VideoChain-API/node_modules/@gradio/client/dist/index.js:551:15
//    at processTicksAndRejections (node:internal/process/task_queues:95:5)
export async function upscaleImage(src: string, factor?: number) {

  // bu default we do a 4X scale
  const scaleFactor = getValidNumber(factor, 2, 10, 4)

  const instance = instances.shift()
  instances.push(instance)

  const api = await client(instance, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })
  
  const result = await api.predict("/upscale", [
    src, 	// blob in 'Source Image' Image component		
    "realesr-general-x4v3", // string (Option from: ['RealESRGAN_x4plus', 'RealESRNet_x4plus', 'RealESRGAN_x4plus_anime_6B', 'RealESRGAN_x2plus', 'realesr-general-x4v3']) in 'Real-ESRGAN inference model to be used' Dropdown component		
    0.5, // number (numeric value between 0 and 1) in 'Denoise Strength (Used only with the realesr-general-x4v3 model)' Slider component		
    false, // boolean  in 'Face Enhancement using GFPGAN (Doesn't work for anime images)' Checkbox component		
    scaleFactor, // number (numeric value between 1 and 10) in 'Image Upscaling Factor' Slider component
]);


  const rawResponse = result as any 

  // console.log("rawResponse:", rawResponse)
  
  return rawResponse?.data?.[0] as string
}
