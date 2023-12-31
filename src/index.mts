import { createReadStream, existsSync } from "node:fs"
import path from "node:path"

import { validate as uuidValidate } from "uuid"
import express from "express"

import { completedFilesDirFilePath } from "./config.mts"

import { Video, VideoStatus, VideoAPIRequest, RenderRequest, RenderedScene, ImageAnalysisRequest, ImageAnalysisResponse, SoundAnalysisResponse, SoundAnalysisRequest } from "./types.mts"

import { parseVideoRequest } from "./utils/requests/parseVideoRequest.mts"
import { savePendingVideo } from "./scheduler/savePendingVideo.mts"
import { getVideo } from "./scheduler/getVideo.mts"
import { main } from "./main.mts"
import { markVideoAsToDelete } from "./scheduler/markVideoAsToDelete.mts"
import { markVideoAsToAbort } from "./scheduler/markVideoAsToAbort.mts"
import { markVideoAsToPause } from "./scheduler/markVideoAsToPause.mts"
import { markVideoAsPending } from "./scheduler/markVideoAsPending.mts"
import { getPendingVideos } from "./scheduler/getPendingVideos.mts"
import { hasValidAuthorization } from "./utils/requests/hasValidAuthorization.mts"
import { getAllVideosForOwner } from "./scheduler/getAllVideosForOwner.mts"
import { initFolders } from "./utils/filesystem/initFolders.mts"
import { sortVideosByYoungestFirst } from "./scheduler/sortVideosByYoungestFirst.mts"
import { getRenderedScene, renderScene } from "./production/renderScene.mts"
import { parseRenderRequest } from "./utils/requests/parseRenderRequest.mts"
import { loadRenderedSceneFromCache } from "./utils/requests/loadRenderedSceneFromCache.mts"

import { upscaleImage } from "./providers/image-upscaling/upscaleImage.mts"
import { analyzeImage } from "./providers/image-caption/analyzeImageWithIDEFICSAndNastyHack.mts"
// import { speechToText } from "./speechToText/speechToTextWithWhisperLib.mts"

initFolders()
// to disable all processing (eg. to debug)
// then comment the following line:
main()

const app = express()
const port = 7860

let isRendering = false

process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
})

process.on('uncaughtException', (error: Error) => {
  console.error(`Caught exception: ${error}\n` + `Exception origin: ${error.stack}`);
})

// fix this error: "PayloadTooLargeError: request entity too large"
// there are multiple version because.. yeah well, it's Express!
// app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// an image analyzing pipeline
app.post("/analyze", async (req, res) => {

  const request = req.body as ImageAnalysisRequest

  if (!request.prompt) {
    console.log("Invalid prompt")
    res.status(400)
    res.write(JSON.stringify({ result: "", error: "invalid prompt" }))
    res.end()
    return
  }

  if (!request.image) {
    console.log("Invalid image")
    res.status(400)
    res.write(JSON.stringify({ result: "", error: "invalid image" }))
    res.end()
    return
  }

  /*
  console.log("/analyze called with: ", {
    prompt: request.prompt,
    image: request.image.slice(0, 50)
  })
  */

  const response: ImageAnalysisResponse = {
    result: "",
    error: ""
  }

  try {
    response.result = await analyzeImage(request.image, request.prompt)
  } catch (err) {
    console.log("failed to analyze the image!")
    console.log(err)
    response.error = `failed to analyze the image: ${err}`
  }

  if (response.error.length > 0) {
    // console.log("server error")
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else {
    // console.log("all good")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  }
})


// a sound recognition pipeline
// it is currently broken
/*
app.post("/listen", async (req, res) => {

  const request = req.body as SoundAnalysisRequest

  if (!request.sound) {
    console.log("Invalid sound")
    res.status(400)
    res.write(JSON.stringify({ result: "", error: "invalid sound" }))
    res.end()
    return
  }

  console.log("/listen called with: ", {
    sound: request.sound.slice(0, 50)
  })

  const response: SoundAnalysisResponse = {
    result: "",
    error: ""
  }

  try {
    response.result = await speechToText(request.sound)
  } catch (err) {
    console.log("failed to listen to the sound!")
    console.log(err)
    response.error = `failed to listen to the sound: ${err}`
  }

  if (response.error.length > 0) {
    // console.log("server error")
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else {
    // console.log("all good")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  }
})
*/

// a "fast track" pipeline
app.post("/render", async (req, res) => {

  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }
  
  // console.log(req.body)

  const request = parseRenderRequest(req.body as RenderRequest)

  if (!request.prompt) {
    console.log("Invalid prompt")
    res.status(400)
    res.write(JSON.stringify({ url: "", error: "invalid prompt" }))
    res.end()
    return
  }

  if (request.cache === "use") {
    // console.log("client requested to use the cache")
    try {
      const cached = await loadRenderedSceneFromCache(request)
      const cachedJson = JSON.stringify(cached)
      // console.log(`request ${request} is in cache!`)
      res.status(200)
      res.write(cachedJson)
      res.end()
      return
    } catch (err) {
      // console.log("request not found in cache: "+ err)
      // move along
    }
  } else if (request.cache === "renew") {
    // console.log("client requested to renew the cache")
  }

  let response: RenderedScene = {
    renderId: "",
    status: "pending",
    assetUrl: "",
    alt: request.prompt || "",
    maskUrl: "",
    error: "",
    segments: []
  }

  try {
    response = await renderScene(request)
  } catch (err) {
    // console.log("failed to render scene!")
    response.error = `failed to render scene: ${err}`
  }

  if (response.error === "already rendering") {
    // console.log("server busy")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else if (response.error.length > 0) {
    // console.log("server error")
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else {
    // console.log("all good")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  }
})

// upscale an arbitrary image
app.post("/upscale", async (req, res) => {

  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  const image = `${req.body.image}`

  if (!image) {
    console.error("invalid input image")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid input image` }))
    res.end()
    return
  }

  let response = {
    assetUrl: "",
    error: "",
  }

  let assetUrl = ""
  try {
    try {
      assetUrl = await upscaleImage(image, req.body.factor)
    } catch (err) {
      // hmm.. let's try again?
      try {
        assetUrl = await upscaleImage(image, req.body.factor)
      } catch (err) {
        throw new Error(`second attempt to upscale the image failed (${err})`)
      }
    }
    if (!assetUrl) {
      throw new Error(`no image to return`)
    }

    response.assetUrl = assetUrl
    // console.log(`request ${renderId} is already in cache, so we return that`)
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  } catch (err) {
    response.error = `${err}`
    console.error(`${err}`)
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
  }
})


// used to upscale an existing image
// the image has to be completed for this to work
// ie it has to be in cache
// it's a bit of a hack endpoint I've added to reduce the laod
// on the AI Comic Factory, but we don't really need it for other applications
app.post("/upscale/:renderId", async (req, res) => {

  const renderId = `${req.params.renderId}`

  if (!uuidValidate(renderId)) {
    console.error("invalid render id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid render id` }))
    res.end()
    return
  }

  let response = {
    assetUrl: "",
    error: "",
  }

  let assetUrl = ""
  try {
    // we still try to search for it in the cache
    const cached = await loadRenderedSceneFromCache(undefined, renderId)
    try {
      assetUrl = await upscaleImage(cached.assetUrl, 2)
    } catch (err) {
      // hmm.. let's try again?
      try {
        assetUrl = await upscaleImage(cached.assetUrl, 2)
      } catch (err) {
        throw new Error(`second attempt to upscale the image failed (${err})`)
      }
    }
    if (!assetUrl) {
      throw new Error(`no image to return`)
    }

    response.assetUrl = assetUrl
    // console.log(`request ${renderId} is already in cache, so we return that`)
    res.status(200)
    res.write(response)
    res.end()
    return
  } catch (err) {
    // console.log("renderId not found in cache: "+ err)
    // move along
    response.error = `${err}`
    console.error(`${err}`)
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
  }
})

// a "fast track" pipeline
app.get("/render/:renderId", async (req, res) => {

  const renderId = `${req.params.renderId}`

  if (!uuidValidate(renderId)) {
    console.error("invalid render id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid render id` }))
    res.end()
    return
  }

  try {
    // we still try to search for it in the cache
    const cached = await loadRenderedSceneFromCache(undefined, renderId)
    const cachedJson = JSON.stringify(cached)
    // console.log(`request ${renderId} is already in cache, so we return that`)
    res.status(200)
    res.write(cachedJson)
    res.end()
    return
  } catch (err) {
    // console.log("renderId not found in cache: "+ err)
    // move along
  }

  let response: RenderedScene = {
    renderId: "",
    status: "pending",
    assetUrl: "",
    alt: "",
    error: "",
    maskUrl: "",
    segments: []
  }

  // console.log("going to render the scene!")
  try {
    response = await getRenderedScene(renderId)
  } catch (err) {
    // console.log("failed to render scene!")
    response.error = `failed to render scene: ${err}`
  }

  if (response.error === "already rendering") {
    console.log("server busy")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else if (response.error.length > 0) {
    // console.log("server error")
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
    return
  } else {
    // console.log("all good")
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  }
})

app.post("/:ownerId", async (req, res) => {
  const request = req.body as VideoAPIRequest

  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }
  
  const ownerId = req.params.ownerId

  if (!uuidValidate(ownerId)) {
    console.error("invalid owner id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid owner id` }))
    res.end()
    return
  }

  let video: Video = null

  console.log(`creating video from request..`)
  // console.log(`request: `, JSON.stringify(request))
  if (!request?.prompt?.length) {
    console.error(`failed to create video (prompt is empty})`)
    res.status(400)
    res.write(JSON.stringify({ error: "prompt is empty" }))
    res.end()
    return
  }
  try {
    video = await parseVideoRequest(ownerId, request)
  } catch (err) {
    console.error(`failed to create video: ${video} (${err})`)
    res.status(400)
    res.write(JSON.stringify({ error: "query seems to be malformed" }))
    res.end()
    return
  }

  console.log(`saving video ${video.id}`)
  try {
    await savePendingVideo(video)
    res.status(200)
    res.write(JSON.stringify(video))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ error: "couldn't save the video" }))
    res.end()
  }
})

app.get("/:ownerId/:videoId\.mp4", async (req, res) => {
    
  /*
  for simplicity, let's skip auth when fetching videos
  the UUIDs cannot easily be guessed anyway

  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }
  */

  const ownerId = req.params.ownerId
  console.log("downloading..")

  if (!uuidValidate(ownerId)) {
    console.error("invalid owner id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid owner id` }))
    res.end()
    return
  }

  const videoId = req.params.videoId

  if (!uuidValidate(videoId)) {
    console.error("invalid video id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid video id` }))
    res.end()
    return
  }

  let video: Video = null
  try {
    video = await getVideo(ownerId, videoId)
    console.log(`returning video ${videoId} to owner ${ownerId}`)
  } catch (err) {
    res.status(404)
    res.write(JSON.stringify({ error: "this video doesn't exist" }))
    res.end()
    return
  }

  const completedFilePath = path.join(completedFilesDirFilePath, video.fileName)

  // note: we DON'T want to use the pending file path, as there may be operations on it
  // (ie. a process might be busy writing stuff to it)
  const filePath = existsSync(completedFilePath) ? completedFilePath : ""
  if (!filePath) {
    res.status(400)
    res.write(JSON.stringify({ error: "video exists, but cannot be previewed yet" }))
    res.end()
    return
  }

  // file path exists, let's try to read it
  try {
    // do we need this?
    // res.status(200)
    // res.setHeader("Content-Type", "media/mp4")
    console.log(`creating a video read stream from ${filePath}`)
    const stream = createReadStream(filePath)
  
    stream.on('close', () => {
      console.log(`finished streaming the video`)
      res.end()
    })
    
    stream.pipe(res)
  } catch (err) {
    console.error(`failed to read the video file at ${filePath}: ${err}`)
    res.status(500)
    res.write(JSON.stringify({ error: "failed to read the video file" }))
    res.end()
  }
})

// get metadata (json)
app.get("/:ownerId/:videoId", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  const ownerId = req.params.ownerId

  if (!uuidValidate(ownerId)) {
    console.error("invalid owner id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid owner id` }))
    res.end()
    return
  }

  const videoId = req.params.videoId

  if (!uuidValidate(videoId)) {
    console.error("invalid video id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid video id` }))
    res.end()
    return
  }

  try {
    const video = await getVideo(ownerId, videoId)
    res.status(200)
    res.write(JSON.stringify(video))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(404)
    res.write(JSON.stringify({ error: "couldn't find this video" }))
    res.end()
  }
})

// only get the videos for a specific owner
app.get("/:ownerId", async (req, res) => {
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  const ownerId = req.params.ownerId

  if (!uuidValidate(ownerId)) {
    console.error(`invalid owner d ${ownerId}`)
    res.status(400)
    res.write(JSON.stringify({ error: `invalid owner id ${ownerId}` }))
    res.end()
    return
  }

  try {
    const videos = await getAllVideosForOwner(ownerId)
    sortVideosByYoungestFirst(videos)

    res.status(200)
    res.write(JSON.stringify(videos.filter(video => video.status !== "delete"), null, 2))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ error: `couldn't get the videos for owner ${ownerId}` }))
    res.end()
  }
})

// caption an audio sample
/*
app.post("/audio/caption", async (req, res) => {

  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  const image = `${req.body.image}`

  if (!image) {
    console.error("invalid input image")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid input image` }))
    res.end()
    return
  }

  let response = {
    caption: "",
    error: "",
  }

  let caption = ""
  try {
    try {
      caption = await audioToCaption(audio, req.body.factor)
    } catch (err) {
      // hmm.. let's try again?
      try {
        caption = await audioToCaption(audio, req.body.factor)
      } catch (err) {
        throw new Error(`second attempt to caption the audio failed (${err})`)
      }
    }
    if (!caption) {
      throw new Error(`no caption to return`)
    }

    response.caption = caption
    res.status(200)
    res.write(JSON.stringify(response))
    res.end()
    return
  } catch (err) {
    response.error = `${err}`
    console.error(`${err}`)
    res.status(500)
    res.write(JSON.stringify(response))
    res.end()
  }
})

*/

// get all pending videos - this is for admin usage only
app.get("/", async (req, res) => {
  if (!hasValidAuthorization(req.headers)) {
    // this is what users will see in the space - but no need to show something scary
    console.log("Invalid authorization")
    res.status(200)
    res.write(`<html><head></head><body>
VideoChain is a toolchain to render scenes using AI. It is used by <a href="https://jbilcke-hf-videoquest.hf.space" target="_blank">VideoQuest</a>, a generative AI game.
    </body></html>`)
    res.end()
    // res.status(401)
    // res.write(JSON.stringify({ error: "invalid token" }))
    // res.end()
    return
  }

  try {
    const videos = await getPendingVideos()
    res.status(200)
    res.write(JSON.stringify(videos, null, 2))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ error: "couldn't get the videos" }))
    res.end()
  }
})


// edit a video
app.patch("/:ownerId/:videoId", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  const ownerId = req.params.ownerId

  if (!uuidValidate(ownerId)) {
    console.error(`invalid owner id ${ownerId}`)
    res.status(400)
    res.write(JSON.stringify({ error: `invalid owner id ${ownerId}` }))
    res.end()
    return
  }

  const videoId = req.params.videoId

  if (!uuidValidate(videoId)) {
    console.error(`invalid video id ${videoId}`)
    res.status(400)
    res.write(JSON.stringify({ error: `invalid video id ${videoId}` }))
    res.end()
    return
  }

  let status: VideoStatus = "unknown"
  try {
    const request = req.body as { status: VideoStatus }
    if (['pending', 'abort', 'delete', 'pause'].includes(request.status)) {
      status = request.status
    } else {
      throw new Error(`invalid video status "${request.status}"`)
    }
  } catch (err) {
    console.error(`invalid parameter (${err})`)
    res.status(401)
    res.write(JSON.stringify({ error: `invalid parameter (${err})` }))
    res.end()
    return
  }

  switch (status) {
    case 'delete': 
      try {
        await markVideoAsToDelete(ownerId, videoId)
        console.log(`deleting video ${videoId}`)
        res.status(200)
        res.write(JSON.stringify({ success: true }))
        res.end()
      } catch (err) {
        console.error(`failed to delete video ${videoId} (${err})`)
        res.status(500)
        res.write(JSON.stringify({ error: `failed to delete video ${videoId}` }))
        res.end()
      }
      break

    case 'abort': 
      try {
        await markVideoAsToAbort(ownerId, videoId)
        console.log(`aborted video ${videoId}`)
        res.status(200)
        res.write(JSON.stringify({ success: true }))
        res.end()
      } catch (err) {
        console.error(`failed to abort video ${videoId} (${err})`)
        res.status(500)
        res.write(JSON.stringify({ error: `failed to abort video ${videoId}` }))
        res.end()
      }
      break

    case 'pause': 
      try {
        await markVideoAsToPause(ownerId, videoId)
        console.log(`paused video ${videoId}`)
        res.status(200)
        res.write(JSON.stringify({ success: true }))
        res.end()
      } catch (err) {
        console.error(`failed to pause video ${videoId} (${err})`)
        res.status(500)
        res.write(JSON.stringify({ error: `failed to pause video ${videoId}` }))
        res.end()
      }
      break
    
    case 'pending': 
      try {
        await markVideoAsPending(ownerId, videoId)
        console.log(`unpausing video ${videoId}`)
        res.status(200)
        res.write(JSON.stringify({ success: true }))
        res.end()
      } catch (err) {
        console.error(`failed to unpause video ${videoId} (${err})`)
        res.status(500)
        res.write(JSON.stringify({ error: `failed to unpause video ${videoId}` }))
        res.end()
      }
      break

    default:
      console.log(`unsupported status ${status}`)
      res.status(401)
      res.write(JSON.stringify({ error: `unsupported status ${status}` }))
      res.end()
  }
})

// delete a video - this is legacy, we should use other functions instead
/*
app.delete("/:id", async (req, res) => {
    
  if (!hasValidAuthorization(req.headers)) {
    console.log("Invalid authorization")
    res.status(401)
    res.write(JSON.stringify({ error: "invalid token" }))
    res.end()
    return
  }

  const [ownerId, videoId] = `${req.params.id}`.split("_")

  if (!uuidValidate(ownerId)) {
    console.error("invalid owner id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid owner id` }))
    res.end()
    return
  }

  if (!uuidValidate(videoId)) {
    console.error("invalid video id")
    res.status(400)
    res.write(JSON.stringify({ error: `invalid video id` }))
    res.end()
    return
  }

  // ecurity note: we always check the existence if the video first
  // that's because we are going to delete all the associated files with a glob,
  // so we must be sure the id is not a system path or something ^^
  let video: Video = null
  try {
    video = await getVideo(ownerId, videoId)
  } catch (err) {
    console.error(err)
    res.status(404)
    res.write(JSON.stringify({ error: "couldn't find this video" }))
    res.end()
    return
  }

  try {
    await markVideoAsToDelete(ownerId, videoId)
    res.status(200)
    res.write(JSON.stringify({ success: true }))
    res.end()
  } catch (err) {
    console.error(err)
    res.status(500)
    res.write(JSON.stringify({ success: false, error: "failed to delete the video" }))
    res.end()
  }
})
*/

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })