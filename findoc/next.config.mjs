// pdfjs relies on nodejs 22.0.0, so we need to polyfill the withResolvers function
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
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@boundaryml/baml"],
    // outputFileTracingIncludes: {
    //   "/": [
    //     "./node_modules/pdf-img-convert/node_modules/pdfjs-dist/legacy/build/pdf.worker.js",
    //     "./node_modules/pdf-img-convert/node_modules/pdfjs-dist/legacy/build/pdf.js",
    //   ],
    // },
    serverActions: {
      bodySizeLimit: "5mb",
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
    config.resolve.alias.canvas = false;

    return config;
  },
  // fix parsing issue with pdfjs
  // swcMinify: false,
};

export default nextConfig;
