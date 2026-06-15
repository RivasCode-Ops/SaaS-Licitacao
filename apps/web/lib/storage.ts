import fs from "fs/promises"
import path from "path"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

export async function saveFile(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
  const uniqueName = `${Date.now()}-${fileName}`
  const filePath = path.join(UPLOADS_DIR, uniqueName)
  await fs.writeFile(filePath, buffer)
  return `/uploads/${uniqueName}`
}

export async function deleteFile(url: string): Promise<void> {
  const relativePath = url.replace(/^\//, "")
  const filePath = path.join(process.cwd(), "public", relativePath)
  await fs.unlink(filePath).catch(() => {})
}
