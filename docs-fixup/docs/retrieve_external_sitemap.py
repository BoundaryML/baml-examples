import requests
import yaml
from bs4 import BeautifulSoup
from pydantic import BaseModel


class BlogEntry(BaseModel):
    path: str
    title: str
    summary: str


def _fetch_blog_entry_list() -> list[BlogEntry]:
    """Fetches all blog post paths, titles, and summaries from boundaryml.com/blog"""
    try:
        response = requests.get("https://boundaryml.com/blog")
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        blog_entry_by_path: dict[str, BlogEntry] = {}

        # Find all blog post articles
        for article in soup.find_all("article"):
            # Find the link and title within h3
            h3 = article.find("h3")
            if not h3:
                continue

            link = h3.find("a", href=True)
            if not link:
                continue
            path = link["href"]
            if path.startswith("https://boundaryml.com"):
                path = path.replace("https://boundaryml.com", "")
            if not path.startswith("/blog/"):
                continue
            path = f"https://boundaryml.com{path}"

            # Extract path, title, and summary
            title = link.text.strip()

            # Find summary paragraph
            summary = ""
            summary_p = article.find("p", class_="line-clamp-3")
            if summary_p:
                summary = summary_p.text.strip()

            blog_entry_by_path[path] = BlogEntry(
                path=path,
                title=title,
                summary=summary,
            )

        return list(blog_entry_by_path.values())
    except Exception as e:
        print(f"Error fetching blog links: {e}")
        raise


class ExternalSitemap:
    _blog_entry_list: list[BlogEntry]

    OTHER_WEBSITES = [
        {
            "page": "Prompt Fiddle, the BAML playground",
            "url": "https://promptfiddle.com",
        }
    ]

    def __init__(
        self, blog_entry_list: list[BlogEntry], other_websites: list[dict[str, str]]
    ):
        self._blog_entry_list = blog_entry_list
        self._other_websites = other_websites

    def dump_as_yaml(self) -> str:
        return yaml.safe_dump(
            {
                "boundaryml.com/blog": [e.model_dump() for e in self._blog_entry_list],
                "other-websites": self._other_websites,
            }
        )

    @staticmethod
    def load(docs_root_path: str) -> "ExternalSitemap":
        return ExternalSitemap(
            blog_entry_list=_fetch_blog_entry_list(),
            other_websites=ExternalSitemap.OTHER_WEBSITES,
        )

    def list_links(self) -> list[str]:
        return [e.path for e in self._blog_entry_list] + [
            e["url"] for e in ExternalSitemap.OTHER_WEBSITES
        ]
