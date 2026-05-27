import { useState } from 'react'
import { B } from '../constants'
import { Sparkle } from './Sparkle'

export const SNSearchCard = ({
  eyebrow,
  heading,
  helperLines = [],      // array of {text, opacity} shown below the card
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
    }}>
      {/* Subtle dot-grid texture */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", opacity:0.06,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize:"24px 24px",
      }}/>

      {/* Ambient sparkles */}
      <Sparkle size={44} style={{position:"absolute", top:14, right:90, opacity:0.18, transform:"rotate(-15deg)"}}/>
      <Sparkle size={22} style={{position:"absolute", top:10, right:52, opacity:0.12, transform:"rotate(10deg)"}}/>
      <Sparkle size={18} style={{position:"absolute", bottom:18, right:24, opacity:0.10}}/>

      <div style={{position:"relative"}}>
        {/* Eyebrow */}
        {eyebrow && (
          <div style={{
            fontSize:10, fontWeight:700, letterSpacing:"2px",
            textTransform:"uppercase", color:B.wasabi, marginBottom:8,
          }}>
            {eyebrow}
          </div>
        )}

        {/* Heading */}
        {heading && (
          <div style={{
            fontSize:22, fontWeight:700, color:"#fff",
            lineHeight:1.2, marginBottom:20,
          }}>
            {heading}
          </div>
        )}

        {/* SN-style input card */}
        <div style={{
          background:"rgba(255,255,255,0.96)",
          borderRadius:14,
          padding:"14px 16px 12px",
          boxShadow: focused
            ? `0 0 0 2px ${B.wasabi}, 0 8px 32px rgba(0,0,0,0.18)`
            : "0 4px 24px rgba(0,0,0,0.18)",
          transition:"box-shadow 0.2s",
          marginBottom:16,
        }}>
          {/* Textarea row */}
          <textarea
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            placeholder={placeholder}
            rows={2}
            style={{
              width:"100%", background:"transparent", border:"none",
              outline:"none", resize:"none", fontFamily:"inherit",
              fontSize:14.5, color:B.text, lineHeight:1.55,
              caretColor:B.blue, boxSizing:"border-box",
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
            <div style={{fontSize:11, color:B.dim, letterSpacing:"0.3px"}}>
              Press <kbd style={{
                background:"rgba(3,45,66,0.06)", border:"1px solid rgba(3,45,66,0.12)",
                borderRadius:4, padding:"1px 5px", fontSize:10, fontFamily:"inherit",
              }}>Enter</kbd> to search
            </div>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label={loading ? loadingLabel : submitLabel}
              title={loading ? loadingLabel : submitLabel}
              style={{
                width: 36, height: 36,
                borderRadius:"50%",
                background: canSubmit
                  ? `linear-gradient(135deg, ${B.wasabi} 0%, #4DC93A 100%)`
                  : "rgba(3,45,66,0.10)",
                border:"none",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor: canSubmit ? "pointer" : "default",
                transition:"background 0.2s, transform 0.15s",
                transform: canSubmit ? "scale(1)" : "scale(0.92)",
                flexShrink:0,
              }}
              onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = canSubmit ? "scale(1)" : "scale(0.92)"; }}
            >
              {loading ? (
                <div style={{
                  width:14, height:14, borderRadius:"50%",
                  border:"2px solid rgba(3,45,66,0.3)",
                  borderTopColor:B.blue,
                  animation:"spin 0.7s linear infinite",
                }}/>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke={canSubmit ? B.blue : B.dim}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Helper lines — below the card */}
        {helperLines.map((line, i) => (
          <div key={i} style={{
            fontSize:12.5, lineHeight:1.6, marginBottom:2,
            color:`rgba(255,255,255,${line.opacity || 0.5})`,
          }}>
            {line.text}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
