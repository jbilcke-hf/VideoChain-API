import { ChatCompletionRequestMessage } from "openai"

export const getTextPrompt = (prompt: ChatCompletionRequestMessage[]) =>
  prompt.reduce((acc, item) => acc.concat(item.content), "") || ""