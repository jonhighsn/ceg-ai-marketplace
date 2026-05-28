---
date: 2026-05-27
topic: marketplace-ux-refresh
---

# Marketplace UX Refresh

## Summary

Refresh the CEG AI Marketplace home page with a value-prop headline and descriptive tab name, add category-based grouping within Browse type tabs, and replace the TileModal overlay with a right-side detail panel that preserves list context. Driven by leadership feedback from personal use — they know the skills exist but find the UI slow to navigate.

---

## Problem Frame

CEG leadership uses the marketplace personally to find and invoke AI skills. They report three friction points: the home page doesn't explain what the tool is for on first glance, the Browse page is a flat list sorted only by type with no way to scan by use-case category, and the modal overlay hides the list when reading skill details — making comparison impossible without opening and closing multiple modals. These are not hypothetical — they come from direct feedback from people who know the skills exist but find the current UI slows them down.

---

## Requirements

**Home page value proposition**

R1. The home page displays a prominent headline and supporting copy that communicates four value dimensions: discover available AI tools, find the right skill for a task, see what AI can do for your accounts, and contribute your own use cases.

R2. The headline and copy are visible above the fold on standard laptop screens without scrolling.

R3. The sidebar navigation label for the home page is renamed from "Home" to a descriptive name that aligns with the value-prop headline.

**Catalog grouping**

R4. Within each Browse type tab (All, In-Platform, Enterprise Skill, Local Skill), tiles are grouped under category section headings using the existing `cat` field values.

R5. Category sections are visually distinct — a heading label separates each group.

R6. Tiles retain their existing sort order (type priority, then alphabetical) within each category section.

R7. When a type tab contains no tiles for a given category, that category section is hidden rather than shown empty.

**Right-side detail panel**

R8. Clicking a tile opens its details in a right-side panel instead of a modal overlay.

R9. The tile list remains visible and scrollable while the detail panel is open.

R10. Clicking a different tile while the panel is open updates the panel content without closing and reopening.

R11. The detail panel can be dismissed (close button, clicking the same tile, or keyboard escape) to return to full-width list view.

R12. The detail panel displays the same information currently shown in TileModal: full description, use case, activation triggers with copy-to-clipboard, and CSP links for in-platform items.

---

## Acceptance Examples

- AE1. **Covers R4, R5, R7.** Given a user on the Browse page "Enterprise Skill" tab, when the tab loads, tiles appear grouped under category headings (e.g., "Account Intelligence", "Coaching & Strategy"). Categories with no enterprise-skill tiles are not shown.

- AE2. **Covers R8, R9, R10.** Given a user browsing the tile list, when they click "Account Command Center", a right-side panel opens with full details while the list stays visible. When they then click "Deal Coach" without closing the panel, the panel updates to show Deal Coach details.

- AE3. **Covers R11.** Given a user with the detail panel open showing a skill, when they press Escape or click the close button, the panel closes and the tile list returns to full width.

- AE4. **Covers R1, R3.** Given a first-time user landing on the home page, they see a headline conveying discover, find, see, and contribute — and the sidebar tab name reinforces that framing rather than just saying "Home".

---

## Success Criteria

- Leadership can identify what the marketplace does within 5 seconds of landing on the home page.
- A user can find a relevant skill by scanning category sections without text search.
- A user can compare two skills by clicking between them without losing their place in the list.
- Planning receives clear scope with no need to invent product behavior or interaction patterns.

---

## Scope Boundaries

- Search feedback loop (flagging poor/no results) — explicitly deferred
- Annotating why Top 10/featured skills were chosen — deferred
- Changes to the search algorithm or ranking logic — not in scope
- Mobile-responsive layout for the right-side panel — not in scope (desktop-first)
- Category management or editing — not in scope

---

## Key Decisions

- **Type tabs remain the primary axis, category is secondary within tabs.** Leadership already navigates by type. Category grouping adds structure within each tab rather than replacing the type filter.
- **Right-side panel over inline expansion or modal.** Panel preserves list context and enables comparison without shifting content. Chosen over inline expansion to keep spatial position stable.
- **Tab rename and value-prop headline are paired.** The sidebar label and the page headline reinforce the same framing — they will be designed together, not independently.

---

## Dependencies / Assumptions

- The existing `cat` field on tiles covers the right categories for grouping. Current values: Account Intelligence, Coaching & Strategy, Content & Deliverables, Knowledge, Renewals & Pipeline, System, Value & Adoption.
- The app remains a client-side SPA with no backend. The detail panel and category grouping are frontend-only changes.
- The current TileModal component will be replaced, not maintained in parallel.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R1][Needs research] Exact headline copy and tab name — design decision during implementation
- [Affects R8][Technical] Panel width and responsive behavior on narrower viewports
- [Affects R4][Technical] Default collapse/expand state for category sections when many are present
