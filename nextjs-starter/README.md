This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

We also added BAML to it!

## Getting Started

1. Run `npm install`
2. ctrl + S a .baml file to generate the `baml_client` directory. We don't include it in this repository.
3. run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Then hit the endpoint (app/api/example_baml/route.ts) that uses a BAML function:

```
curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/example_baml
```

You will see `["CancelOrder"]` returned

## General setup for NextJS + BAML

This is already done in this repo, but you can do the same in your own repository.

1. Change nextConfig to enable the experimental feature: `serverComponentsExternalPackages: ["@boundaryml/baml-core"]`
2. For testing locally you'll also need to modify the webpack config:

```
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
```

Basically, @boundaryml/baml-core package uses a native Rust module that needs to be imported correctly. The config change tells NextJS how to load it properly.

### Limitations

We do not support `edge` runtime just yet. Let us know if you need BAML to work in the `edge` runtime.
