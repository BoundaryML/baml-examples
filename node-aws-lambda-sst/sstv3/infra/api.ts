import { bucket } from "./storage";

export const api = new sst.aws.ApiGatewayV2("Api");

// for when sstv3 supports lambda layers
// const installPackages = stack.stage === "prod" ? [] : ["@boundaryml/baml"];
// const bamlLayer =
// stack.stage === "prod"
//   ? [
//       new sst.aws.lambda.LayerVersion(stack, "BAMLLayer", {
//         code: lambda.Code.fromAsset("layers/baml-layer"),
//       }),
//     ]
//   : [];

api.route("GET /", {
  link: [bucket],
  runtime: "nodejs20.x",
  environment: {
    // OPENAI_API_KEY: process.env.OPENAI_API_KEY
  },
  nodejs: {
    install: ["@boundaryml/baml", "@boundaryml/baml-linux-x64-gnu"],
    // TBD which loader config we need (this one or the esbuild one)
    loader: {
      ".node": "file",
    },

    esbuild: {
      loader: {
        ".node": "file",
      },
      // TODO: add the lambda layer when sstv3 supports it (or upload it manually)
      // since this will be in the lambda layer, don't include it in the final bundle
      // external: ["@boundaryml/baml"],
    },
  },
  handler: "packages/functions/src/api.handler",
});