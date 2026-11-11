"""Build an inline @font-face CSS block (base64 woff2, subset) for a Google font, so a custom chart tile shows the
portal's font inside ThoughtSpot.

Why inline: the custom-chart (BYOC) frame inside a Liveboard is subject to the cluster CSP. Unless a cluster admin adds
fonts.googleapis.com / fonts.gstatic.com to style-src / font-src, a <link> to Google Fonts silently fails and the tile
falls back to the system font, even though the local preview showed the right font.

Usage (library):  from embed_font import font_css; css = font_css("Montserrat")
Usage (CLI):      python3 embed_font.py "Montserrat" > font.css

Source: fontsource on jsDelivr (pinned version). Prefers the variable font (one file, every weight); falls back to static
400/600/700 weights. Subset to ASCII plus dashes, quotes, bullet and ellipsis, kerning only, no hinting: roughly 20-30 KB of CSS per weight.
Needs fontTools + brotli; installs them once into ~/.cache/ts-charts/fontenv if missing.
"""
import base64
import io
import json
import os
import subprocess
import sys
import urllib.request

FONTENV = os.path.expanduser("~/.cache/ts-charts/fontenv")
UNICODES = "U+0020-007E,U+2013-2014,U+2018-201D,U+2022,U+2026"  # charts are ASCII by contract


def _ensure_fonttools():
    try:
        import fontTools  # noqa: F401
        import brotli  # noqa: F401
        return sys.executable
    except ImportError:
        py = os.path.join(FONTENV, "bin", "python")
        if not os.path.exists(py):
            env = dict(os.environ, PATH=os.path.expanduser("~/.local/bin") + ":" + os.environ.get("PATH", ""))
            subprocess.run(["uv", "venv", "-q", FONTENV], check=True, env=env)
            subprocess.run(["uv", "pip", "install", "-q", "--python", py, "fonttools", "brotli"], check=True, env=env)
        return py


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def _version(pkg):
    try:
        return json.loads(_get("https://data.jsdelivr.com/v1/packages/npm/" + pkg + "/resolved"))["version"]
    except Exception:
        return None


def _subset(data, py):
    code = ("import sys,io\nfrom fontTools import subset\nfrom fontTools.ttLib import TTFont\n"
            "f=TTFont(io.BytesIO(sys.stdin.buffer.read()))\no=subset.Options(); o.flavor='woff2'; o.layout_features=['kern']; o.hinting=False; o.desubroutinize=True\n"
            "s=subset.Subsetter(o); s.populate(unicodes=subset.parse_unicodes(sys.argv[1])); s.subset(f)\n"
            "b=io.BytesIO(); f.flavor='woff2'; f.save(b); sys.stdout.buffer.write(b.getvalue())\n")
    r = subprocess.run([py, "-c", code, UNICODES], input=data, capture_output=True, check=True)
    return r.stdout


def font_faces(family, weights=("400", "600", "700")):
    """Return [(weight_range, woff2_bytes)] for the family. `weights` limits the static fallback (each ~10 KB of base64)."""
    slug = family.strip().lower().replace(" ", "-")
    py = _ensure_fonttools()
    v = _version("@fontsource-variable/" + slug)
    if v:
        try:
            raw = _get("https://cdn.jsdelivr.net/npm/@fontsource-variable/%s@%s/files/%s-latin-wght-normal.woff2" % (slug, v, slug))
            return [("100 900", _subset(raw, py))]
        except Exception:
            pass
    v = _version("@fontsource/" + slug)
    if not v:
        raise SystemExit("font not found on fontsource: " + family)
    out = []
    for w in weights:
        try:
            raw = _get("https://cdn.jsdelivr.net/npm/@fontsource/%s@%s/files/%s-latin-%s-normal.woff2" % (slug, v, slug, w))
            out.append((w, _subset(raw, py)))
        except Exception:
            continue
    if not out:
        raise SystemExit("no woff2 files for " + family)
    return out


def font_css(family, weights=("400", "600", "700")):
    fam = family.strip().strip("'\"")
    css = []
    for weight, data in font_faces(fam, weights):
        css.append("@font-face { font-family: '%s'; font-style: normal; font-weight: %s; font-display: block; "
                   "src: url(data:font/woff2;base64,%s) format('woff2'); }" % (fam, weight, base64.b64encode(data).decode()))
    return "\n".join(css) + "\n"


if __name__ == "__main__":
    sys.stdout.write(font_css(sys.argv[1]))
