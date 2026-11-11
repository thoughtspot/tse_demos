# Calendar heatmap with measure toggle

Month x year grid with a toggle between 2 and 3 measures (for example volume, a count, and a rate). Shows seasonality and a recent surge at a glance.

- **Search**: `[m1] [m2] [m3] [date].monthly [Theme Mode]`
  (Emburse: `[Expense Amount] [Violations] [Out-of-Policy %] [Transaction Date].monthly [Theme Mode]`)
- **Edit only `CFG`**: roles.date, roles.measures (regex array), labels.measures, formats (array, same order), title, search, brand.
- **Behaviour**: edge months under 70% of the median, and inner months under 40%, are left blank as partial; the ramp runs light to primary to navy (dark mode: grid to primary to pale); the subtitle names the busiest month.
- **Note**: rate measures must come from the search already aggregated per month (one row per month), because the chart does not re-aggregate.
- **Tile**: 7x9.
- **Verified in preview**: light and dark, absent, wrapped and empty data, 620x400, sweep 13/13.
