
// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_ZEROSCOPE_SPACE_API_URL_1 || ""}`,
].filter(instance => instance?.length > 0)

const secretToken = `${process.env.VC_MICROSERVICE_SECRET_TOKEN || ""}`

export const generateVideo = async (prompt: string, options?: {
  seed: number;
  nbFrames: number;
  nbSteps: number;
}) => {
  throw new Error("Not implemented yet")
}
