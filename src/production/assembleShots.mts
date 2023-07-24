import path from "node:path"

// due to Docker issues, we disable OpenGL transitions for now
// import concat from 'ffmpeg-concat'
import concat from './concatNoGL.mts'

import { VideoShot } from '../types.mts'
import { pendingFilesDirFilePath } from "../config.mts"
import { normalizePendingVideoToTmpFilePath } from "./normalizePendingVideoToTmpFilePath.mts"

export const assembleShots = async (shots: VideoShot[], fileName: string) => {

  if (!Array.isArray(shots) || shots.length < 2) {
    throw new Error(`need at least 2 shots`)
  }

  const transitions = [
    {
      name: 'circleOpen',
      duration: 1000,
    },
    {
      name: 'crossWarp',
      duration: 800,
    },
    {
      name: 'directionalWarp',
      duration: 800,
      // pass custom params to a transition
      params: { direction: [1, -1] },
    },
    
    /*
    {
      name: 'squaresWire',
      duration: 2000,
    },
    */
  ]

  const videoFilePath = path.join(pendingFilesDirFilePath, fileName)

  // before performing assembly, we must normalize images
  const shotFilesPaths: string[] = []
  for (let shot of shots) {
    const normalizedShotFilePath = await normalizePendingVideoToTmpFilePath(shot.fileName)
    shotFilesPaths.push(normalizedShotFilePath)
  }

  await concat({
    output: videoFilePath,
    videos: shotFilesPaths,
    transitions: shotFilesPaths
      .slice(0, shotFilesPaths.length - 1)
      .map(
        (vid) => transitions[Math.floor(Math.random() * transitions.length)]
      ),
  })
}
