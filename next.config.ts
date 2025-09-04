import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// export default withSentryConfig(nextConfig, {
//   org: "ghost-ai-solutions",
//   project: "javascript-nextjs",
//   silent: !process.env.CI,
//   widenClientFileUpload: true,
//   tunnelRoute: "/monitoring",
//   disableLogger: true,
//   automaticVercelMonitors: true
// });
export default nextConfig;