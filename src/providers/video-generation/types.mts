import { HotshotImageInferenceSize } from "../../types.mts"

export type VideoGenerationOptions = {
  /**
   * Positive prompt to use
   */
  positivePrompt: string

  /**
   * Negative prompt to use
   */
  negativePrompt?: string

  /**
   * Seed.
   * 
   * Depending on the vendor, if you use a negative value (eg -1) it should give you an always random value
   */
  seed?: number

  /**
   * Number of frames to generate
   */
  nbFrames?: number

  /**
   * Duration of the video, in seconds
   */
  videoDuration?: number

  /**
   * Number of inference steps (for final rendering use 70)
   */
  nbSteps?: number

  /**
   * Image size (which is actually a ratio)
   * 
   * Note that Hotshot wasn't trained on all possible combinations,
   * and in particular by default it supposed to only support 512x512 well
   */
  size?: HotshotImageInferenceSize

  /**
   * Trigger word
   * 
   * for a replicate LoRa this is always the same ("In the style of TOK")
   * triggerWord = "In the style of TOK",
   * for jbilcke-hf/sdxl-cinematic-2 it is "cinematic-2"
   */
  triggerWord?: string

  /**
   * Owner + repo name of the Hugging Face LoRA
   */
  huggingFaceLora?: string

  /**
   * URL to the weights .tar (those can be hosted anywere, it doesn't have to be on Replicate.com)
   */
  replicateLora?: string
}