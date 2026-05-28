# CEG AI Marketplace

CEG AI Marketplace is an internal ServiceNow CEG catalog for AI capabilities, Claude skills, in-platform CSP features, and the idea pipeline. It helps CEG users find the right existing capability before submitting a new idea.

Live URL: `https://jonhighsn.github.io/ceg-ai-marketplace/`

## Local Development

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```

## Semantic Search

Marketplace search uses a hybrid approach:

- semantic search matches by meaning using embeddings in `search-index.json`
- Fuse keyword search remains the fallback for exact names, ids, acronyms, and unavailable semantic assets
- user queries are embedded in the browser with `@huggingface/transformers`; no Cloud, OpenRouter, or secret-bearing API call is made

Regenerate the local static index after catalog or pipeline data changes:

```bash
npm run search:index
```

The script reads `public/data/tiles.json` and `public/data/ideas.json` by default and writes `public/data/search-index.json`. If production switches the semantic index source to the `data` branch combined catalog payload, regenerate from that payload instead:

```bash
npm run search:index -- --catalog path/to/catalog.json --out path/to/search-index.json
```

At runtime, the app loads the bundled `public/data/search-index.json`. If the index fingerprint does not match the live catalog and ideas, semantic search is skipped and keyword search still works.

## Updating The Skill Catalog

Edit the canonical catalog source, regenerate `search-index.json`, commit, and push. For local bundled data, update `public/data/tiles.json`. In production, the app also supports the GitHub `data` branch `catalog.json` payload configured by `DATA_RAW_URL`.

Tile shape:

```json
{
  "id": "account-command-center",
  "name": "Account Command Center",
  "type": "enterprise-skill",
  "status": "now",
  "cat": "Account Intelligence",
  "desc": "What the capability does.",
  "useCase": "When to use it.",
  "triggers": ["account command center"],
  "url": "https://example.com"
}
```

Valid `type` values: `in-platform`, `enterprise-skill`, `local-skill`, `automated`.

Valid `status` values: `now`, `next`, `later`.

## Updating The Pipeline

Edit the canonical pipeline source, regenerate `search-index.json`, commit, and push. For local bundled data, update `public/data/ideas.json`.

Idea shape:

```json
{
  "id": "pipeline-1",
  "title": "Pre-Interlock Intelligence Agent",
  "problem": "Problem or opportunity description.",
  "category": "Account Intelligence",
  "status": "committed"
}
```

Valid idea `status` values: `under-review`, `committed`, `delivered`.

## Architecture

The app is a Vite + React static site hosted on GitHub Pages with `base: "/ceg-ai-marketplace/"`. Catalog and idea data are fetched from the raw GitHub `data` branch `catalog.json` payload configured in `src/constants.js`, with hardcoded fallback arrays in `src/data-fallback.js` so the app still renders if fetches fail. Bundled `public/data/*.json` files support local data generation and fallback workflows. Admin updates are stored in browser localStorage and take precedence over fetched JSON in that browser.

## Known Limitations

| Limitation | Location | Future fix |
| --- | --- | --- |
| Semantic search depends on browser model loading and a fresh index | `src/search.js`, `src/search-index.js` | Optional backend reranker or hosted model proxy |
| Votes are per-browser, not cross-user | `PageIdeaPortal` | Backend database |
| Admin passcode is hardcoded | `PageAdmin` | Azure AD / SSO auth |
| Idea submissions are local browser state only | `PageIdeaPortal`, `DiscoverySubmit` | Backend database |

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`. In repository settings, configure GitHub Pages to deploy from GitHub Actions.
