import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import puppeteer from "puppeteer"

import { downloadFileToTmp } from '../utils/downloadFileToTmp.mts'
import { pendingFilesDirFilePath } from '../config.mts'
import { moveFileFromTmpToPending } from "../utils/moveFileFromTmpToPending.mts"

const instances: string[] = [
  process.env.VC_VIDEO_UPSCALE_SPACE_API_URL
]

// TODO we should use an inference endpoint instead (or a space which bakes generation + upscale at the same time)
export async function upscaleVideo(fileName: string, prompt: string) {
  const instance = instances.shift()
  instances.push(instance)

  const browser = await puppeteer.launch({
    // headless: true,
    protocolTimeout: 800000,
  })

  try {
    const page = await browser.newPage()

    await page.goto(instance, {
      waitUntil: 'networkidle2',
    })

    const promptField = await page.$('textarea')
    await promptField.type(prompt)

    const inputFilePath = path.join(pendingFilesDirFilePath, fileName)
    // console.log(`local file to upscale: ${inputFilePath}`)
    
    await new Promise(r => setTimeout(r, 3000))

    const fileField = await page.$('input[type=file]')

    // console.log(`uploading file..`)
    await fileField.uploadFile(inputFilePath)

    // console.log('looking for the button to submit')
    const submitButton = await page.$('button.lg')

    // console.log('clicking on the button')
    await submitButton.click()

    /*
    const client = await page.target().createCDPSession()

    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: tmpDir,
    })
    */

    await page.waitForSelector('a[download="xl_result.mp4"]', {
      timeout: 800000, // need to be large enough in case someone else attemps to use our space
    })

    const upscaledFileUrl = await page.$$eval('a[download="xl_result.mp4"]', el => el.map(x => x.getAttribute("href"))[0])

    // it is always a good idea to download to a tmp dir before saving to the pending dir
    // because there is always a risk that the download will fail
    
    const tmpFileName = `${uuidv4()}.mp4`

    await downloadFileToTmp(upscaledFileUrl, tmpFileName)
    await moveFileFromTmpToPending(tmpFileName, fileName)
  } catch (err) {
    throw err
  } finally {
    await browser.close()
  }
}
