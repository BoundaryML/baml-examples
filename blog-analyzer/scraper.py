import time
import requests
from bs4 import BeautifulSoup, Tag
from urllib.parse import urljoin, urlparse
from typing import Set, Tuple, Generator
from tqdm import tqdm
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
from PIL import Image
from io import BytesIO
from selenium.webdriver.common.by import By
from collections import deque
from pathlib import Path

from files import get_content_path, get_screenshot_path
# Initialize Selenium WebDriver
options = Options()
options.add_argument('--headless')  # Run in headless mode
options.add_argument('--disable-gpu')
driver = webdriver.Chrome(options=options)


def capture_full_page_screenshot(driver: webdriver.Chrome, path: Path):
    original_size = driver.get_window_size()
    required_width = driver.execute_script('return document.body.parentNode.scrollWidth')
    required_height = driver.execute_script('return document.body.parentNode.scrollHeight')
    driver.set_window_size(required_width, required_height)
    driver.find_element(By.TAG_NAME, 'body').screenshot(str(path))
    driver.set_window_size(original_size['width'], original_size['height'])


def scrape_website(base_url: str, max_links: int = 50) -> Generator[Tuple[str, str, Image.Image], None, None]:
    visited = set()
    queue = deque([base_url])

    with tqdm(desc="Scraping pages") as progress_bar:
        while queue and len(visited) < max_links:
            current_url = queue.popleft()

            visited.add(current_url)

            content_path = get_content_path(current_url)
            screenshot_path = get_screenshot_path(current_url)

            # Only scape if content is html, not assets
            asset_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.css', '.js', '.json', '.xml', '.txt', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
            if any(current_url.endswith(ext) for ext in asset_extensions):
                continue
            
            # Check if the content for this page already exists
            if content_path.exists():
                with open(content_path, 'r', encoding='utf-8') as file:
                    page_source = file.read()
                with open(screenshot_path, 'rb') as file:
                    screenshot = Image.open(file)
                yield current_url, page_source, screenshot
            else:
                content_path.parent.mkdir(parents=True, exist_ok=True)
                screenshot_path.parent.mkdir(parents=True, exist_ok=True)
                
                try:
                    driver.get(current_url)
                    time.sleep(0.5)
                    page_source = driver.page_source
                    content_path.write_text(page_source)

                    capture_full_page_screenshot(driver, screenshot_path)

                    with open(screenshot_path, 'rb') as file:
                        screenshot = Image.open(file)
                    yield current_url, page_source, screenshot

                except requests.exceptions.RequestException as e:
                    print(f"An error occurred while processing {current_url}: {e}")
                    continue

            # Process links from the page source
            soup = BeautifulSoup(page_source, 'html.parser')
            links = soup.find_all('a')
            base_domain = urlparse(base_url).netloc

            for link in links:
                assert isinstance(link, Tag)
                href = link.get('href')
                if href:
                    assert isinstance(href, str)
                    full_url = urljoin(current_url, href)
                    parsed_full_url = urlparse(full_url)
                    sanitized_url = parsed_full_url._replace(query='', fragment='').geturl()

                    full_domain = urlparse(sanitized_url).netloc
                    if full_domain.endswith(base_domain) and sanitized_url not in visited:
                        queue.append(sanitized_url)
                        progress_bar.total = len(visited) + len(queue)
                        progress_bar.update(1)
                        progress_bar.set_description(f"Processing {sanitized_url}")