import { generateAudio } from "./services/generateAudio.mts"


console.log('generating background audio..')
const audioFileName = await generateAudio("sounds of a castle bell ringing alarm", "test_juju_audio.mp3")

console.log('result:', audioFileName)