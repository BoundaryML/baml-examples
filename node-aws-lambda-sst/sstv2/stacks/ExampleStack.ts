import { Api, StackContext } from "sst/constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export function ExampleStack({ stack }: StackContext) {
  // For local dev we want to bundle in the actual BAML dependency, as we may be running in
  // a macOS environment and don't have a compatible Lambda layer with the baml dependency.
  // The BAML lambda layer only works for Linux environments at the moment.

  // in dev, include the baml binary dependencies in node_modules
  const installPackages = stack.stage === "prod" ? [] : ["@boundaryml/baml"];

  const bamlLayer =
    stack.stage === "prod"
      ? [
          new lambda.LayerVersion(stack, "BAMLLayer", {
            code: lambda.Code.fromAsset("layers/baml-layer"),
          }),
        ]
      : [];
  // Create the HTTP API
  const api = new Api(stack, "Api", {
    routes: {
      // "GET /notes": "packages/functions/src/list.handler",
      "GET /notes/{id}": {
        function: {
          handler: "packages/functions/src/get.handler",
          environment: {
            OPENAI_API_KEY: "...",
          },
          runtime: "nodejs20.x",
          nodejs: {
            install: installPackages,
            esbuild: {
              loader: {
                ".node": "file",
              },
              // since this will be in the lambda layer, don't include it in the final bundle
              external: ["@boundaryml/baml"],
            },
          },
          layers: bamlLayer,
        },
      },
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
