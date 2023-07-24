import { ChatCompletionRequestMessage } from "openai"
import { parse } from "yaml"

import { createChatCompletion } from "./createChatCompletion.mts"

export const generateYAML = async <T,>(messages: ChatCompletionRequestMessage[] = [], defaultValue?: T): Promise<T> => {

  const defaultResult = defaultValue || ({} as T)

  if (!messages.length) {
    return defaultResult
  }

  const output = await createChatCompletion(messages)

  let raw = ""

  // cleanup any remains of the markdown response
  raw = output.split("```")[0]

  // remove any remaining `
  const input = raw.replaceAll("`", "")

  try {
    const obj = parse(input) as T

    if (obj === null || typeof obj === undefined) {
      throw new Error("couldn't parse YAML")
    }

    return obj
  } catch (err) {
    // just in case, we also try JSON!
    const obj = JSON.parse(input) as T

    if (obj === null || typeof obj === undefined) {
      throw new Error("couldn't parse JSON")
    }

    return obj
  }
}