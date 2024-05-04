
import { getHuggingFaceSpaceStatus } from "./getHuggingFaceSpaceStatus.mts"
import { sleep } from "./sleep.mts"

export async function makeSureSpaceIsRunning({
  space,
  maxWaitTimeInSec = 15 * 60, // some spaces are ultra slow to cold boot (eg. data dl at runtime)
  statusUpdateFrequencyInSec = 5,
  // userName,
  // spaceName,
}: {
  space?: string // a joined "user_name/space_name"

  maxWaitTimeInSec?: number

  statusUpdateFrequencyInSec?: number

  // userName: string
  // spaceName: string
}): Promise<void> {
  if (!space) { return }
  
  // process.stdout.write(`trying to restart space "${space}"`)
  try {
    const { runtime: { stage } } = await getHuggingFaceSpaceStatus({ space })
    if (stage === "RUNNING") {
      // process.stdout.write(`: well, it is already ${stage}!\n`)
      return
    }
  } catch (err) {
  }

  const res = await fetch(`https://huggingface.co/api/spaces/${space}/restart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VC_HF_API_TOKEN || ""}`
    }
  })

  if (res.status !== 200) {
    process.stdout.write(`failure!\nwe couldn't trigger the restart of space "${space}"\n`)
  
    throw new Error(`failed to trigger the restart of space "${space}" (status is not 200)`)
  }

  let elapsedTime = 0

  process.stdout.write(`trying to restart space "${space}"`)

  while (true) {
    process.stdout.write(".")
    const { runtime: { stage } } = await getHuggingFaceSpaceStatus({ space })

    if (stage === "RUNNING") {
      process.stdout.write(`success!\nspace "${space}" is ${stage} (took ${elapsedTime} sec)\n`)
      return
    } else if (stage === "BUILDING" || stage === "RUNNING_BUILDING") {
      // let's wait more
      await sleep(statusUpdateFrequencyInSec * 1000)

      elapsedTime += statusUpdateFrequencyInSec

      if (elapsedTime >= maxWaitTimeInSec) {
        process.stdout.write(`failure!\nspace "${space}" is still ${stage} (after ${elapsedTime} sec)\n`)
        if (stage === "BUILDING") {
          throw new Error(`failed to start space ${space} (reason: space is ${stage}, but we reached the ${maxWaitTimeInSec} sec timeout)`)
        } else {
          // if we are "RUNNING_BUILDING" we assume it is.. okay? I guess?
          return
        }
      }
    } else {
      process.stdout.write(`failure!\nspace "${space}" is ${stage} (after ${elapsedTime} sec)\n`)
      throw new Error(`failed to build space ${space} (reason: space is ${stage})`)
    }
  }
}