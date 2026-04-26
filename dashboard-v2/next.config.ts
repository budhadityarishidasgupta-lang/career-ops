import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exec API spawns node scripts at runtime; keep their dependencies/assets available.
  serverExternalPackages: [
    "js-yaml",
    "yaml",
    "postgres",
    "playwright",
    "@huggingface/inference",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./scripts/**/*",
      "./templates/**/*",
      "./portals/**/*",
      "../templates/**/*",
      "../portals/**/*",
      "./config/**/*",
      "./data/**/*",
      "./fonts/**/*",
      "./node_modules/.pnpm/js-yaml@*/node_modules/js-yaml/**/*",
      "./node_modules/.pnpm/yaml@*/node_modules/yaml/**/*",
      "./node_modules/.pnpm/postgres@*/node_modules/postgres/**/*",
      "./node_modules/.pnpm/dotenv@*/node_modules/dotenv/**/*",
      "./node_modules/.pnpm/@huggingface+inference@*/node_modules/@huggingface/inference/**/*",
      "./node_modules/.pnpm/playwright@*/node_modules/playwright/**/*",
    ],
  },
};

export default nextConfig;
