# Home page: rebuilt from the company's own website, every run

The user's rule (2026-10-18): the portal Home must **match the company's website**, not reuse the previous client's
layout. Never ship the template's scaffold Landing, or another client's Landing with words swapped.

## Steps (run as a parallel worker in Phase 4, Track C)

1. **Source:** the homepage HTML and theme CSS fetched in Phase 1 (full browser User-Agent; check `<title>` is not a
   Cloudflare page). Extract:
   - the hero headline, subline and CTA labels, verbatim where possible
   - the section order and what each section is (stats or proof points, pillars or products, audience cards,
     testimonial, closing band)
   - the hero image URL if it's a product or brand photo on the company's own domain (hotlinking 1–2 decorative
     images is fine)
   - visual language: colours, gradient, radius, card style
2. **Build** `src/tabs/Landing.tsx`, keeping the `onNavigate(tab: TabId)` signature:
   - Hero mirroring the site. The gradient accent goes on the same phrase the site emphasises. Two CTAs go into the
     portal (e.g. analytics and the action queue).
   - A stats strip from the **real demo data** (rows, key rates, cycle time, networks or regions), or the site's
     published proof points.
   - The site's pillars or products as cards, with its copy shortened.
   - The site's audience or segment cards. Each links to a portal tab.
   - A closing CTA band using the site's tagline and the Ask-AI tab.
   - Floating "product moment" cards on the hero image that echo the portal's story (e.g. "Referral accepted, 1.2
     days", "Loop closed").
   - No live data or ThoughtSpot embeds on Home.
3. **Style:** prefix every class `<slug>-home-`. Use portal variables (`--sl-cream`, `--sl-white`, `--sl-ink`,
   `--sl-muted`, `--sl-green` (primary), `--sl-border`, `--intime-grad`) so dark mode works.
4. **Verify:** Playwright screenshots in light and dark. Bypass the Basic login with an init script that sets
   `sessionStorage['<slug>.auth'] = '{"username":"demo","password":"demo"}'`, `sessionStorage['<slug>.tab'] = 'home'` and
   `localStorage['<slug>-theme'] = 'light' | 'dark'`. Read both PNGs and fix layout defects.
   The app scrolls inside an inner container, so `fullPage: true` captures only the first viewport: use a tall viewport
   (e.g. 1440x2300) instead. On the Vite dev server `networkidle` never settles; wait for `load` plus about 4 s (Nooks run).

Worked example: `examples/unite-us/home/` (`Landing.tsx`, `home.css`, `home-light.png`, `home-dark.png`): the uniteus.com
hero "Predict Needs. Deliver Services. Prove Impact.", the site's photo, its 4 pillars, its 4 audience cards and its
closing tagline.
