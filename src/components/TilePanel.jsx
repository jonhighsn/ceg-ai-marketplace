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
