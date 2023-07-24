export const streamToBuffer = (
  stream: NodeJS.ReadWriteStream
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk: Buffer) => {
      // console.log("Received chunk with length:"", chunk.length)
      chunks.push(chunk)
    })
    stream.on("error", reject)
    stream.on("end", () => {
      /*
      console.log(
        "Stream ended, total buffer length:",
        Buffer.concat(chunks).length
      )
      */
      resolve(Buffer.concat(chunks))
    })
  })
}