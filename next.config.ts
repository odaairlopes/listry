import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  devIndicators: false, poweredByHeader: false, turbopack: { root: process.cwd() },
  images: { remotePatterns: [new URL("https://images.metahub.space/poster/medium/*/img"), new URL("https://covers.openlibrary.org/b/id/*?default=false")] },
};
export default config;
