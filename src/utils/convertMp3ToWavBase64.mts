
import path from "node:path"
import * as fs from "node:fs"

import { v4 as uuidv4 } from "uuid"
import tmpDir from "temp-dir"
import ffmpeg from "fluent-ffmpeg"

export function convertMp3ToWavBase64(base64: string) : Promise<string> {
  return new Promise((resolve, reject) => {

    const inputPath = path.join(tmpDir, `${uuidv4()}.mp3`)
    const outputPath = path.join(tmpDir, `${uuidv4()}.wav`)

    const base64Header = 'data:audio/mpeg;base64,';

    fs.writeFile(inputPath, base64.replace(base64Header, ''), { encoding: 'base64' }, (writeError) => {
      if (writeError) {
        reject(writeError);
        return;
      }

      ffmpeg(inputPath)
        .output(outputPath)
        .on('end', () => {
          fs.readFile(outputPath, { encoding: 'base64' }, (readError, data) => {
            if (readError) {
              reject(readError);
              return;
            }
            resolve(`data:audio/wav;base64,${data}`);
            fs.promises.unlink(inputPath);
            fs.promises.unlink(outputPath);
          });
        })
        .on('error', (conversionError) => {
          reject(conversionError);
        })
        .run();
    });
  });
}