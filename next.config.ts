import type { NextConfig } from "next";

// GitHub Pages serves the site from /samspire-mushroom-cafe; local dev serves from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
