import { useState } from 'react'
import { B } from '../constants'
import { Sparkle } from './Sparkle'

export const SNSearchCard = ({
  eyebrow,
  heading,
  helperLines = [],
  placeholder,
  value,
  onChange,
  onSubmit,
  loading,
  submitLabel = "Search",
  loadingLabel = "Thinking...",
}) => {
  const [focused, setFocused] = useState(false);
  const canSubmit = value.trim() && !loading;

  return (
    <div style={{
      background: B.blue,
      borderRadius: 16,
      padding: "28px 28px 24px",
      marginBottom: 24,
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s cubic-bezier(0.22,1,0.36,1)",
      transform: loading ? "scale(0.985)" : "scale(1)",
      boxShadow: loading
        ? "0 2px 12px rgba(3,45,66,0.12)"
        : "0 4px 24px rgba(3,45,66,0.08)",
    }}>
      {/* Dot-grid texture */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", opacity:0.06,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize:"24px 24px",
      }}/>

      {/* Sparkles — activate during loading */}
      <Sparkle size={44} style={{
        position:"absolute", top:14, right:90,
        animation: loading ? "sparkleDrift 1.8s ease-in-out infinite" : "none",
        opacity: loading ? undefined : 0.18,
        transform:"rotate(-15deg)",
        transition:"opacity 0.3s",
      }}/>
      <Sparkle size={22} style={{
        position:"absolute", top:10, right:52,
        animation: loading ? "sparkleDrift 2.2s ease-in-out infinite 0.4s" : "none",
        opacity: loading ? undefined : 0.12,
        transform:"rotate(10deg)",
        transition:"opacity 0.3s",
      }}/>
      <Sparkle size={18} style={{
        position:"absolute", bottom:18, right:24,
        animation: loading ? "sparkleDrift 1.6s ease-in-out infinite 0.8s" : "none",
        opacity: loading ? undefined : 0.10,
        transition:"opacity 0.3s",
      }}/>

      <div style={{position:"relative"}}>
        {/* Eyebrow */}
        {eyebrow && (
          <div style={{
            fontSize:10, fontWeight:700, letterSpacing:"2px",
            textTransform:"uppercase", color:B.wasabi, marginBottom:8,
            transition:"opacity 0.3s",
            opacity: loading ? 0.6 : 1,
          }}>
            {eyebrow}
          </div>
        )}

        {/* Heading */}
        {heading && (
          <div style={{
            fontSize:22, fontWeight:700, color:"#fff",
            lineHeight:1.2, marginBottom:20,
            transition:"opacity 0.3s",
            opacity: loading ? 0.7 : 1,
          }}>
            {heading}
          </div>
        )}

        {/* Input card */}
        <div style={{
          background:"rgba(255,255,255,0.96)",
          borderRadius:14,
          padding:"14px 16px 12px",
          boxShadow: focused
            ? `0 0 0 2px ${B.wasabi}, 0 8px 32px rgba(0,0,0,0.18)`
            : "0 4px 24px rgba(0,0,0,0.18)",
          transition:"box-shadow 0.2s",
          marginBottom:16,
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Scan pulse bar */}
          {loading && (
            <div style={{
              position:"absolute", top:0, left:0, right:0,
              height:3,
              background:`linear-gradient(90deg, transparent, ${B.wasabi}, transparent)`,
              animation:"scanPulse 1.4s ease-in-out infinite",
              borderRadius:"14px 14px 0 0",
            }}/>
          )}

          {/* Textarea */}
          <textarea
            value={value}
            onChange={loading ? undefined : onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); onSubmit(); } }}
            placeholder={placeholder}
            rows={2}
            readOnly={loading}
            style={{
              width:"100%", background:"transparent", border:"none",
              outline:"none", resize:"none", fontFamily:"inherit",
              fontSize:14.5, color:B.text, lineHeight:1.55,
              caretColor:B.blue, boxSizing:"border-box",
              opacity: loading ? 0.5 : 1,
              transition:"opacity 0.3s",
              cursor: loading ? "default" : "text",
              "::placeholder":{ color:B.dim },
            }}
          />

          {/* Action row */}
          <div style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            marginTop:8, paddingTop:8,
            borderTop:"1px solid rgba(3,45,66,0.08)",
          }}>
            <div style={{
              fontSize:11, color:B.dim, letterSpacing:"0.3px",
              transition:"opacity 0.3s",
              opacity: loading ? 0.4 : 1,
            }}>
              {loading ? (
                <span style={{ animation:"breathe 1.6s ease-in-out infinite", color:B.snGreen, fontWeight:600 }}>
                  {loadingLabel}
                </span>
              ) : (
                <>Press <kbd style={{
                  background:"rgba(3,45,66,0.06)", border:"1px solid rgba(3,45,66,0.12)",
                  borderRadius:4, padding:"1px 5px", fontSize:10, fontFamily:"inherit",
                }}>Enter</kbd> to search</>
              )}
            </div>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label={loading ? loadingLabel : submitLabel}
              title={loading ? loadingLabel : submitLabel}
              style={{
                width:36, height:36,
                borderRadius:"50%",
                background: loading
                  ? `linear-gradient(135deg, ${B.wasabi} 0%, #4DC93A 100%)`
                  : canSubmit
                    ? `linear-gradient(135deg, ${B.wasabi} 0%, #4DC93A 100%)`
                    : "rgba(3,45,66,0.10)",
                border:"none",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor: canSubmit ? "pointer" : "default",
                transition:"background 0.2s, transform 0.15s",
                transform: loading ? "scale(1)" : canSubmit ? "scale(1)" : "scale(0.92)",
                animation: loading ? "breathe 1.6s ease-in-out infinite" : "none",
                flexShrink:0,
              }}
              onMouseEnter={e => { if (canSubmit && !loading) e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = (canSubmit && !loading) ? "scale(1)" : "scale(0.92)"; }}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h3l2-4 3 8 2-4h2" stroke={B.blue}
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke={canSubmit ? B.blue : B.dim}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Helper lines */}
        {helperLines.map((line, i) => (
          <div key={i} style={{
            fontSize:12.5, lineHeight:1.6, marginBottom:2,
            color:`rgba(255,255,255,${line.opacity || 0.5})`,
            transition:"opacity 0.3s",
            opacity: loading ? 0.4 : 1,
          }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
};
