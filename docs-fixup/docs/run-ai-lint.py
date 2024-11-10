import argparse
import asyncio
import os.path
import subprocess

from tqdm.asyncio import tqdm

from docs.lib import process_file
from docs.retrieve_external_sitemap import ExternalSitemap
from docs.retrieve_fern import DocsConfig

# Path to the root of the docs directory
DOCS_PATH = "."

# Max number of concurrent LLM calls
MAX_CONCURRENT_TASKS = 10


def parse_args():
    parser = argparse.ArgumentParser(
        description="Process documentation files for link suggestions."
    )
    parser.add_argument(
        "--docs-path",
        default=".",
        help="Path to the root of the docs directory (default: current directory)",
    )
    parser.add_argument(
        "files",
        nargs="*",
        default=[],
        help="Documentation files to process (default: all docs)",
    )
    return parser.parse_args()


def infer_paths_from_git_diff(docs_path: str, all_relpaths: list[str]) -> list[str]:
    print("No paths were specified, inferring based on 'git diff' instead")
    modified_relpaths: list[str] = []
    for line in (
        subprocess.check_output(
            ["git", "diff", "--name-status", "origin/canary"], cwd=docs_path
        )
        .decode("utf-8")
        .splitlines()
    ):
        status, relpath = line.rstrip().split("\t", 1)
        relpath = relpath.replace("fern-eval/", "")
        relpath = relpath.replace("fern/", "")
        # A = added, M = modified, R = renamed
        if status in ("A", "M", "R") and relpath in all_relpaths:
            modified_relpaths.append(relpath)

    print(
        f"Will process all files linked in sitemap (found {len(modified_relpaths)} files)."
    )
    return modified_relpaths


async def main():
    args = parse_args()

    try:
        print("Building docs sitemap from docs.yml...")
        docs_config = DocsConfig.parse_docs_config(args.docs_path)
        docs_sitemap_str = docs_config.build_sitemap_for_llm()

    except Exception:
        print("Error occurred while parsing docs.yml")
        raise

    try:
        print("Building external sitemap (checking blog, promptfiddle, etc.)...")
        external_sitemap = ExternalSitemap.load(args.docs_path)
    except Exception:
        print("Error occurred while building external sitemap")
        raise

    if args.files:
        relpath_list = args.files
    else:
        relpath_list = infer_paths_from_git_diff(
            args.docs_path, docs_config.list_docs_relpaths()
        )

    sitemap_context_str = "\n".join([docs_sitemap_str, external_sitemap.dump_as_yaml()])
    allowed_link_dests = set(
        docs_config.list_docs_slugs() + external_sitemap.list_links()
    )

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)

    async def process_file_with_semaphore(relpath: str):
        async with semaphore:
            result = await process_file(
                relpath,
                [
                    line.rstrip()
                    for line in open(os.path.join(args.docs_path, relpath)).readlines()
                ],
                sitemap_context_str,
                allowed_link_dests,
            )
        result.write_new_doc(output_path=os.path.join(args.docs_path, relpath))
        return result

    results = await tqdm.gather(
        *[process_file_with_semaphore(relpath) for relpath in relpath_list],
        total=len(relpath_list),
        desc="Processing files",
        bar_format="{desc}: {percentage:3.0f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed} elapsed]",
    )
    for result in results:
        print(result.build_diff())


if __name__ == "__main__":
    asyncio.run(main())
