"""Replace ThoughtSpot's Spotter icon (the dog, `rd-icon-spotter`) with a mini mark of the client's logo.

Usage: python3 make_spotter_icon.py <app_dir> <logo.svg> --color "#AC8343" [--xmax 49]
       python3 make_spotter_icon.py <app_dir> <logo.svg> --color "#216CFF" --crop "-5.5 0 48 48"

--crop keeps the logo's original artwork (use it when the logo has masks, groups or relative path commands, e.g.
Unite Us): the whole logo goes in the symbol, the viewBox crops to the emblem, <mask> elements are stripped (they
render blank inside a hidden sprite) and every non-white fill becomes --color. Always render the sprite via
<use href="#rd-icon-spotter"> once to check it is not blank.

Takes the logo's path data, keeps only the subpaths left of --xmax (the monogram / first letter of a wordmark;
omit --xmax to keep the whole logo), writes public/<slug>-spotter-icon.svg as an SDK icon sprite
(<symbol id="rd-icon-spotter">, square viewBox), and points config.ts TS_ICON_SPRITE_URL at it on the app's own
origin (window.location.origin), so every embed's customizations.iconSpriteUrl picks it up.
Docs: https://developers.thoughtspot.com/docs/customize-icons#_spotter_icon
"""
import argparse
import os
import re

ap = argparse.ArgumentParser()
ap.add_argument("app")
ap.add_argument("logo")
ap.add_argument("--color", required=True)
ap.add_argument("--xmax", type=float, default=None)
ap.add_argument("--crop", default=None, help='viewBox around the emblem, e.g. "-5.5 0 48 48"')
a = ap.parse_args()

svg = open(a.logo, encoding="utf-8").read()
if a.crop:
    inner = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", svg.strip())
    inner = re.sub(r"<mask[^>]*>.*?</mask>", "", inner, flags=re.S)
    inner = re.sub(r'\s*mask="url\([^)]*\)"', "", inner)
    inner = re.sub(r'fill="(?!none|white|#fff\b|#ffffff\b)[^"]+"', 'fill="' + a.color + '"', inner, flags=re.I)
    symbol_body, vb = inner, a.crop
else:
    symbol_body = vb = None
if symbol_body is None:
  subs = [p for d in re.findall(r'\sd="([^"]+)"', svg) for p in re.findall(r"[Mm][^Mm]*", d)]
  nums = lambda p: [float(x) for x in re.findall(r"-?\d+\.?\d*", p)]
  keep = [p for p in subs if a.xmax is None or max(nums(p)[0::2]) < a.xmax] or subs
  pts = [n for p in keep for n in nums(p)]
  xs, ys = pts[0::2], pts[1::2]
  x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
  side = max(x1 - x0, y1 - y0) * 1.25
  vb = "%.1f %.1f %.1f %.1f" % ((x0 + x1 - side) / 2, (y0 + y1 - side) / 2, side, side)
slug = os.path.basename(os.path.abspath(a.app)).replace("-tse", "")
name = slug + "-spotter-icon.svg"
open(os.path.join(a.app, "public", name), "w", encoding="utf-8").write(
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width:0;height:0;visibility:hidden;">\n'
    '  <defs/>\n  <symbol id="rd-icon-spotter" viewBox="%s" fill="%s">\n    %s\n  </symbol>\n</svg>\n'
    % (vb, a.color, symbol_body if symbol_body is not None else '<path d="%s"/>' % "".join(keep)))
cfg = os.path.join(a.app, "src", "config.ts")
s = open(cfg, encoding="utf-8").read()
t = re.sub(r"export const TS_ICON_SPRITE_URL =\s*[^;]+;",
           "export const TS_ICON_SPRITE_URL = `${window.location.origin}/" + name + "`;", s, count=1)
open(cfg, "w", encoding="utf-8").write(t)
print("wrote public/%s (viewBox %s); config.ts %s" % (name, vb, "patched" if t != s else "already set"))
