
import { client } from "@gradio/client"


// we don't use replicas yet, because it ain't easy to get their hostname
const instances: string[] = [
  `${process.env.VC_ANALYSIS_SPACE_API_URL || ""}`,
  // `${process.env.VC_UPSCALING_SPACE_API_URL_2 || ""}`,
  // `${process.env.VC_UPSCALING_SPACE_API_URL_3 || ""}`,
].filter(instance => instance?.length > 0)


export async function analyzeImage(src: string, prompt: string): Promise<string> {

  const instance = instances.shift()
  instances.push(instance)

  const api = await client(instance, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })
  
  const result = await api.predict(6, [		
    "HuggingFaceM4/idefics-80b-instruct", // string (Option from: ['HuggingFaceM4/idefics-80b-instruct']) in 'Model' Dropdown component		
    prompt, // string  in 'Text input' Textbox component		
    "null", // any (any valid json) in 'IDEFICS' Chatbot component
    src, 	// blob in 'Image input' Image component

    // the following values come from the source code at:
    // https://huggingface.co/spaces/HuggingFaceM4/idefics_playground/blob/main/app_dialogue.py#L416-L472

    "Greedy", // string  in 'Decoding strategy' Radio component		
    0.4, // number (numeric value between 0.0 and 5.0) in 'Sampling temperature' Slider component		
    512, // number (numeric value between 8 and 1024) in 'Maximum number of new tokens to generate' Slider component		
    1, // number (numeric value between 0.0 and 5.0) in 'Repetition penalty' Slider component		
    0.8, // number (numeric value between 0.01 and 0.99) in 'Top P' Slider component
  ])

  const rawResponse = result as any 

  console.log("rawResponse:", rawResponse)
  
  return rawResponse?.data?.[0] as string
}
