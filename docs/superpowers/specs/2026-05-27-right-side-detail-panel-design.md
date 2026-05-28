# Right-Side Detail Panel — Design Spec

**Date:** 2026-05-27
**Status:** Approved
**Replaces:** TileModal (centered overlay)

## Decision

Replace the centered TileModal with a right-side detail panel. The panel slides in when a card is selected and stays alongside the card grid so users maintain browsing context.

## Layout

- Panel is 380px wide (`max(380px, 30vw)` for responsive)
- Panel slides in from the right edge of the `<main>` content area
- Card grid compresses to fill remaining width — no changes to grid CSS, the container just gets narrower
- Panel has `overflow-y: auto`, `max-height: 100vh`, `position: sticky; top: 0`
- Left edge of panel: `1px solid B.border` + `box-shadow: -4px 0 16px rgba(3,45,66,0.06)` for depth separation

## Animation

- **Panel enter:** `transform: translateX(100%)` to `translateX(0)`, 200ms ease-out
- **Panel exit:** reverse — `translateX(0)` to `translateX(100%)`, 200ms ease-in
- **Grid width transition:** 200ms ease to match panel timing
- **Content swap (different card while open):** no animation — instant content update

## Panel Content

Same content structure as current TileModal body:

1. **Header bar** — blue background (`B.blue`), contains:
   - TagPill for type
   - TagPill for status (if not "now")
   - Tile name (20px, bold, white)
   - Category (12px, dimmed)
   - Close button (✕, top-right)
2. **Scrollable body:**
   - "What it does" — tile.desc
   - "When to use it" — tile.useCase in wasabi callout
   - Type-specific sections:
     - enterprise-skill: trigger phrases with copy-to-clipboard
     - local-skill: trigger phrases + SharePoint download link
     - in-platform: "Open in CSP" link
     - automated: explanation text
   - Coming soon callout for non-available tiles

## Interaction

- **Click card** → panel opens (or content swaps if already open)
- **Click different card while panel open** → content swaps instantly, no close/reopen
- **Close button (✕)** → panel slides out, grid expands back to full width
- **No backdrop** — panel sits alongside grid, no overlay dimming
- **Keyboard:** Escape closes panel

## Responsive

Below 760px (existing mobile breakpoint in index.css):
- Panel becomes full-width overlay (covers entire main area)
- Standard slide-up from bottom with backdrop, similar to mobile sheet

## Component Architecture

### New Component: `TilePanel.jsx`

- Props: `{ tile, onClose }`
- Renders the panel content (extracted from TileModal body)
- Handles copy-to-clipboard for triggers
- Contains its own scroll container

### Modified: `PageBrowse.jsx`

- Add `selectedTile` state (already exists)
- Render `TilePanel` conditionally alongside the card grid
- Wrap grid + panel in a flex container
- Grid area gets `flex: 1`, panel gets fixed width
- Panel enter/exit controlled by CSS transition on a wrapper

### Modified: `PageHome.jsx`

- Same pattern as PageBrowse

### Modified: `DiscoverySubmit.jsx`

- Same pattern (if detail view is needed there)

### Deleted: `TileModal.jsx`

- Replaced entirely by `TilePanel.jsx`

## Files

| Action | File |
|--------|------|
| Create | `src/components/TilePanel.jsx` |
| Modify | `src/pages/PageBrowse.jsx` |
| Modify | `src/pages/PageHome.jsx` |
| Modify | `src/pages/pipeline/DiscoverySubmit.jsx` |
| Delete | `src/components/TileModal.jsx` |
| Modify | `src/index.css` — add panel transition styles |
