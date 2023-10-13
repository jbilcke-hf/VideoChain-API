export const downloadFileAsBase64URL = async (remoteUrl: string): Promise<string> => {
  const controller = new AbortController()

  // download the file
  const response = await fetch(remoteUrl, {
    signal: controller.signal
  })

  // get as Buffer
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // convert it to base64
  const base64 = buffer.toString('base64')

  const contentType = response.headers.get('content-type')

  const assetUrl = `data:${contentType};base64,${base64}`
  return assetUrl
};