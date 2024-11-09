import { Resource } from "sst";
import { Handler } from "aws-lambda";
import { Example } from "@monorepo-template/core/example";

import { b } from "../baml_client"

export const handler: Handler = async (_event) => {

  const resume = await b.ExtractResume("hithere")
  return {
    statusCode: 200,
    body: `${Example.hello()}. yes it works.... ${JSON.stringify(resume)}`,
  };
};
