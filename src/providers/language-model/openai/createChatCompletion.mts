import { ChatCompletionRequestMessage } from "openai"
import { GPTTokens } from "gpt-tokens"

import { openai } from "./openai.mts"
import { runModerationCheck } from "./runModerationCheck.mts"
import { getUserContent } from "./getUserContent.mts"
import { getTextPrompt } from "./getTextPrompt.mts"

export const createChatCompletion = async (
  messages: ChatCompletionRequestMessage[],
  model = "gpt-4"
): Promise<string> => {
  // this is the part added by the user, and the one we need to check against the moderation API
  const userContent = getUserContent(messages)

  const check = await runModerationCheck(userContent)

  if (check.flagged) {
    console.error("Thoughtcrime: content flagged by the AI police", {
      userContent,
      moderationResult: check,
    })
    return "Thoughtcrime: content flagged by the AI police"
  }

  const rawPrompt = getTextPrompt(messages)


  // for doc: https://www.npmjs.com/package/gpt-tokens
  const usageInfo = new GPTTokens({
    // Plus enjoy a 25% cost reduction for input tokens on GPT-3.5 Turbo (0.0015 per 1K input tokens)
    // plus    : false,
    model   : "gpt-4",
    messages: messages as any,
  })

  console.table({
    "Tokens prompt": usageInfo.promptUsedTokens,
    "Tokens completion": usageInfo.completionUsedTokens,
    "Tokens total": usageInfo.usedTokens,
  })

  // Price USD:  0.000298
  console.log("Price USD: ", usageInfo.usedUSD)

  // const tokenLimit = 4000

  const maxTokens = 4000 - usageInfo.promptUsedTokens

  console.log("maxTokens:", maxTokens)
  /*
  console.log("settings:", {
    tokenLimit,
    promptLength: rawPrompt.length,
    promptTokenLengh: rawPrompt.length / 1.9,
    maxTokens
  })

  console.log("createChatCompletion(): raw prompt length:", rawPrompt.length)
  console.log(
    `createChatCompletion(): requesting ${maxTokens} of the ${tokenLimit} tokens availables`
  )
  */

  console.log("query:", {
    model,
    // messages,
    user: "Anonymous User",
    temperature: 0.7,
    max_tokens: maxTokens,
    // stop: preset.stop?.length ? preset.stop : undefined,
  })

  const response = await openai.createChatCompletion({
    model,
    messages,
    // TODO use the Hugging Face Login username here
    user: "Anonymous User",
    temperature: 0.7,

    // 30 tokens is about 120 characters
    // we don't want more, as it will take longer to respond
    max_tokens: maxTokens,
    // stop: preset.stop?.length ? preset.stop : undefined,
  })

  const { choices } = response.data

  if (!choices.length) {
    console.log("createChatCompletion(): no choice found in the LLM response..")
    return ""
  }
  const firstChoice = choices[0]

  if (firstChoice?.message?.role !== "assistant") {
    console.log(
      "createChatCompletion(): something went wrong, the model imagined the user response?!"
    )
    return ""
  }

  console.log("createChatCompletion(): response", firstChoice.message.content)

  return firstChoice.message.content || ""
}