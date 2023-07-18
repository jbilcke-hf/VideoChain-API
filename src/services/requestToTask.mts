import { v4 as uuidv4 } from "uuid"

// convert a request (which might be invalid)

import { VideoSequenceRequest, VideoTask } from "../types.mts"
import { generateSeed } from "./generateSeed.mts"
import { getValidNumber } from "../utils/getValidNumber.mts"
import { getValidResolution } from "../utils/getValidResolution.mts"

// into a valid task
export const requestToTask = async (request: VideoSequenceRequest): Promise<VideoTask> => {

  const task: VideoTask = {
    // ------------ VideoSequenceMeta -------------
    id: uuidv4(),

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

    upscale: request.sequence.upscale === true,

    noise: request.sequence.noise === true,

    steps: getValidNumber(request.sequence.steps, 1, 60, 35),

    fps: getValidNumber(request.sequence.fps, 8, 60, 24),

    resolution: getValidResolution(request.sequence.resolution),

    outroTransition: 'staticfade',
    outroDurationMs: 3000,

    // ---------- VideoSequenceData ---------
    nbCompletedShots: 0,
    nbTotalShots: 0,
    progressPercent: 0,
    completedAt: null,
    completed: false,
    error: '',
    tmpFilePath: '',
    finalFilePath: '',

    // ------- the VideoShot -----

    shots: [],
  }


  // optional background audio prompt
  const backgroundAudioPrompt = `${query.backgroundAudioPrompt || ""}`

  // optional foreground audio prompt
  const foregroundAudioPrompt = `${query.foregroundAudioPrompt || ""}`

  // optional seed
  const defaultSeed = generateSeed()
  const seedStr = getValidNumber(Number(`${query.seed || defaultSeed}`)
  const maybeSeed = Number(seedStr)
  const seed = isNaN(maybeSeed) || ! isFinite(maybeSeed) ? defaultSeed : maybeSeed
  
  // in production we want those ON by default
  const upscale = `${query.upscale || "true"}` === "true"
  const interpolate = `${query.upscale || "true"}` === "true"
  const noise = `${query.noise || "true"}` === "true"


  const defaultDuration = 3
  const maxDuration = 5
  const durationStr = Number(`${query.duration || defaultDuration}`)
  const maybeDuration = Number(durationStr)
  const duration = Math.min(maxDuration, Math.max(1, isNaN(maybeDuration) || !isFinite(maybeDuration) ? defaultDuration : maybeDuration))
  
  const defaultSteps = 35
  const stepsStr = Number(`${query.steps || defaultSteps}`)
  const maybeSteps = Number(stepsStr)
  const nbSteps = Math.min(60, Math.max(1, isNaN(maybeSteps) || !isFinite(maybeSteps) ? defaultSteps : maybeSteps))
  
  // const frames per second
  const defaultFps = 24
  const fpsStr = Number(`${query.fps || defaultFps}`)
  const maybeFps = Number(fpsStr)
  const nbFrames = Math.min(60, Math.max(8, isNaN(maybeFps) || !isFinite(maybeFps) ? defaultFps : maybeFps))
  
  const defaultResolution = 576
  const resolutionStr = Number(`${query.resolution || defaultResolution}`)
  const maybeResolution = Number(resolutionStr)
  const resolution = Math.min(1080, Math.max(256, isNaN(maybeResolution) || !isFinite(maybeResolution) ? defaultResolution : maybeResolution))
  
  const actorPrompt = `${query.actorPrompt || ""}`

  const actorVoicePrompt = `${query.actorVoicePrompt || ""}`

  const actorDialoguePrompt = `${query.actorDialoguePrompt || ""}`



  return task
}