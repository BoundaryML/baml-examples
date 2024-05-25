import CopyPlugin from "copy-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@boundaryml/baml"],
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

    // Adding new rule for .baml files
    // config.module.rules.push({
    //   test: /\.baml$/, // Match files ending with .baml
    //   use: [
    //     {
    //       loader: 'file-loader', // Using file-loader to manage .baml files
    //       options: {
    //         name: '[name].[ext]', // Naming format for the output files
    //         outputPath: 'baml_src/', // Directory where .baml files will be placed
    //       },
    //     },
    //   ],
    // });

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: "baml_src/", to: "baml_src/" },
        ],
      }),
    )

    // config.module.rules.push(
    //   {
    //     test: /\.baml$/i,
    //     loader: 'raw-loader',
     
  
    // });

    return config;
  },
};

export default nextConfig;
