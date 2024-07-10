import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { b } from "../baml_client";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const res = await b.ExtractResume(
      "Mark gonzalez, mark@hello.com. python. 5 years."
    );
    console.log(res);
  } catch (e) {
    console.log(e);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from get!" }),
  };
};
