import { ChatCompletionRequestMessage } from "openai"

import { openai } from "./openai.mts"
import { streamCompletion } from "./stream.mts"
import { getTextPrompt } from "./getTextPrompt.mts"

export const createChatCompletionStream = async (
  messages: ChatCompletionRequestMessage[],
  model: string,
  onMessage: (message: string) => Promise<void>,
  onEnd = () => Promise<void>
) => {
  try {
    const rawPrompt = getTextPrompt(messages)

    const tokenLimit = 4096 // 8000

    const maxTokens = Math.round(tokenLimit - rawPrompt.length / 1.9)

    const completion = await openai.createCompletion({
      model,
      prompt: messages,
      temperature: 0.7,
      max_tokens: Math.min(30, maxTokens),
      stream: true,
    })

    for await (const message of streamCompletion(completion as any)) {
      try {
        const parsed = JSON.parse(message)
        const { text } = parsed.choices[0]

        try {
          await onMessage(text)
        } catch (err) {
          console.error(
            'Could not process stream message (callback failed)',
            message,
            err
          )
        }
      } catch (error) {
        console.error('Could not JSON parse stream message', message, error)
      }
    }
    try {
      await onEnd()
    } catch (err) {
      console.error('onEnd callback failed', err)
    }
  } catch (error: any) {
    if (error.code) {
      try {
        const parsed = JSON.parse(error.body)
        console.error('An error occurred during OpenAI request: ', parsed)
      } catch (error) {
        console.error(
          'An error occurred during OpenAI request (invalid json): ',
          error
        )
      }
    } else {
      console.error('An error occurred during OpenAI request', error)
    }
  }
}