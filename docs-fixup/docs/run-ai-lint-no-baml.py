import asyncio
import difflib
import os
from anthropic import AsyncAnthropic
from pydantic import RootModel, BaseModel
from pygments import highlight
from pygments.lexers import DiffLexer
from pygments.formatters import TerminalFormatter

DOCS_PATH = "/Users/sam/baml2/fern-eval"


class LinkSuggestion(BaseModel):
    link_text: str
    dest: str
    line_number: int
    link_id: str


class LinkSuggestions(RootModel[list[LinkSuggestion]]):
    root: list[LinkSuggestion]


async def main():
    relpath = "01-guide/02-languages/python.mdx"
    doc_path = DOCS_PATH + "/" + relpath
    links = await get_links(
        doc_path,
        open(DOCS_PATH + "/docs.yml").read(),
    )

    print(links)
    print()

    orig_doc_lines = [line.rstrip("\n") for line in open(doc_path).readlines()]
    doc_lines = orig_doc_lines.copy()
    for link in links.root:
        print(f"[{link.link_text}] (on line {link.line_number}) -> {link.dest}")
        for i in range(
            max(link.line_number - 3, 0), min(link.line_number + 3, len(doc_lines))
        ):
            print(f"{i:3}: {doc_lines[i][:-1]}")
            doc_lines[i] = doc_lines[i].replace(
                f"[{link.link_text}]", f"[{link.link_text}][{link.link_id}]"
            )

    for link in sorted(links.root, key=lambda x: x.line_number, reverse=True):
        link_expr = f"[{link.link_id}]: {link.dest}"

        if link.line_number + 1 >= len(doc_lines):
            doc_lines.append(link_expr)
        else:
            doc_lines.insert(link.line_number + 1, link_expr)

    print("*" * 80)
    print("ORIGINAL DOC")
    print(("\n".join(orig_doc_lines)))
    print("*" * 80)
    print("WITH LINKS")
    print("\n".join(doc_lines))
    print("*" * 80)
    diff = difflib.unified_diff(
        [f"{line}\n" for line in orig_doc_lines],
        [f"{line}\n" for line in doc_lines],
        fromfile=f"a/{relpath}",
        tofile=f"b/{relpath}",
    )
    print(highlight("".join(diff), DiffLexer(), TerminalFormatter()))
    # open(doc_path, "w").write("\n".join(doc_lines))
    newdoc = "\n".join(doc_lines)


async def get_links(file_path: str, sitemap_str: str) -> LinkSuggestions:


async def get_links2(file_path: str, sitemap_str: str) -> LinkSuggestions:
    text = """Based on the file content and sitemap, here are the suggested link destinations:

```json
[
  {
    "link_text": "What is baml_client",
    "dest": "/guide/what-is-baml_client",
    "line_number": 41
  },
  {
    "link_text": "VSCode extension",
    "dest": "/guide/01-editors/vscode",
    "line_number": 55
  },
  {
    "link_text": "Deployment Guides",
    "dest": "/guide/03-development/deploying",
    "line_number": 198
  },
  {
    "link_text": "Interactive Examples",
    "dest": "/examples/interactive-examples",
    "line_number": 199
  }
]
```

The suggested destinations are based on:
- Matching the link text to page titles in the sitemap
- Using relative paths that align with the sitemap's navigation structure
- Choosing the most relevant page for each link"""
    text = None
    if text:
        return extract_json_block(text)

    client = AsyncAnthropic(
        # This is the default and can be omitted
        api_key=os.environ.get("ANTHROPIC_API_KEY"),
    )
    messages = [
        {
            "role": "user",
            "content": f"""
Suggest link destinations in the shown format, for the following file based on the attached sitemap:

<format>
[{{
  link_text: str
  dest: str
  line_number: int
  link_id: str  // try to only use a-z, 0-9, -, _ for link IDs
}}]
</format>

<file path="{DOCS_PATH}/01-guide/02-languages/python.mdx">
{
  "\n".join(
    f"{i:3} | {line[:-1]}"
    for i, line in enumerate(
      open(DOCS_PATH + "/01-guide/02-languages/python.mdx").readlines()
    )
  )
}
</file path="{DOCS_PATH}/01-guide/02-languages/python.mdx">

<sitemap>
{sitemap_str}
</sitemap>
                """,
        }
    ]
    print(f"message content ===\n{messages[0]['content']}")
    message = await client.messages.create(
        max_tokens=1024,
        messages=messages,
        # model="claude-3-5-sonnet-latest",
        model="claude-3-5-haiku-20241022",
    )

    text = ""
    for content in message.content:
        if content.type == "text":
            text += content.text
        else:
            raise ValueError(f"Unknown content type: {content.type}")

    return extract_json_block(text)


def extract_json_block(llm_response: str) -> LinkSuggestions:
    print(f"[llm_response]\n{llm_response}\n[/llm_response]")
    start = llm_response.find("```json")
    end = llm_response.find("```", start + 1)
    json_str = llm_response[start + len("```json") : end]
    retval = LinkSuggestions.model_validate_json(json_str)
    print()
    return retval


if __name__ == "__main__":
    asyncio.run(main())
