export const Callout = ({type="info",icon,children}) => {
  const s={
    info:{bg:"rgba(129,181,161,0.10)",bd:"rgba(129,181,161,0.35)",c:"#2d6a57"},
    warning:{bg:"rgba(245,158,11,0.08)",bd:"rgba(245,158,11,0.35)",c:"#92600a"},
    danger:{bg:"rgba(239,68,68,0.06)",bd:"rgba(239,68,68,0.3)",c:"#a02020"},
    success:{bg:"rgba(99,223,78,0.10)",bd:"rgba(99,223,78,0.35)",c:"#2d6020"},
  }[type];
  return (
    <div style={{display:"flex",gap:10,padding:"12px 14px",borderRadius:6,marginBottom:14,
      fontSize:13.5,lineHeight:1.55,background:s.bg,border:`1px solid ${s.bd}`,color:s.c}}>
      <span style={{flexShrink:0,fontSize:14,marginTop:1}}>{icon}</span><span>{children}</span>
    </div>
  );
};
