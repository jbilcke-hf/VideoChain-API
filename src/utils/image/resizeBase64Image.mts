import sharp from "sharp"

export async function resizeBase64Image(imgBase64: string, targetWidth: number, targetHeight: number): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(imgBase64, 'base64');

  // Resize the buffer to the target size
  const resizedBuffer = await sharp(buffer)
      .resize(targetWidth, targetHeight)
      .toBuffer();

  // Convert the buffer back to base64
  const resizedImageBase64 = resizedBuffer.toString('base64');

  return `data:image/png;base64,${resizedImageBase64}`
}