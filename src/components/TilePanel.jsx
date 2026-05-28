import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  const copyTrigger = (t) => {
    navigator.clipboard?.writeText(t).catch(() => {});
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  };

  return createPortal(
    <>
      <div className="detail-panel-backdrop" onClick={onClose} />
      <div className="detail-panel-slide">
        <div style={{
          height: "100%", display: "flex", flexDirection: "column",
          background: B.white, boxShadow: "-6px 0 24px rgba(3,45,66,0.10)",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{background: B.blue, padding: "20px 24px 24px", position: "relative", flexShrink: 0}}>
            <button onClick={onClose}
              style={{position: "absolute", top: 10, right: 12,
                background: "none", border: "none", color: "rgba(255,255,255,0.45)",
                cursor: "pointer", fontSize: 15, padding: 4, lineHeight: 1,
                transition: "color 0.15s"}}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>✕</button>
            <div style={{display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap"}}>
              <TagPill color={tm.color} onDark>{tm.icon} {tm.label}</TagPill>
              {tile.status !== "now" && <TagPill color={sm.color} onDark>{sm.label}</TagPill>}
            </div>
            <div style={{fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2, paddingRight: 24, marginTop: 4}}>{tile.name}</div>
            <div style={{fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4}}>{tile.cat}</div>
          </div>

          {/* Body */}
          <div style={{padding: "20px 24px", overflowY: "auto", flex: 1}}>
            <SubLabel>What it does</SubLabel>
            <div style={{fontSize: 14, color: B.muted, lineHeight: 1.6, marginBottom: 24}}>{tile.desc}</div>

            <SubLabel>When to use it</SubLabel>
            <div style={{fontSize: 14, color: B.muted, lineHeight: 1.6, marginBottom: 24}}>{tile.useCase}</div>

            {(tile.type === "enterprise-skill" || tile.type === "local-skill") && tile.triggers && available && (
              <>
                <SubLabel>How to activate</SubLabel>
                {tile.type === "enterprise-skill" && (
                  <div style={{fontSize: 14, color: B.muted, lineHeight: 1.6, marginBottom: 16}}>
                    Pre-loaded for all CEG users. Just type any trigger phrase in Claude:
                  </div>
                )}
                {tile.type === "local-skill" && (
                  <div style={{fontSize: 14, color: B.muted, lineHeight: 1.6, marginBottom: 16}}>
                    Download the skill file from SharePoint, install via Claude Settings, then use a trigger:
                  </div>
                )}
                <div style={{display: "flex", flexDirection: "column", gap: 6, marginBottom: 24}}>
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
                <div style={{fontSize: 14, color: B.muted, lineHeight: 1.6, marginBottom: 16}}>
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
                <div style={{fontSize: 14, color: B.muted, lineHeight: 1.6, marginBottom: 16}}>
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
      </div>
    </>,
    document.body
  );
};
