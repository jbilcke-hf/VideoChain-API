import { v4 as uuidv4 } from "uuid"

import { downloadFileToTmp } from "./downloadFileToTmp.mts"
import { segmentImage } from "./segmentImage.mts"

// TODO we should use an inference endpoint instead

// note: on a large T4 (8 vCPU)
// it takes about 30 seconds to compute
export async function segmentImageFromURL(
  inputUrl: string,
  actionnables: string[]
) {
  if (!actionnables?.length) {
    throw new Error("cannot segment image without actionnables!")
  }
  console.log(`segmenting image from URL: "${inputUrl}"`)
  const tmpFileName = `${uuidv4()}`
  const tmpFilePath = await downloadFileToTmp(inputUrl, tmpFileName)

  const results = await segmentImage(tmpFilePath, actionnables)

  console.log("image has been segmented!", results)
  return results
}