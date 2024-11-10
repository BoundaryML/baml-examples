import asyncio
import hashlib
import os
import os.path
import pickle
import re
from functools import wraps
from pathlib import Path

from shiny import reactive, render
from shiny.express import input, ui

from docs.lib import (
    LinkSuggestionWithMeta,
    ProcessFileResult,
    _link_suggestion_to_dest,
    process_file,
)
from docs.retrieve_external_sitemap import ExternalSitemap
from docs.retrieve_fern import DocsConfig

MAX_CONCURRENT_TASKS = 20

link_suggest_results: reactive.Value[dict[str, ProcessFileResult]] = reactive.value({})
# Add page title and sidebar

DOCS_PATH = "../fern"


# def infer_paths_from_git_diff(docs_path: str, all_relpaths: list[str]) -> list[str]:
#     print("No paths were specified, inferring based on 'git diff' instead")
#     modified_relpaths: list[str] = []
#     for line in (
#         subprocess.check_output(
#             ["git", "diff", "--name-status", "origin/canary"], cwd=docs_path
#         )
#         .decode("utf-8")
#         .splitlines()
#     ):
#         status, relpath = line.rstrip().split("\t", 1)
#         relpath = relpath.replace("fern-eval/", "")
#         relpath = relpath.replace("fern/", "")
#         # A = added, M = modified, R = renamed
#         if status in ("A", "M", "R") and relpath in all_relpaths:
#             modified_relpaths.append(relpath)

#     return modified_relpaths


try:
    print("Building docs sitemap from docs.yml...")
    docs_config = DocsConfig.parse_docs_config(DOCS_PATH)
    docs_sitemap_str = docs_config.build_sitemap_for_llm()

except Exception:
    print("Error occurred while parsing docs.yml")
    raise

try:
    print("Building external sitemap (checking blog, promptfiddle, etc.)...")
    external_sitemap = ExternalSitemap.load(DOCS_PATH)
except Exception:
    print("Error occurred while building external sitemap")
    raise

# relpath_list = infer_paths_from_git_diff(DOCS_PATH, docs_config.list_docs_relpaths())
relpath_list = docs_config.list_docs_relpaths()
if "pages/changelog.mdx" in relpath_list:
    relpath_list.remove("pages/changelog.mdx")

sitemap_context_str = "\n".join([docs_sitemap_str, external_sitemap.dump_as_yaml()])
allowed_link_dests = set(docs_config.list_docs_slugs() + external_sitemap.list_links())


class UiInputs:
    RESET = "reset"
    RELPATH_SELECTION = "relpath_selection"
    SUGGEST_FIXES = "suggest_fixes"
    EXPAND_DIFFS = "expand_diffs"
    DOCS_URL_PREFIX = "docs_url_prefix"

    EXPAND_ALL_FIXES = "expand_all_fixes"
    COLLAPSE_ALL_FIXES = "collapse_all_fixes"
    APPLY_SELECTED_FIXES = "apply_selected_fixes"
    SELECTED_FIX_CHECKBOXES = "selected_fix_checkboxes"

    @staticmethod
    def selected_suggestions(
        results: dict[str, ProcessFileResult],
    ) -> list[ProcessFileResult]:
        retval: list[ProcessFileResult] = []
        for i_result, (_relpath, result) in enumerate(results.items()):
            apply_selected_fixes_key = f"{UiInputs.SELECTED_FIX_CHECKBOXES}_{i_result}"
            if apply_selected_fixes_key in input:
                filtered_result = result.model_copy()
                filtered_result.llm_suggestions = [
                    filtered_result.llm_suggestions[int(j)]
                    for j in input[apply_selected_fixes_key]()
                ]
                retval.append(filtered_result)
        return retval


ui.page_opts(title="LLM-powered doc fixes", fillable=True)
ui.include_css(Path(__file__).parent / "app-styles.css")

with ui.sidebar(open="desktop", width="30em"):
    with ui.layout_columns():
        ui.input_action_button(UiInputs.SUGGEST_FIXES, "Suggest fixes")
        ui.input_action_button(UiInputs.RESET, "Reset filter")
    ui.input_select(
        UiInputs.RELPATH_SELECTION,
        "Select paths:",
        sorted(relpath_list),
        selected=[],
        multiple=True,
        size="10",
    )
    ui.h4("Preview Settings")
    ui.input_checkbox(UiInputs.EXPAND_DIFFS, "Expand diffs", value=False)
    ui.input_text(
        UiInputs.DOCS_URL_PREFIX,
        "Docs URL for link previews:",
        "https://docs.boundaryml.com",
    )
    ui.h4("Sitemap context")
    ui.markdown(f"```{sitemap_context_str}```")


with ui.panel_well():

    @render.express
    def actions():
        results = link_suggest_results()
        if not results:
            ui.p("Click 'Suggest fixes' to see link suggestions!")
            return

        selected_fix_count = 0
        for filtered_result in UiInputs.selected_suggestions(results):
            selected_fix_count += len(filtered_result.llm_suggestions)

        with ui.card():
            ui.card_header("Actions")
            with ui.card_body():
                with ui.layout_columns():
                    ui.input_action_button(
                        UiInputs.EXPAND_ALL_FIXES, "Expand all fixes"
                    )
                    ui.input_action_button(
                        UiInputs.COLLAPSE_ALL_FIXES, "Collapse all fixes"
                    )
                    ui.input_action_button(
                        UiInputs.APPLY_SELECTED_FIXES,
                        f"Apply {selected_fix_count} selected {('fix' if selected_fix_count == 1 else 'fixes')}",
                    )

    @render.express
    def table():
        results = link_suggest_results()
        if not results:
            return

        for i_result, (relpath, result) in enumerate(results.items()):
            assert isinstance(relpath, str)
            assert isinstance(result, ProcessFileResult)

            link_suggestion_checkboxes: dict[
                int, tuple[ui.HTML, LinkSuggestionWithMeta]
            ] = {}
            for j, link_suggestion_with_meta in enumerate(result.llm_suggestions):
                assert isinstance(link_suggestion_with_meta, LinkSuggestionWithMeta)
                link_suggestion = link_suggestion_with_meta.link_suggestion
                if link_suggestion_with_meta.has_been_applied:
                    continue
                link_text = f"[{link_suggestion.link_text}]"
                # re_extract_link matches
                #   - links "[Discord]" (with no trailing link),
                #   - inline links "[Discord](https://discord.gg/...)", and
                #   - labelled reference links "[Discord][discord-server]"
                re_extract_link = (
                    re.escape(link_text)
                    + f"({"|".join([r"\([^)]*\)", r"\[[^]]*\]", ""])})"
                )
                suggested_dest = _link_suggestion_to_dest(link_suggestion)

                with_suggestion_lines = result.curr_doc_lines.copy()
                existing_link = re.search(
                    re_extract_link,
                    with_suggestion_lines[link_suggestion.line_number],
                )
                if existing_link is None:
                    continue
                else:
                    existing_link = existing_link.group(0)
                    suggested_link = f"{link_text}({suggested_dest})"
                    with_suggestion_lines[link_suggestion.line_number] = re.sub(
                        pattern=re_extract_link,
                        repl=suggested_link,
                        string=with_suggestion_lines[link_suggestion.line_number],
                    )

                    markdown_str = f"On line {link_suggestion.line_number}, replace [`{existing_link}`](http://neverssl.com) with [`{link_text}({suggested_dest})`]({
                        suggested_dest if suggested_dest.startswith("http") else f"{input[UiInputs.DOCS_URL_PREFIX]()}{suggested_dest}"
                    })"
                    if link_suggestion_with_meta.ignore_reason is not None:
                        markdown_str += f"\n\nYou should ignore this suggestion: {link_suggestion_with_meta.ignore_reason}"
                    if input[UiInputs.EXPAND_DIFFS]():
                        markdown_str += f"\n```\n{result.build_diff(new_lines=with_suggestion_lines, highlight_diff=False)}\n```"
                    else:
                        markdown_str += f"\n```\n{result.build_diff(new_lines=with_suggestion_lines, highlight_diff=False, include_header=False, diff_context_lines=0)}\n```"
                    link_suggestion_checkboxes[j] = (
                        ui.markdown(markdown_str),
                        link_suggestion_with_meta,
                    )

            if not link_suggestion_checkboxes:
                continue

            with ui.card(fill=False):
                ui.card_header(relpath)
                with ui.card_body(class_="link-suggestion-checkboxes"):
                    ui.input_checkbox_group(
                        f"{UiInputs.SELECTED_FIX_CHECKBOXES}_{i_result}",
                        label="",
                        choices={
                            str(j): md
                            for j, (
                                md,
                                _link_suggestion_with_meta,
                            ) in link_suggestion_checkboxes.items()
                        },
                        selected=[
                            str(j)
                            for j, (
                                _,
                                link_suggestion_with_meta,
                            ) in link_suggestion_checkboxes.items()
                            if link_suggestion_with_meta.ignore_reason is None
                        ],
                    )


@reactive.effect
@reactive.event(input[UiInputs.RESET])
def _reset():
    ui.update_select(UiInputs.RELPATH_SELECTION, selected=[])


def disk_cache(cache_dir=".cache"):
    def decorator(func):
        @wraps(func)
        async def wrapper(relpath: str):
            os.makedirs(cache_dir, exist_ok=True)
            # Create cache key from relpath
            cache_key = hashlib.md5(relpath.encode()).hexdigest()
            cache_file = os.path.join(cache_dir, f"{cache_key}.pkl")

            # Try to load from cache
            try:
                with open(cache_file, "rb") as f:
                    return pickle.load(f)
            except (FileNotFoundError, pickle.PickleError):
                # Cache miss - compute result
                result = await func(relpath)
                # Save to cache
                with open(cache_file, "wb") as f:
                    pickle.dump(result, f)
                return result

        return wrapper

    return decorator


semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)


# @disk_cache()
async def process_file_cached(relpath: str):
    async with semaphore:
        return await process_file(
            relpath,
            [
                line.rstrip()
                for line in open(os.path.join(DOCS_PATH, relpath)).readlines()
            ],
            sitemap_context_str,
            allowed_link_dests,
        )


@reactive.effect
@reactive.event(input[UiInputs.SUGGEST_FIXES])
async def _suggest_fixes():
    relpaths = input[UiInputs.RELPATH_SELECTION]()
    ai_results = await asyncio.gather(
        *[process_file_cached(relpath) for relpath in relpaths],
    )
    link_suggest_results.set({r.relpath: r for r in ai_results})


@reactive.effect
@reactive.event(input[UiInputs.APPLY_SELECTED_FIXES])
async def _apply_selected_fixes():
    results = link_suggest_results()
    if not results:
        return

    new_results = {}
    for i_result, (relpath, result) in enumerate(results.items()):
        apply_selected_fixes_key = f"{UiInputs.SELECTED_FIX_CHECKBOXES}_{i_result}"
        if apply_selected_fixes_key in input:
            selected_link_index_list = [
                int(j) for j in input[apply_selected_fixes_key]()
            ]
        else:
            selected_link_index_list: list[int] = []

        selected_link_suggestions = [
            result.llm_suggestions[j] for j in selected_link_index_list
        ]

        new_doc_lines = result.curr_doc_lines.copy()

        for llm_suggestion in selected_link_suggestions:
            link_suggestion = llm_suggestion.link_suggestion
            link_text = f"[{link_suggestion.link_text}]"
            suggested_dest = _link_suggestion_to_dest(link_suggestion)
            suggested_link = f"{link_text}({suggested_dest})"
            # re_extract_link matches
            #   - links "[Discord]" (with no trailing link),
            #   - inline links "[Discord](https://discord.gg/...)", and
            #   - labelled reference links "[Discord][discord-server]"
            re_extract_link = re.escape(link_text) + "({})".format(
                "|".join([r"\([^)]*\)", r"\[[^]]*\]", ""])
            )

            new_doc_lines[link_suggestion.line_number] = re.sub(
                pattern=re_extract_link,
                repl=suggested_link,
                string=new_doc_lines[link_suggestion.line_number],
            )

        with open(os.path.join(DOCS_PATH, relpath), "w") as f:
            f.write("\n".join(new_doc_lines))
            print(f"Wrote {relpath}")

        for j in selected_link_index_list:
            result.llm_suggestions[j].has_been_applied = True
        new_results[relpath] = result

    link_suggest_results.set(new_results)

    for i_result, (relpath, result) in enumerate(results.items()):
        apply_selected_fixes_key = f"{UiInputs.SELECTED_FIX_CHECKBOXES}_{i_result}"
        if apply_selected_fixes_key in input:
            input[apply_selected_fixes_key]()
            ui.update_checkbox_group(apply_selected_fixes_key, selected=[])
