import { ChatCompletionRequestMessage } from "openai"

export const getUserContent = (prompt: ChatCompletionRequestMessage[]) =>
  prompt
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n")