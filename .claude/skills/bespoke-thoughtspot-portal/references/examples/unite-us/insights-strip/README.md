# Insights strip (KPIs tab, x5 y4 w7 h2)

A theme-aware BYOC tile: "Key findings" label plus two one-line findings side by side, sized for a 2-row tile.
Search: `[<any measure>] [Theme Mode]` (the measure only makes the search valid; the copy is static and must quote
numbers verified through searchdata). Light: brand tint background, primary headings, navy text. Dark: the portal's
dark tile colour. Edit only the palette object `P` and the two `.f` lines. Ship with `scripts/make_tile_patch.py
--tab KPIs --x 5 --y 4 --w 7 --h 2 --name "Key findings" --font "<portal font.family>"`.
