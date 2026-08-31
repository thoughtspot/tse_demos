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
// The `Northwind` token does double duty in the template: visible prose
// ("Northwind's pipeline") AND code identifiers (Northwind_DOCS, NorthwindLogo,
// AskNorthwind, and the two brand-named files). A multi-word client like
// "Minimal Path" is fine as prose but emits `Minimal Path_DOCS` as an
// identifier, which is a TS syntax error. So identifiers get a stripped,
// identifier-safe variant while prose keeps the real display name.
const clientIdent = (client.replace(/[^A-Za-z0-9_]/g, '') || 'Client')
  .replace(/^(?=\d)/, '_');                     // identifiers can't start with a digit
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
  // Identifier-adjacent first (Northwind_DOCS, AskNorthwind, NorthwindLogo —
  // always touching an identifier char on one side), then the remaining
  // standalone occurrences, which are prose and take the real display name.
  // The lowercase token maps to `slug`, which the caller validates as
  // kebab-case, so it is already safe in CSS vars, class names and filenames.
  return s.replace(/(?<=[A-Za-z0-9_])Northwind|Northwind(?=[A-Za-z0-9_])/g, clientIdent)
          .split('Northwind').join(client)
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
mv('src/components/NorthwindLogo.tsx', `src/components/${clientIdent}Logo.tsx`);
mv('src/tabs/AskNorthwind.tsx', `src/tabs/Ask${clientIdent}.tsx`);
// Rename the default logo asset to the path the renamed component now imports
// (`../assets/${slug}-logo.svg?raw`); step 6 overwrites it if spec.logo was given,
// otherwise the template's placeholder wordmark survives under the new name so
// the build doesn't fail on an unresolvable import.
mv('src/assets/northwind-logo.svg', `src/assets/${slug}-logo.svg`);
// No logo supplied -> generate a text wordmark for the client rather than
// keeping the template's. String-patching the template asset is not enough:
// its monogram path literally draws an "N" (Northwind's initial) and its badge
// is hardcoded to the template indigo, so "Tixr" would ship an N badge in the
// wrong color. Generating gives the client's own initial, brand primary and
// font, and a viewBox wide enough for the actual name.
// (Skipped when spec.logo is supplied — step 6 writes the real logo instead.)
if (!spec.logo?.svgPath) {
  const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const name = client;
  const initial = (name.trim()[0] || 'C').toUpperCase();
  // The badge follows the brand primary when the spec carries a palette; the
  // template's indigo is the fallback for a spec that keeps the stock theme.
  const primary = spec.theme?.light?.['--sl-green'] || '#4F5BD5';
  const face = [`'${brandFamily}'`, ...(brandFamily === 'Inter' ? [] : ["'Inter'"]), 'system-ui', '-apple-system', 'sans-serif'].join(', ');
  // ~0.56em average advance at weight 700, plus the 30px badge gutter.
  const width = Math.ceil(30 + name.length * 11.2 + 2);
  write(path.join(OUT, `src/assets/${slug}-logo.svg`),
`<svg viewBox="0 0 ${width} 32" fill="none" role="img" aria-label="${xml(name)}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="6" width="20" height="20" rx="6" fill="${primary}"/>
  <text x="10" y="21.5" text-anchor="middle" font-family="${xml(face)}" font-size="13" font-weight="700" fill="#ffffff">${xml(initial)}</text>
  <text x="30" y="23" font-family="${xml(face)}" font-size="20" font-weight="700" letter-spacing="-0.3" fill="currentColor">${xml(name)}</text>
</svg>
`);
}

// ---- 2. content.ts (all copy, from spec) -----------------------------------
// spec.content is OPTIONAL. Omit it entirely and the template's own content.ts
// survives — step 1 already renamed the Northwind token in every casing, so the
// default copy reads as the client's. That is the "chose nothing" path.
// NOTE: when supplied it REPLACES the file wholesale, so a partial object drops
// every key it omits (the app reads ~40 of them). The site worker validates
// against that; if you call this codemod directly, pass all keys or none.
if (spec.content) {
  const contentFile =
`// Generated by apply-spec.mjs — single source of truth for all portal copy.
export interface LoginStat { value: string; label: string; }
export const CONTENT = ${JSON.stringify(spec.content, null, 2)} as const;
export type Content = typeof CONTENT;
`;
  write(path.join(OUT, 'src/content.ts'), contentFile);
}

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
    // navLayout: 'top' (default horizontal bar) or 'sidebar' (left panel).
    `  navLayout: '${ff.navLayout === 'sidebar' ? 'sidebar' : 'top'}',\n` +
    '} as const;\n');
}

// ---- 3. config.ts — IDs / host / action / columns / embed theme ------------
// NOTE: inline/action ids, `spec.action`, inlineName/inlineMetrics/hierarchy are
// only meaningful when features.inline / features.action are on — Basic-mode
// specs (and the interview itself, which skips those sections entirely) may
// omit them. Whatever we write here for a disabled feature is inert: its tab
// (and the file that would read these constants) gets deleted in step 7. So we
// fall back to harmless placeholders instead of crashing on the missing field.
edit(path.join(OUT, 'src/config.ts'), (s) => {
  const i = spec.ids;
  const action = spec.action || { id: 'request-bid', name: 'Request Bid' };
  const cols = spec.columns || {};
  const inlineName = cols.inlineName && cols.inlineName.length ? cols.inlineName : ['Name'];
  const inlineMetrics = cols.inlineMetrics || [];
  const hierarchy = cols.hierarchy || {};
  s = s.replace('https://YOUR-CLUSTER.thoughtspot.cloud', `https://${spec.host}`)
       .replace('REPLACE_MAIN_LIVEBOARD_GUID', i.analyticsLiveboard)
       .replace('REPLACE_INLINE_LIVEBOARD_GUID', i.inlineLiveboard || i.analyticsLiveboard)
       .replace(/REPLACE_MODEL_GUID/g, i.model)
       .replace('REPLACE_ACTION_LIVEBOARD_GUID', i.actionLiveboard || i.analyticsLiveboard)
       .replace('REPLACE_ACTION_VIZ_GUID', i.actionViz || i.analyticsLiveboard)
       .replace("'request-bid'", `'${action.id}'`)
       .replace("'Request Bid'", `'${action.name}'`);
  // candidate column arrays
  const arr = (name, items) =>
    s = s.replace(new RegExp(`export const ${name} = \\[[\\s\\S]*?\\];`),
      `export const ${name} = [\n${items.map((x) => `  '${x}',`).join('\n')}\n];`);
  arr('CADENCE_COLUMN_CANDIDATES', inlineName);
  arr('REGION_COLUMN_CANDIDATES', cols.filterPrimary || []);
  arr('CORRIDOR_COLUMN_CANDIDATES', cols.filterSecondary || []);
  // inline detail metrics (CADENCE_DETAIL_COLUMNS)
  const keys = inlineMetrics.map((_, n) => `metric${n + 1}`);
  const body = inlineMetrics.map((m, n) =>
    `  ${keys[n]}: {\n    label: '${m.label}',\n    format: '${m.format}',\n    candidates: [${m.candidates.map((c) => `'${c}'`).join(', ')}],\n  },`).join('\n');
  s = s.replace(/export const CADENCE_DETAIL_COLUMNS: Record<[\s\S]*?\n> = \{[\s\S]*?\n\};/,
    keys.length
      ? `export const CADENCE_DETAIL_COLUMNS: Record<\n  ${keys.map((k) => `'${k}'`).join(' | ')},\n  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }\n> = {\n${body}\n};`
      : `export const CADENCE_DETAIL_COLUMNS: Record<\n  string,\n  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }\n> = {};`);
  // hierarchy + date filter columns
  s = s.replace(/export const SEGMENT_COLUMN = '[^']*';/, `export const SEGMENT_COLUMN = '${hierarchy.segment || (cols.filterPrimary || [])[0] || ''}';`)
       .replace(/export const REP_COLUMN = '[^']*';/, `export const REP_COLUMN = '${hierarchy.rep || (cols.filterSecondary || [])[0] || ''}';`)
       .replace(/export const CADENCE_NAME_COLUMN = '[^']*';/, `export const CADENCE_NAME_COLUMN = '${hierarchy.cadence || inlineName[0]}';`)
       .replace(/export const DATE_COLUMN = '[^']*';/, `export const DATE_COLUMN = '${cols.date || ''}';`);
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
  // spec.theme is OPTIONAL: omit it (and pass no screenshot) to keep the
  // template's palette, which step 1 already rebranded. Only regenerate the
  // token blocks when a theme was supplied, and only for the modes it defines —
  // block(undefined) would otherwise throw.
  if (spec.theme) {
    for (const key of ['light', 'dark']) {
      const d = spec.theme[key] || {};
      const lightDict = spec.theme.light || {};
      if (!d['--brand-accent']) d['--brand-accent'] = lightDict['--sl-green'] || '#4F5BD5';
      if (!d['--brand-navy']) d['--brand-navy'] = lightDict['--sl-evergreen'] || '#12203a';
      spec.theme[key] = d;
    }
    const block = (dict) => Object.entries(dict).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    if (Object.keys(spec.theme.light || {}).length)
      s = s.replace(/:root \{\n[\s\S]*?\n\}/, `:root {\n${block(spec.theme.light)}\n}`);
    if (Object.keys(spec.theme.dark || {}).length)
      s = s.replace(/:root\[data-theme='dark'\] \{\n[\s\S]*?\n\}/, `:root[data-theme='dark'] {\n${block(spec.theme.dark)}\n}`);
  }
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
if (spec.theme?.default)
  edit(path.join(OUT, 'src/context/ThemeContext.tsx'), (s) =>
    s.replace(/: 'dark';/, `: '${spec.theme.default}';`).replace(/: 'light';/, `: '${spec.theme.default}';`));
if (spec.logo?.svgPath) {
  const svg = read(path.resolve(ROOT, spec.logo.svgPath)).replace(/fill:\s*#[0-9A-Fa-f]{3,6}/g, 'fill:currentColor');
  write(path.join(OUT, `src/assets/${slug}-logo.svg`), svg);
}
if (spec.favicon) write(path.join(OUT, `public/${slug}-icon.svg`), spec.favicon);
if (spec.font?.srcPath) fs.copyFileSync(path.resolve(ROOT, spec.font.srcPath), path.join(OUT, `public/${spec.font.file}`));
// remove stale template assets
for (const f of ['public/northwind-icon.svg', 'public/figma-reference.png'])
  { const p = path.join(OUT, f); if (fs.existsSync(p)) fs.rmSync(p); }

// ---- 7. prune features the spec turns off ----------------------------------
const f = spec.features || {};
// component = the imported identifier in App.tsx (e.g. 'Carriers', 'SpotterTab'),
// icon = the lucide-react icon identifier used only by that tab's TopBar entry.
// Both dangling imports would otherwise fail `tsc` (TS6133/TS2307) after the tab
// and its file are pruned.
// Removing a tab must also remove its App.tsx import — the file is deleted, so
// a dangling `import Carriers from './tabs/Carriers'` fails tsc (TS2307/TS6133).
// Icons are deliberately NOT removed here: they are shared candidates for the
// iconForLabel resolver, so deleting one by name breaks every other tab that
// could resolve to it. Orphaned icons are handled once, below.
const rmTab = (id, component, extraFiles = []) => {
  edit(path.join(OUT, 'src/App.tsx'), (s) => s
    .replace(new RegExp(`\\s*\\{tab === '${id}' && <[^>]+>\\}`), '')
    .replace(new RegExp(`import ${component} from '\\./tabs/[^']+';\\n`), ''));
  edit(path.join(OUT, 'src/components/TopBar.tsx'), (s) =>
    s.replace(new RegExp(`\\s*\\{ id: '${id}',[^\\n]*\\},`), ''));
  for (const rel of extraFiles) { const p = path.join(OUT, rel); if (fs.existsSync(p)) fs.rmSync(p); }
};
if (f.inline === false) rmTab('carriers', 'Carriers', ['src/tabs/Carriers.tsx']);
if (f.action === false) rmTab('capacity', 'Capacity', ['src/tabs/Capacity.tsx', 'src/components/BidModal.tsx']);
if (f.askMode === 'fancy') rmTab('spotter', 'SpotterTab', ['src/tabs/Spotter.tsx']);
if (f.askMode === 'normal') rmTab('ask', `Ask${clientIdent}`, [`src/tabs/Ask${clientIdent}.tsx`]);

// Pruning a tab can orphan icon imports, which fails tsc under noUnusedLocals.
// Two cases, and BOTH occur: pruning one of inline/action leaves that tab's
// fallback icon (e.g. Zap) unused, and pruning both additionally orphans
// iconForLabel and every candidate icon it can resolve to. Drop the resolver
// first when nothing calls it, then sweep whatever candidate imports are left
// unreferenced — which covers either case without naming icons per tab.
edit(path.join(OUT, 'src/components/TopBar.tsx'), (s) => {
  if (!/icon:\s*iconForLabel\(/.test(s)) {
    s = s.replace(/\/\/ Pick a tab icon from its label[\s\S]*?\nfunction iconForLabel[\s\S]*?\n\}\n\n/, '');
  }
  const block = s.match(/(\n\s*\/\/ candidate icons the label-resolver[^\n]*\n)([\s\S]*?)(?=\n\} from 'lucide-react';)/);
  if (!block) return s;
  const kept = block[2]
    .split('\n')
    .filter((line) => {
      const name = line.trim().replace(/,$/, '');
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) return false;      // drop blanks/comments
      // Referenced anywhere outside this import block?
      const rest = s.replace(block[0], '');
      return new RegExp(`\\b${name}\\b`).test(rest);
    });
  // Keep the comment only while candidates survive; drop the block entirely otherwise.
  return s.replace(block[0], kept.length ? block[1] + kept.join('\n') : '');
});

console.log(`\n[apply-spec] ${client} -> ${slug}-tse/ in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
if (f.action !== false)
  console.log('[apply-spec] NOTE: the custom-action modal (BidModal) is generic — customize it by hand for a bespoke workflow.');
