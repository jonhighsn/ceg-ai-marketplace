import { useMemo, useState } from 'react'
import { B, TYPE_META } from '../constants'
import { filterCatalogByQuery, groupTilesByCategory, sortCatalogTiles } from '../helpers'
import { TileCard } from '../components/TileCard'
import { TilePanel } from '../components/TilePanel'

const CATALOG_TYPES = ["all", "in-platform", "enterprise-skill", "local-skill"];

const PageBrowse = ({ tiles = [] }) => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTile, setSelectedTile] = useState(null);

  const filtered = useMemo(() => {
    const byType = typeFilter === "all" ? tiles : tiles.filter(t => t.type === typeFilter);
    const bySearch = filterCatalogByQuery(byType, searchQuery);
    return sortCatalogTiles(bySearch);
  }, [tiles, typeFilter, searchQuery]);

  const grouped = useMemo(() => groupTilesByCategory(filtered), [filtered]);

  const typeCounts = useMemo(() => {
    return Object.fromEntries(CATALOG_TYPES.map(t => [t, t === "all" ? tiles.length :
      tiles.filter(x => x.type === t).length]));
  }, [tiles]);

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:24, fontWeight:700, color:B.text, marginBottom:4}}>Browse Catalog</div>
        <div style={{fontSize:14, color:B.muted, marginBottom:14}}>
          {filtered.length} capabilities
        </div>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, category, description..."
          style={{width:"100%", padding:"10px 14px", fontSize:14,
            border:`1px solid ${B.border}`, borderRadius:8,
            fontFamily:"inherit", outline:"none", boxSizing:"border-box",
            background:B.white}}
        />
      </div>

      {/* Type tabs */}
      <div style={{display:"flex", gap:6, marginBottom:16, flexWrap:"wrap"}}>
        {CATALOG_TYPES.map(t => {
          const meta = t === "all" ? {label:"All", icon:"📋"} : TYPE_META[t];
          const active = typeFilter === t;
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{display:"flex", alignItems:"center", gap:6,
                background: active ? B.blue : B.white,
                color: active ? "#fff" : B.muted,
                border: `1px solid ${active ? B.blue : B.border}`,
                borderRadius:6, padding:"7px 14px", fontSize:12.5, fontWeight:600,
                cursor:"pointer", whiteSpace:"nowrap"}}>
              {meta.icon && <span>{meta.icon}</span>}
              {meta.label}
              <span style={{opacity:0.7, fontSize:11}}>({typeCounts[t]})</span>
            </button>
          );
        })}

      </div>

      {/* Tile grid + detail panel */}
      <div className="detail-panel-container">
        <div className="detail-panel-grid">
          {filtered.length > 0 ? (
            <div>
              {grouped.map(({ category, tiles: catTiles }) => (
                <div key={category} style={{marginBottom:20}}>
                  <div style={{fontSize:13, fontWeight:700, color:B.snGreen, letterSpacing:"0.5px",
                    textTransform:"uppercase", marginBottom:10, paddingBottom:6,
                    borderBottom:`1px solid ${B.border}`}}>
                    {category}
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14}}>
                    {catTiles.map(t => <TileCard key={t.id} tile={t} onSelect={setSelectedTile} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign:"center", padding:"40px 20px",
              background:B.white, border:`1px solid ${B.border}`, borderRadius:10}}>
              <div style={{fontSize:32, marginBottom:12}}>🔍</div>
              <div style={{fontSize:15, fontWeight:600, color:B.text, marginBottom:6}}>No capabilities match this filter</div>
              <div style={{fontSize:13, color:B.muted}}>Try a different type or role filter</div>
            </div>
          )}
        </div>
        {selectedTile && (
          <div className="detail-panel-enter">
            <TilePanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBrowse
