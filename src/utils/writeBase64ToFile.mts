import { promises as fs } from "node:fs"

export async function writeBase64ToFile(content: string, filePath: string): Promise<void> {
  
  // Remove "data:image/png;base64," from the start of the data url
  const base64Data = content.split(",")[1]

  // Convert base64 to binary
  const data = Buffer.from(base64Data, "base64")

  // Write binary data to file
  try {
    await fs.writeFile(filePath, data)
    // console.log("File written successfully")
  } catch (error) {
    console.error("An error occurred:", error)
  }
}