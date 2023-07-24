import { ChatCompletionRequestMessage } from "openai"

import { Video, VideoAPIRequest } from "../types.mts"
import { generateYAML } from "./openai/generateYAML.mts"
import { HallucinatedVideoRequest, OpenAIErrorResponse } from "./types.mts"
import { getQueryChatMessages } from "../preproduction/prompts.mts"
import { getValidNumber } from "../utils/getValidNumber.mts"
import { parseShotRequest } from "../utils/parseShotRequest.mts"


export const enrichVideoSpecsUsingLLM = async (video: Video): Promise<Video> => {

  const messages: ChatCompletionRequestMessage[] = getQueryChatMessages(video.videoPrompt)
  
  const defaultValue = {} as unknown as HallucinatedVideoRequest

  let hallucinatedVideo: HallucinatedVideoRequest
  video.shots = []

  try {
    hallucinatedVideo = await generateYAML<HallucinatedVideoRequest>(
      messages,
      defaultValue
    )
    console.log("enrichVideoSpecsUsingLLM: hallucinatedVideo = ", hallucinatedVideo)
  } catch (err) {

    let error: OpenAIErrorResponse = err?.response?.data?.error as unknown as OpenAIErrorResponse
    if (!error) {
      error = { message: `${err || ""}` } as unknown as OpenAIErrorResponse
    }
    
    console.error(JSON.stringify(error, null, 2))
    throw new Error(`failed to call the LLM: ${error.message}`)
  }

  // const video = JSON.parse(JSON.stringify(referenceVideo)) as Video

  // TODO here we should make some verifications and perhaps even some conversions
  // betwen the LLM response and the actual format used in a videoRequest
  video.backgroundAudioPrompt = hallucinatedVideo.backgroundAudioPrompt || video.backgroundAudioPrompt
  video.foregroundAudioPrompt = hallucinatedVideo.foregroundAudioPrompt || video.foregroundAudioPrompt
  video.actorPrompt = hallucinatedVideo.actorPrompt || video.actorPrompt
  video.actorVoicePrompt = hallucinatedVideo.actorVoicePrompt || video.actorVoicePrompt

  video.noise = typeof hallucinatedVideo.noise !== "undefined"
    ? (`${hallucinatedVideo.noise || ""}`.toLowerCase() === "true")
    : video.noise
  
  video.noiseAmount = typeof hallucinatedVideo.noiseAmount !== "undefined"
    ? getValidNumber(hallucinatedVideo.noiseAmount, 0, 10, 2)
    : video.noiseAmount

  video.outroDurationMs = typeof hallucinatedVideo.outroDurationMs !== "undefined"
    ? getValidNumber(hallucinatedVideo.outroDurationMs, 0, 3000, 500)
    : video.outroDurationMs

  const hallucinatedShots = Array.isArray(hallucinatedVideo.shots) ? hallucinatedVideo.shots : []


  for (const hallucinatedShot of hallucinatedShots) {
    const shot = await parseShotRequest(video, {
      shotPrompt: hallucinatedShot.shotPrompt,
      environmentPrompt: hallucinatedShot.environmentPrompt,
      photographyPrompt: hallucinatedShot.photographyPrompt,
      actionPrompt: hallucinatedShot.actionPrompt,
      foregroundAudioPrompt: hallucinatedShot.foregroundAudioPrompt
    })
    video.shots.push(shot)
  }

  console.log("enrichVideoSpecsUsingLLM: video = ", video)

  return video
}