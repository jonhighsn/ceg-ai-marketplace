import { B, SKILL_REPO_URL } from '../constants'

const NAV = [
  {id:"home",  icon:"🏠", label:"Overview"},
  {id:"browse",icon:"🗂",  label:"Browse Catalog"},
  {id:"submit",icon:"🚀", label:"Pipeline"},
];

export const Sidebar = ({page, onPage}) => {
  return (
    <div style={{width:220, flexShrink:0, background:B.blue, display:"flex",
      flexDirection:"column", minHeight:"100vh", position:"sticky", top:0}}>
      {/* Logo */}
      <div style={{padding:"20px 18px 14px"}}>
        <img src="/ServiceNow_logo_RGB_White_WasabiGreen.png" alt="ServiceNow" style={{height:20, marginBottom:8}}/>
        <div style={{fontSize:15, fontWeight:700, color:"#fff", lineHeight:1.2}}>CEG AI Marketplace</div>
      </div>


      {/* Nav items */}
      <div style={{padding:"10px 8px", flex:1}}>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => onPage(n.id)}
              style={{width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"10px 10px", borderRadius:7, marginBottom:2,
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                border: `1px solid ${active ? "rgba(255,255,255,0.15)" : "transparent"}`,
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                fontSize:13.5, fontWeight: active ? 700 : 500,
                cursor:"pointer", textAlign:"left", fontFamily:"inherit"}}>
              <span style={{fontSize:16}}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <button
          onClick={() => onPage("admin")}
          aria-label="Admin"
          title="Admin"
          style={{
            marginBottom:10, background:"none", border:"none",
            color:"rgba(255,255,255,0.3)", cursor:"pointer",
            fontSize:16, padding:"4px 2px", display:"flex",
            alignItems:"center", gap:6, fontFamily:"inherit",
            transition:"color 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
        >
          ⚙️
        </button>
        <a href={SKILL_REPO_URL} target="_blank" rel="noreferrer"
          style={{display:"flex", alignItems:"center", gap:7,
            color:"rgba(255,255,255,0.45)", fontSize:11.5, textDecoration:"none"}}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
          📦 Skill File Repository →
        </a>

      </div>
    </div>
  );
};
