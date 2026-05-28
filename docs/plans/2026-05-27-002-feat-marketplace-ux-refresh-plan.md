---
title: Marketplace UX Refresh
type: feat
status: active
date: 2026-05-27
origin: docs/brainstorms/2026-05-27-marketplace-ux-refresh-requirements.md
---

# Marketplace UX Refresh

## Summary

Implement the three UX improvements scoped in the origin requirements: a value-prop headline and renamed sidebar tab on the home page, category-based grouping within Browse type tabs, and a right-side detail panel replacing the centered TileModal. The approved panel design spec (`docs/superpowers/specs/2026-05-27-right-side-detail-panel-design.md`) anchors the panel work with exact dimensions, animation, and component architecture.

---

## Problem Frame

CEG leadership uses the marketplace to find and invoke AI skills. The home page doesn't explain the tool's purpose at first glance, Browse is a flat list with no way to scan by use-case category, and the modal overlay hides the list during skill comparison — three friction points from direct feedback. (See origin for full narrative.)

---

## Requirements

- R1. Home page displays prominent headline + supporting copy conveying four value dimensions: discover, find, see what's possible, contribute.
- R2. Headline visible above the fold on standard laptop screens.
- R3. Sidebar "Home" label renamed to a descriptive name aligned with the value-prop headline.
- R4. Browse type tabs group tiles under category section headings using the `cat` field.
- R5. Category sections visually distinct with heading labels.
- R6. Tiles retain existing sort order (type priority, then alphabetical) within each category.
- R7. Empty category sections hidden rather than shown.
- R8. Clicking a tile opens details in a right-side panel instead of a modal.
- R9. Tile list remains visible and scrollable while the panel is open.
- R10. Clicking a different tile updates panel content without close/reopen.
- R11. Panel dismissible via close button, same-tile click, or Escape key.
- R12. Panel displays same content as current TileModal.

**Origin acceptance examples:** AE1 (covers R4, R5, R7), AE2 (covers R8, R9, R10), AE3 (covers R11), AE4 (covers R1, R3)

---

## Scope Boundaries

- Search feedback loop — explicitly deferred
- Annotating why Top 10/featured skills were chosen — deferred
- Changes to search algorithm or ranking logic — not in scope
- Mobile-responsive panel layout — included per approved design spec (full-width overlay at <760px)
- Category management or editing — not in scope

### Deferred to Follow-Up Work

- Pipeline/DiscoverySubmit page panel integration — mentioned in approved spec but not in origin requirements; separate PR if needed

---

## Context & Research

### Relevant Code and Patterns

- `src/pages/PageHome.jsx` — hero search via SNSearchCard, featured in-platform tiles grid, selectedTile state + TileModal
- `src/pages/PageBrowse.jsx` — type tabs, flat tile grid, selectedTile state + TileModal
- `src/components/Sidebar.jsx` — NAV array with `{id, icon, label}` entries; "Home" label is a string constant
- `src/components/TileModal.jsx` — overlay with full tile details, copy-to-clipboard for triggers; will be replaced
- `src/components/TileCard.jsx` — card with type/status pills, name, category, desc, CTA; `onSelect` prop bubbles tile to parent
- `src/constants.js` — `B` color palette, `TYPE_META`, `TYPE_SORT_ORDER`, `STATUS_META`
- `src/helpers.js` — `sortCatalogTiles()`, `filterCatalogByQuery()`; inline styles throughout
- `src/index.css` — minimal global styles, `.marketplace-app` flex layout, 760px mobile breakpoint
- `docs/superpowers/specs/2026-05-27-right-side-detail-panel-design.md` — approved panel design with dimensions (380px/30vw), animation (200ms slide), component architecture, interaction spec

### Institutional Learnings

- No `docs/solutions/` directory exists. Completed plans and design specs are the closest proxy for institutional knowledge.

### External References

- None needed — strong local patterns and approved design spec.

---

## Key Technical Decisions

- **Follow approved panel spec.** The design spec at `docs/superpowers/specs/2026-05-27-right-side-detail-panel-design.md` specifies exact dimensions (380px/30vw), animation (200ms slide), and component architecture. The plan implements it directly rather than re-designing.
- **Home + Browse only for panel integration.** The approved spec mentions DiscoverySubmit, but origin requirements scope panel to Home and Browse pages only. Pipeline page deferred.
- **Include mobile responsive per spec.** The spec includes <760px full-width overlay behavior. Origin scopes "desktop-first" but the spec's mobile behavior is low-cost and already designed.
- **Category grouping via new helper.** Add `groupTilesByCategory()` to `helpers.js` following the pattern of existing `sortCatalogTiles()`. Returns a `Map<string, Tile[]>` keyed by category name.
- **Inline styles maintained.** No CSS modules or Tailwind introduction. Panel transitions added to `index.css` as the spec requires `@keyframes` or transition classes not achievable inline.

---

## Open Questions

### Resolved During Planning

- Panel width: `width: max(380px, 30vw)` per approved spec — minimum 380px, scaling to 30vw on viewports wider than ~1267px
- Panel content: identical to TileModal body per spec
- Animation: 200ms translateX slide per spec
- Category sort order: categories sorted alphabetically by name; tiles within each category follow existing `TYPE_SORT_ORDER` then alphabetical

### Deferred to Implementation

- Exact headline copy and sidebar tab name — content design decision during implementation
- Category heading styling — visual design decision following existing SubLabel pattern
- Panel scrollbar styling — visual polish during implementation

---

## Implementation Units

### U1. Home page value prop and sidebar rename

**Goal:** Add a prominent value-prop headline to the home page and rename the sidebar navigation label from "Home" to a descriptive name that reinforces the headline framing.

**Requirements:** R1, R2, R3

**Dependencies:** None

**Files:**
- Modify: `src/pages/PageHome.jsx`
- Modify: `src/components/Sidebar.jsx`

**Approach:**
- In `Sidebar.jsx`, change `label:"Home"` in the NAV array to the chosen descriptive name (e.g., "Overview" or "Start Here"). The exact name is a content decision during implementation.
- In `PageHome.jsx`, add a headline section between the SNSearchCard and the search results block. The headline communicates the four value dimensions (discover, find, see, contribute) in a prominent heading with supporting copy. Style using `B` constants, matching the existing visual language. Ensure it renders above the fold on a 1280px-wide viewport without scrolling past the search card.
- The existing SNSearchCard `heading` prop ("What do you need to do today?") may be adjusted or kept — the new headline is a separate element above or alongside the search card.

**Patterns to follow:**
- `SubLabel` component for section labels
- `B` color constants for all styling
- Inline style objects matching existing page structure

**Test scenarios:**
- Happy path: Home page renders headline with all four value dimensions visible; sidebar shows updated label
- Edge case: Headline doesn't push featured tiles below the fold on 1280x800 viewport
- Integration: Clicking sidebar label navigates to home page as before

**Verification:**
- Home page shows value-prop headline above the fold
- Sidebar shows descriptive label instead of "Home"
- Both elements are visually cohesive and use design tokens

---

### U2. Category grouping in Browse

**Goal:** Group tiles by category within each Browse type tab, with visually distinct section headings and hidden empty categories.

**Requirements:** R4, R5, R6, R7

**Dependencies:** None

**Files:**
- Modify: `src/pages/PageBrowse.jsx`
- Modify: `src/helpers.js`

**Approach:**
- Add `groupTilesByCategory(tiles)` to `helpers.js`. Takes a sorted tile array, returns an array of `{category: string, tiles: Tile[]}` objects — one per category that has tiles, sorted alphabetically by category name. Tiles within each category group retain their existing sort order (type priority, then alphabetical).
- In `PageBrowse.jsx`, after the existing `filtered` useMemo, compute `grouped` as `groupTilesByCategory(filtered)`. Replace the flat grid with a loop over grouped entries. For each group, render a category heading (styled like SubLabel or a new heading element) followed by the tile grid for that group's tiles. Categories with zero tiles are naturally excluded by the helper.
- The existing search/type-filter behavior continues to work — filtering happens before grouping, so only matching tiles appear in their respective category sections.

**Patterns to follow:**
- `sortCatalogTiles()` in `helpers.js` for helper function pattern
- `SubLabel` component for category headings
- Existing tile grid layout (`repeat(auto-fill, minmax(260px, 1fr))`)
- `B` constants for heading styling

**Test scenarios:**
- Happy path: Covers AE1. "Enterprise Skill" tab shows tiles grouped under "Account Intelligence", "Coaching & Strategy", etc. with headings
- Edge case: "All" tab with all tiles shows all populated categories; categories with no tiles for the current type filter are hidden
- Edge case: Text search that matches tiles across multiple categories — each category shows only matching tiles
- Edge case: Type tab with tiles in only one category — single heading shown, no empty sections
- Integration: Clicking a tile in any category section triggers `onSelect` correctly

**Verification:**
- Browse page shows category headings within each type tab
- Empty categories are hidden
- Tiles remain sorted by type priority then alphabetical within each category
- Search and type filtering still work correctly

---

### U3. Right-side detail panel

**Goal:** Replace TileModal with a right-side detail panel that slides in alongside the tile grid, preserving list context and enabling skill comparison.

**Requirements:** R8, R9, R10, R11, R12

**Dependencies:** U2 (Browse page category grouping should be stable before modifying layout)

**Files:**
- Create: `src/components/TilePanel.jsx`
- Modify: `src/pages/PageBrowse.jsx`
- Modify: `src/pages/PageHome.jsx`
- Modify: `src/index.css`
- Delete: `src/components/TileModal.jsx`

**Approach:**
- Create `TilePanel.jsx` following the approved spec. Props: `{ tile, onClose }`. Renders the same content as TileModal (header with type/status pills + name + category, body with desc, useCase callout, type-specific sections, coming-soon callout). Includes copy-to-clipboard for triggers. Panel is 380px wide (`max(380px, 30vw)`), sticky, with `overflow-y: auto`.
- In `PageBrowse.jsx`, replace the `<TileModal>` conditional render with a flex layout: `<div style={{display:'flex'}}>` containing the tile grid area (`flex:1`) and `<TilePanel>` (fixed width). `selectedTile` state already exists. Panel enter/exit uses CSS transition on `transform: translateX`. Clicking the same tile closes the panel. Escape key calls `onClose`.
- In `PageHome.jsx`, same pattern. Wrap the existing content area in a flex container. Panel appears alongside the search + featured tiles area when a tile is selected. Also update search result click handlers (currently call `setSelectedTile`) to work with the panel.
- Add panel transition styles to `index.css`: enter animation `translateX(100%)` to `translateX(0)` 200ms ease-out, exit reverse. Grid width transition 200ms ease. No backdrop overlay. Content swap (different card while open) is instant — no animation.
- Add mobile responsive behavior: below 760px breakpoint, panel becomes full-width overlay with slide-up from bottom.
- Add keyboard handling: `useEffect` in TilePanel (or parent pages) listens for `keydown 'Escape'` and calls `onClose` when panel is open. Clean up listener on unmount. On panel open, move focus to the panel container or close button. On panel close, return focus to the TileCard that was clicked.
- selectedTile is component-local to each page — panel state never persists across page navigation via sidebar.
- Delete `TileModal.jsx`. Remove any remaining imports from both pages.

**Patterns to follow:**
- `TileModal.jsx` body content — extract panel body from this component
- Inline styles with `B` constants
- `TagPill`, `Callout`, `SubLabel` components used in TileModal
- Existing `.marketplace-app` flex layout in `index.css`
- 760px breakpoint in `index.css` for mobile responsive

**Test scenarios:**
- Happy path: Covers AE2. Clicking "Account Command Center" opens right-side panel with full details; grid compresses but stays visible. Clicking "Deal Coach" updates panel instantly without close/reopen.
- Happy path: Covers AE3. Close button and Escape key dismiss panel; grid returns to full width.
- Edge case: Panel opens from search results on home page (not just featured tiles)
- Edge case: Opening panel on a tile near the bottom of a long list — panel stays sticky, scrollable independently
- Edge case: Covers AE2 variant. Rapid clicking between tiles — content swaps without visual glitch
- Integration: Panel works in both Browse (with category groups from U2) and Home (with featured tiles)
- Integration: All TileModal content renders correctly in panel — desc, useCase, triggers, CSP link, coming-soon callout
- Integration: Copy-to-clipboard for trigger phrases works in panel

**Verification:**
- Clicking any tile opens a right-side panel (no centered modal)
- Tile list remains visible and scrollable while panel is open
- Clicking different tiles swaps content instantly
- Close button, same-tile click, and Escape all dismiss the panel
- Panel shows all content previously shown in TileModal
- TileModal.jsx is deleted with no remaining imports
- Mobile: panel becomes full-width overlay below 760px

---

## System-Wide Impact

- **Interaction graph:** TileCard's `onSelect` prop pattern unchanged — parent pages still control selectedTile state. Panel replaces TileModal as the rendering target.
- **State lifecycle risks:** None — selectedTile state management is identical, just the rendering changes. No persistence, no API calls. Panel state is component-local to each page and resets on navigation — panel never persists across sidebar page transitions.
- **API surface parity:** Pipeline page (DiscoverySubmit) still uses any existing TileModal reference — deferred per scope. If it imports TileModal, the import will break. This should be caught during implementation or flagged as a follow-up.
- **Unchanged invariants:** Search functionality, type filtering, catalog data loading, admin CRUD, idea pipeline — all untouched.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| TileModal import in DiscoverySubmit breaks after deletion | Search codebase for TileModal imports; either update or note as known break for follow-up |
| Headline copy feels generic or doesn't land with leadership | Defer exact copy to implementation with quick iteration; use the four value dimensions as guardrails |
| Category grouping makes Browse page feel dense with many headings | Start with all categories expanded (no collapse); add collapse later if feedback warrants it |
| Panel width too narrow for long trigger phrases on small screens | Spec uses max(380px, 30vw) which scales; monitor during implementation |

---

## Documentation / Operational Notes

- Update `README.md` if the home page description or component list changes
- The approved panel spec (`docs/superpowers/specs/2026-05-27-right-side-detail-panel-design.md`) should be marked as implemented once U3 ships
- No backend or deployment changes — static SPA only

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-27-marketplace-ux-refresh-requirements.md](docs/brainstorms/2026-05-27-marketplace-ux-refresh-requirements.md)
- **Approved panel spec:** [docs/superpowers/specs/2026-05-27-right-side-detail-panel-design.md](docs/superpowers/specs/2026-05-27-right-side-detail-panel-design.md)
- Related code: `src/components/TileModal.jsx`, `src/pages/PageBrowse.jsx`, `src/pages/PageHome.jsx`
