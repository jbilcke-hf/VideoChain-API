import puppeteer from "puppeteer"

import { sleep } from "../../utils/misc/sleep.mts"
import { ImageSegment } from "../../types.mts"
import { downloadFileAsBase64 } from "../../utils/download/downloadFileAsBase64.mts"
import { resizeBase64Image } from "../../utils/image/resizeBase64Image.mts"

// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_SEGMENTATION_MODULE_SPACE_API_URL_1 || ""}`,
  `${process.env.VC_SEGMENTATION_MODULE_SPACE_API_URL_2 || ""}`,
  // `${process.env.VC_SEGMENTATION_MODULE_SPACE_API_URL_3 || ""}`,
]

// TODO we should use an inference endpoint instead

// note: on a large T4 (8 vCPU)
// it takes about 30 seconds to compute
export async function segmentImage(
  inputImageFilePath: string,
  actionnables: string[],
  width: number,
  height: number,
): Promise<{
  maskUrl: string
  segments: ImageSegment[]
}> {

  console.log(`segmenting image..`)

  const instance = instances.shift()
  instances.push(instance)

  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 40000,
  })

  try {
    const page = await browser.newPage()
    await page.goto(instance, { waitUntil: 'networkidle2' })
    
    // await new Promise(r => setTimeout(r, 1000))

    const fileField = await page.$('input[type="file"]')

    // console.log(`uploading file..`)
    await fileField.uploadFile(inputImageFilePath)

    const firstTextarea = await page.$('textarea[data-testid="textbox"]')

    const conceptsToDetect = actionnables.join(" . ")
    await firstTextarea.type(conceptsToDetect)

    // console.log('looking for the button to submit')
    const submitButton = await page.$('button.lg')

    await sleep(300)

    // console.log('clicking on the button')
    await submitButton.click()

    await page.waitForSelector('img[data-testid="detailed-image"]', {
      timeout: 40000, // we keep it tight, to fail early
    })

    const tmpMaskDownloadUrl = await page.$$eval('img[data-testid="detailed-image"]', el => el.map(x => x.getAttribute("src"))[0])

    let segments: ImageSegment[] = []
    
    try {
      segments = JSON.parse(await page.$$eval('textarea', el => el.map(x => x.value)[1]))
    } catch (err) {
      console.log(`failed to parse JSON: ${err}`)
      segments = []
    }

    // const tmpMaskFileName = `${uuidv4()}.png`
    // await downloadFileToTmp(maskUrl, tmpMaskFileName)

    const rawPngInBase64 = await downloadFileAsBase64(tmpMaskDownloadUrl)

    const maskUrl = await resizeBase64Image(rawPngInBase64, width, height)

    return {
      maskUrl,
      segments,
    }
  } catch (err) {
    throw err
  } finally {
    await browser.close()
  }
}

/*

If you want to try:

/ note: must be a jpg and not jpeg it seems
// (probably a playwright bug)
const results = await segmentImage("./barn.jpg", [
  "roof",
  "door",
  "window"
])

console.log("results:", results)
*/