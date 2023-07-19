import path from "node:path"

import concat from 'ffmpeg-concat'

import { VideoShot } from '../types.mts'
import { pendingFilesDirFilePath } from "../config.mts"

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

  const shotFilesPaths = shots.map(shot => path.join(
    pendingFilesDirFilePath,
    shot.fileName
  ))

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
