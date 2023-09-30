import { v4 as uuidv4 } from "uuid"
import puppeteer from "puppeteer"

import { downloadFileToTmp } from "../../utils/download/downloadFileToTmp.mts"
import { moveFileFromTmpToPending } from "../../utils/filesystem/moveFileFromTmpToPending.mts"

export const state = {
  load: 0,
}

const instances: string[] = [
  `${process.env.VC_AUDIO_GENERATION_SPACE_API_URL_1 || ""}`
].filter(instance => instance?.length > 0)

// TODO we should use an inference endpoint instead
export async function generateAudio(prompt: string, audioFileName: string) {

  if (state.load === instances.length) {
    throw new Error(`all audio generation servers are busy, try again later..`)
  }

  state.load += 1

  try {
    const instance = instances.shift()
    instances.push(instance)

    const browser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 120000,
    })

    try {
      const page = await browser.newPage()

      await page.goto(instance, {
        waitUntil: "networkidle2",
      })

      // await new Promise(r => setTimeout(r, 1000))

      const firstTextboxInput = await page.$('input[data-testid="textbox"]')

      await firstTextboxInput.type(prompt)

      // console.log("looking for the button to submit")
      const submitButton = await page.$("button.lg")

      // console.log("clicking on the button")
      await submitButton.click()

      await page.waitForSelector("a[download]", {
        timeout: 120000, // no need to wait for too long, generation is quick
      })

      const audioRemoteUrl = await page.$$eval("a[download]", el => el.map(x => x.getAttribute("href"))[0])


      // it is always a good idea to download to a tmp dir before saving to the pending dir
      // because there is always a risk that the download will fail
      
      const tmpFileName = `${uuidv4()}.mp4`

      await downloadFileToTmp(audioRemoteUrl, tmpFileName)
      await moveFileFromTmpToPending(tmpFileName, audioFileName)
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