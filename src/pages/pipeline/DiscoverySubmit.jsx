import { useMemo, useState } from 'react'
import { B, SUBMIT_FORM_URL, TYPE_META } from '../../constants'
import { Callout } from '../../components/Callout'
import { SNSearchCard } from '../../components/SNSearchCard'
import { TileModal } from '../../components/TileModal'

const DiscoverySubmit = ({ tiles = [] }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null); // {catalog:[], ideas:[]}
  const [selectedTile, setSelectedTile] = useState(null);

  const hasResults = Array.isArray(aiResult) && aiResult.length > 0;
  const noResults = Array.isArray(aiResult) && aiResult.length === 0;

  const matchedTiles = useMemo(() => {
    if (!Array.isArray(aiResult)) return [];
    return aiResult.map(r => ({ ...r, tile: tiles.find(t => t.id === r.id) })).filter(r => r.tile);
  }, [aiResult, tiles]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setAiResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a capability matching engine for the ServiceNow CEG AI catalog. Given a user idea or use case, find the best 1-3 existing capabilities that already satisfy it. Catalog: ${JSON.stringify(tiles.map(t=>({id:t.id,name:t.name,type:t.cat,desc:t.desc})))}. Return ONLY valid JSON: {"recommendations":[{"id":"tile-id","name":"name","reason":"1-2 sentences explaining how this already covers their use case","confidence":"high|medium"}]}. If nothing genuinely matches, return {"recommendations":[]}.`,
          messages: [{ role: "user", content: `My idea or use case: ${query}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAiResult(parsed.recommendations || []);
    } catch {
      // TODO: route through /api/search proxy function
      setAiResult({ _error: true })
    }
    setLoading(false);
  };

  return (
    <div>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .disc-anim { animation: fadeSlideIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .scan-pulse { background:linear-gradient(90deg,#e8edf2 25%,#f4f6f8 50%,#e8edf2 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .disc-tile:hover { border-color:#81B5A1 !important; }
      `}</style>

      {/* Hero search surface */}
      <SNSearchCard
        eyebrow="IDEA DISCOVERY"
        heading="Before you submit, check what's already built."
        helperLines={[
          {text:"Most ideas we receive have a skill or capability that already covers them. Describe your use case and we'll scan the catalog first.", opacity:0.62},
          {text:"If nothing fits, you'll land on the submission form in one click.", opacity:0.38},
        ]}
        placeholder="e.g. Auto-generate a QBR deck from live account data..."
        value={query}
        onChange={e => { setQuery(e.target.value); if (aiResult !== null) setAiResult(null); }}
        onSubmit={handleSearch}
        loading={loading}
        submitLabel="Check Catalog →"
        loadingLabel="Scanning..."
      />

      {/* Loading */}
      {loading && (
        <div className="disc-anim" style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:B.dim,marginBottom:12}}>
            Scanning catalog for matches...
          </div>
          {[0,1].map(i => (
            <div key={i} style={{display:"flex",gap:12,background:B.white,border:`1px solid ${B.border}`,
              borderRadius:10,padding:"16px 18px",marginBottom:8}}>
              <div className="scan-pulse" style={{width:40,height:40,borderRadius:8,flexShrink:0}}/>
              <div style={{flex:1,paddingTop:2}}>
                <div className="scan-pulse" style={{height:13,width:"40%",borderRadius:4,marginBottom:8}}/>
                <div className="scan-pulse" style={{height:11,width:"70%",borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matches found */}
      {!loading && aiResult?._error && (
        <Callout type="warning" icon="⚠️">
          AI search is not available in this environment. <a href="https://claude.ai" target="_blank" rel="noreferrer" style={{color:B.blue,fontWeight:700}}>Open in Claude →</a>
        </Callout>
      )}

      {!loading && hasResults && (
        <div className="disc-anim" style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",color:"#2d6a57"}}>
              {matchedTiles.length} match{matchedTiles.length!==1?"es":""} found
            </span>
            <span style={{fontSize:11,color:B.dim,background:B.surface2,padding:"2px 8px",borderRadius:4}}>
              for "{query}"
            </span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {matchedTiles.map(r => (
              <div key={r.id} className="disc-tile"
                onClick={() => setSelectedTile(r.tile)}
                style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,
                  padding:"14px 18px",cursor:"pointer",display:"flex",gap:14,
                  alignItems:"flex-start",transition:"border-color 0.15s"}}>
                <div style={{width:40,height:40,background:r.confidence==="high"?B.blue:B.surface2,
                  borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:18,flexShrink:0}}>
                  {TYPE_META[r.tile.type].icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:700,color:B.text}}>{r.name}</span>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,
                      letterSpacing:"0.3px",textTransform:"uppercase",
                      background:r.confidence==="high"?"rgba(99,223,78,0.14)":"rgba(129,181,161,0.15)",
                      color:r.confidence==="high"?"#1a6010":"#2d6a57"}}>
                      {r.confidence==="high"?"Best match":"Good match"}
                    </span>
                  </div>
                  <div style={{fontSize:13,color:B.muted,lineHeight:1.55}}>{r.reason}</div>
                </div>
                <div style={{fontSize:11,color:B.snGreen,fontWeight:600,whiteSpace:"nowrap",paddingTop:2}}>View →</div>
              </div>
            ))}
          </div>
          {/* Progressive disclosure */}
          <div style={{background:B.surface2,border:`1px solid ${B.border}`,borderRadius:10,
            padding:"16px 20px",display:"flex",alignItems:"center",
            justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:13.5,fontWeight:600,color:B.text,marginBottom:3}}>None of these cover your idea?</div>
              <div style={{fontSize:12.5,color:B.muted,lineHeight:1.5}}>
                Submit your idea and the CEG AI team will review it bi-weekly.
              </div>
            </div>
            <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer"
              style={{background:B.blue,color:"#fff",fontWeight:700,fontSize:13,
                padding:"10px 20px",borderRadius:7,textDecoration:"none",
                display:"inline-block",whiteSpace:"nowrap"}}>
              Submit My Idea →
            </a>
          </div>
        </div>
      )}

      {/* No match */}
      {!loading && noResults && (
        <div className="disc-anim" style={{marginBottom:20}}>
          <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,
            padding:"32px 24px",textAlign:"center"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(99,223,78,0.10)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,margin:"0 auto 14px"}}>💡</div>
            <div style={{fontSize:15,fontWeight:700,color:B.text,marginBottom:6}}>
              Nothing in the catalog covers this yet.
            </div>
            <div style={{fontSize:13.5,color:B.muted,lineHeight:1.6,maxWidth:440,margin:"0 auto 20px"}}>
              This looks like a genuine gap. Submit your idea — the CEG AI team reviews submissions every two weeks.
            </div>
            <a href={SUBMIT_FORM_URL} target="_blank" rel="noreferrer"
              style={{background:B.blue,color:"#fff",fontWeight:700,fontSize:14,
                padding:"11px 26px",borderRadius:7,textDecoration:"none",display:"inline-block"}}>
              Submit My Idea →
            </a>
          </div>
        </div>
      )}

      {selectedTile && <TileModal tile={selectedTile} onClose={() => setSelectedTile(null)} />}
    </div>
  );
};

// ── PageIdeaPortal ────────────────────────────────────────────────────────────

export default DiscoverySubmit
