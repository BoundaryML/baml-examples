/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@boundaryml/baml"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
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

// A polyfill for using pdfjs, ignore if you're not doing any PDF stuff
// (pdfjs relies on nodejs 22.0.0, so we need to define the node22 "Promise.withResolvers" function)
if (typeof Promise.withResolvers === "undefined") {
  if (typeof window !== "undefined") {
    window.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  } else {
    global.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

export default nextConfig;
