import { useMemo, useRef, useState } from 'react'
import { B, TYPE_META } from '../constants'
import { searchMarketplace } from '../search'
import { SNSearchCard } from '../components/SNSearchCard'
import { SubLabel } from '../components/SubLabel'
import { TileCard } from '../components/TileCard'
import { TilePanel } from '../components/TilePanel'
import { TagPill } from '../components/TagPill'

const PageHome = ({ tiles = [], ideas = [] }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // { tiles: [], ideas: [] }
  const [loading, setLoading] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const searchRunRef = useRef(0);

  const featuredTiles = useMemo(() => {
    return tiles.filter(t => t.type === "in-platform" && t.status === "now");
  }, [tiles]);

  const handleSearch = async () => {
    if (!query.trim()) return
    const searchRun = searchRunRef.current + 1
    searchRunRef.current = searchRun
    setLoading(true)
    const searchQuery = query
    const nextResults = await searchMarketplace({ tiles, ideas, query: searchQuery })
    if (searchRunRef.current !== searchRun) return
    setResults(nextResults)
    setLoading(false)
  };

  const matchedTiles = results?.tiles || []
  const matchedIdeas = results?.ideas || []
  const hasResults = results && (matchedTiles.length > 0 || matchedIdeas.length > 0)

  return (
    <div>
      {/* Value prop */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex", flexDirection:"column", gap:2, marginBottom:14}}>
          <div style={{fontSize:42, fontWeight:900, color:B.text, lineHeight:1.08, letterSpacing:"-0.02em"}}>
            The right AI tool
          </div>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{width:32, height:4, background:B.wasabi, borderRadius:2, flexShrink:0}} />
            <div style={{fontSize:42, fontWeight:900, color:B.text, lineHeight:1.08, letterSpacing:"-0.02em"}}>
              for every account, every task
            </div>
          </div>
        </div>
        <div style={{fontSize:16, color:B.muted, lineHeight:1.6, maxWidth:520, fontWeight:400}}>
          Discover AI capabilities built for your role. Search by task, explore what's possible for your accounts, or shape what we build next.
        </div>
      </div>

      {/* Hero search */}
      <SNSearchCard
        eyebrow="CEG AI Marketplace"
        heading="What do you need to do today?"
        helperLines={[
          {text:"Discover AI tools, find the right skill for any task, see what's possible for your accounts — or contribute your own use case.", opacity:0.6},
        ]}
        placeholder="e.g. QBR, account intelligence, automation..."
        value={query}
        onChange={e => {
          searchRunRef.current += 1;
          setLoading(false);
          setQuery(e.target.value);
          if (results !== null) setResults(null);
        }}
        onSubmit={handleSearch}
        loading={loading}
        submitLabel="Search →"
        loadingLabel="Searching..."
      />

      {/* Search results */}
      {results !== null && (
        <div style={{marginBottom:24, animation:"resultEnter 0.3s cubic-bezier(0.22,1,0.36,1) both"}}>
          {hasResults ? (
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:"1px",
                textTransform:"uppercase", color:B.snGreen, marginBottom:4}}>
                Results for "{query}"
              </div>

              {/* Catalog hits */}
              {matchedTiles.length > 0 && (
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:10.5, fontWeight:700, letterSpacing:"0.8px",
                    textTransform:"uppercase", color:B.muted, marginBottom:8}}>
                    Live Catalog
                  </div>
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    {matchedTiles.map((t, idx) => (
                      <div key={t.id} onClick={() => setSelectedTile(t)}
                        style={{animation:`resultEnter 0.3s cubic-bezier(0.22,1,0.36,1) ${idx * 60}ms both`,
                          background:B.white, border:`1px solid ${B.border}`, borderRadius:8,
                          padding:"12px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start"}}
                        onMouseEnter={e => e.currentTarget.style.borderColor = B.snGreen}
                        onMouseLeave={e => e.currentTarget.style.borderColor = B.border}>
                        <div style={{width:34, height:34, background:t.confidence==="high"?B.blue:B.surface2,
                          borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:16, flexShrink:0}}>{TYPE_META[t.type].icon}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap"}}>
                            <span style={{fontSize:13.5, fontWeight:700, color:B.text}}>{t.name}</span>
                            <span style={{fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:4,
                              textTransform:"uppercase", letterSpacing:"0.3px",
                              background:"rgba(129,181,161,0.15)", color:"#2d6a57"}}>Catalog</span>
                          </div>
                          <div style={{fontSize:12.5, color:B.muted, lineHeight:1.5}}>{t.desc}</div>
                        </div>
                        <TagPill color={t.match?.confidence==="best"?"green":"teal"}>
                          {t.match?.label || (t.confidence==="high"?"Best match":"Good match")}
                        </TagPill>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline hits */}
              {matchedIdeas.length > 0 && (
                <div>
                  <div style={{fontSize:10.5, fontWeight:700, letterSpacing:"0.8px",
                    textTransform:"uppercase", color:B.muted, marginBottom:8}}>
                    Pipeline
                  </div>
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    {matchedIdeas.map((i, idx) => (
                      <div key={i.id}
                        onClick={() => window.dispatchEvent(new CustomEvent("storefront:nav", {detail:"submit"}))}
                        style={{animation:`resultEnter 0.3s cubic-bezier(0.22,1,0.36,1) ${(matchedTiles.length + idx) * 60}ms both`,
                          background:B.white, border:`1px solid ${B.border}`, borderRadius:8,
                          padding:"12px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start"}}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#d97706"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = B.border}>
                        <div style={{width:34, height:34, background:"rgba(245,158,11,0.10)",
                          borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:16, flexShrink:0}}>🚀</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap"}}>
                            <span style={{fontSize:13.5, fontWeight:700, color:B.text}}>{i.title}</span>
                            <span style={{fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:4,
                              textTransform:"uppercase", letterSpacing:"0.3px",
                              background:"rgba(245,158,11,0.10)", color:"#805700"}}>Pipeline</span>
                          </div>
                          <div style={{fontSize:12.5, color:B.muted, lineHeight:1.5}}>{i.problem}</div>
                        </div>
                        <TagPill color="amber">{i.match?.label || (i.confidence==="high"?"In pipeline":"Related")}</TagPill>
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

      {selectedTile && <TilePanel tile={selectedTile} onClose={() => setSelectedTile(null)} />}
    </div>
  );
};

// ── PageBrowse ────────────────────────────────────────────────────────────────

export default PageHome
