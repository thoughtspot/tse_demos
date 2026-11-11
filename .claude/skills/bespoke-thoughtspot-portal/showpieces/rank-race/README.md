# Rank race (Play by period)

Horizontal bars re-rank on the running total, period by period (bar-chart-race style). Top N per frame, so entities enter and leave.

- **Search**: `[amount] [entity] [date].quarterly [Theme Mode]`
  (Emburse: `[Expense Amount] [Merchant] [Transaction Date].quarterly [Theme Mode]`)
- **Edit only `CFG`**: roles, labels, cumulative (true = running total, false = per-period ranking), top, hero (optional entity in primary, the rest muted), formats, periodGrain, title, search, brand.
- **Behaviour**: partial periods are dropped; the subtitle names the leader at the last period.
- **Interactions**: Play, hover (cumulative plus the period value), click to select.
- **Tile**: 7x9.
- **Verified in preview**: light and dark, absent, wrapped and empty data, 620x400, sweep 6/13.
