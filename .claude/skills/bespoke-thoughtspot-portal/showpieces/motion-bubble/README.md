# Motion bubble (Play by period)

Entities move across x/y, sized by a third measure, one frame per period. A threshold line and a hero entity in the brand primary make the story visible (a hero that crosses the line).

- **Search**: `[x measure] [y measure] [size measure] [entity] [date].quarterly [Theme Mode]`
  (Emburse: `[Expense Amount] [Out-of-Policy %] [Violations] [Department] [Transaction Date].quarterly [Theme Mode]`)
- **Edit only `CFG`**: roles (regex per column), labels (axis and legend names), hero, threshold, formats, periodGrain, title, search, brand.
- **Behaviour**: partial periods (under 40% of the median period total) are dropped; numbers go in the subtitle because MayaCharts appends the frame to the title; colours switch with `[Theme Mode]`.
- **Interactions**: Play, hover tooltip, click to select (Escape clears).
- **Tile**: 7x9 on the KPIs tab.
- **Verified in preview**: light and dark, absent, wrapped and empty data, 620x400, sweep 4/13.
