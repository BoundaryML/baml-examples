import { b, Changes } from "@/baml_client"
import { Image } from "@boundaryml/baml";
import fs from 'fs';
import path from 'path';


async function main() {
  try {
    console.log("starting")
    const filePathDir = path.join(__dirname, '../baml_src/files/');
    const filePath = path.join(filePathDir, 'california-tax-form-empty/page1.png');
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    // console.log(base64String);

    const image = Image.fromBase64("image/png", base64String);

    // const response = await b.PDFGenerateBAMLSchema([image]);
    const stream = b.stream.PDFGenerateBAMLSchema([image]);
    for await (const response of stream) {
      console.log(response);
    }
    const response = await stream.getFinalResponse();
    console.log(response);

    const shouldMakeChanges = await b.ReviseSchema(image, response)

    if (shouldMakeChanges.summary === Changes.CHANGES_NEEDED) {
      const changeStr = shouldMakeChanges.changes.map((change, index) => `${index + 1}. ${change}`).join('\n');
      const response2 = await b.PDFMakeChange(image, response, changeStr);

      console.log(response2)
    }

  } catch (e: any) {
    console.log(e);
  }
}





console.log("running")
main()