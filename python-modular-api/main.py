from baml_client import b
import base64
import os
from openai import AsyncOpenAI, OpenAI, AsyncStream, Stream
from openai.types.chat import ChatCompletion, ChatCompletionChunk
import typing


def add_pdf_to_body(body, pdf_path):
    # Read the PDF file and encode it as base64
    pdf_path = "./ai-conference-floor-plan.pdf"
    with open(pdf_path, "rb") as pdf_file:
        pdf_bytes = pdf_file.read()
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

    body["messages"].append(
        {
            "role": "user",
            "content": [
                {
                    "type": "file",
                    "file": {
                        "filename": os.path.basename(pdf_path),
                        "file_data": f"data:application/pdf;base64,{pdf_base64}",
                    },
                }
            ],
        }
    )
    return body


def main():
    client = OpenAI()
    req = b.request.ExtractPDF()
    body = req.body.json()
    pdf_path = "./invoice.pdf"

    # Inject the PDF into the messages array in the body
    body = add_pdf_to_body(body, pdf_path)

    response = typing.cast(ChatCompletion, client.chat.completions.create(**body))
    if response.choices[0].message.content is None:
        raise Exception("No content in response")
    parsed = b.parse.ExtractPDF(response.choices[0].message.content)

    print("Hello from python-modular-api!")
    print(parsed)


if __name__ == "__main__":
    main()
