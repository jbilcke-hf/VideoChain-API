export function addBase64HeaderToMp4(base64Data: string) {
  if (typeof base64Data !== "string" || !base64Data) {
    return ""
  }
  if (base64Data.startsWith('data:')) {
    if (base64Data.startsWith('data:video/mp4;base64,')) {
      return base64Data
    } else {
      throw new Error("fatal: the input string is NOT a mp4 video!")
    }
  } else {
    return `data:video/mp4;base64,${base64Data}`
  }
}