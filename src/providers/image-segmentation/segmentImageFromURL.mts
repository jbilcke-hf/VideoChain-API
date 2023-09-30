import { v4 as uuidv4 } from "uuid"

import { downloadFileToTmp } from "../../utils/download/downloadFileToTmp.mts"
import { segmentImage } from "./segmentImage.mts"

// TODO we should use an inference endpoint instead

// WARNING: this function is currently unused
// if you do attempt to use it, please check the hardcoded 1024x1024 thing line 21, and refactor it to your needs
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

  const results = await segmentImage(tmpFilePath, actionnables, 1024, 1024)

  console.log("image has been segmented!", results)
  return results
}