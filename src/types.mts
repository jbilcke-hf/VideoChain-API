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


export interface MakeShot {
  token: string
  shotPrompt: string
  // inputVideo?: string

  audioPrompt?: string
  seed?: number
  upscale?: boolean

  duration?: number
  steps?: number

  fps?: number // 8, 12, 24, 30, 60

  resolution?: number // 256, 512, 576, 720, 1080
}