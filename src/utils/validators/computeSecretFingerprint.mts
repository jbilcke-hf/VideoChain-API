import { computeSha256 } from "./computeSha256.mts"

const secretFingerprint = `${process.env.VC_SECRET_FINGERPRINT || ""}`

export function computeSecretFingerprint(input: string) {
  return computeSha256(`${secretFingerprint}_${input}`)
}