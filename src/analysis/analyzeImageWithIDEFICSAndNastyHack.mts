
/*
unfortunately the Gradio client doesn't support streaming:
it will crash here with a nasty error

  node_modules/@gradio/client/dist/index.js:705
  return data.map((d, i) => {
              ^
TypeError: Cannot read properties of null (reading 'is_file')
    at node_modules/@gradio/client/dist/index.js:713:43
    at Array.map (<anonymous>)
    at transform_output (node_modules/@gradio/client/dist/index.js:705:15)


This prevents use from using IDEFICS using the Gradio API,
so the only solution is to hack our way in using puppeteer.
*/


import path from "node:path"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import puppeteer from "puppeteer"

import { writeBase64ToFile } from "../utils/writeBase64ToFile.mts"
import { sleep } from "../utils/sleep.mts"
import { deleteFileIfExists } from "../utils/deleteFileIfExists.mts"

const instances: string[] = [
  `${process.env.VC_ANALYSIS_SPACE_API_URL || ""}`,
].filter(instance => instance?.length > 0)

// There is no easy to use public API for IDEFICS
// (something where we can just push text + file and get a response without handling history, upload etc)
// So let's hack our way in 🐕
export async function analyzeImage(image: string, prompt: string) {
  const instance = instances.shift()
  instances.push(instance)

  // wait.. is that really a jpg we have?
  // well, let's hope so.
  const tmpImageFilePath = path.join(tmpDir, `${uuidv4()}.jpg`)

  await writeBase64ToFile(image, tmpImageFilePath)
  // console.log("wrote the image to ", tmpImageFilePath)

  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 30000,
  })

  try {
    const page = await browser.newPage()

    await page.goto(instance, {
      waitUntil: 'networkidle2',
    })

    // console.log("filling in the prompt..")
    const promptField = await page.$('textarea')
    await promptField.type(prompt)

    // console.log("beginning:", imageBase64.slice(0, 100))

    // await new Promise(r => setTimeout(r, 1000))

    const fileField = await page.$('input[type=file]')

    console.log(`uploading file..`)
    await fileField.uploadFile(tmpImageFilePath)
    // console.log(`did it work? did it do something?`)

    // console.log('looking for the button to submit')
    const submitButton = await page.$('button.lg')

    // console.log('clicking on the submit')
    // await submitButton.click()

    console.log("waiting for bot response..")
    await page.$('.message.bot')

    // note: we are going to receive the response in streaming

    // TODO we should a different approach here, like perhaps something to detect when the element
    // has stopped receiving updates
    await sleep(12000)

    const message = await page.$$eval(".message.bot p", el => el.map(x => x.innerText)[0])
    console.log("message:", message)

    return message
  } catch (err) {
    throw err
  } finally {
    await browser.close()
    await deleteFileIfExists(tmpImageFilePath)
  }
}
