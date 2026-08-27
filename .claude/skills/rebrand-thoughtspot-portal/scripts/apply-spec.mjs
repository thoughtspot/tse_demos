#!/usr/bin/env node
// ---------------------------------------------------------------------------
// apply-spec.mjs — spec.json -> a fully-skinned <slug>-tse/ app.
//
//   node scripts/apply-spec.mjs <spec.json>
//
// Deterministic codemod for the mechanizable ~90% of a reskin: clone the
// template, rename the brand token, write content.ts (all copy), patch config.ts
// (host / GUIDs / columns / action / embed theme), patch auth + fonts, regenerate
// the globals.css theme tokens, drop in the logo/favicon/font, and prune features
// the spec turns off. Bespoke workflow modals (e.g. a custom leave form) are NOT
// generated — they stay a manual step, and the script prints a reminder.
//
// Run from your project root. The skill is self-contained: the base template is
// bundled next to this script (../template-tse), and the generated <slug>-tse/ app
// is written into the current working directory. Paths in the spec (logo.svgPath,
// font.srcPath) are resolved relative to the current working directory.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();                                   // where the app is written
const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(SKILL_DIR, 'template-tse');        // bundled with the skill
const SKIP = new Set(['node_modules', 'dist', '.vercel', '.git']);

const specPath = process.argv[2];
if (!specPath) { console.error('usage: node scripts/apply-spec.mjs <spec.json>'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const t0 = Date.now();

const slug = spec.slug;
const client = spec.client;                    // Title-case, e.g. "InTime"
const CLIENT = client.toUpperCase();
const clientLower = slug;                       // lowercase token
const OUT = path.join(ROOT, `${slug}-tse`);

// Embed font: the brand font can't be pushed into ThoughtSpot's sandboxed iframe
// unless it's on a CDN or uploaded to the cluster. So we request the brand font
// first (renders if the cluster has it) and load the NEAREST Google font as the
// reachable fallback. Map common brand faces -> closest free Google font.
const gfontUrl = (fam) =>
  `https://fonts.googleapis.com/css2?family=${fam.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
const FONT_FALLBACKS = {
  larsseit: 'DM Sans', circular: 'Mulish', gilroy: 'Poppins', gotham: 'Montserrat',
  avenir: 'Nunito Sans', 'avenir next': 'Nunito Sans', 'proxima nova': 'Montserrat',
  metric: 'Inter', graphik: 'Public Sans', futura: 'Jost', 'brandon grotesque': 'Montserrat',
  helvetica: 'Inter', arial: 'Inter',
  // Google faces map to themselves (so an explicit Google font just works)
  inter: 'Inter', roboto: 'Roboto', 'open sans': 'Open Sans', lato: 'Lato',
  montserrat: 'Montserrat', poppins: 'Poppins', 'dm sans': 'DM Sans', mulish: 'Mulish',
  nunito: 'Nunito', 'nunito sans': 'Nunito Sans', jost: 'Jost', manrope: 'Manrope',
};
const brandFamily = (spec.font && spec.font.family) || 'Inter';
const fbFamily = FONT_FALLBACKS[brandFamily.toLowerCase()] || 'Inter';
const embedFamily = `'${brandFamily}', '${fbFamily}', system-ui, -apple-system, 'Segoe UI', sans-serif`;
const embedFontUrl = (spec.font && spec.font.googleUrl) || gfontUrl(fbFamily);
// Host-UI font: a self-hosted file is @font-face'd; a Google font (given by name
// or googleUrl) is loaded via index.html's <link>. isBrandGoogleFont is true when
// the brand font IS itself a Google font (map returns it unchanged).
const isBrandGoogleFont = fbFamily.toLowerCase() === brandFamily.toLowerCase() && brandFamily.toLowerCase() !== 'inter';
const hostGoogleUrl = spec.font
  ? (spec.font.googleUrl || (isBrandGoogleFont && !spec.font.file ? gfontUrl(brandFamily) : null))
  : null;

// ---- helpers ---------------------------------------------------------------
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const s = path.join(src, ent.name), d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
function walk(dir, fn) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, fn);
    else fn(p);
  }
}
const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s);
function edit(p, fn) { write(p, fn(read(p))); }
function renameBrand(s) {
  return s.split('Northwind').join(client)
          .split('NORTHWIND').join(CLIENT)
          .split('northwind').join(clientLower);
}

// ---- 0. clone --------------------------------------------------------------
// Zero-setup: the generated apps share the bundled template's node_modules. If it
// hasn't been installed yet (fresh clone of the skill), install it now — once —
// instead of failing the first build with a confusing missing-deps error.
ensureTemplateDeps();

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
copyDir(TEMPLATE, OUT);
// symlink deps to the bundled template's node_modules. Absolute target so it works
// wherever the generated app is created.
try { fs.symlinkSync(path.join(TEMPLATE, 'node_modules'), path.join(OUT, 'node_modules')); } catch {}

function ensureTemplateDeps() {
  // A real install has node_modules AND the SDK dep resolved (a bare/partial dir
  // would still fail the build). Check for the SDK to catch a half-populated dir.
  const nm = path.join(TEMPLATE, 'node_modules');
  const sdk = path.join(nm, '@thoughtspot', 'visual-embed-sdk');
  if (fs.existsSync(sdk)) return;
  // node/npm often aren't on the default PATH (they live at ~/.node/bin here) —
  // prepend it so `npm` resolves whether or not the caller exported it.
  const home = process.env.HOME || '';
  const PATH = `${path.join(home, '.node', 'bin')}:${process.env.PATH || ''}`;
  console.log('[apply-spec] template deps not installed — running `npm install` once (this can take a minute)…');
  try {
    execSync('npm install --no-audit --no-fund', {
      cwd: TEMPLATE,
      stdio: 'inherit',
      env: { ...process.env, PATH },
    });
  } catch {
    console.error(
      `[apply-spec] auto-install failed. Install manually, then re-run:\n` +
      `  (cd "${TEMPLATE}" && npm install)`,
    );
    process.exit(1);
  }
}

// ---- 1. brand rename (all casings) + file renames --------------------------
walk(path.join(OUT, 'src'), (p) => {
  if (/\.(ts|tsx|css)$/.test(p)) edit(p, renameBrand);
});
edit(path.join(OUT, 'index.html'), renameBrand);
// Host webfont: point index.html's font <link> at the brand Google font when the
// host font is a Google font (self-hosted fonts are handled by @font-face above).
if (hostGoogleUrl) {
  edit(path.join(OUT, 'index.html'), (s) =>
    s.replace('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', hostGoogleUrl));
}
edit(path.join(OUT, 'package.json'), (s) => s.replace(/northwind-thoughtspot-portal/g, `${slug}-thoughtspot-portal`));
const mv = (a, b) => { const A = path.join(OUT, a), B = path.join(OUT, b); if (fs.existsSync(A)) fs.renameSync(A, B); };
mv('src/components/NorthwindLogo.tsx', `src/components/${client}Logo.tsx`);
mv('src/tabs/AskNorthwind.tsx', `src/tabs/Ask${client}.tsx`);

// ---- 2. content.ts (all copy, from spec) -----------------------------------
const contentFile =
`// Generated by apply-spec.mjs — single source of truth for all portal copy.
export interface LoginStat { value: string; label: string; }
export const CONTENT = ${JSON.stringify(spec.content, null, 2)} as const;
export type Content = typeof CONTENT;
`;
write(path.join(OUT, 'src/content.ts'), contentFile);

// ---- 2b. flags.ts — feature toggles (monetize / tiers / pinning) -----------
// Tabs (inline/action/askMode) are PRUNED below; these three are gated in-place
// via FLAGS so shared components (paywall, tier switcher, Add-Report) render only
// when on. Default true when the spec omits a flag.
{
  const ff = (spec.features || {});
  const b = (v) => (v === false ? 'false' : 'true');
  write(path.join(OUT, 'src/flags.ts'),
    '// Generated by apply-spec.mjs from spec.features.\n' +
    'export const FLAGS = {\n' +
    `  monetize: ${b(ff.monetize)},\n` +
    `  tiers: ${b(ff.tiers)},\n` +
    `  pinning: ${b(ff.pinning)},\n` +
    // home is opt-in: off unless the spec explicitly asks for a Home landing page.
    `  home: ${ff.home === true ? 'true' : 'false'},\n` +
    '} as const;\n');
}

// ---- 3. config.ts — IDs / host / action / columns / embed theme ------------
edit(path.join(OUT, 'src/config.ts'), (s) => {
  const i = spec.ids;
  s = s.replace('https://YOUR-CLUSTER.thoughtspot.cloud', `https://${spec.host}`)
       .replace('REPLACE_MAIN_LIVEBOARD_GUID', i.analyticsLiveboard)
       .replace('REPLACE_INLINE_LIVEBOARD_GUID', i.inlineLiveboard)
       .replace(/REPLACE_MODEL_GUID/g, i.model)
       .replace('REPLACE_ACTION_LIVEBOARD_GUID', i.actionLiveboard)
       .replace('REPLACE_ACTION_VIZ_GUID', i.actionViz)
       .replace("'request-bid'", `'${spec.action.id}'`)
       .replace("'Request Bid'", `'${spec.action.name}'`);
  // candidate column arrays
  const arr = (name, items) =>
    s = s.replace(new RegExp(`export const ${name} = \\[[\\s\\S]*?\\];`),
      `export const ${name} = [\n${items.map((x) => `  '${x}',`).join('\n')}\n];`);
  arr('CADENCE_COLUMN_CANDIDATES', spec.columns.inlineName);
  arr('REGION_COLUMN_CANDIDATES', spec.columns.filterPrimary);
  arr('CORRIDOR_COLUMN_CANDIDATES', spec.columns.filterSecondary);
  // inline detail metrics (CADENCE_DETAIL_COLUMNS)
  const keys = spec.columns.inlineMetrics.map((_, n) => `metric${n + 1}`);
  const body = spec.columns.inlineMetrics.map((m, n) =>
    `  ${keys[n]}: {\n    label: '${m.label}',\n    format: '${m.format}',\n    candidates: [${m.candidates.map((c) => `'${c}'`).join(', ')}],\n  },`).join('\n');
  s = s.replace(/export const CADENCE_DETAIL_COLUMNS: Record<[\s\S]*?\n> = \{[\s\S]*?\n\};/,
    `export const CADENCE_DETAIL_COLUMNS: Record<\n  ${keys.map((k) => `'${k}'`).join(' | ')},\n  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }\n> = {\n${body}\n};`);
  // hierarchy + date filter columns
  s = s.replace(/export const SEGMENT_COLUMN = '[^']*';/, `export const SEGMENT_COLUMN = '${spec.columns.hierarchy.segment}';`)
       .replace(/export const REP_COLUMN = '[^']*';/, `export const REP_COLUMN = '${spec.columns.hierarchy.rep}';`)
       .replace(/export const CADENCE_NAME_COLUMN = '[^']*';/, `export const CADENCE_NAME_COLUMN = '${spec.columns.hierarchy.cadence}';`)
       .replace(/export const DATE_COLUMN = '[^']*';/, `export const DATE_COLUMN = '${spec.columns.date}';`);
  // embed theme hex swaps (indigo -> brand)
  for (const [a, b] of spec.embedSwaps || []) s = s.split(a).join(b);
  // Brand-tint the LIGHT embed surfaces (secondary buttons, chips, hovers, tile
  // borders, action buttons, menus) by blending the primary toward white — so
  // surfaces follow the brand instead of a flat grey. The neutral hexes below are
  // the template's surface placeholders acting as swap keys.
  {
    const h2 = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
    const x = (n) => Math.round(n).toString(16).padStart(2, '0');
    const mixW = (hex, t) => { const [r, g, b] = h2(hex); return '#' + x(r + (255 - r) * t) + x(g + (255 - g) * t) + x(b + (255 - b) * t); };
    const prim = (spec.theme && spec.theme.light && spec.theme.light['--sl-green']) || '#4F5BD5';
    const surf = {
      '#FCFCFD': mixW(prim, 0.975), '#F5F6F8': mixW(prim, 0.96), '#F5F6F9': mixW(prim, 0.96),
      '#EEF0F4': mixW(prim, 0.92), '#EEF0F5': mixW(prim, 0.92), '#F1F2F6': mixW(prim, 0.945),
      '#E3E6EC': mixW(prim, 0.86), '#E8EAF1': mixW(prim, 0.90), '#E2E4EC': mixW(prim, 0.88),
      '#D7DBE3': mixW(prim, 0.80),
    };
    for (const [g, v] of Object.entries(surf)) s = s.split(g).join(v);
  }
  // embed font: brand font first, nearest reachable Google font as fallback
  s = s.replace(/export const EMBED_FONT_FAMILY = '[^']*';/,
    `export const EMBED_FONT_FAMILY = ${JSON.stringify(embedFamily)};`);
  // the stylesheet actually loaded into the iframe — always a reliable Google URL
  s = s.replace(/export const TS_FONT_URL =\n  '[^']*';/,
    `export const TS_FONT_URL =\n  ${JSON.stringify(embedFontUrl)};`);
  return s;
});

// ---- 4. thoughtspot.ts — auth + embed font + accent swaps ------------------
edit(path.join(OUT, 'src/lib/thoughtspot.ts'), (s) => {
  if (spec.auth === 'basic') {
    s = s.replace(/void username;\n\s*void password;\n/, '')
         .replace('authType: AuthType.None,', 'authType: AuthType.Basic,\n    username,\n    password,');
  }
  s = s.replace(/const APP_FONT = "[^"]*";/, `const APP_FONT = ${JSON.stringify(embedFamily)};`);
  for (const [a, b] of spec.embedSwaps || []) s = s.split(a).join(b);
  for (const [a, b] of spec.greenSwaps || []) s = s.split(a).join(b);
  return s;
});

// ---- 5. globals.css — regenerate theme tokens + @font-face -----------------
edit(path.join(OUT, 'src/styles/globals.css'), (s) => {
  // Guarantee the fixed brand tokens the chatbot depends on — if the spec's theme
  // dicts omit them, the chat FAB/header background (var(--brand-accent/navy)) would
  // be undefined and render transparent. Default from the light primary + ink.
  for (const key of ['light', 'dark']) {
    const d = spec.theme[key] || {};
    if (!d['--brand-accent']) d['--brand-accent'] = spec.theme.light['--sl-green'] || '#4F5BD5';
    if (!d['--brand-navy']) d['--brand-navy'] = spec.theme.light['--sl-evergreen'] || '#12203a';
    spec.theme[key] = d;
  }
  const block = (dict) => Object.entries(dict).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  s = s.replace(/:root \{\n[\s\S]*?\n\}/, `:root {\n${block(spec.theme.light)}\n}`);
  s = s.replace(/:root\[data-theme='dark'\] \{\n[\s\S]*?\n\}/, `:root[data-theme='dark'] {\n${block(spec.theme.dark)}\n}`);
  // leftover dark-override rules (login-left gradient, branded header fills)
  for (const [a, b] of spec.cssSwaps || []) s = s.split(a).join(b);
  if (spec.font && spec.font.file) {
    const face =
`@font-face {\n  font-family: '${spec.font.family}';\n  font-style: normal;\n  font-weight: normal;\n  font-display: swap;\n  src: url('/${spec.font.file}') format('woff2');\n}\n\n`;
    s = face + s;
  }
  return s;
});

// ---- 6. theme default + assets --------------------------------------------
edit(path.join(OUT, 'src/context/ThemeContext.tsx'), (s) =>
  s.replace(/: 'dark';/, `: '${spec.theme.default}';`).replace(/: 'light';/, `: '${spec.theme.default}';`));
if (spec.logo?.svgPath) {
  const svg = read(path.join(ROOT, spec.logo.svgPath)).replace(/fill:\s*#[0-9A-Fa-f]{3,6}/g, 'fill:currentColor');
  write(path.join(OUT, `src/assets/${slug}-logo.svg`), svg);
}
if (spec.favicon) write(path.join(OUT, `public/${slug}-icon.svg`), spec.favicon);
if (spec.font?.srcPath) fs.copyFileSync(path.join(ROOT, spec.font.srcPath), path.join(OUT, `public/${spec.font.file}`));
// remove stale template assets
for (const f of ['public/northwind-icon.svg', 'src/assets/northwind-logo.svg', 'public/figma-reference.png'])
  { const p = path.join(OUT, f); if (fs.existsSync(p)) fs.rmSync(p); }

// ---- 7. prune features the spec turns off ----------------------------------
const f = spec.features || {};
const rmTab = (id, extraFiles = []) => {
  edit(path.join(OUT, 'src/App.tsx'), (s) => s.replace(new RegExp(`\\s*\\{tab === '${id}' && <[^>]+>\\}`), ''));
  edit(path.join(OUT, 'src/components/TopBar.tsx'), (s) => s.replace(new RegExp(`\\s*\\{ id: '${id}',[^\\n]*\\},`), ''));
  for (const rel of extraFiles) { const p = path.join(OUT, rel); if (fs.existsSync(p)) fs.rmSync(p); }
};
if (f.inline === false) rmTab('carriers', ['src/tabs/Carriers.tsx']);
if (f.action === false) rmTab('capacity', ['src/tabs/Capacity.tsx', 'src/components/BidModal.tsx']);
if (f.askMode === 'fancy') rmTab('spotter', ['src/tabs/Spotter.tsx']);
if (f.askMode === 'normal') rmTab('ask', [`src/tabs/Ask${client}.tsx`]);

console.log(`\n[apply-spec] ${client} -> ${slug}-tse/ in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
if (f.action !== false)
  console.log('[apply-spec] NOTE: the custom-action modal (BidModal) is generic — customize it by hand for a bespoke workflow.');
