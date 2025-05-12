import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "out",
  ...(process.env.NODE_ENV === "development" ? {

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
  } : {}),
  trailingSlash: true,
};

export default nextConfig;
