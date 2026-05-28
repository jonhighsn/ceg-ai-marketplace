import { B } from '../constants'

export const SubLabel = ({children}) => (
  <span style={{fontSize:11,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",
    color:B.blue,marginBottom:8,marginTop:18,display:"block",
    borderBottom:`2px solid ${B.wasabi}`,paddingBottom:4}}>{children}</span>
);
