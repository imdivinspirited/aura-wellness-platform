import re
import time
from pathlib import Path
from typing import List, Optional, Dict, Any
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
EXTERNAL_LINKS_FILE = DATA_DIR / "external_links.txt"
CACHE_TTL = 3600
_scrape_cache: Dict[str, Dict[str, Any]] = {}


def _normalize_url(url: str) -> str:
    u = url.strip()
    if not u.startswith(("http://", "https://")):
        u = "https://" + u
    return u


def _extract_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    return re.sub(r"\n{3,}", "\n\n", text)


async def scrape_url(url: str) -> Optional[Dict[str, str]]:
    global _scrape_cache
    key = _normalize_url(url)
    if key in _scrape_cache:
        entry = _scrape_cache[key]
        if time.time() - entry["_ts"] < CACHE_TTL:
            return {k: v for k, v in entry.items() if k != "_ts"}
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            r = await client.get(key)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            title = ""
            t = soup.find("title")
            if t:
                title = t.get_text(strip=True)
            desc = ""
            meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
            if meta and meta.get("content"):
                desc = meta["content"].strip()
            body = _extract_text(soup)
            content = f"{title}\n\n{desc}\n\n{body}" if desc else f"{title}\n\n{body}"
            entry = {"title": title, "description": desc, "content": content[:100000], "url": key, "_ts": time.time()}
            _scrape_cache[key] = entry
            return {"title": title, "description": desc, "content": entry["content"], "url": key}
    except Exception:
        return None


async def scrape_artofliving() -> List[Dict[str, str]]:
    base = "https://www.artofliving.org"
    paths = ["/in-en", "/yoga", "/meditation", "/in-en/courses", "/in-en/our-teacher"]
    results = []
    for p in paths:
        url = urljoin(base, p)
        data = await scrape_url(url)
        if data:
            results.append(data)
    return results


def _load_external_links() -> List[str]:
    if not EXTERNAL_LINKS_FILE.exists():
        return []
    lines = EXTERNAL_LINKS_FILE.read_text(encoding="utf-8").strip().splitlines()
    return [_normalize_url(l) for l in lines if l.strip()]


async def scrape_external_links() -> List[Dict[str, str]]:
    urls = _load_external_links()
    results = []
    for url in urls[:20]:
        data = await scrape_url(url)
        if data:
            results.append(data)
    return results


def search_scraped_content(query: str, content_list: List[Dict[str, str]]) -> List[tuple]:
    query_lower = query.lower()
    words = set(re.findall(r"\w+", query_lower))
    scored = []
    for item in content_list:
        content = (item.get("content") or "") + " " + (item.get("title") or "") + " " + (item.get("description") or "")
        content_lower = content.lower()
        matches = sum(1 for w in words if w in content_lower and len(w) > 1)
        if matches > 0:
            score = matches / max(len(words), 1) + (0.5 if query_lower in content_lower else 0)
            snippet = content[:800] + ("..." if len(content) > 800 else "")
            scored.append((snippet, score, item.get("url", "")))
    scored.sort(key=lambda x: -x[1])
    return scored[:5]
