
export type VideoStatus =
  | 'pending'
  | 'abort' // this is an order (the video might still being processed by a task)
  | 'delete' // this is an order (the video might still being processed by a task)
  | 'pause' // this is an order (the video might still being processed by a task)
  | 'completed'
  | 'unknown'


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


export type VideoShotMeta = {
  shotPrompt: string
  // inputVideo?: string

  // background, weather, lights, time of the day, etc
  environmentPrompt: string

  // camera parameters, angle, type of shot etc
  photographyPrompt: string

  // dynamic elements of the scene, movement etc
  actionPrompt: string

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
  noiseAmount: number // noise strength (default is 2, and 10 is very visible)

  durationMs: number // in milliseconds
  steps: number

  fps: number // 8, 12, 24, 30, 60

  resolution: string // {width}x{height} (256, 512, 576, 720, 1080)

  introTransition: VideoTransition
  introDurationMs: number // in milliseconds
}


export type VideoShotData = {
  // must be unique
  id: string
  sequenceId: string
  ownerId: string

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
  createdAt: string
  completedAt: string
  completed: boolean
  error: string
}

export type VideoShot = VideoShotMeta & VideoShotData

export type VideoSequenceMeta = {

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
  noiseAmount: number // noise strength (default is 2, and 10 is very visible)

  steps: number // between 10 and 50

  fps: number // 8, 12, 24, 30, 60

  resolution: string // 256, 512, 576, 720, 1080

  outroTransition: VideoTransition
  outroDurationMs: number
}


export type VideoSequenceData = {
  // must be unique
  id: string

  ownerId: string
  
  fileName: string

  // used to check compatibility
  version: number

  status: VideoStatus

  hasGeneratedSpecs: boolean
  hasAssembledVideo: boolean
  nbCompletedShots: number
  progressPercent: number
  createdAt: string
  completedAt: string
  completed: boolean
  error: string
}

export type VideoSequence = VideoSequenceMeta & VideoSequenceData

export type VideoStatusRequest = {
  status: VideoStatus
}

export type GenericAPIResponse = {
  success?: boolean
  error?: string
}

export type VideoAPIRequest = Partial<{
  prompt: string
  sequence: Partial<VideoSequenceMeta>
  shots: Array<Partial<VideoShotMeta>>
}>

export type Video = VideoSequence & {
  shots: VideoShot[]
}

export type ProjectionMode = 'cartesian' | 'spherical'

export type CacheMode = "use" | "renew" | "ignore"

export type RenderRequest = {
  prompt: string

  // unused for now
  negativePrompt: string

  // whether to use video segmentation
  // disabled (default)
  // firstframe: we only analyze the first frame
  // allframes: we analyze all the frames
  segmentation: 'disabled' | 'firstframe' | 'allframes'

  // segmentation will only be executed if we have a non-empty list of actionnables
  // actionnables are names of things like "chest", "key", "tree", "chair" etc
  actionnables: string[]

  nbFrames: number

  nbFPS: number

  nbSteps: number // min: 1, max: 50

  seed: number

  width: number
  height: number

  // upscaling factor
  // 0: no upscaling
  // 1: no upscaling
  // 2: 2x larger
  // 3: 3x larger
  // 4x: 4x larger, up to 4096x4096 (warning: a PNG of this size can be 50 Mb!)
  upscalingFactor: number

  projection: ProjectionMode

  /**
   * Use turbo mode
   * 
   * At the time of writing this will use SSD-1B + LCM
   * https://huggingface.co/spaces/jbilcke-hf/fast-image-server
   */
  turbo: boolean

  cache: CacheMode

  wait: boolean // wait until the job is completed

  analyze: boolean // analyze the image to generate a caption (optional)
}

export type ImageAnalysisRequest = {
  image: string // in base64
  prompt: string
}

export type ImageAnalysisResponse = {
  result: string
  error?: string
}

export type SoundAnalysisRequest = {
  sound: string // in base64
  prompt: string
}

export type SoundAnalysisResponse = {
  result: string
  error?: string
}


export type ImageSegmentationRequest = {
  image: string // in base64
  keywords: string[]
}

export type ImageSegment = {
  id: number
  box: number[]
  color: number[]
  label: string
  score: number 
}

export type RenderedSceneStatus = 'pending' | 'completed' | 'error'

export type RenderedScene = {
  renderId: string
  status: RenderedSceneStatus
  assetUrl: string 
  alt: string
  error: string
  maskUrl: string
  segments: ImageSegment[]
}

export type RenderCache = {
  id: string
  hash: string
  scene: RenderedScene
}

// note: for video generation we are always going to have slow jobs,
// because we need multiple seconds, minutes, hours.. of video + audio
// but for rendering we aim at shorter delays, less than 45 seconds
// so the goal of rendering "jobs" is mostly to give the illusion that
// things go faster, by already providing some things like the background image,
// before we send 
export type RenderingJob = {
  scene: RenderRequest
  result: RenderedScene

  status: 'pending' | 'completed' | 'error'
}

// vendor-specific types

export type HotshotImageInferenceSize =
| '320x768'
| '384x672'
| '416x608'
| '512x512'
| '608x416'
| '672x384'
| '768x320'
| '1024x1024' // custom ratio - this isn't supported / supposed to work properly
| '1024x512' // custom panoramic ratio - this isn't supported / supposed to work properly
| '1024x576' // movie ratio (16:9) this isn't supported / supposed to work properly
| '576x1024' // tiktok ratio (9:16) this isn't supported / supposed to work properly

export type VideoOrientation =
  | "portrait"
  | "landscape"
  | "square"

export type VideoProjection =
  | "cartesian" // this is the default
  | "equirectangular"

export type VideoGenerationParams = {
  prompt: string // can be empty
  image?: string // can be empty
  lora?: string
  style?: string
  orientation: VideoOrientation
  projection: VideoProjection
  width: number
  height: number
  nbSteps: number
  seed?: number
  debug?: boolean
}