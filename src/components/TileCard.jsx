import { useState } from 'react'
import { B, STATUS_META, TYPE_META } from '../constants'
import { TagPill } from './TagPill'

export const TileCard = ({tile, onSelect}) => {
  const [hov, setHov] = useState(false);
  const tm = TYPE_META[tile.type];
  const sm = STATUS_META[tile.status];
  const available = tile.status === "now";
  return (
    <div onClick={() => onSelect(tile)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{background:B.white, border:`1px solid ${hov?B.snGreen:B.border}`,
        borderRadius:10, padding:"16px 18px", cursor:"pointer",
        boxShadow: hov?"0 4px 16px rgba(3,45,66,0.10)":"0 1px 3px rgba(3,45,66,0.05)",
        transition:"box-shadow 0.15s, border-color 0.15s", display:"flex", flexDirection:"column"}}>
      <div style={{display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center"}}>
        <TagPill color={tm.color}>{tm.icon} {tm.label}</TagPill>
        {tile.status !== "now" && <TagPill color={sm.color}>{sm.label}</TagPill>}
      </div>
      <div style={{fontSize:15, fontWeight:700, color:B.text, marginBottom:4, lineHeight:1.3}}>{tile.name}</div>
      <div style={{fontSize:11, color:B.dim, marginBottom:8, letterSpacing:"0.2px"}}>
        {tile.cat}
      </div>
      <div style={{fontSize:13, color:B.muted, lineHeight:1.55, flex:1, marginBottom:12}}>{tile.desc}</div>
      <div style={{fontSize:11.5, fontWeight:600,
        color: available ? B.snGreen : B.dim}}>
        {!available ? "Coming Soon" :
         tile.type === "in-platform" ? "Available in CSP →" :
         tile.type === "enterprise-skill" ? `Say: "${tile.triggers?.[0]}" →` :
         tile.type === "local-skill" ? "Download & Install →" :
         "Automated · Running"}
      </div>
    </div>
  );
};

// ── TileModal ─────────────────────────────────────────────────────────────────
