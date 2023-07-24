import {
  CreateModerationResponseResultsInnerCategories,
  CreateModerationResponseResultsInnerCategoryScores,
} from "openai"

import { openai } from "./openai.mts"

export const runModerationCheck = async (
  input = ''
): Promise<{
  categories?: CreateModerationResponseResultsInnerCategories
  category_scores?: CreateModerationResponseResultsInnerCategoryScores
  flagged: boolean
}> => {
  if (!input || !input.length) {
    console.log(`skipping moderation check as input length is too shot`)
    return {
      flagged: false,
    }
  }

  const response = await openai.createModeration({ input })
  const { results } = response.data

  if (!results.length) {
    throw new Error(`failed to call the moderation endpoint`)
  }

  return results[0]
}