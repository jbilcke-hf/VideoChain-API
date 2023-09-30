import tmpDir from "temp-dir"
import { validate as uuidValidate } from "uuid"

import { completedMetadataDirFilePath, completedFilesDirFilePath, pendingMetadataDirFilePath, pendingFilesDirFilePath } from "../config.mts"
import { deleteFilesWithName } from "../utils/filesystem/deleteAllFilesWith.mts"


// note: we make sure ownerId and videoId are *VALID*
// otherwise an attacker could try to delete important files!
export const deleteVideo = async (ownerId: string, videoId?: string) => {
  if (!uuidValidate(ownerId)) {
    throw new Error(`fatal error: ownerId ${ownerId} is invalid!`)
  }

  if (videoId && !uuidValidate(videoId)) {
    throw new Error(`fatal error: videoId ${videoId} is invalid!`)
  }
  const id = videoId ? `${ownerId}_${videoId}` : ownerId

  // this should delete everything, including audio files
  // however we still have some temporary files with a name that is unique:
  // we should probably rename those
  await deleteFilesWithName(tmpDir, id)
  await deleteFilesWithName(completedMetadataDirFilePath, id)
  await deleteFilesWithName(completedFilesDirFilePath, id)
  await deleteFilesWithName(pendingMetadataDirFilePath, id)
  await deleteFilesWithName(pendingFilesDirFilePath, id)
}
