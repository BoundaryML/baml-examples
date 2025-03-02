import { withBaml } from '@boundaryml/baml-nextjs-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer, webpack, nextRuntime }) => {
    // You can ignore this block -- it's just to run the baml compiler on the web for the PDF demo:
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };

    return config;
  },
};

export default withBaml()(nextConfig);
