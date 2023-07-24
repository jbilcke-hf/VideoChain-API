import { assembleShots } from "../production/assembleShots.mts"
import { Video, VideoShot } from "../types.mts"
import { copyVideoFromPendingToCompleted } from "../utils/copyVideoFromPendingToCompleted.mts"

export const updateShotPreview = async (video: Video, shot: VideoShot) => {
  // copy the individual shot
  await copyVideoFromPendingToCompleted(shot.fileName)

  // now let's create the latest version of the assembly
  const shotsThatCanBeAssembled = video.shots.filter(sh => sh.hasGeneratedPreview)

  // if we have multiple shots with at least a minimal image, we assemble them
  if (shotsThatCanBeAssembled.length === 1) {
    // copy the individual shot to become the final video
    await copyVideoFromPendingToCompleted(shot.fileName, video.fileName)
  } else if (shotsThatCanBeAssembled.length > 1) {
    try {
      // create an updated assembly
      await assembleShots(shotsThatCanBeAssembled, video.fileName)

      // copy the assembly to become the final video
      await copyVideoFromPendingToCompleted(video.fileName)
    } catch (err) {
      console.error(`failed to create the temporary assembly: ${err}`)
    }
  }
}