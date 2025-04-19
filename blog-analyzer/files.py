from pathlib import Path
from urllib.parse import urlparse
DATA_DIR = Path("data")

def get_page_dir(url: str) -> Path:
    base_url = urlparse(url).netloc
    path = urlparse(url).path
    page_dir = DATA_DIR / base_url.replace("/", "_") / path.replace("/", "_")
    page_dir.mkdir(parents=True, exist_ok=True)
    return page_dir

def get_content_path(url: str) -> Path:
    return get_page_dir(url) / "content.txt"

def get_screenshot_path(url: str) -> Path:
    return get_page_dir(url) / "full_screenshot.png"

def get_analysis_path(url: str) -> Path:
    return get_page_dir(url) / "analysis.json"
