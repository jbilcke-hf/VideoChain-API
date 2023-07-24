// note: this has to exactly match what is in the prompt, in ../preproduction/prompts.mts
export interface HallucinatedVideoRequest {
  backgroundAudioPrompt: string; // describe the background audio (crowd, birds, wind, sea etc..)
  foregroundAudioPrompt: string; // describe the foreground audio (cars revving, footsteps, objects breaking, explosion etc)
  actorPrompt: string; // describe the physical look of the main actor visible in the shot (man, woman, old, young, hair, glasses, clothes etc)
  actorVoicePrompt: string; // describe the main actor voice (man, woman, old, young, amused, annoyed.. etc)
  noise: boolean; // whether to apply movie noise or not
  noiseAmount: number; // (integer) the amount of ffmpeg noise (film grain) to apply. 0 is none, 10 is a lot
  outroDurationMs: number; // in milliseconds. An outro generally only lasts between 0 and 3000 (3s)
  
  shots: Array<{
    shotPrompt: string; // describe the main elements of a shot, in excruciating details. You must include ALL those parameters: characters, shot story, what is happening. How they look, the textures, the expressions, their clothes. The color, materials and style of clothes. 
    environmentPrompt: string; // describe the environment, in excruciating details. You must include ALL those parameters: Lights, atmosphere and weather (misty, dust, clear, rain, snow..). Time of the day and hour of the day. Furnitures, their shape, style, era. The materials used for each object. The global time period, time of the day, era. Explain if anything is moving in the backgroung.
    photographyPrompt: string; // describe the photography, in excruciating details. You must include ALL those parameters: Camera angle, position and movement. Type of shot and angle. Lighting. Mood. Settings. Tint of the lights. Position of the sun or moon. Shadows and their direction. Camera shutter speed, blur, bokeh, aperture.
    actionPrompt: string; // describe the dynamics of a shot, in excruciating details. You must include ALL those parameters: What is happening, who and what is moving. Which entity are in movements. What are the directions, starting and ending position. At which speed entities or objects are moving. Is there motion blur, slow motion, timelapse etc.
    foregroundAudioPrompt: string; // describe the sounds in a concise way (eg. ringing bells, underwater sound and whistling dolphin, cat mewong etc),
  }>
}

export interface OpenAIErrorResponse {
  message: string
  type: string
  param: any
  code: any
}