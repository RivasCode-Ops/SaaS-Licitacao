import { config } from "dotenv"
import path from "path"
import type { NextConfig } from "next"

config({ path: path.resolve(__dirname, "../../.env") })

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default nextConfig
