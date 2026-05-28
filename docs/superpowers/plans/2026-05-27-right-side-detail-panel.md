# Right-Side Detail Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the centered TileModal with a slide-in right-side detail panel that keeps browsing context visible.

**Architecture:** A new `TilePanel.jsx` component renders alongside each page's card grid inside a flex container. The grid gets `flex:1` and the panel gets a fixed 380px width with CSS transitions for enter/exit. Pages that currently use `TileModal` switch to `TilePanel` wrapped in a shared layout helper.

**Tech Stack:** React 19, inline styles, CSS transitions in `index.css`, no external libraries.

---

### Task 1: Create TilePanel component

**Files:**
- Create: `src/components/TilePanel.jsx`

- [ ] **Step 1: Create `TilePanel.jsx`**

The component extracts the body content from `TileModal.jsx` (header + scrollable body) and adds Escape key handling. It renders as a flex column with fixed width and sticky positioning.

```jsx
import { useEffect, useState } from 'react'
import { B, SKILL_REPO_URL, STATUS_META, TYPE_META } from '../constants'
import { Callout } from './Callout'
import { SubLabel } from './SubLabel'
import { TagPill } from './TagPill'

export const TilePanel = ({ tile, onClose }) => {
  const [copied, setCopied] = useState(null);
  const tm = TYPE_META[tile.type];
  const sm = STATUS_META[tile.status];
  const available = tile.status === "now";

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const copyTrigger = (t) => {
    navigator.clipboard?.writeText(t).catch(() => {});
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{
      width: "min(380px, 30vw)", flexShrink: 0,
      background: B.white, borderLeft: `1px solid ${B.border}`,
      boxShadow: "-4px 0 16px rgba(3,45,66,0.06)",
      display: "flex", flexDirection: "column",
      maxHeight: "100vh", position: "sticky", top: 0,
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{background: B.blue, padding: "20px 24px", flexShrink: 0}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
          <div style={{minWidth: 0}}>
            <div style={{display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap"}}>
              <TagPill color={tm.color}>{tm.icon} {tm.label}</TagPill>
              {tile.status !== "now" && <TagPill color={sm.color}>{sm.label}</TagPill>}
            </div>
            <div style={{fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2}}>{tile.name}</div>
            <div style={{fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4}}>{tile.cat}</div>
          </div>
          <button onClick={onClose}
            style={{background: "rgba(255,255,255,0.12)", border: "none", color: "#fff",
              width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>✕</button>
        </div>
      </div>
      {/* Body */}
      <div style={{padding: "20px 24px", overflowY: "auto", flex: 1}}>
        <SubLabel>What it does</SubLabel>
        <div style={{fontSize: 14, color: B.muted, lineHeight: 1.65, marginBottom: 16}}>{tile.desc}</div>

        <SubLabel>When to use it</SubLabel>
        <div style={{fontSize: 14, color: B.muted, lineHeight: 1.65, marginBottom: 16,
          background: B.wasabiBg, padding: "10px 14px", borderRadius: 6,
          borderLeft: `3px solid ${B.wasabi}`}}>{tile.useCase}</div>

        {(tile.type === "enterprise-skill" || tile.type === "local-skill") && tile.triggers && available && (
          <>
            <SubLabel>How to activate</SubLabel>
            {tile.type === "enterprise-skill" && (
              <div style={{fontSize: 13, color: B.muted, marginBottom: 10}}>
                Pre-loaded for all CEG users. Just type any trigger phrase in Claude:
              </div>
            )}
            {tile.type === "local-skill" && (
              <div style={{fontSize: 13, color: B.muted, marginBottom: 10}}>
                Download the skill file from SharePoint, install via Claude Settings, then use a trigger:
              </div>
            )}
            <div style={{display: "flex", flexDirection: "column", gap: 6, marginBottom: 16}}>
              {tile.triggers.map(t => (
                <div key={t} onClick={() => copyTrigger(t)}
                  style={{display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: B.accentBg, border: `1px solid ${B.border}`, borderRadius: 6,
                    padding: "8px 12px", cursor: "pointer", transition: "background 0.1s"}}
                  onMouseEnter={e => e.currentTarget.style.background = B.wasabiBg}
                  onMouseLeave={e => e.currentTarget.style.background = B.accentBg}>
                  <span style={{fontSize: 13, fontFamily: "monospace", color: B.text}}>"{t}"</span>
                  <span style={{fontSize: 11, color: copied === t ? "#1a6010" : B.snGreen, fontWeight: 600}}>
                    {copied === t ? "✓ Copied!" : "Copy"}
                  </span>
                </div>
              ))}
            </div>
            {tile.type === "local-skill" && (
              <a href={SKILL_REPO_URL} target="_blank" rel="noreferrer"
                style={{display: "inline-flex", alignItems: "center", gap: 6,
                  background: B.blue, color: "#fff", fontWeight: 700, fontSize: 13,
                  padding: "10px 18px", borderRadius: 6, textDecoration: "none"}}>
                📦 Download from SharePoint →
              </a>
            )}
          </>
        )}

        {tile.type === "in-platform" && tile.url && available && (
          <>
            <SubLabel>Where to find it</SubLabel>
            <div style={{fontSize: 13, color: B.muted, marginBottom: 12}}>
              Available directly within the CSP platform. No separate installation required.
            </div>
            <a href={tile.url} target="_blank" rel="noreferrer"
              style={{display: "inline-flex", alignItems: "center", gap: 6,
                background: B.teal, color: "#fff", fontWeight: 700, fontSize: 13,
                padding: "10px 18px", borderRadius: 6, textDecoration: "none"}}>
              ⚡ Open in CSP →
            </a>
          </>
        )}

        {tile.type === "automated" && available && (
          <>
            <SubLabel>How it works</SubLabel>
            <div style={{fontSize: 13, color: B.muted, lineHeight: 1.65, marginBottom: 12}}>
              This workflow runs automatically — no action needed from you.
              Contact CEG Strategic Operations to confirm you're on the distribution list.
            </div>
          </>
        )}

        {!available && (
          <Callout type="info" icon="🗓">
            <strong>{sm.label}:</strong> This capability is on the roadmap and not yet available.
            Submit an idea or upvote a similar request in the <span style={{fontWeight: 700}}>Submit Idea</span> tab.
          </Callout>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify file created**

Run: `ls -la src/components/TilePanel.jsx`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add src/components/TilePanel.jsx
git commit -m "feat: add TilePanel component extracted from TileModal"
```

---

### Task 2: Add panel CSS transitions to index.css

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add panel transition styles**

Append these rules to the end of `src/index.css`, after the existing `@media` block (after line 70):

```css
/* Detail panel transitions */
.detail-panel-container {
  display: flex;
  min-height: 0;
}

.detail-panel-grid {
  flex: 1;
  min-width: 0;
  transition: all 200ms ease;
}

.detail-panel-enter {
  animation: panelSlideIn 200ms ease-out both;
}

.detail-panel-exit {
  animation: panelSlideOut 200ms ease-in both;
}

@keyframes panelSlideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes panelSlideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* Mobile: panel becomes full-width overlay */
@media (max-width: 760px) {
  .detail-panel-container {
    position: relative;
  }

  .detail-panel-container .detail-panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3,45,66,0.45);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: stretch;
  }

  .detail-panel-container .detail-panel-overlay > div {
    width: 100%;
    max-height: 85vh;
    border-left: none;
    box-shadow: 0 -8px 30px rgba(3,45,66,0.15);
  }
}
```

- [ ] **Step 2: Verify CSS parses**

Run: `head -5 src/index.css && echo "---" && tail -10 src/index.css`
Expected: file starts with `:root` block and ends with mobile overlay media query

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add detail panel CSS transitions and mobile overlay"
```

---

### Task 3: Update PageBrowse to use TilePanel

**Files:**
- Modify: `src/pages/PageBrowse.jsx`

- [ ] **Step 1: Replace TileModal import and usage with TilePanel**

In `src/pages/PageBrowse.jsx`:

**Line 5** — change the import:
```
// FROM:
import { TileModal } from '../components/TileModal'
// TO:
import { TilePanel } from '../components/TilePanel'
```

**Lines 66-79** — wrap the grid + panel in the flex container:

Replace the block from `{/* Tile grid */}` through the end TileModal line (lines 66-79) with:

```jsx
      {/* Tile grid + detail panel */}
      <div className="detail-panel-container">
        <div className="detail-panel-grid">
          {filtered.length > 0 ? (
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14}}>
              {filtered.map(t => <TileCard key={t.id} tile={t} onSelect={setSelectedTile} />)}
            </div>
          ) : (
            <div style={{textAlign:"center", padding:"40px 20px",
              background:B.white, border:`1px solid ${B.border}`, borderRadius:10}}>
              <div style={{fontSize:32, marginBottom:12}}>🔍</div>
              <div style={{fontSize:15, fontWeight:600, color:B.text, marginBottom:6}}>No capabilities match this filter</div>
              <div style={{fontSize:13, color:B.muted}}>Try a different type or role filter</div>
            </div>
          )}
        </div>
        {selectedTile && (
          <div className={selectedTile ? "detail-panel-enter" : "detail-panel-exit"}>
            <TilePanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
          </div>
        )}
      </div>
```

- [ ] **Step 2: Verify file syntax**

Run: `npx -y acorn-loose --ecma2020 src/pages/PageBrowse.jsx > /dev/null 2>&1 && echo "OK" || echo "Parse error"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add src/pages/PageBrowse.jsx
git commit -m "feat: wire TilePanel into PageBrowse with flex layout"
```

---

### Task 4: Update PageHome to use TilePanel

**Files:**
- Modify: `src/pages/PageHome.jsx`

- [ ] **Step 1: Replace TileModal import and usage with TilePanel**

In `src/pages/PageHome.jsx`:

**Line 7** — change the import:
```
// FROM:
import { TileModal } from '../components/TileModal'
// TO:
import { TilePanel } from '../components/TilePanel'
```

**Lines 154-164** — wrap the featured tiles grid + panel:

Replace the block from `{/* Featured tiles */}` through the TileModal line (lines 154-164) with:

```jsx
      {/* Featured tiles + detail panel */}
      <div className="detail-panel-container">
        <div className="detail-panel-grid">
          <div style={{marginBottom: 8}}>
            <SubLabel>In-Platform Capabilities</SubLabel>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14}}>
            {featuredTiles.map(t => (
              <TileCard key={t.id} tile={t} onSelect={setSelectedTile} />
            ))}
          </div>
        </div>
        {selectedTile && (
          <div className="detail-panel-enter">
            <TilePanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
          </div>
        )}
      </div>
```

- [ ] **Step 2: Verify file syntax**

Run: `npx -y acorn-loose --ecma2020 src/pages/PageHome.jsx > /dev/null 2>&1 && echo "OK" || echo "Parse error"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add src/pages/PageHome.jsx
git commit -m "feat: wire TilePanel into PageHome with flex layout"
```

---

### Task 5: Update DiscoverySubmit to use TilePanel

**Files:**
- Modify: `src/pages/pipeline/DiscoverySubmit.jsx`

- [ ] **Step 1: Replace TileModal import and usage with TilePanel**

In `src/pages/pipeline/DiscoverySubmit.jsx`:

**Line 5** — change the import:
```
// FROM:
import { TileModal } from '../../components/TileModal'
// TO:
import { TilePanel } from '../../components/TilePanel'
```

**Line 143** — replace the TileModal usage:

Replace:
```jsx
      {selectedTile && <TileModal tile={selectedTile} onClose={() => setSelectedTile(null)} />}
```

With:
```jsx
      {selectedTile && (
        <div className="detail-panel-container">
          <div className="detail-panel-grid" />
          <div className="detail-panel-enter">
            <TilePanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
          </div>
        </div>
      )}
```

Note: DiscoverySubmit has no grid — the panel overlays alongside the search results. The empty `detail-panel-grid` div reserves no space.

- [ ] **Step 2: Verify file syntax**

Run: `npx -y acorn-loose --ecma2020 src/pages/pipeline/DiscoverySubmit.jsx > /dev/null 2>&1 && echo "OK" || echo "Parse error"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add src/pages/pipeline/DiscoverySubmit.jsx
git commit -m "feat: wire TilePanel into DiscoverySubmit"
```

---

### Task 6: Delete TileModal and clean up exports

**Files:**
- Delete: `src/components/TileModal.jsx`

- [ ] **Step 1: Verify no remaining TileModal imports**

Run: `grep -r "TileModal" src/`
Expected: no output (all references replaced in Tasks 3-5)

- [ ] **Step 2: Delete TileModal.jsx**

Run: `rm src/components/TileModal.jsx`

- [ ] **Step 3: Verify app starts**

Run: `npm run dev`
Expected: Vite dev server starts with no errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove TileModal replaced by TilePanel"
```

---

### Task 7: Manual verification

**Files:** None (testing only)

- [ ] **Step 1: Start dev server and open in browser**

Run: `npm run dev`

Open the URL shown (typically `http://localhost:5173`).

- [ ] **Step 2: Verify Browse page**

1. Click "Browse" in sidebar
2. Click any card → panel should slide in from right
3. Verify panel shows header (blue bg), description, "when to use", and type-specific content
4. Click a different card while panel is open → content should swap instantly (no slide animation)
5. Click ✕ close button → panel slides out, grid expands back
6. Press Escape while panel is open → panel closes

- [ ] **Step 3: Verify Home page**

1. Click "Home" in sidebar
2. Click a featured In-Platform card → panel slides in
3. Verify same content structure
4. Close panel via ✕

- [ ] **Step 4: Verify Submit Idea page**

1. Click "Submit Idea" in sidebar
2. Search for something that matches (e.g. "QBR")
3. Click a search result → panel should appear
4. Close panel

- [ ] **Step 5: Verify mobile responsive**

1. Resize browser to <760px width
2. Click a card → panel should become full-width overlay from bottom
3. Close panel

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address visual issues from manual verification"
```
