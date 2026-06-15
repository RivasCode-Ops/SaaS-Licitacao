import { config } from "dotenv"
import path from "path"
import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

config({ path: path.resolve(__dirname, "../../.env") })

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
})
