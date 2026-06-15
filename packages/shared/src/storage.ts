import fs from "fs/promises"
import path from "path"

let s3Client: import("@aws-sdk/client-s3").S3Client | null = null

function getS3() {
  if (s3Client) return s3Client
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
  } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    return null
  }
  const { S3Client } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3")
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })
  return s3Client
}

function getBucket(): string {
  return process.env.R2_BUCKET ?? ""
}

function getPublicURL(): string {
  return process.env.R2_PUBLIC_URL ?? ""
}

export async function saveFile(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const s3 = getS3()

  if (s3) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3")
    const key = `${Date.now()}-${fileName}`
    await s3.send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: buffer,
      })
    )
    const baseUrl = getPublicURL()
    if (baseUrl) return `${baseUrl}/${key}`
    return `/api/file/${key}`
  }

  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
  const uniqueName = `${Date.now()}-${fileName}`
  const filePath = path.join(UPLOADS_DIR, uniqueName)
  await fs.writeFile(filePath, buffer)
  return `/uploads/${uniqueName}`
}

export async function deleteFile(url: string): Promise<void> {
  const s3 = getS3()

  if (s3) {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3")
    const key = extractKey(url)
    if (key) {
      await s3.send(
        new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
      ).catch(() => {})
    }
    return
  }

  const relativePath = url.replace(/^\//, "")
  const filePath = path.join(process.cwd(), "public", relativePath)
  await fs.unlink(filePath).catch(() => {})
}

function extractKey(url: string): string | null {
  if (url.startsWith("/uploads/")) return url.replace("/uploads/", "")
  if (url.startsWith("/api/file/")) return url.replace("/api/file/", "")
  const parts = url.split("/")
  return parts[parts.length - 1] ?? null
}
