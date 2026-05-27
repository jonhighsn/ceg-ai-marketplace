# CEG AI Storefront — Claude Code Migration Spec
## Single-file Claude artifact → GitHub Pages React app

---

## Context

This is a migration, not a rewrite. The current app is a single 2,100-line JSX file
that runs inside a Claude.ai artifact sandbox. It works correctly. The goal is to:

1. Move it into a proper Vite + React project
2. Host it on GitHub Pages with a stable URL
3. Extract `TILES` and `SEEDED_IDEAS` into JSON files fetched at runtime — so data
   updates (committed to `data/`) redeploy without touching source code
4. Split the monolith into components for easier future iteration

**Do not rewrite logic.** Lift and shift. If something works in the artifact, keep it
working. The only behavioural change is where data comes from.

---

## Source File

The full current artifact is at `src/App.jsx` in this repo (committed as-is before
you start). Treat it as the reference implementation. When in doubt, match its
behaviour exactly.

---

## Repo Structure to Create

```
ceg-ai-storefront/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── data/
│       ├── tiles.json          ← extracted from TILES array in App.jsx
│       └── ideas.json          ← extracted from SEEDED_IDEAS array in App.jsx
└── src/
    ├── main.jsx
    ├── App.jsx                 ← slimmed root: routing + data fetch only
    ├── constants.js            ← B tokens, URLs, storage keys, TYPE_META, STATUS_META
    ├── helpers.js              ← pure functions: sort, filter, normalize, parse
    ├── storage.js              ← localStorage shim replacing window.storage
    ├── data-fallback.js        ← hardcoded TILES + SEEDED_IDEAS as fallback
    ├── components/
    │   ├── Callout.jsx
    │   ├── TagPill.jsx
    │   ├── SubLabel.jsx
    │   ├── Sparkle.jsx
    │   ├── SNSearchCard.jsx
    │   ├── IdeaStatusBadge.jsx
    │   ├── TileCard.jsx
    │   ├── TileModal.jsx
    │   └── Sidebar.jsx
    └── pages/
        ├── PageHome.jsx
        ├── PageBrowse.jsx
        ├── PageAdmin.jsx
        ├── PageIdeaPortal.jsx
        └── pipeline/
            └── DiscoverySubmit.jsx
```

---

## 1. Toolchain

### `package.json`

```json
{
  "name": "ceg-ai-storefront",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
```

### `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ceg-ai-storefront/',   // must match GitHub repo name exactly
});
```

### `index.html`

Standard Vite HTML entry. Mount point `<div id="root">`. Load `src/main.jsx`.
Include Inter font from Google Fonts:
`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">`

### `src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

---

## 2. GitHub Actions Deploy Workflow

### `.github/workflows/deploy.yml`

Trigger: push to `main`. Steps:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` with Node 20
3. `npm ci`
4. `npm run build`
5. `peaceiris/actions-gh-pages@v3` — deploy `dist/` to `gh-pages` branch

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch.

---

## 3. Data Files

### `public/data/tiles.json`

Extract the `TILES` array from `App.jsx` as a plain JSON array. Strip the JS syntax
(no `const TILES =`, no trailing `;`). Remove any fields that are `undefined` or
functions. Keep all fields present in the current tile objects:
`id, name, type, status, cat, desc, useCase, triggers, url`.

Example shape:
```json
[
  {
    "id": "account-command-center",
    "name": "Account Command Center",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "...",
    "useCase": "...",
    "triggers": ["account command center"]
  }
]
```

### `public/data/ideas.json`

Extract the `SEEDED_IDEAS` array. Keep all fields: `id, title, problem, category, status`.
No `timestamp` field (removed in a prior iteration).

```json
[
  {
    "id": "pipeline-1",
    "title": "Pre-Interlock Intelligence Agent",
    "problem": "...",
    "category": "Account Intelligence",
    "status": "committed"
  }
]
```

---

## 4. Source Split Rules

### `src/constants.js`

Export everything that is currently a module-level `const` and not a component or
function:

```js
export const B = { ... };                    // brand tokens — copy verbatim from artifact
export const SKILL_REPO_URL = "...";
export const SUBMIT_FORM_URL = "...";
export const CSP_URL = "...";
export const ADMIN_PASSCODE = "ceg2026";
export const STORAGE_INTAKE_KEY = "storefront:intake-submissions";
export const STORAGE_CATALOG_KEY = "storefront:catalog-override";
export const STORAGE_IDEAS_SEEDED_KEY = "storefront:ideas-seeded-override";
export const STORAGE_VOTES_KEY = "storefront:idea-votes";
export const STORAGE_USER_VOTES_KEY = "storefront:user-votes";
export const TYPE_META = { ... };
export const STATUS_META = { ... };
export const IDEA_STATUS_META = { ... };
export const VALID_IDEA_STATUSES = [...];
export const TYPE_SORT_ORDER = { ... };
```

**Do not export `TILES` or `SEEDED_IDEAS` from here** — those come from JSON fetch
with fallback from `data-fallback.js`.

### `src/helpers.js`

Export the four pure functions exactly as they exist in the artifact:

```js
export const sortCatalogTiles = (tiles) => { ... };
export const filterCatalogByQuery = (tiles, q) => { ... };
export const normalizeIdeaStatus = (s) => { ... };
export const parseUnifiedSearch = (text) => { ... };
```

No changes to logic.

### `src/storage.js`

Replace `window.storage` with a localStorage shim that has the same async interface.
All `window.storage?.get/set/delete` calls across the codebase must be replaced with
`import storage from '../storage'` + `storage.get(...)` etc.

```js
// src/storage.js
const storage = {
  async get(key, _shared = false) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? { key, value: val } : null;
    } catch { return null; }
  },
  async set(key, value, _shared = false) {
    try {
      localStorage.setItem(key, String(value));
      return { key, value };
    } catch { return null; }
  },
  async delete(key, _shared = false) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch { return null; }
  },
};

export default storage;
```

The `shared` parameter is kept for API compatibility but has no effect — all storage
is local to the browser in this deployment. Do not remove the parameter.

### `src/data-fallback.js`

Copy the full `TILES` and `SEEDED_IDEAS` arrays verbatim from the artifact. These
are used only if the JSON fetch fails.

```js
// AUTO-GENERATED — do not edit manually.
// Update public/data/tiles.json and public/data/ideas.json instead.
export const TILES_FALLBACK = [ /* full TILES array copied from artifact */ ];
export const IDEAS_FALLBACK = [ /* full SEEDED_IDEAS array copied from artifact */ ];
```

### Components (`src/components/`)

Each component is a named export lifted verbatim from the artifact. No logic changes.
Add import statements for `B`, constants, helpers, and sub-components as needed.

| File | Export | Notes |
|------|--------|-------|
| `Callout.jsx` | `Callout` | Imports `B` |
| `TagPill.jsx` | `TagPill` | Imports `B` |
| `SubLabel.jsx` | `SubLabel` | Imports `B` |
| `Sparkle.jsx` | `Sparkle` | SVG only, no imports needed |
| `SNSearchCard.jsx` | `SNSearchCard` | Imports `Sparkle`, `B` |
| `IdeaStatusBadge.jsx` | `IdeaStatusBadge` | Imports `IDEA_STATUS_META` from constants |
| `TileCard.jsx` | `TileCard` | Imports `TYPE_META`, `STATUS_META`, `TagPill`, `B` |
| `TileModal.jsx` | `TileModal` | Imports `TYPE_META`, `STATUS_META`, `B`, `SubLabel`, `TagPill`, `Callout` |
| `Sidebar.jsx` | `Sidebar`, `NAV` | Imports `B` |

### Pages (`src/pages/`)

Each page is a default export. Import components, constants, helpers, and storage as
needed. No logic changes.

| File | Original | Key imports |
|------|----------|-------------|
| `PageHome.jsx` | `PageHome` | `SNSearchCard`, `TileCard`, `TileModal`, `SubLabel`, helpers, storage |
| `PageBrowse.jsx` | `PageBrowse` | `TileCard`, `TileModal`, helpers |
| `PageAdmin.jsx` | `PageAdmin` | `Callout`, `IdeaStatusBadge`, `IDEA_STATUS_META`, storage |
| `PageIdeaPortal.jsx` | `PageIdeaPortal` | `IdeaStatusBadge`, `TagPill`, `Callout`, `DiscoverySubmit`, storage |
| `pipeline/DiscoverySubmit.jsx` | `DiscoverySubmit` | `TileModal`, `TYPE_META`, `B` |

---

## 5. Data Fetch — Critical Section

This is the only meaningful behavioural change. Everything else is wiring.

### In `src/App.jsx`

```jsx
import { TILES_FALLBACK, IDEAS_FALLBACK } from './data-fallback';

const DATA_BASE = import.meta.env.BASE_URL; // /ceg-ai-storefront/ in prod, / in dev

export default function App() {
  const [liveTiles, setLiveTiles] = useState([]);
  const [liveIdeas, setLiveIdeas] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState('home');

  // Load catalog + ideas from JSON, fall back to hardcoded arrays on failure
  useEffect(() => {
    Promise.all([
      fetch(`${DATA_BASE}data/tiles.json`).then(r => r.json()),
      fetch(`${DATA_BASE}data/ideas.json`).then(r => r.json()),
    ])
      .then(([tiles, ideas]) => {
        setLiveTiles(Array.isArray(tiles) && tiles.length ? tiles : TILES_FALLBACK);
        setLiveIdeas(Array.isArray(ideas) && ideas.length ? ideas : IDEAS_FALLBACK);
      })
      .catch(() => {
        setLiveTiles(TILES_FALLBACK);
        setLiveIdeas(IDEAS_FALLBACK);
      })
      .finally(() => setDataLoaded(true));
  }, []);

  // ... rest of App unchanged (storage load, nav event listener, page routing)
```

### Loading state

```jsx
if (!dataLoaded) return (
  <div style={{display:'flex', alignItems:'center', justifyContent:'center',
    minHeight:'100vh', background:'#F4F6F8', color:'#4A6070', fontSize:14,
    fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>
    Loading catalog...
  </div>
);
```

### Admin storage override

`PageAdmin` still writes catalog overrides to storage and calls `onCatalogUpdate` /
`onIdeasUpdate` in App. This takes precedence over the fetched JSON exactly as before.
No changes to this logic.

---

## 6. Anthropic API Calls — Known Gap

The app makes direct `fetch` calls to `https://api.anthropic.com/v1/messages`.
These work in the Claude artifact because Claude injects auth. In a real browser they
will fail due to CORS and missing API key.

**For this pass:** The existing try/catch already handles failures silently. Add a
user-visible error state in `PageHome` and `DiscoverySubmit`:

```jsx
// After catch in searchAI / handleSearch:
setAiResult({ catalog: [], ideas: [], _error: true });

// In render, if aiResult._error:
<div style={{...}}>
  AI search is not available in this environment.
  <a href="https://claude.ai" target="_blank">Open in Claude →</a>
</div>
```

Add `// TODO: route through /api/search proxy function` at each call site.

Do not add an API key to any file. Do not attempt a proxy in this pass.

---

## 7. Environment Config

### `.env.example`

```
# Copy to .env.local for local development
# No secrets required for base deployment

# Future: URL of Anthropic API proxy serverless function
# VITE_API_PROXY_URL=https://your-function.example.com/api/search
```

---

## 8. Acceptance Criteria

Verify each before marking done.

### Build
- [ ] `npm ci` completes cleanly
- [ ] `npm run build` produces `dist/`
- [ ] `dist/data/tiles.json` and `dist/data/ideas.json` are present
- [ ] No TypeScript or lint errors (project is JS only, no TS config needed)

### Runtime — `npm run preview`
- [ ] App loads, "Loading catalog..." appears briefly, then home page renders
- [ ] Home page shows "In-Platform Capabilities" tile grid
- [ ] Browse page renders all tiles; search input filters; type pills work
- [ ] Pipeline page shows all ideas; search filters; vote buttons render
- [ ] Admin page: gear icon in sidebar footer opens it; passcode `ceg2026` unlocks
- [ ] Admin Export JSON: clicking button downloads a `.json` file
- [ ] Admin catalog upload: paste valid JSON → diff preview → Apply → tiles update
- [ ] Sidebar shows 3 nav items (Home, Browse Catalog, Pipeline)
- [ ] No `window.storage` errors in console
- [ ] No React key warnings in console

### Data fetch behaviour
- [ ] Add a tile with id `"test-fetch-tile"` to `public/data/tiles.json`, rebuild,
      reload preview — tile appears in Browse
- [ ] Rename `public/data/tiles.json` to `tiles.json.bak`, rebuild, reload —
      app renders with fallback data, no crash

### Deployment
- [ ] Push to `main` triggers `deploy.yml`
- [ ] Workflow completes green in GitHub Actions
- [ ] App accessible at `https://[org].github.io/ceg-ai-storefront/`
- [ ] Hard refresh on the deployed URL does not 404

---

## 9. Known Limitations (document in README and with TODO comments)

| Limitation | Location | Future fix |
|------------|----------|------------|
| AI search non-functional in prod | `PageHome`, `DiscoverySubmit` | Anthropic API proxy function |
| Votes are per-browser, not cross-user | `PageIdeaPortal` | Backend database |
| Admin passcode is hardcoded | `PageAdmin` | Azure AD / SSO auth |
| Idea submissions stored in localStorage only | `PageIdeaPortal`, `DiscoverySubmit` | Backend database |

---

## 10. File Delivery Order

Complete in this sequence to avoid broken imports at each step:

1. `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`
2. `src/constants.js`, `src/helpers.js`, `src/storage.js`
3. `src/data-fallback.js`
4. `public/data/tiles.json`, `public/data/ideas.json`
5. `src/components/*.jsx` (all 9 files)
6. `src/pages/*.jsx` and `src/pages/pipeline/DiscoverySubmit.jsx`
7. `src/App.jsx`
8. Verify: `npm run build` passes
9. `.github/workflows/deploy.yml`
10. `.env.example`, `README.md`

---

## 11. README

Generate a `README.md` covering:

- What the app is and who it's for (2–3 sentences)
- **Live URL:** `https://[org].github.io/ceg-ai-storefront/`
- **Local dev:** `npm ci && npm run dev`
- **Updating the skill catalog:** edit `public/data/tiles.json`, commit, push —
  auto-deploys in ~2 minutes
- **Updating the pipeline:** edit `public/data/ideas.json`, commit, push
- **Tile JSON shape** with all required fields and valid type/status values
- **Idea JSON shape** with all required fields and valid status values
- **Known limitations** table (copy from section 9 above)
- **Architecture** — one paragraph explaining Vite + GitHub Pages + JSON fetch pattern
