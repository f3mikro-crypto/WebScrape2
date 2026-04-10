from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
import re
import os

app = Flask(__name__)
CORS(app, origins="*")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# Common price patterns across currencies
PRICE_PATTERNS = [
    r'[\$\£\€\¥\₹\₩]\s?\d[\d,]*\.?\d*',
    r'\d[\d,]*\.?\d*\s?[\$\£\€\¥\₹]',
    r'\d[\d,]*\.?\d*\s?(USD|GBP|EUR|JPY|INR|CAD|AUD)',
]
COMBINED_PRICE_RE = re.compile('|'.join(PRICE_PATTERNS), re.IGNORECASE)

# Size/dimension patterns
SIZE_PATTERNS = [
    r'\d+\s?(cm|mm|m|km|in|inch|inches|ft|feet)\b',
    r'\d+\s?x\s?\d+(\s?x\s?\d+)?\s?(cm|mm|m|in|inches|ft)?',
    r'\d+(\.\d+)?\s?(kg|g|lbs?|oz|pounds?|grams?|kilograms?)\b',
    r'\b(XS|S|M|L|XL|XXL|XXXL|Small|Medium|Large|Extra\s+Large)\b',
    r'\d+\s?(ml|cl|l|litre|liter|fl\.?\s?oz)\b',
    r'\b\d{1,3}"\s*(x\s*\d{1,3}")?',
]
COMBINED_SIZE_RE = re.compile('|'.join(SIZE_PATTERNS), re.IGNORECASE)

def extract_text(tag):
    return tag.get_text(strip=True) if tag else ""

def resolve_url(src, base_url):
    if not src:
        return ""
    if src.startswith("http"):
        return src
    if src.startswith("//"):
        return "https:" + src
    if src.startswith("/"):
        base = re.match(r"(https?://[^/]+)", base_url)
        return base.group(1) + src if base else src
    base_dir = base_url.rsplit("/", 1)[0]
    return base_dir + "/" + src

@app.route("/")
def home():
    return jsonify({"status": "WebScraper backend is running ✅"})

@app.route("/scrape", methods=["POST"])
def scrape():
    data = request.json
    url = data.get("url", "").strip()
    fields = data.get("fields", [])

    if not url:
        return jsonify({"error": "No URL provided"}), 400
    if not url.startswith("http"):
        url = "https://" + url

    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        resp.raise_for_status()
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. The website took too long to respond."}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to that website. Check the URL and try again."}), 502
    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Website returned an error: {e.response.status_code}"}), 502
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    results = []

    # ── Headings ──────────────────────────────────────────────
    if "headings" in fields:
        for h in soup.find_all(["h1", "h2", "h3"]):
            text = extract_text(h)
            if text:
                results.append({"type": "Heading", "tag": h.name.upper(), "content": text, "extra": "", "preview": ""})

    # ── Paragraphs ────────────────────────────────────────────
    if "paragraphs" in fields:
        for p in soup.find_all("p"):
            text = extract_text(p)
            if len(text) > 20:
                results.append({"type": "Paragraph", "tag": "P",
                                 "content": text[:200] + ("..." if len(text) > 200 else ""), "extra": "", "preview": ""})

    # ── Links ─────────────────────────────────────────────────
    if "links" in fields:
        seen = set()
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith("http") and href not in seen:
                seen.add(href)
                results.append({"type": "Link", "tag": "A", "content": extract_text(a) or href, "extra": href, "preview": ""})

    # ── Images (enhanced with preview) ────────────────────────
    if "images" in fields:
        seen_imgs = set()
        for img in soup.find_all("img"):
            src = (img.get("src") or img.get("data-src") or
                   img.get("data-lazy-src") or img.get("data-original") or "").strip()
            if not src and img.get("srcset"):
                src = img["srcset"].split(",")[0].strip().split(" ")[0]
            if not src or src in seen_imgs:
                continue
            seen_imgs.add(src)

            abs_src   = resolve_url(src, url)
            alt       = img.get("alt", "").strip()
            width     = img.get("width", "")
            height    = img.get("height", "")
            dimensions = f"{width}x{height}px" if width and height else ""

            results.append({
                "type": "Image",
                "tag": "IMG",
                "content": alt or "(no alt text)",
                "extra": abs_src,
                "dimensions": dimensions,
                "preview": abs_src   # used by frontend to show thumbnail
            })

    # ── Prices (NEW) ──────────────────────────────────────────
    if "prices" in fields:
        seen_prices = set()
        price_selectors = [
            "[class*='price']", "[class*='Price']", "[class*='cost']",
            "[class*='amount']", "[class*='sale']", "[id*='price']",
            "span.price", "p.price", ".product-price",
            ".woocommerce-Price-amount", "[data-price]", "[itemprop='price']"
        ]
        for selector in price_selectors:
            try:
                for el in soup.select(selector):
                    text = extract_text(el)
                    if text and text not in seen_prices and len(text) < 50:
                        if COMBINED_PRICE_RE.search(text):
                            seen_prices.add(text)
                            parent = el.find_parent(["li","div","article","section"])
                            product_name = ""
                            if parent:
                                name_el = parent.find(["h2","h3","h4","a","span"],
                                                      class_=re.compile(r'name|title|product', re.I))
                                if name_el:
                                    product_name = extract_text(name_el)[:80]
                            results.append({"type": "Price", "tag": "£$€", "content": text,
                                            "extra": product_name, "preview": ""})
            except Exception:
                continue

        # Fallback regex scan
        if not seen_prices:
            full_text = soup.get_text(separator=" ")
            for match in COMBINED_PRICE_RE.finditer(full_text):
                price_str = match.group(0).strip()
                if price_str and price_str not in seen_prices:
                    seen_prices.add(price_str)
                    results.append({"type": "Price", "tag": "£$€", "content": price_str,
                                    "extra": "", "preview": ""})

    # ── Sizes (NEW) ───────────────────────────────────────────
    if "sizes" in fields:
        seen_sizes = set()
        size_selectors = [
            "[class*='size']", "[class*='Size']", "[class*='variant']",
            "[class*='dimension']", "[class*='weight']", "[class*='spec']",
            "[data-size]", "[itemprop='size']", "select option",
            ".swatch", ".size-option", "[class*='option']"
        ]
        for selector in size_selectors:
            try:
                for el in soup.select(selector):
                    text = extract_text(el)
                    if text and text not in seen_sizes and len(text) < 60:
                        if COMBINED_SIZE_RE.search(text):
                            seen_sizes.add(text)
                            results.append({"type": "Size", "tag": "SIZE", "content": text,
                                            "extra": el.name, "preview": ""})
            except Exception:
                continue

        # Fallback text scan
        if not seen_sizes:
            for el in soup.find_all(string=COMBINED_SIZE_RE):
                text = el.strip()
                if text and text not in seen_sizes and len(text) < 100:
                    seen_sizes.add(text)
                    results.append({"type": "Size", "tag": "SIZE", "content": text[:100],
                                    "extra": "", "preview": ""})

    # ── Tables ────────────────────────────────────────────────
    if "tables" in fields:
        for table in soup.find_all("table"):
            for row in table.find_all("tr")[:10]:
                cells = [extract_text(c) for c in row.find_all(["td","th"]) if extract_text(c)]
                if cells:
                    results.append({"type": "Table row", "tag": "TR", "content": " | ".join(cells),
                                    "extra": "", "preview": ""})

    # ── Emails ────────────────────────────────────────────────
    if "emails" in fields:
        text_body = soup.get_text()
        emails = list(set(re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text_body)))
        for email in emails:
            results.append({"type": "Email", "tag": "@", "content": email, "extra": "", "preview": ""})

    # ── Meta ──────────────────────────────────────────────────
    if "meta" in fields:
        for m in soup.find_all("meta"):
            name = m.get("name") or m.get("property") or ""
            content = m.get("content", "")
            if name and content:
                results.append({"type": "Meta", "tag": "META", "content": content[:200],
                                "extra": name, "preview": ""})

    page_title = extract_text(soup.find("title")) if soup.find("title") else url

    return jsonify({
        "url": url,
        "title": page_title,
        "count": len(results),
        "results": results
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n✅  WebScraper backend running at http://localhost:{port}\n")
    app.run(debug=False, host="0.0.0.0", port=port)
