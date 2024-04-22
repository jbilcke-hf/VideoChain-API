import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: `${process.env.VC_OPENAI_API_KEY || ""}`
})