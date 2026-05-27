import { useMemo, useState } from 'react'
import { B, TYPE_META } from '../constants'
import { parseUnifiedSearch } from '../helpers'
import { SNSearchCard } from '../components/SNSearchCard'
import { SubLabel } from '../components/SubLabel'
import { TileCard } from '../components/TileCard'
import { TileModal } from '../components/TileModal'
import { Callout } from '../components/Callout'
import { TagPill } from '../components/TagPill'

const PageHome = ({ tiles = [], ideas = [] }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null); // {catalog:[], ideas:[]}
  const [selectedTile, setSelectedTile] = useState(null);

  const featuredTiles = useMemo(() => {
    return tiles.filter(t => t.type === "in-platform" && t.status === "now");
  }, [tiles]);

  const searchAI = async () => {
    if (!query.trim()) return;
    setLoading(true); setAiResult(null);
    try {
      const catalogJson = JSON.stringify(tiles.map(t=>({id:t.id,name:t.name,type:t.type,cat:t.cat,desc:t.desc})));
      const ideasJson = JSON.stringify(ideas.map(i=>({id:i.id,title:i.title,category:i.category,problem:(i.problem||"").slice(0,120),status:i.status})));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1200,
          system: `You are an AI capability recommendation engine for ServiceNow CEG. Search BOTH sources below and return results from each.

LIVE CATALOG (deployed today): ${catalogJson}

IDEA PIPELINE (in development): ${ideasJson}

YOU MUST respond with this exact JSON structure and nothing else — no markdown, no explanation:
{"catalog":[{"id":"<tile id>","name":"<tile name>","reason":"<why it fits in 1-2 sentences>","confidence":"high|medium"}],"ideas":[{"id":"<idea id>","title":"<idea title>","reason":"<why it is relevant in 1-2 sentences>","confidence":"high|medium"}]}

Rules: (1) Only include items that genuinely match the task. (2) Return an empty array [] for a section if nothing fits. (3) Do not invent IDs — use only IDs from the data above. (4) Return the raw JSON object, no backticks, no "json" prefix.`,
          messages: [{role: "user", content: `My task: ${query}`}]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      setAiResult(parseUnifiedSearch(text));
    } catch {
      // TODO: route through /api/search proxy function
      setAiResult({ catalog: [], ideas: [], _error: true })
    }
    setLoading(false);
  };

  const matchedAiTiles = useMemo(() => {
    if (!aiResult) return [];
    return (aiResult.catalog || []).map(r => ({...r, tile: tiles.find(t => t.id === r.id)})).filter(r => r.tile);
  }, [aiResult, tiles]);

  const matchedAiIdeas = useMemo(() => {
    if (!aiResult) return [];
    return (aiResult.ideas || []).map(r => ({...r, idea: ideas.find(i => i.id === r.id)})).filter(r => r.idea);
  }, [aiResult, ideas]);

  return (
    <div>
      {/* Hero search */}
      <SNSearchCard
        eyebrow="CEG AI Marketplace"
        heading="What do you need to do today?"
        helperLines={[
          {text:"Describe your task — AI will recommend the right capability from the CEG catalog.", opacity:0.6},
        ]}
        placeholder="e.g. I need to prep for a QBR with a customer..."
        value={query}
        onChange={e => { setQuery(e.target.value); if (aiResult !== null) setAiResult(null); }}
        onSubmit={searchAI}
        loading={loading}
        submitLabel="Recommend →"
        loadingLabel="Thinking..."
      />

      {/* Loading skeleton */}
      {loading && (
        <div style={{marginBottom:24}}>
          {[0,1].map(i => (
            <div key={i} style={{display:"flex", gap:12, background:B.white,
              border:`1px solid ${B.border}`, borderRadius:8, padding:"14px 16px", marginBottom:8}}>
              <div style={{width:36, height:36, borderRadius:8, flexShrink:0,
                background:"linear-gradient(90deg,#e8edf2 25%,#f4f6f8 50%,#e8edf2 75%)",
                backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite"}}/>
              <div style={{flex:1}}>
                <div style={{height:13, width:"35%", borderRadius:4, marginBottom:8,
                  background:"linear-gradient(90deg,#e8edf2 25%,#f4f6f8 50%,#e8edf2 75%)",
                  backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite"}}/>
                <div style={{height:11, width:"65%", borderRadius:4,
                  background:"linear-gradient(90deg,#e8edf2 25%,#f4f6f8 50%,#e8edf2 75%)",
                  backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite"}}/>
              </div>
            </div>
          ))}
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
      )}

      {/* AI results — unified catalog + pipeline */}
      {!loading && aiResult !== null && (
        <div style={{marginBottom:24}}>
          {aiResult._error ? (
            <Callout type="warning" icon="⚠️">
              AI search is not available in this environment. <a href="https://claude.ai" target="_blank" rel="noreferrer" style={{color:B.blue,fontWeight:700}}>Open in Claude →</a>
            </Callout>
          ) : (matchedAiTiles.length > 0 || matchedAiIdeas.length > 0) ? (
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:"1px",
                textTransform:"uppercase", color:B.snGreen, marginBottom:4}}>
                Results for "{query}"
              </div>

              {/* Catalog hits */}
              {matchedAiTiles.length > 0 && (
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10.5, fontWeight:700, letterSpacing:"0.8px",
                    textTransform:"uppercase", color:B.muted, marginBottom:8}}>
                    Live Catalog
                  </div>
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    {matchedAiTiles.map(r => (
                      <div key={r.id} onClick={() => setSelectedTile(r.tile)}
                        style={{background:B.white, border:`1px solid ${B.border}`, borderRadius:8,
                          padding:"12px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start"}}
                        onMouseEnter={e => e.currentTarget.style.borderColor = B.snGreen}
                        onMouseLeave={e => e.currentTarget.style.borderColor = B.border}>
                        <div style={{width:34, height:34, background:r.confidence==="high"?B.blue:B.surface2,
                          borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:16, flexShrink:0}}>{TYPE_META[r.tile.type].icon}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap"}}>
                            <span style={{fontSize:13.5, fontWeight:700, color:B.text}}>{r.name}</span>
                            <span style={{fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:4,
                              textTransform:"uppercase", letterSpacing:"0.3px",
                              background:"rgba(129,181,161,0.15)", color:"#2d6a57"}}>Catalog</span>
                          </div>
                          <div style={{fontSize:12.5, color:B.muted, lineHeight:1.5}}>{r.reason}</div>
                        </div>
                        <TagPill color={r.confidence==="high"?"green":"teal"}>
                          {r.confidence==="high"?"Best match":"Good match"}
                        </TagPill>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline hits */}
              {matchedAiIdeas.length > 0 && (
                <div>
                  <div style={{fontSize:10.5, fontWeight:700, letterSpacing:"0.8px",
                    textTransform:"uppercase", color:B.muted, marginBottom:8}}>
                    Pipeline
                  </div>
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    {matchedAiIdeas.map(r => (
                      <div key={r.id}
                        onClick={() => window.dispatchEvent(new CustomEvent("storefront:nav", {detail:"submit"}))}
                        style={{background:B.white, border:`1px solid ${B.border}`, borderRadius:8,
                          padding:"12px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start"}}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#d97706"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = B.border}>
                        <div style={{width:34, height:34, background:"rgba(245,158,11,0.10)",
                          borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:16, flexShrink:0}}>🚀</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap"}}>
                            <span style={{fontSize:13.5, fontWeight:700, color:B.text}}>{r.title}</span>
                            <span style={{fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:4,
                              textTransform:"uppercase", letterSpacing:"0.3px",
                              background:"rgba(245,158,11,0.10)", color:"#805700"}}>Pipeline</span>
                          </div>
                          <div style={{fontSize:12.5, color:B.muted, lineHeight:1.5}}>{r.reason}</div>
                        </div>
                        <TagPill color="amber">{r.confidence==="high"?"In pipeline":"Related"}</TagPill>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{background:B.accentBg, border:`1px solid ${B.border}`,
              borderRadius:8, padding:"16px 20px", textAlign:"center"}}>
              <div style={{fontSize:14, color:B.muted, marginBottom:8}}>
                No match found. Have an idea for a new AI capability?
              </div>
              <div style={{fontSize:13, color:B.snGreen, fontWeight:600, cursor:"pointer"}}
                onClick={() => window.dispatchEvent(new CustomEvent("storefront:nav", {detail:"submit"}))}>
                Browse the Pipeline →
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured tiles */}
      <div style={{marginBottom:8}}>
        <SubLabel>In-Platform Capabilities</SubLabel>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14}}>
        {featuredTiles.map(t => (
          <TileCard key={t.id} tile={t} onSelect={setSelectedTile} />
        ))}
      </div>

      {selectedTile && <TileModal tile={selectedTile} onClose={() => setSelectedTile(null)} />}
    </div>
  );
};

// ── PageBrowse ────────────────────────────────────────────────────────────────

export default PageHome
