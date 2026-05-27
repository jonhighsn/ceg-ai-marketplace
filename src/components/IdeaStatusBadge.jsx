import { IDEA_STATUS_META } from '../constants'

export const IdeaStatusBadge = ({status}) => {
  const meta = IDEA_STATUS_META[status] || IDEA_STATUS_META["under-review"];
  return (
    <span style={{display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700,
      padding:"3px 9px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.4px",
      background:`${meta.dot}18`, color:meta.dot, border:`1px solid ${meta.dot}40`}}>
      <span style={{width:6, height:6, borderRadius:"50%", background:meta.dot, display:"inline-block"}}/>
      {meta.label}
    </span>
  );
};
