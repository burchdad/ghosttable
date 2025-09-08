import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },        // skip ESLint on Vercel builds
  typescript: { ignoreBuildErrors: true },     // skip TS errors on Vercel builds
};

export default withSentryConfig(nextConfig, {
  org: "ghost-ai-solutions",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true
});