export const dynamic = "force-dynamic";

import { b, traceAsync } from "../../../baml_client";
import TypeBuilder from "../../../baml_client/type_builder";
import { Role } from "../../../baml_client/types";

export async function GET(request: Request) {
  const tb = new TypeBuilder();

  tb.Person.addProperty("hair_color", tb.string());
  const roleEnum = tb.addEnum("Role");
  roleEnum.addValue("Software Engineer");
  roleEnum.addValue("Intern");

  tb.Person.addProperty("role", roleEnum.type());

  const result = await b.ExtractPerson(
    "My name is Harry. I have black hair. I love skiing. I am 25 years old.",
    { tb: tb }
  );
  console.log(JSON.stringify(result, null, 2));

  if (Object.keys(result).length != 1) {
    throw new Error("Expected 1 properties, got 2");
  }

  return Response.json(result);
}
