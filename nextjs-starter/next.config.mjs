/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@boundaryml/baml-core"],
  },
  webpack: (config, { dev, isServer, webpack, nextRuntime }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: "nextjs-node-loader",
          options: {
            outputPath: config.output.path,
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
