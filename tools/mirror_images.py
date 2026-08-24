#!/usr/bin/env python3
"""
Mirror the site's imagery locally at usable resolution.

Why this exists
---------------
Every image on this site originally pointed at Google Stitch's asset CDN
(lh3.googleusercontent.com/aida-public/...). Those URLs are ephemeral: commit
8b826d0 ("Fix broken portfolio image") was already a response to one of them
rotting. If Google expires them, essentially every image disappears at once.

Two things this script handles that a plain download does not:

1. Resolution. The bare URL serves a 435x512 thumbnail, which looks badly
   blurry stretched across a full-screen hero. Appending "=w1920" makes the
   CDN serve the native original (1328x1564 for these assets).
2. Format and size. Sources are JPEG; WebP at q82 is roughly a third of the
   bytes at the same perceived quality.

Usage
-----
    python3 tools/mirror_images.py            # only fetch what's missing
    python3 tools/mirror_images.py --force    # re-fetch everything

Requires Pillow. No other dependencies.
"""

import argparse
import json
import os
import sys
import urllib.request

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install --user Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL_MAP = os.path.join(ROOT, "images", "url_map.json")

# The CDN caps at the native size, so asking for 1920 simply yields the
# original rather than the thumbnail.
UPSTREAM_SIZE_HINT = "=w1920"

# Target display width per role. Full-bleed backgrounds get everything the
# source has; cards are never rendered wider than ~700 CSS px, so 900 covers
# a 2x display without shipping needless bytes.
FULL_BLEED_WIDTH = 1328
FEATURE_WIDTH = 1100
CARD_WIDTH = 900

FULL_BLEED = ("-hero",)
FEATURE = ("home-scrolly-arch", "about-vision", "about-craft", "services-mep",
           "services-landscape")

WEBP_QUALITY = 82


def target_width(filename: str) -> int:
    stem = os.path.basename(filename)
    if any(token in stem for token in FULL_BLEED):
        return FULL_BLEED_WIDTH
    if any(stem.startswith(token) for token in FEATURE):
        return FEATURE_WIDTH
    return CARD_WIDTH


def fetch(url: str, dest_tmp: str) -> None:
    request = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 (golden-pearl-site-build)"}
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        with open(dest_tmp, "wb") as handle:
            handle.write(response.read())


def process(url: str, rel_path: str, force: bool) -> str:
    dest = os.path.join(ROOT, rel_path)
    width = target_width(rel_path)

    if os.path.exists(dest) and not force:
        with Image.open(dest) as existing:
            if existing.width >= width * 0.9:
                return f"skip   {rel_path} (already {existing.width}px)"

    tmp = dest + ".tmp"
    fetch(url + UPSTREAM_SIZE_HINT, tmp)

    with Image.open(tmp) as source:
        image = source.convert("RGB")
        original = image.size
        if image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.LANCZOS)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        image.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)

    os.remove(tmp)
    kb = os.path.getsize(dest) // 1024
    return f"ok     {rel_path}  {original[0]}x{original[1]} -> {image.size[0]}x{image.size[1]}  {kb}KB"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true",
                        help="re-fetch even if a local file already looks big enough")
    args = parser.parse_args()

    with open(URL_MAP) as handle:
        url_map = json.load(handle)

    failures = []
    for url, rel_path in sorted(url_map.items(), key=lambda pair: pair[1]):
        try:
            print(process(url, rel_path, args.force), flush=True)
        except Exception as error:                      # noqa: BLE001
            failures.append(rel_path)
            print(f"FAIL   {rel_path}: {error}", flush=True)

    # The one asset that was already committed locally, rather than mirrored.
    source_png = os.path.join(ROOT, "images", "luxury_living_room.png")
    if os.path.exists(source_png):
        with Image.open(source_png) as image:
            image = image.convert("RGB")
            if image.width > CARD_WIDTH:
                height = round(image.height * CARD_WIDTH / image.width)
                image = image.resize((CARD_WIDTH, height), Image.LANCZOS)
            out = os.path.join(ROOT, "images", "luxury_living_room.webp")
            image.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
            print(f"ok     images/luxury_living_room.webp  {os.path.getsize(out) // 1024}KB")

    if failures:
        print(f"\n{len(failures)} failed: {', '.join(failures)}")
        return 1
    print("\nAll images mirrored.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
