import { client } from "@gradio/client"

const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png")
const exampleImage = await response_0.blob()
						
const app = await client("https://jbilcke-hf-grounded-segment-anything.hf.space/")
const result = await app.predict(0, [
  exampleImage, 	// blob in 'Upload' Image component		
  "Howdy!", // string  in 'Detection Prompt[To detect multiple objects, seperating each name with '.', like this: cat . dog . chair ]' Textbox component		
  0, // number (numeric value between 0.0 and 1.0) in 'Box Threshold' Slider component		
  0, // number (numeric value between 0.0 and 1.0) in 'Text Threshold' Slider component		
  0, // number (numeric value between 0.0 and 1.0) in 'IOU Threshold' Slider component
]) as any

console.log(result.data)