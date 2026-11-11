# Drillable sunburst

An amount through 2 or 3 hierarchy levels. Click a ring to zoom in; Back, Escape or an empty click goes up. Thin wedges fold into "Other (n)".

- **Search**: `[amount] [level 1] [level 2] [level 3] [Theme Mode]`
  (Emburse: `[Expense Amount] [Region] [Department] [Expense Category] [Theme Mode]`)
- **Edit only `CFG`**: roles.path (array of regexes, outer to inner), roles.value, labels.path, labels.value, formats.value, minAngle, title, search, brand.
- **Behaviour**: top-level branches take the brand series in descending size; the subtitle names the biggest branch and its share.
- **Note**: this is a module type, so it uses `AZ.maya(spec, 'maya.global.js')`. The first render takes about 2.5 s.
- **Tile**: 7x9.
- **Verified in preview**: light and dark, absent, wrapped and empty data, 620x400, sweep 4/13.
