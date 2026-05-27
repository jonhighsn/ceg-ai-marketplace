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

## Updating The Skill Catalog

Edit `public/data/tiles.json`, commit, and push to `main`. GitHub Actions builds the app and deploys the updated static JSON to GitHub Pages.

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

Edit `public/data/ideas.json`, commit, and push to `main`.

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

The app is a Vite + React static site hosted on GitHub Pages with `base: "/ceg-ai-marketplace/"`. Catalog and idea data are fetched from `public/data/*.json` at runtime, with hardcoded fallback arrays in `src/data-fallback.js` so the app still renders if JSON fetches fail. Admin updates are stored in browser localStorage and take precedence over fetched JSON in that browser.

## Known Limitations

| Limitation | Location | Future fix |
| --- | --- | --- |
| AI search is unavailable in static production | `PageHome`, `DiscoverySubmit` | Anthropic API proxy function |
| Votes are per-browser, not cross-user | `PageIdeaPortal` | Backend database |
| Admin passcode is hardcoded | `PageAdmin` | Azure AD / SSO auth |
| Idea submissions are local browser state only | `PageIdeaPortal`, `DiscoverySubmit` | Backend database |

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`. In repository settings, configure GitHub Pages to deploy from GitHub Actions.
