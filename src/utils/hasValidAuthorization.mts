import { IncomingHttpHeaders } from "node:http"

export const hasValidAuthorization = (headers: IncomingHttpHeaders) => {
  const [_, token] = `${headers.authorization || ""}`.split(" ")
  if (typeof token === "string" && token.trim() === process.env.VC_SECRET_ACCESS_TOKEN.trim()) {
    return true
  }

  return false
}