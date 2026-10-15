import type { NextConfig } from "next";

// GitHub Pages serves the site from /samspire-mushroom-cafe; local dev serves from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // lets phones on the same Wi-Fi load the dev server, e.g. http://192.168.x.x:3000
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
