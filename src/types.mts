export type VideoTransition =
  | 'dissolve'
  | 'bookflip'
  | 'bounce'
  | 'bowtiehorizontal'
  | 'bowtievertical'
  | 'bowtiewithparameter'
  | 'butterflywavescrawler'
  | 'circlecrop'
  | 'colourdistance'
  | 'crazyparametricfun'
  | 'crosszoom'
  | 'directional'
  | 'directionalscaled'
  | 'doomscreentransition'
  | 'dreamy'
  | 'dreamyzoom'
  | 'edgetransition'
  | 'filmburn'
  | 'filmburnglitchdisplace'
  | 'glitchmemories'
  | 'gridflip'
  | 'horizontalclose'
  | 'horizontalopen'
  | 'invertedpagecurl'
  | 'leftright'
  | 'linearblur'
  | 'mosaic'
  | 'overexposure'
  | 'polkadotscurtain'
  | 'radial'
  | 'rectangle'
  | 'rectanglecrop'
  | 'rolls'
  | 'rotatescalevanish'
  | 'simplezoom'
  | 'simplezoomout'
  | 'slides'
  | 'staticfade'
  | 'stereoviewer'
  | 'swirl'
  | 'tvstatic'
  | 'topbottom'
  | 'verticalclose'
  | 'verticalopen'
  | 'waterdrop'
  | 'waterdropzoomincircles'
  | 'zoomleftwipe'
  | 'zoomrigthwipe'
  | 'angular'
  | 'burn'
  | 'cannabisleaf'
  | 'circle'
  | 'circleopen'
  | 'colorphase'
  | 'coordfromin'
  | 'crosshatch'
  | 'crosswarp'
  | 'cube'
  | 'directionaleasing'
  | 'directionalwarp'
  | 'directionalwipe'
  | 'displacement'
  | 'doorway'
  | 'fade'
  | 'fadecolor'
  | 'fadegrayscale'
  | 'flyeye'
  | 'heart'
  | 'hexagonalize'
  | 'kaleidoscope'
  | 'luma'
  | 'luminance_melt'
  | 'morph'
  | 'mosaic_transition'
  | 'multiply_blend'
  | 'perlin'
  | 'pinwheel'
  | 'pixelize'
  | 'polar_function'
  | 'powerkaleido'
  | 'randomnoisex'
  | 'randomsquares'
  | 'ripple'
  | 'rotatetransition'
  | 'rotate_scale_fade'
  | 'scalein'
  | 'squareswire'
  | 'squeeze'
  | 'static_wipe'
  | 'swap'
  | 'tangentmotionblur'
  | 'undulatingburnout'
  | 'wind'
  | 'windowblinds'
  | 'windowslice'
  | 'wipedown'
  | 'wipeleft'
  | 'wiperight'
  | 'wipeup'
  | 'x_axistranslation'


export interface VideoShotMeta {
  shotPrompt: string
  // inputVideo?: string

  // describe the background audio (crowd, birds, wind, sea etc..)
  backgroundAudioPrompt: string

  // describe the foreground audio (cars revving, footsteps, objects breaking, explosion etc)
  foregroundAudioPrompt: string

  // describe the main actor visible in the shot (optional)
  actorPrompt: string

  // describe the main actor voice (man, woman, old, young, amused, annoyed.. etc)
  actorVoicePrompt: string

  // describe the main actor dialogue line
  actorDialoguePrompt: string

  seed: number
  noise: boolean // add movie noise

  durationMs: number // in milliseconds
  steps: number

  fps: number // 8, 12, 24, 30, 60

  resolution: string // {width}x{height} (256, 512, 576, 720, 1080)

  introTransition: VideoTransition
  introDurationMs: number // in milliseconds
}


export interface VideoShotData {
  // must be unique
  id: string

  fileName: string

  // used to check compatibility
  version: number

  // for internal use
  hasGeneratedPreview: boolean
  hasGeneratedVideo: boolean
  hasUpscaledVideo: boolean
  hasGeneratedBackgroundAudio: boolean
  hasGeneratedForegroundAudio: boolean
  hasGeneratedActor: boolean
  hasInterpolatedVideo: boolean
  hasAddedAudio: boolean
  hasPostProcessedVideo: boolean
  nbCompletedSteps: number
  nbTotalSteps: number
  progressPercent: number
  completedAt: string
  completed: boolean
  error: string
}

export type VideoShot = VideoShotMeta & VideoShotData

export interface VideoSequenceMeta {

  // describe the whole movie
  videoPrompt: string

  // describe the background audio (crowd, birds, wind, sea etc..)
  backgroundAudioPrompt: string

  // describe the foreground audio (cars revving, footsteps, objects breaking, explosion etc)
  foregroundAudioPrompt: string

  // describe the main actor visible in the shot (optional)
  actorPrompt: string

  // describe the main actor voice (man, woman, old, young, amused, annoyed.. etc)
  actorVoicePrompt: string

  // describe the main actor dialogue line
  actorDialoguePrompt: string

  seed: number

  noise: boolean // add movie noise

  steps: number // between 10 and 50

  fps: number // 8, 12, 24, 30, 60

  resolution: string // 256, 512, 576, 720, 1080

  outroTransition: VideoTransition
  outroDurationMs: number
}


export interface VideoSequenceData {
  // must be unique
  id: string
  
  fileName: string

  // used to check compatibility
  version: number

  hasAssembledVideo: boolean
  nbCompletedShots: number
  nbTotalShots: number
  progressPercent: number
  completedAt: string
  completed: boolean
  error: string
}

export type VideoSequence = VideoSequenceMeta & VideoSequenceData

export type VideoSequenceRequest = {
  token: string
  sequence: VideoSequenceMeta
  shots: VideoShotMeta[]
}

export type VideoTask = VideoSequence & {
  shots: VideoShot[]
}