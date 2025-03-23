
import asyncio
import json
import os
from pathlib import Path

from docs.retrieve_external_sitemap import ExternalSitemap
from docs.retrieve_fern import DocsConfig

DOCS_PATH = "/Users/aaronvillalpando/Projects/baml/fern"

async def main():
    print("Building docs sitemap from docs.yml...")
    docs_config = DocsConfig.parse_docs_config(DOCS_PATH)
    docs_sitemap_str = docs_config.build_sitemap_for_llm()

    json_docs = docs_config.list_docs_json()
    with open("docs.json", "w") as f:
        json.dump(json_docs, f, indent=2)

if __name__ == "__main__":
    asyncio.run(main())
