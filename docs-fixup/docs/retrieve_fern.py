import os
import re
from typing import Any, Dict, List, Optional, Union

import frontmatter
import yaml
from pydantic import BaseModel, computed_field

DOCS_PATH = "/Users/aaronvillalpando/Projects/baml/fern"


def normalize_slug(title: str) -> str:
    """Slug-ify a string according to Fern rules

    Fern slug-ification relies on lodash's _.words, which is implemented using some
    truly wild regexes.

    The regex here is a poor man's approximation of that (e.g. it doesn't strip
    diacritics), created using Claude. Consult test_docs_schema for the test cases
    used to verify that this works as intended.
    """
    title = "".join(c if c.isalnum() else " " for c in title)
    pattern = (
        r"[A-Z]{2,}(?=[A-Z][a-z]+|[0-9]|\s|$)|[A-Z]?[a-z]+|[A-Z]|[0-9]+|[^a-zA-Z0-9\s]+"
    )
    words = re.findall(pattern, title)
    return "-".join(words).lower()


class PageContent(BaseModel):
    page: str
    path: str
    slug: Optional[str] = None

    model_config = {"extra": "ignore"}

    @computed_field
    @property
    def computed_slug(self) -> str:
        if self.slug:
            return self.slug
        return normalize_slug(self.page)


class SectionContent(BaseModel):
    section: str
    slug: Optional[str] = None
    contents: List[Union["SectionContent", PageContent, "ApiContent"]]

    model_config = {"extra": "ignore"}

    @computed_field
    @property
    def computed_slug(self) -> str:
        if self.slug:
            return self.slug
        return normalize_slug(self.section)


class ApiContent(BaseModel):
    api: str

    model_config = {"extra": "ignore"}


class TabLayout(BaseModel):
    tab: str
    layout: Optional[List[Union[PageContent, SectionContent, ApiContent]]] = None


class Tab(BaseModel):
    slug: Optional[str] = None

    model_config = {"extra": "ignore"}


class TopLevelConfig(BaseModel):
    navigation: List[TabLayout]
    tabs: Dict[str, Tab]


class DocsConfig:
    _top_level_config: TopLevelConfig
    _docs_root_path: str

    def __init__(self, top_level_config: TopLevelConfig, docs_root_path: str):
        self._top_level_config = top_level_config
        self._docs_root_path = docs_root_path

    @staticmethod
    def parse_docs_config(docs_root_path: str) -> "DocsConfig":
        docs_yml_contents = open(os.path.join(docs_root_path, "docs.yml")).read()
        c = TopLevelConfig.model_validate(
            yaml.load(docs_yml_contents, Loader=yaml.CSafeLoader)
        )
        return DocsConfig(top_level_config=c, docs_root_path=docs_root_path)

    def list_docs_json(self) -> list[Any]:
        docs_json: list[Any] = []

        def process_content(
            content: Union[PageContent, SectionContent, ApiContent],
            current_path: List[str],
        ) -> Any:
            if isinstance(content, PageContent):
                f = frontmatter.load(DOCS_PATH + "/" + content.path)
                slug = f.metadata.get("slug", None)

                if slug is None:
                    # Build the full slug by joining all parts with '/'
                    slug_parts = [part for part in current_path if part]
                    slug_parts.append(content.computed_slug)

                    slug = "/".join(slug_parts)

                assert isinstance(slug, str)

                docs_json.append(
                    {
                        "slug": slug if slug.startswith("/") else f"/{slug}",
                        "path": content.path,
                        "body": open(
                            os.path.join(self._docs_root_path, content.path)
                        ).read(),
                    }
                )

            elif isinstance(content, SectionContent):
                # Use computed_slug instead of slug
                next_path = current_path + [content.computed_slug]
                for subcontent in content.contents:
                    process_content(subcontent, next_path)

        for tab_layout in self._top_level_config.navigation:
            if not tab_layout.layout:
                continue
            tab = self._top_level_config.tabs.get(tab_layout.tab, Tab())
            for content in tab_layout.layout:
                process_content(content, [tab.slug] if tab.slug else [])

        return docs_json

    def list_docs_relpaths(self) -> list[str]:
        """List the relative filepaths of all pages listed in docs.yml

        This is _not_ the actual URL that a given page is served at.
        """
        paths: list[str] = []

        def process_content(
            content: Union[PageContent, SectionContent, ApiContent],
        ):
            if isinstance(content, PageContent):
                paths.append(content.path)
            elif isinstance(content, SectionContent):
                for subcontent in content.contents:
                    process_content(subcontent)

        for tab_layout in self._top_level_config.navigation:
            if not tab_layout.layout:
                continue
            for content in tab_layout.layout:
                process_content(content)

        return paths

    def list_docs_slugs(self) -> list[str]:
        slugs: list[str] = []

        def process_content(
            content: Union[PageContent, SectionContent, ApiContent],
            current_path: List[str],
        ) -> Any:
            if isinstance(content, PageContent):
                f = frontmatter.load(DOCS_PATH + "/" + content.path)
                slug = f.metadata.get("slug", None)

                if slug is None:
                    # Build the full slug by joining all parts with '/'
                    slug_parts = [part for part in current_path if part]
                    slug_parts.append(content.computed_slug)

                    slug = "/".join(slug_parts)

                assert isinstance(slug, str)

                slugs.append(slug if slug.startswith("/") else f"/{slug}")

            elif isinstance(content, SectionContent):
                # Use computed_slug instead of slug
                next_path = current_path + [content.computed_slug]
                for subcontent in content.contents:
                    process_content(subcontent, next_path)

        for tab_layout in self._top_level_config.navigation:
            if not tab_layout.layout:
                continue
            tab = self._top_level_config.tabs.get(tab_layout.tab, Tab())
            for content in tab_layout.layout:
                process_content(content, [tab.slug] if tab.slug else [])

        return slugs

    def build_sitemap_for_llm(self) -> str:
        """Builds a mapping of page paths to their full slugs based on docs.yml

        Format is meant to mirror docs.yml itself, but with 'url' fields instead
        of 'slug' fields.
        """

        def process_content(
            content: Union[PageContent, SectionContent, ApiContent],
            current_path: List[str],
        ) -> Any:
            if isinstance(content, PageContent):
                f = frontmatter.load(DOCS_PATH + "/" + content.path)
                slug = f.metadata.get("slug", None)

                if slug is None:
                    # Build the full slug by joining all parts with '/'
                    slug_parts = [part for part in current_path if part]
                    slug_parts.append(content.computed_slug)

                    slug = "/".join(slug_parts)

                assert isinstance(slug, str)

                return {
                    "page": content.page,
                    "url": slug if slug.startswith("/") else f"/{slug}",
                }

            elif isinstance(content, SectionContent):
                # Use computed_slug instead of slug
                next_path = current_path + [content.computed_slug]
                for subcontent in content.contents:
                    process_content(subcontent, next_path)

                return {
                    "section": content.section,
                    "contents": [
                        process_content(subcontent, next_path)
                        for subcontent in content.contents
                    ],
                }

        output: list[Any] = []
        # Process each tab's layout
        for tab_layout in self._top_level_config.navigation:
            if not tab_layout.layout:
                continue

            # Get tab slug from tabs config
            tab = self._top_level_config.tabs.get(tab_layout.tab, Tab())

            # Process each content item in the tab's layout
            output.append(
                {
                    "tab": tab_layout.tab,
                    "layout": [
                        process_content(content, [tab.slug] if tab.slug else [])
                        for content in tab_layout.layout
                    ],
                }
            )

        return yaml.safe_dump({"docs.boundaryml.com": output})


# Required for forward references
SectionContent.model_rebuild()
