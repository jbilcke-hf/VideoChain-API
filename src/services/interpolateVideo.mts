import path from "node:path"

import puppeteer from "puppeteer"
import tmpDir from "temp-dir"
import { downloadVideo } from "./downloadVideo.mts"

const instances: string[] = [
  process.env.VS_VIDEO_INTERPOLATION_SPACE_API_URL
]


// TODO we should use an inference endpoint instead
export async function interpolateVideo(fileName: string, steps: number, fps: number) {
  const inputFilePath = path.join(tmpDir, fileName)

  console.log(`interpolating ${fileName}`)
  console.log(`warning: interpolateVideo parameter "${steps}" is ignored!`)
  console.log(`warning: interpolateVideo parameter "${fps}" is ignored!`)

  const instance = instances.shift()
  instances.push(instance)

  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 400000,
  })

  const page = await browser.newPage()
  await page.goto(instance, { waitUntil: 'networkidle2' })
  
  await new Promise(r => setTimeout(r, 3000))

  const fileField = await page.$('input[type=file]')

  // console.log(`uploading file..`)
  await fileField.uploadFile(inputFilePath)

  // console.log('looking for the button to submit')
  const submitButton = await page.$('button.lg')

  // console.log('clicking on the button')
  await submitButton.click()

  await page.waitForSelector('a[download="interpolated_result.mp4"]', {
    timeout: 400000, // need to be large enough in case someone else attemps to use our space
  })

  const interpolatedFileUrl = await page.$$eval('a[download="interpolated_result.mp4"]', el => el.map(x => x.getAttribute("href"))[0])

  await downloadVideo(interpolatedFileUrl, fileName)

  return fileName
}