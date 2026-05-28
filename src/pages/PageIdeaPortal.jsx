import { useEffect, useMemo, useState } from 'react'
import { B, IDEA_STATUS_META, STORAGE_INTAKE_KEY, STORAGE_USER_VOTES_KEY, STORAGE_VOTES_KEY } from '../constants'
import { normalizeIdeaStatus } from '../helpers'
import { searchMarketplace } from '../search'
import storage from '../storage'
import { IdeaStatusBadge } from '../components/IdeaStatusBadge'
import { TagPill } from '../components/TagPill'
import DiscoverySubmit from './pipeline/DiscoverySubmit'

const PageIdeaPortal = ({ ideas = [], tiles = [] }) => {
  const _ideas = ideas;
  const [tab, setTab] = useState("catalog");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedIdeas, setSearchedIdeas] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // votes: { [ideaId]: count }  — shared across all users
  const [votes, setVotes] = useState({});
  // userVotes: Set of idea IDs this user has already voted on — personal
  const [userVotes, setUserVotes] = useState(new Set());

  // Load submissions, votes, userVotes from storage
  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORAGE_INTAKE_KEY, true);
        if (r?.value) setSubmissions(JSON.parse(r.value));
      } catch { /* Ignore unavailable local submission storage. */ }
      try {
        const v = await storage.get(STORAGE_VOTES_KEY, true);
        if (v?.value) setVotes(JSON.parse(v.value));
      } catch { /* Ignore unavailable shared vote storage. */ }
      try {
        const uv = await storage.get(STORAGE_USER_VOTES_KEY, false);
        if (uv?.value) setUserVotes(new Set(JSON.parse(uv.value)));
      } catch { /* Ignore unavailable per-user vote storage. */ }
    })();
  }, []);

  const handleVote = async (ideaId) => {
    if (userVotes.has(ideaId)) return; // already voted
    const newVotes = { ...votes, [ideaId]: (votes[ideaId] || 0) + 1 };
    const newUserVotes = new Set([...userVotes, ideaId]);
    setVotes(newVotes);
    setUserVotes(newUserVotes);
    try {
      await storage.set(STORAGE_VOTES_KEY, JSON.stringify(newVotes), true);
      await storage.set(STORAGE_USER_VOTES_KEY, JSON.stringify([...newUserVotes]), false);
    } catch { /* Ignore vote persistence failures; keep in-memory feedback. */ }
  };

  const allIdeas = useMemo(() => {
    const userIdeas = submissions.map(s => ({...s, status:normalizeIdeaStatus(s.status||"under-review"), seeded:false}));
    return [..._ideas.map(i=>({...i,status:normalizeIdeaStatus(i.status)})), ...userIdeas];
  }, [submissions, _ideas]);

  useEffect(() => {
    let cancelled = false;

    if (!searchQuery.trim()) {
      return () => { cancelled = true };
    }

    (async () => {
      const results = await searchMarketplace({
        tiles,
        ideas: allIdeas,
        query: searchQuery,
        scope: 'ideas',
      });
      if (!cancelled) {
        setSearchedIdeas(results.ideas);
        setSearchLoading(false);
      }
    })();

    return () => { cancelled = true };
  }, [allIdeas, searchQuery, tiles]);

  const filteredIdeas = useMemo(() => {
    const sourceIdeas = searchQuery.trim() ? (searchedIdeas || []) : allIdeas;
    return statusFilter === "all" ? sourceIdeas : sourceIdeas.filter(i => i.status === statusFilter);
  }, [allIdeas, statusFilter, searchQuery, searchedIdeas]);

  const statusCounts = useMemo(() => {
    const counts = {all: allIdeas.length};
    Object.keys(IDEA_STATUS_META).forEach(s => { counts[s] = allIdeas.filter(i => i.status === s).length; });
    return counts;
  }, [allIdeas]);

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
        marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:24,fontWeight:700,color:B.text,marginBottom:4}}>Pipeline</div>
          <div style={{fontSize:14,color:B.muted}}>Track what's in the pipeline and submit new ideas.</div>
        </div>
        <button onClick={() => setTab("submit")}
          style={{background:B.blue,color:"#fff",fontWeight:700,fontSize:13,
            padding:"10px 20px",borderRadius:7,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>
          + Submit Idea
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:`1px solid ${B.border}`}}>
        {[{id:"catalog",label:"Idea Catalog"},{id:"submit",label:"Submit New Idea"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{padding:"9px 18px",fontSize:13.5,fontWeight:600,border:"none",
              background:"transparent",cursor:"pointer",fontFamily:"inherit",
              color:tab===t.id?B.blue:B.muted,
              borderBottom:`2px solid ${tab===t.id?B.wasabi:"transparent"}`,marginBottom:-1}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Catalog tab */}
      {tab === "catalog" && (
        <div>
          {/* Search input */}
          <input
            value={searchQuery}
            onChange={e => {
              const nextQuery = e.target.value;
              setSearchQuery(nextQuery);
              if (!nextQuery.trim()) {
                setSearchedIdeas(null);
                setSearchLoading(false);
              } else {
                setSearchLoading(true);
              }
            }}
            placeholder="Search ideas by title, category, or description..."
            style={{width:"100%",padding:"10px 14px",fontSize:14,
              border:`1px solid ${B.border}`,borderRadius:8,
              fontFamily:"inherit",outline:"none",
              boxSizing:"border-box",background:B.white,marginBottom:14}}
          />
          {searchLoading && (
            <div style={{fontSize:12,color:B.dim,marginTop:-6,marginBottom:12}}>
              Searching ideas...
            </div>
          )}

          {/* Status filter pills */}
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            <button onClick={() => setStatusFilter("all")}
              style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,
                border:`1px solid ${statusFilter==="all"?B.blue:B.border}`,
                background:statusFilter==="all"?B.blue:B.white,
                color:statusFilter==="all"?"#fff":B.muted,cursor:"pointer"}}>
              All ({statusCounts.all})
            </button>
            {Object.entries(IDEA_STATUS_META).map(([key, meta]) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,
                  border:`1px solid ${statusFilter===key?meta.dot:B.border}`,
                  background:statusFilter===key?`${meta.dot}18`:B.white,
                  color:statusFilter===key?meta.dot:B.muted,cursor:"pointer"}}>
                {meta.label} ({statusCounts[key]||0})
              </button>
            ))}
          </div>

          {/* Idea list */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filteredIdeas.length === 0 ? (
              <div style={{textAlign:"center",padding:"40px 20px",background:B.white,
                border:`1px solid ${B.border}`,borderRadius:10}}>
                <div style={{fontSize:28,marginBottom:10}}>💡</div>
                <div style={{fontSize:14,fontWeight:600,color:B.text}}>
                  {searchQuery ? "No ideas match your search" : "No ideas in this status"}
                </div>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}
                    style={{marginTop:10,background:"none",border:"none",
                      color:B.snGreen,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                    Clear search
                  </button>
                )}
              </div>
            ) : filteredIdeas.map(idea => {
              const voteCount = votes[idea.id] || 0;
              const hasVoted = userVotes.has(idea.id);
              return (
                <div key={idea.id} style={{background:B.white,border:`1px solid ${B.border}`,
                  borderRadius:10,padding:"16px 20px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",
                    justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:8}}>
                    <div style={{fontSize:15,fontWeight:700,color:B.text,lineHeight:1.3,flex:1}}>
                      {idea.title}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                      {/* Upvote button */}
                      <button
                        onClick={() => handleVote(idea.id)}
                        disabled={hasVoted}
                        title={hasVoted ? "You've already upvoted this" : "Upvote this idea"}
                        style={{
                          display:"flex", alignItems:"center", gap:5,
                          padding:"5px 11px", borderRadius:20,
                          border:`1px solid ${hasVoted ? B.wasabi : B.border}`,
                          background: hasVoted ? "rgba(99,223,78,0.10)" : B.white,
                          color: hasVoted ? "#1a6010" : B.muted,
                          cursor: hasVoted ? "default" : "pointer",
                          fontSize:12, fontWeight:700,
                          transition:"all 0.15s",
                        }}
                        onMouseEnter={e => { if (!hasVoted) { e.currentTarget.style.borderColor = B.wasabi; e.currentTarget.style.color = "#1a6010"; }}}
                        onMouseLeave={e => { if (!hasVoted) { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.color = B.muted; }}}
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M6.5 2L10.5 7H8V11H5V7H2.5L6.5 2Z"
                            fill={hasVoted ? "#1a6010" : "none"}
                            stroke={hasVoted ? "#1a6010" : "currentColor"}
                            strokeWidth="1.4" strokeLinejoin="round"/>
                        </svg>
                        {voteCount > 0 ? voteCount : "Vote"}
                      </button>
                      <IdeaStatusBadge status={idea.status} />
                    </div>
                  </div>
                  <div style={{fontSize:13,color:B.muted,lineHeight:1.6,marginBottom:10}}>
                    {idea.problem}
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                    <TagPill color="blue">{idea.category}</TagPill>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit tab */}
      {tab === "submit" && (
        <DiscoverySubmit tiles={tiles} ideas={allIdeas} />
      )}
    </div>
  );
};

export default PageIdeaPortal
