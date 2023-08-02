import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import puppeteer from "puppeteer"

import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"
import { pendingFilesDirFilePath } from "../config.mts"
import { moveFileFromTmpToPending } from "../utils/moveFileFromTmpToPending.mts"

export const state = {
  load: 0
}

const instances: string[] = [
  process.env.VC_VIDEO_INTERPOLATION_SPACE_API_URL
]

// TODO we should use an inference endpoint instead
export async function interpolateVideo(fileName: string, steps: number, fps: number) {
  if (state.load === instances.length) {
    throw new Error(`all video interpolation servers are busy, try again later..`)
  }

  state.load += 1

  try {
    const inputFilePath = path.join(pendingFilesDirFilePath, fileName)

    console.log(`interpolating ${fileName}`)
    console.log(`warning: interpolateVideo parameter "${steps}" is ignored!`)
    console.log(`warning: interpolateVideo parameter "${fps}" is ignored!`)

    const instance = instances.shift()
    instances.push(instance)

    const browser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 400000,
    })

    try {
      const page = await browser.newPage()
      await page.goto(instance, { waitUntil: 'networkidle2' })
      
      // await new Promise(r => setTimeout(r, 1000))

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

      // it is always a good idea to download to a tmp dir before saving to the pending dir
      // because there is always a risk that the download will fail

      const tmpFileName = `${uuidv4()}.mp4`

      await downloadFileToTmp(interpolatedFileUrl, tmpFileName)
      await moveFileFromTmpToPending(tmpFileName, fileName)
    } catch (err) {
      throw err
    } finally {
      await browser.close()
    }
  } catch (err) {
    throw err
  } finally {
    state.load -= 1
  }
}