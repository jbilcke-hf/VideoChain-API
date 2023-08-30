
import { client } from "@gradio/client"

const instances: string[] = [
  `${process.env.VC_ANALYSIS_SPACE_API_URL || ""}`,
].filter(instance => instance?.length > 0)

export async function analyzeImage(src: string, prompt: string): Promise<string> {

  const instance = instances.shift()
  instances.push(instance)

  const api = await client(instance, {
    hf_token: `${process.env.VC_HF_API_TOKEN}` as any
  })

  // console.log("/analyzeImage: calling api.predict(6, ...)")

  /*
  the chat history has this format:
  [
    [
      '![](/file=/tmp/gradio/2ee0577f810cba5c50d0a7f047a9e6557f4e269f/image.png)What do you see in the following image?',
      'I'
    ]
  ]
*/
  const chat_history = [
    // ['', '']
  ]

  // unfortunately the Gradio client doesn't support streaming, and will crash here with a nasty error
  /*
  node_modules/@gradio/client/dist/index.js:705
  return data.map((d, i) => {
              ^
TypeError: Cannot read properties of null (reading 'is_file')
    at node_modules/@gradio/client/dist/index.js:713:43
    at Array.map (<anonymous>)
    at transform_output (node_modules/@gradio/client/dist/index.js:705:15)
  */

  const result = await api.predict(6, [		
    "HuggingFaceM4/idefics-80b-instruct", // string (Option from: ['HuggingFaceM4/idefics-80b-instruct']) in 'Model' Dropdown component		
    prompt, // string  in 'Text input' Textbox component		
    chat_history, // any (any valid json) in 'IDEFICS' Chatbot component
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

  console.log("got a response!:", rawResponse)
  
  return rawResponse?.data?.[0] as string
}
