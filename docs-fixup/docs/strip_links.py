import os
import re

from docs.retrieve_fern import DocsConfig

DOCS_PATH = "../fern"


def main():
    docs_config = DocsConfig.parse_docs_config(DOCS_PATH)

    all_relpaths = docs_config.list_docs_relpaths()
    all_relpaths.remove("pages/changelog.mdx")

    for relpath in all_relpaths:
        with open(os.path.join(DOCS_PATH, relpath)) as f:
            curr_doc_lines = f.readlines()

        no_links_doc_lines: list[str] = []

        for line in curr_doc_lines:
            line = line.rstrip()

            if re.match(r"^\[([^\]]+)\]:\s+(\S+)", line):
                # discard labeled reference links
                continue

            # strip inline links
            line, _ = re.subn(r"\[([^]]+)\]\([^)]+\)", r"[\1]", line)
            # strip reference links with labels
            line, _ = re.subn(r"\[([^]]+)\]\[[^]]+\]", r"[\1]", line)

            no_links_doc_lines.append(line)

        # print("\n".join(curr_doc_lines))
        # print("\n".join(no_links_doc_lines))
        with open(os.path.join(DOCS_PATH, relpath), "w") as f:
            f.write("\n".join(no_links_doc_lines))
            f.truncate()


if __name__ == "__main__":
    main()
