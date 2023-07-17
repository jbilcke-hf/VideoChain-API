export interface Shot {
  shotId: string
  index: number
  lastGenerationAt: string
  videoPrompt: string
  audioPrompt: string
  duration: number // no more than 3 (we don't have the ressources for it)
  fps: number // typically 8, 12, 24
}

export interface Sequence {
  sequenceId: string
  skip: boolean
  lastGenerationAt: string
  videoPrompt: string
  audioPrompt: string
  channel: string
  tags: string[]
  shots: Shot[]
}

export interface Database {
  version: number
  startAtShotId: string
  sequences: Sequence[]
}


export interface ShotQuery {
  token: string
  shotPrompt: string
  // inputVideo?: string

  // describe the background audio (crowd, birds, wind, sea etc..)
  backgroundAudioPrompt?: string

  // describe the foreground audio (cars revving, footsteps, objects breaking, explosion etc)
  foregroundAudioPrompt?: string

  // describe the main actor visible in the shot (optional)
  actorPrompt?: string

  // describe the main actor voice (man, woman, old, young, amused, annoyed.. etc)
  actorVoicePrompt?: string

  // describe the main actor dialogue line
  actorDialoguePrompt?: string

  seed?: number
  upscale?: boolean

  noise?: boolean // add movie noise

  duration?: number
  steps?: number

  fps?: number // 8, 12, 24, 30, 60

  resolution?: number // 256, 512, 576, 720, 1080
}

export interface Job {
  startedAt: string
  query: ShotQuery
}