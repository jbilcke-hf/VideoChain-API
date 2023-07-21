import { v4 as uuidv4, validate as uuidValidate } from "uuid"
import { HfInference } from "@huggingface/inference"

// convert a request (which might be invalid)

import { VideoTaskRequest, VideoTask, VideoShotMeta } from "../types.mts"
import { getValidNumber } from "./getValidNumber.mts"
import { getValidResolution } from "./getValidResolution.mts"
import { parseShotRequest } from "./parseShotRequest.mts"
import { generateSeed } from "./generateSeed.mts"
import { sequenceFormatVersion } from "../config.mts"

// const hfi = new HfInference(process.env._VC_HF_API_TOKEN)
// const hf = hfi.endpoint(process.env.VC_INFERENCE_ENDPOINT_URL)

export const parseVideoRequest = async (request: VideoTaskRequest): Promise<VideoTask> => {
  // we don't want people to input their own ID or we might have trouble,
  // such as people attempting to use a non-UUID, a file path (to hack us), etc
  const id = uuidv4()

  if (typeof request.prompt === "string" && request.prompt.length > 0) {
    console.log("we have a valid prompt:", request.prompt)
      // TODO: use llama2 to populate this!
    request.sequence = {
      videoPrompt: request.prompt,
    }
    request.shots = [{
      shotPrompt: request.prompt,
    }]
  }

  // more or less check that we have a UUID
  // (I think we can also have an exact match over length === 34)
  if (uuidValidate(request.ownerId)) {
    console.log("we have a valid owner:", request.ownerId)
      // TODO: use llama2 to populate this!
    request.ownerId
  } else {
    request.ownerId = uuidv4()
  }

  // console.log("continuing..")
  const task: VideoTask = {
    // ------------ VideoSequenceMeta -------------
    id,

    ownerId: request.ownerId,

    // describe the whole movie
    videoPrompt: `${request.sequence.videoPrompt || ''}`,

    // describe the background audio (crowd, birds, wind, sea etc..)
    backgroundAudioPrompt: `${request.sequence.backgroundAudioPrompt || ''}`,

    // describe the foreground audio (cars revving, footsteps, objects breaking, explosion etc)
    foregroundAudioPrompt: `${request.sequence.foregroundAudioPrompt || ''}`,

    // describe the main actor visible in the shot (optional)
    actorPrompt: `${request.sequence.actorPrompt || ''}`,

    // describe the main actor voice (man, woman, old, young, amused, annoyed.. etc)
    actorVoicePrompt: `${request.sequence.actorVoicePrompt || ''}`,

    // describe the main actor dialogue line
    actorDialoguePrompt: `${request.sequence.actorDialoguePrompt || ''}`,

    seed: getValidNumber(request.sequence.seed, 0, 4294967295, generateSeed()),

    noise: request.sequence.noise === true,
    noiseAmount: request.sequence.noise === true ? 2 : 0,

    steps: getValidNumber(request.sequence.steps, 10, 50, 45),

    fps: getValidNumber(request.sequence.fps, 8, 60, 24),

    resolution: getValidResolution(request.sequence.resolution),

    outroTransition: 'staticfade',
    outroDurationMs: 3000,

    // ---------- VideoSequenceData ---------
    version: sequenceFormatVersion,
    fileName: `${request.ownerId}_${id}.mp4`,
    hasAssembledVideo: false,
    nbCompletedShots: 0,
    progressPercent: 0,
    completedAt: null,
    completed: false,
    error: '',


    // ------- the VideoShot -----

    shots: [],
  }

  // console.log("we are still good..")
  const maybeShots = Array.isArray(request.shots) ? request.shots : []

  // console.log("let's try..")
  for (const maybeShot of maybeShots) {
    // console.log("trying shot", maybeShot)
    try {
      const shot = await parseShotRequest(task, maybeShot)
      task.shots.push(shot)
    } catch (err) {
      console.log(`error parsing shot: `, maybeShot)
    }

  }

  return task
}