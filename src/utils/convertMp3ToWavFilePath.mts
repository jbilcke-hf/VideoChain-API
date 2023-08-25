
import path from "node:path"
import * as fs from "node:fs"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import ffmpeg from "fluent-ffmpeg"

export function convertMp3ToWavFilePath(base64: string) : Promise<string> {
  return new Promise((resolve, reject) => {

    // this one will be deleted at the end
    const tmpInputPath = path.join(tmpDir, `${uuidv4()}.mp3`)

    const tmpOutputPath = path.join(tmpDir, `${uuidv4()}.wav`)

    const base64Header = 'data:audio/mpeg;base64,';

    fs.writeFile(tmpInputPath, base64.replace(base64Header, ''), { encoding: 'base64' }, (writeError) => {
      if (writeError) {
        reject(writeError);
        return;
      }

      ffmpeg(tmpInputPath)
        .output(tmpOutputPath)
        .on('end', () => {
          fs.promises.unlink(tmpInputPath)
          resolve(tmpOutputPath)
        
        })
        .on('error', (conversionError) => {
          reject(conversionError);
        })
        .run();
    });
  });
}