import { B } from '../constants'

const LIGHT = {
  green:{bg:"rgba(99,223,78,0.14)",c:"#1a6010",bd:"rgba(99,223,78,0.4)"},
  blue:{bg:"rgba(3,45,66,0.08)",c:B.blue,bd:"rgba(3,45,66,0.2)"},
  teal:{bg:"rgba(129,181,161,0.15)",c:"#2d6a57",bd:"rgba(129,181,161,0.4)"},
  amber:{bg:"rgba(245,158,11,0.10)",c:"#805700",bd:"rgba(245,158,11,0.35)"},
  purple:{bg:"rgba(139,92,246,0.10)",c:"#5b21b6",bd:"rgba(139,92,246,0.35)"},
};
const DARK = {
  green:{bg:"rgba(255,255,255,0.18)",c:"#fff",bd:"rgba(255,255,255,0.25)"},
  blue:{bg:"rgba(255,255,255,0.15)",c:"#fff",bd:"rgba(255,255,255,0.2)"},
  teal:{bg:"rgba(255,255,255,0.18)",c:"#fff",bd:"rgba(255,255,255,0.25)"},
  amber:{bg:"rgba(255,255,255,0.18)",c:"#fff",bd:"rgba(255,255,255,0.25)"},
  purple:{bg:"rgba(255,255,255,0.18)",c:"#fff",bd:"rgba(255,255,255,0.25)"},
};
const fallback = {bg:"rgba(3,45,66,0.08)",c:B.blue,bd:"rgba(3,45,66,0.2)"};

export const TagPill = ({color="green", onDark=false, children}) => {
  const s = (onDark ? DARK : LIGHT)[color] || fallback;
  return <span style={{display:"inline-flex",alignItems:"center",fontSize:10.5,fontWeight:700,padding:"2px 8px",
    borderRadius:4,letterSpacing:"0.3px",textTransform:"uppercase",
    background:s.bg,color:s.c,border:`1px solid ${s.bd}`}}>{children}</span>;
};
