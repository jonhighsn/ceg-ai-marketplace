# Data Storage Design: GitHub-as-CMS with Data Branch

**Date:** 2026-05-27
**Status:** Approved

## Context

CEG AI Marketplace is a static React SPA deployed to GitHub Pages. Catalog data (tiles and ideas) currently lives in JSON files fetched at runtime, with localStorage overrides for admin edits. Admin changes are device-local only - no propagation to other users.

**Requirements:**
- Admin CRUD that propagates to all users
- Lightweight, minimal infrastructure
- Free tier only
- Stay on GitHub Pages
- Single admin editor
- "Few minutes" propagation delay acceptable
- 50-200 records scale

## Architecture

### Two-Branch Model

Single repo, two isolated write paths:

| Branch | Written by | Contents |
|--------|-----------|----------|
| `main` | CI/CD (git push) | App code, fallback data, deploy workflow |
| `data` | Admin via GitHub Contents API | `catalog.json` only |

CI/CD deploys from `main`. Admin writes to `data` branch via Contents API. No write-path collision.

### Data Format

Single `catalog.json` on `data` branch:

```json
{
  "version": "2026-05-27T14:30:00Z",
  "tiles": [
    {
      "id": "tile-001",
      "name": "Skill Name",
      "type": "enterprise-skill",
      "status": "now",
      "cat": "category",
      "desc": "Description",
      "useCase": "Use case text",
      "triggers": ["trigger phrase 1", "trigger phrase 2"],
      "url": "https://..."
    }
  ],
  "ideas": [
    {
      "id": "idea-001",
      "title": "Idea Title",
      "problem": "Problem statement",
      "category": "category",
      "status": "under-review"
    }
  ]
}
```

Single file ensures atomic writes - tiles and ideas always update together.

### Read Path (All Users)

1. On app load: fetch `https://raw.githubusercontent.com/{owner}/ceg-ai-marketplace/data/catalog.json` (owner derived from repo URL, hardcoded in `constants.js`)
2. Parse JSON, extract `version`, `tiles`, `ideas`
3. Store `version` in memory
4. Every 30 minutes: re-fetch same URL, compare `version` field
5. If version changed: update app state
6. If fetch fails: silently keep current data
7. If first-load fetch fails: fall back to hardcoded `TILES_FALLBACK` / `IDEAS_FALLBACK` in bundle

No query params on the URL. Version comparison happens in application code, not via cache-busting. The JSON is small enough (~15-50KB) that fetching it every 30 minutes is negligible bandwidth.

### Write Path (Admin)

1. Admin visits admin page, enters passcode (UI gate, stored in `constants.js`)
2. Admin enters GitHub PAT on first use (stored in localStorage under `storefront:github-pat`)
3. PAT must be fine-grained, scoped to `Contents: write` on this repo only
4. Admin edits tiles/ideas in existing admin UI
5. On save:
   - Validate JSON structure (required fields, correct types, < 500KB)
   - GET current file SHA from `data` branch
   - If SHA matches expected: PUT updated `catalog.json` with new version timestamp
   - If SHA mismatch: alert admin, re-fetch, let admin review before retry
6. Commit message format: `admin: update catalog - {ISO timestamp}`
7. On success: update admin's local state immediately

### Error Handling

| Error | Response |
|-------|----------|
| 401 Unauthorized | "PAT expired or invalid. Please update your GitHub token." |
| 409 Conflict (SHA mismatch) | "Data changed since you loaded. Refreshing..." → auto-reload + retry |
| Network error | "Could not save. Changes stored locally. Try again." |
| Validation failure | Specific field-level error messages |
| Any write failure | Changes persist in localStorage as staging area |

### Rollback

Every admin write creates a git commit on the `data` branch. Rollback options:
- View commit history on GitHub: `/{owner}/ceg-ai-marketplace/commits/data`
- Manual revert via GitHub UI or `git revert`
- Admin can link to commit history from admin page

### Security Model

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| Admin UI access | Passcode in `constants.js` | Cosmetic gate only |
| Data writes | Fine-grained GitHub PAT | `Contents: write` on this repo only |
| PAT storage | localStorage | Single admin device |

The passcode is client-side and viewable in source. This is acceptable because:
- It only gates the admin UI, not actual data writes
- Writing requires the PAT which is NOT in the bundle
- Single admin, internal tool, not public-facing

## File Changes

### Modify

- **`src/App.jsx`** - Change fetch URLs to raw.githubusercontent.com `data` branch. Parse combined `catalog.json` format. Keep fallback logic.
- **`src/constants.js`** - Add `DATA_RAW_URL` constant pointing to `data` branch. Keep `ADMIN_PASSCODE`.
- **`src/pages/PageAdmin.jsx`** - Replace localStorage writes with GitHub Contents API calls. Add PAT input field. Add pre-write validation. Add error handling per table above.
- **`src/storage.js`** - Add helpers for PAT storage (`storefront:github-pat`), staged changes, SHA caching.
- **`src/data-fallback.js`** - Restructure to match `catalog.json` format (tiles + ideas in one object).

### Create

- **`data` branch** - Created from `main`, containing `catalog.json` seeded from current `tiles.json` + `ideas.json`

### No Changes

- Navigation, search (Fuse.js), UI components, routing
- CI/CD deploy workflow (still deploys from `main`)
- User voting (stays localStorage-only)

## Migration Steps

1. Create `data` branch from current `main`
2. Create `catalog.json` on `data` branch combining current `tiles.json` + `ideas.json` data
3. Remove `tiles.json` and `ideas.json` from `data` branch (keep on `main` for fallback)
4. Update `constants.js` with `DATA_RAW_URL`
5. Update `App.jsx` fetch logic to read `catalog.json` from `data` branch
6. Update `data-fallback.js` to match new format
7. Rewrite `PageAdmin.jsx` save flow to use GitHub Contents API
8. Update `storage.js` with PAT and SHA helpers
9. Test admin CRUD end-to-end
10. Deploy

## Out of Scope

- Real-time subscriptions (websockets/SSE) - polling is sufficient
- Multi-admin conflict resolution - single editor
- User voting persistence - stays localStorage-only
- Image/file uploads - not needed
- Audit logging beyond git commits
- Database or schema versioning

## Risks Accepted

- **PAT in localStorage**: Single admin, fine-grained scope limits damage to one repo's contents
- **Passcode in client bundle**: Only gates UI, not writes. Acceptable for internal tool.
- **CDN cache delay**: Up to ~5 min for users. Within "few minutes" requirement.
- **Single file SPOF**: Mitigated by fallback data in bundle + git history for rollback.
- **No enforced single-editor lock**: Relies on convention. Acceptable given single admin constraint.
