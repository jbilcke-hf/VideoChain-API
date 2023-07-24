import { v4 as uuidv4 } from "uuid"

// convert a request (which might be invalid)

import { VideoSequence, VideoShot, VideoShotMeta } from "../types.mts"
import { generateSeed } from "./generateSeed.mts"
import { getValidNumber } from "./getValidNumber.mts"
import { shotFormatVersion } from "../config.mts"

export const parseShotRequest = async (sequence: VideoSequence, maybeShotMeta: Partial<VideoShotMeta>): Promise<VideoShot> => {
  // we don't want people to input their own ID or we might have trouble,
  // such as people attempting to use a non-UUID, a file path (to hack us), etc
  const id = uuidv4()

  const shot: VideoShot = {
    id,
    sequenceId: sequence.id,
    ownerId: sequence.ownerId,

    shotPrompt: `${maybeShotMeta.shotPrompt || ""}`,

    // background, weather, lights, time of the day, etc
    environmentPrompt: `${maybeShotMeta.environmentPrompt || ""}`,

    // camera parameters, angle, type of shot etc
    photographyPrompt: `${maybeShotMeta.photographyPrompt || ""}`,

    // dynamic elements of the scene, movement etc
    actionPrompt: `${maybeShotMeta.actionPrompt || ""}`,

    // describe the background audio (crowd, birds, wind, sea etc..)
    backgroundAudioPrompt: `${maybeShotMeta.backgroundAudioPrompt || ""}`,

    // describe the foreground audio (cars revving, footsteps, objects breaking, explosion etc)
    foregroundAudioPrompt: `${maybeShotMeta.foregroundAudioPrompt || maybeShotMeta.shotPrompt || ""}`,

    // describe the main actor visible in the shot (optional)
    actorPrompt: `${maybeShotMeta.actorPrompt || ""}`,

    // describe the main actor voice (man, woman, old, young, amused, annoyed.. etc)
    actorVoicePrompt: `${maybeShotMeta.actorVoicePrompt || ""}`,

    // describe the main actor dialogue line
    actorDialoguePrompt: `${maybeShotMeta.actorDialoguePrompt || ""}`,

    // a video sequence SHOULD NOT HAVE a consistent seed, to avoid weird geometry similarities
    seed: getValidNumber(maybeShotMeta.seed, 0, 4294967295, generateSeed()),

    // a video sequence SHOULD HAVE a consistent grain
    noise: sequence.noise,
    noiseAmount: sequence.noiseAmount,

    // a video sequence CAN HAVE inconsistent scene duration, like in any real movie
    durationMs: getValidNumber(maybeShotMeta.durationMs, 0, 6000, 3000),
    
    // a video sequence CAN HAVE inconsistent iteration steps
    steps: getValidNumber(maybeShotMeta.steps || sequence.steps, 10, 50, 45),

    // a video sequence MUST HAVE consistent frames per second
    fps: getValidNumber(sequence.fps, 8, 60, 30),

    // a video sequence MUST HAVE a consistent resolution
    resolution: sequence.resolution,

    // a video sequence CAN HAVE intro transitions for each shot
    introTransition: 'fade',
    introDurationMs: 500,

    // for internal use

    version: shotFormatVersion,
    fileName: `${sequence.ownerId}_${sequence.id}_${id}.mp4`,
    hasGeneratedPreview: false,
    hasGeneratedVideo: false,
    hasUpscaledVideo: false,
    hasGeneratedBackgroundAudio: false,
    hasGeneratedForegroundAudio: false,
    hasGeneratedActor: false,
    hasInterpolatedVideo: false,
    hasAddedAudio: false,
    hasPostProcessedVideo: false,
    nbCompletedSteps: 0,

    // - generate with Zeroscope
    // - upscale with Zeroscope XL
    // - interpolate with FILE
    // - generate audio background
    // - generate audio foreground
    // - add audio to video
    // - post-processing
    nbTotalSteps: 5,
    progressPercent: 0,
    createdAt: new Date().toISOString(),
    completedAt: '',
    completed: false,
    error: '',
  }

  return shot
}