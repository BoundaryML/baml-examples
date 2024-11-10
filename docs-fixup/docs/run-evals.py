import asyncio
import json
import random
import re

from pygments import highlight
from pygments.formatters import TerminalFormatter
from pygments.lexers import DiffLexer

from docs.lib import process_file
from docs.retrieve_external_sitemap import ExternalSitemap
from docs.retrieve_fern import DocsConfig

DOCS_PATH = "/Users/sam/baml2/fern"

# Number of docs to run evals on
EVAL_COUNT = 10

# Number of concurrent LLM calls allowed during evals
MAX_CONCURRENT_TASKS = 10

random.seed(123123)


async def main():
    docs_config = DocsConfig.parse_docs_config(DOCS_PATH)
    external_sitemap = ExternalSitemap.load(DOCS_PATH)
    allowed_link_dests = set(
        docs_config.list_docs_slugs() + external_sitemap.list_links()
    )
    sitemap_context_str = "\n".join(
        [docs_config.build_sitemap_for_llm(), external_sitemap.dump_as_yaml()]
    )

    all_relpaths = docs_config.list_docs_relpaths()
    all_relpaths.remove("pages/changelog.mdx")
    selected_paths = random.sample(all_relpaths, min(EVAL_COUNT, len(all_relpaths)))
    selected_paths = [
        # "01-guide/04-baml-basics/switching-llms.mdx",
        # "01-guide/06-prompt-engineering/tools.mdx",
        # "03-reference/baml/prompt-syntax/output-format.mdx",
        # "03-reference/baml/clients/providers/ollama.mdx",
        "01-guide/02-languages/rest.mdx",
    ]
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)

    async def run_eval(relpath: str, *, strip_links: bool):
        async with semaphore:
            curr_doc_lines = [
                line.rstrip() for line in open(DOCS_PATH + "/" + relpath).readlines()
            ]
            if strip_links:
                eval_doc_lines = [
                    re.sub(r"\[([^\]]+)\]\([^)]+\)", r"[\1]", line)
                    for line in curr_doc_lines
                ]
            else:
                eval_doc_lines = curr_doc_lines.copy()
            process_file_result = await process_file(
                relpath,
                eval_doc_lines,
                sitemap_context_str,
                allowed_link_dests,
            )

            diff = process_file_result.build_diff(old_lines=curr_doc_lines)

            eval_outcome = ""
            eval_outcome += "=" * 100 + "\n"
            if strip_links:
                eval_outcome += relpath + " (stripped links)\n"
            else:
                eval_outcome += relpath + " (original links)\n"
            eval_outcome += "-" * 100 + "\n"
            if diff:
                eval_outcome += diff
            else:
                eval_outcome += "<failed to apply LLM-suggested links>"

            eval_outcome += "\n"
            eval_outcome += json.dumps(
                [s.model_dump() for s in process_file_result.llm_suggestions],
                indent=2,
            )
            print(eval_outcome)

    await asyncio.gather(
        *[run_eval(relpath, strip_links=True) for relpath in selected_paths],
        *[run_eval(relpath, strip_links=False) for relpath in selected_paths],
    )


if __name__ == "__main__":
    asyncio.run(main())
