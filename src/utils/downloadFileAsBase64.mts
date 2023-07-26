export const downloadImageAsBase64 = async (remoteUrl: string): Promise<string> => {
  const controller = new AbortController()

  // download the image
  const response = await fetch(remoteUrl, {
    signal: controller.signal
  })

  // get as Buffer
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // convert it to base64
  const base64 = buffer.toString('base64')

  return base64
};