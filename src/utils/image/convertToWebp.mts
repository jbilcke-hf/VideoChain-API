import sharp from "sharp"

export async function convertToWebp(imgBase64: string): Promise<string> {
  // Convert base64 to buffer
  const tmpBuffer = Buffer.from(imgBase64, 'base64')

  // Resize the buffer to the target size
  const newBuffer = await sharp(tmpBuffer)
    .webp({
      // for options please see https://sharp.pixelplumbing.com/api-output#webp

      // preset: "photo",

      // effort: 3,

      // for a PNG-like quality
      // lossless: true,

      // by default it is quality 80
      quality: 90,

      // nearLossless: true,

      // use high quality chroma subsampling
      smartSubsample: true,
     })
      .toBuffer()

  // Convert the buffer back to base64
  const newImageBase64 = newBuffer.toString('base64')

  return `data:image/webp;base64,${newImageBase64}`
}