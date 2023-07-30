import puppeteer from "puppeteer"

import { downloadFileToTmp } from "../utils/downloadFileToTmp.mts"

export const state = {
  load: 0
}

const instances: string[] = [
  process.env.VC_VOICE_GENERATION_SPACE_API_URL
]

// TODO we should use an inference endpoint instead
export async function generateVoice(prompt: string, voiceFileName: string) {
  if (state.load === instances.length) {
    throw new Error(`all voice generation servers are busy, try again later..`)
  }

  state.load += 1

  try {
    const instance = instances.shift()
    instances.push(instance)

    console.log("instance:", instance)
    
    const browser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 800000,
    })

    try {
      const page = await browser.newPage()

      await page.goto(instance, {
        waitUntil: "networkidle2",
      })

      await new Promise(r => setTimeout(r, 3000))

      const firstTextarea = await page.$('textarea[data-testid="textbox"]')

      await firstTextarea.type(prompt)

      // console.log("looking for the button to submit")
      const submitButton = await page.$("button.lg")

      // console.log("clicking on the button")
      await submitButton.click()

      await page.waitForSelector("audio", {
        timeout: 800000, // need to be large enough in case someone else attemps to use our space
      })

      const voiceRemoteUrl = await page.$$eval("audio", el => el.map(x => x.getAttribute("src"))[0])


      console.log({
        voiceRemoteUrl,
      })


      console.log(`- downloading ${voiceFileName} from ${voiceRemoteUrl}`)

      await downloadFileToTmp(voiceRemoteUrl, voiceFileName)

      return voiceFileName
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
