import difflib
from typing import Optional

import requests
from pydantic import BaseModel
from pygments import highlight
from pygments.formatters import TerminalFormatter
from pygments.lexers import DiffLexer

from docs.baml_client import b
from docs.baml_client.types import LinkSuggestion, LocalLinkDest, OtherLinkDest


def _link_suggestion_to_dest(link: LinkSuggestion) -> str:
    if isinstance(link.suggested_link, LocalLinkDest):
        return link.suggested_link.path
    elif isinstance(link.suggested_link, OtherLinkDest):
        return link.suggested_link.url
    else:
        raise ValueError(
            f"No handling for this format of suggested_link: {link.suggested_link}"
        )


class LinkSuggestionWithMeta(BaseModel):
    link_suggestion: LinkSuggestion
    ignore_reason: Optional[str]
    has_been_applied: bool


class ProcessFileResult(BaseModel):
    llm_suggestions: list[LinkSuggestionWithMeta]
    relpath: str
    curr_doc_lines: list[str]
    new_doc_lines: list[str]

    def build_diff(
        self,
        *,
        old_lines: Optional[list[str]] = None,
        new_lines: Optional[list[str]] = None,
        diff_context_lines: int = 3,
        highlight_diff: bool = True,
        include_header: bool = True,
    ) -> str:
        if old_lines is None:
            old_lines = self.curr_doc_lines
        if new_lines is None:
            new_lines = self.new_doc_lines

        diff = list(
            difflib.unified_diff(
                [f"{line}\n" for line in old_lines],
                [f"{line}\n" for line in new_lines],
                fromfile=f"a/{self.relpath}",
                tofile=f"b/{self.relpath}",
                n=diff_context_lines,
            )
        )
        if not include_header and len(diff) > 0:
            diff = diff[3:]
        if highlight_diff:
            return str(
                highlight("".join(diff), DiffLexer(), TerminalFormatter())
            ).strip()
        else:
            return "".join(diff).strip()

    def write_new_doc(self, *, output_path: str):
        open(output_path, "w").write("\n".join(self.new_doc_lines))


async def process_file(
    relpath: str,
    doc_content_lines: list[str],
    sitemap_context_str: str,
    allowed_link_dests: set[str],
) -> ProcessFileResult:
    links = await b.MakeLinkSuggestions(
        filepath_str=relpath,
        # File contents need to be prefixed with line numbers, so that the LLM
        # can return line numbers in the suggestions.
        file_contents="\n".join(
            f"{i:3} | {line}" for i, line in enumerate(doc_content_lines)
        ),
        sitemap_str=sitemap_context_str,
    )

    orig_doc_lines = doc_content_lines.copy()
    doc_lines = orig_doc_lines.copy()
    llm_suggestions: list[LinkSuggestionWithMeta] = []
    for link in links:
        if link.current_dest is not None:
            llm_suggestions.append(
                LinkSuggestionWithMeta(
                    link_suggestion=link,
                    ignore_reason="this link appears to point somewhere already",
                    has_been_applied=False,
                )
            )
            continue

        link_dest = _link_suggestion_to_dest(link)
        if link_dest not in allowed_link_dests:
            if link_dest.startswith("https://"):
                try:
                    resp = requests.get(link_dest)
                except Exception:
                    resp = None
                    llm_suggestions.append(
                        LinkSuggestionWithMeta(
                            link_suggestion=link,
                            ignore_reason=f"link appears to be invalid (DNS resolution failed)",
                            has_been_applied=False,
                        )
                    )
                    continue
                if resp.status_code == 200:
                    pass
                else:
                    llm_suggestions.append(
                        LinkSuggestionWithMeta(
                            link_suggestion=link,
                            ignore_reason=f"link appears to be invalid (returns HTTP {resp.status_code})",
                            has_been_applied=False,
                        )
                    )
                    continue
            else:
                llm_suggestions.append(
                    LinkSuggestionWithMeta(
                        link_suggestion=link,
                        ignore_reason="link does not appear in the sitemap",
                        has_been_applied=False,
                    )
                )
                continue

        i_line = link.line_number
        link_text = f"[{link.link_text}]"
        j_link_text = doc_lines[i_line].find(link_text)

        if j_link_text == -1:
            llm_suggestions.append(
                LinkSuggestionWithMeta(
                    link_suggestion=link,
                    ignore_reason="this suggestion does not point to anything",
                    has_been_applied=False,
                )
            )
            continue

        def link_already_exists():
            j_after_link = j_link_text + len(link_text)
            if j_after_link >= len(doc_lines[i_line]):
                return False
            if doc_lines[i_line][j_after_link] == "(":
                # inline link
                return True
            if doc_lines[i_line][j_after_link] == "[":
                # reference link with label
                return True
            if any(line.startswith(link_text + ": ") for line in doc_lines):
                # reference link with no label
                return True
            return False

        if link_already_exists():
            llm_suggestions.append(
                LinkSuggestionWithMeta(
                    link_suggestion=link,
                    ignore_reason="this link already points somewhere",
                    has_been_applied=False,
                )
            )
            continue

        doc_lines[i_line] = doc_lines[i_line].replace(
            link_text, f"{link_text}({link_dest})"
        )
        llm_suggestions.append(
            LinkSuggestionWithMeta(
                link_suggestion=link,
                ignore_reason=None,
                has_been_applied=False,
            )
        )

    return ProcessFileResult(
        llm_suggestions=llm_suggestions,
        relpath=relpath,
        curr_doc_lines=orig_doc_lines,
        new_doc_lines=doc_lines,
    )
