import path from "node:path"


import puppeteer from "puppeteer"

import { pendingFilesDirFilePath } from '../../config.mts'
import { downloadFileAsBase64URL } from "../../utils/download/downloadFileAsBase64URL.mts"

const instances: string[] = [
  `${process.env.VC_VIDEO_UPSCALE_SPACE_API_URL_1 || ""}`
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

// TODO we should use an inference endpoint instead (or a space which bakes generation + upscale at the same time)
export async function upscaleVideoToBase64URL(fileName: string, prompt: string) {
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

    const secretField = await page.$('input[type=text]')
    await secretField.type(secretToken)

    const promptField = await page.$('textarea')
    await promptField.type(prompt)

    const inputFilePath = path.join(pendingFilesDirFilePath, fileName)
    // console.log(`local file to upscale: ${inputFilePath}`)
    
    // await new Promise(r => setTimeout(r, 1000))

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

    // we download the whole file
    // it's only a few seconds of video, so it should be < 2MB
    const assetUrl = await downloadFileAsBase64URL(upscaledFileUrl)

    return assetUrl
  } catch (err) {
    throw err
  } finally {
    await browser.close()
  }
}
