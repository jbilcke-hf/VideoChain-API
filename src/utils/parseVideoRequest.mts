import { v4 as uuidv4 } from "uuid"

// convert a request (which might be invalid)

import { VideoSequenceRequest, VideoTask } from "../types.mts"
import { getValidNumber } from "./getValidNumber.mts"
import { getValidResolution } from "./getValidResolution.mts"
import { parseShotRequest } from "./parseShotRequest.mts"
import { generateSeed } from "./generateSeed.mts"
import { sequenceFormatVersion } from "../config.mts"


export const parseVideoRequest = async (request: VideoSequenceRequest): Promise<VideoTask> => {
  // we don't want people to input their own ID or we might have trouble,
  // such as people attempting to use a non-UUID, a file path (to hack us), etc
  const id = uuidv4()

  const task: VideoTask = {
    // ------------ VideoSequenceMeta -------------
    id,

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

    steps: getValidNumber(request.sequence.steps, 10, 50, 35),

    fps: getValidNumber(request.sequence.fps, 8, 60, 24),

    resolution: getValidResolution(request.sequence.resolution),

    outroTransition: 'staticfade',
    outroDurationMs: 3000,

    // ---------- VideoSequenceData ---------
    version: sequenceFormatVersion,
    fileName: `${id}.mp4`,
    hasAssembledVideo: false,
    nbCompletedShots: 0,
    nbTotalShots: 0,
    progressPercent: 0,
    completedAt: null,
    completed: false,
    error: '',


    // ------- the VideoShot -----

    shots: [],
  }

  const maybeShots = Array.isArray(request.shots) ? request.shots : []

  for (const maybeShot of maybeShots) {
    try {
      const shot = await parseShotRequest(task, maybeShot)
      task.shots.push(shot)
    } catch (err) {
      console.log(`error parsing shot: `, maybeShot)
    }

  }

  return task
}