import { useRef, useState } from 'react'
import { ADMIN_PASSCODE, B, IDEA_STATUS_META, STORAGE_CATALOG_KEY, STORAGE_IDEAS_SEEDED_KEY } from '../constants'
import { IDEAS_FALLBACK, TILES_FALLBACK } from '../data-fallback'
import storage from '../storage'
import { Callout } from '../components/Callout'

const PageAdmin = ({ liveTiles, onCatalogUpdate, liveIdeas, onIdeasUpdate }) => {
  const _liveIdeas = liveIdeas || IDEAS_FALLBACK;
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeErr, setPasscodeErr] = useState(false);

  // Upload/paste state
  const [inputMode, setInputMode] = useState("paste"); // paste | upload
  const [jsonText, setJsonText] = useState("");
  const [uploadErr, setUploadErr] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [diff, setDiff] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const fileRef = useRef(null);

  // Ideas state
  const [ideasInputMode, setIdeasInputMode] = useState("paste");
  const [ideasJsonText, setIdeasJsonText] = useState("");
  const [ideasErr, setIdeasErr] = useState(null);
  const [ideasParsed, setIdeasParsed] = useState(null);
  const [ideasDiff, setIdeasDiff] = useState(null);
  const [ideasSaving, setIdeasSaving] = useState(false);
  const [ideasSaveSuccess, setIdeasSaveSuccess] = useState(false);
  const [ideasResetConfirm, setIdeasResetConfirm] = useState(false);
  const ideasFileRef = useRef(null);

  const REQUIRED_IDEA_FIELDS = ["id","title","problem","category","status"];
  // VALID_IDEA_STATUSES defined above via IDEA_STATUS_META

  const validateIdeas = (arr) => {
    if (!Array.isArray(arr)) return "Root must be a JSON array.";
    for (let i = 0; i < arr.length; i++) {
      const t = arr[i];
      for (const f of REQUIRED_IDEA_FIELDS) {
        if (!t[f]) return `Idea ${i+1} (id: "${t.id||"?"}"): missing required field "${f}"`;
      }
      if (!Object.keys(IDEA_STATUS_META).includes(t.status))
        return `Idea ${i+1}: invalid status "${t.status}". Must be: ${Object.keys(IDEA_STATUS_META).join(", ")}`;
    }
    return null;
  };

  const computeIdeasDiff = (incoming) => {
    const liveMap = Object.fromEntries(_liveIdeas.map(t => [t.id, t]));
    const inMap = Object.fromEntries(incoming.map(t => [t.id, t]));
    return {
      added: incoming.filter(t => !liveMap[t.id]),
      removed: _liveIdeas.filter(t => !inMap[t.id]),
      updated: incoming.filter(t => liveMap[t.id] && JSON.stringify(liveMap[t.id]) !== JSON.stringify(t)),
      unchanged: incoming.filter(t => liveMap[t.id] && JSON.stringify(liveMap[t.id]) === JSON.stringify(t)),
    };
  };

  const parseAndValidateIdeas = (text) => {
    setIdeasErr(null); setIdeasParsed(null); setIdeasDiff(null);
    try {
      const data = JSON.parse(text.trim());
      const err = validateIdeas(data);
      if (err) { setIdeasErr(err); return; }
      setIdeasParsed(data);
      setIdeasDiff(computeIdeasDiff(data));
    } catch(e) { setIdeasErr("Invalid JSON: " + e.message); }
  };

  const handleIdeasTextChange = (val) => {
    setIdeasJsonText(val);
    if (val.trim().startsWith("[")) parseAndValidateIdeas(val);
    else { setIdeasParsed(null); setIdeasDiff(null); setIdeasErr(null); }
  };

  const handleIdeasFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const t = ev.target.result; setIdeasJsonText(t); parseAndValidateIdeas(t); };
    reader.readAsText(file);
  };

  const handleIdeasApply = async () => {
    if (!ideasParsed) return;
    setIdeasSaving(true);
    try {
      await storage.set(STORAGE_IDEAS_SEEDED_KEY, JSON.stringify(ideasParsed), true);
      onIdeasUpdate(ideasParsed);
      setIdeasSaveSuccess(true);
      setTimeout(() => setIdeasSaveSuccess(false), 3000);
    } catch(e) { setIdeasErr("Storage write failed: " + e.message); }
    setIdeasSaving(false);
  };

  const handleIdeasReset = async () => {
    await storage.delete(STORAGE_IDEAS_SEEDED_KEY, true);
    onIdeasUpdate(IDEAS_FALLBACK);
    setIdeasResetConfirm(false);
    setIdeasParsed(null); setIdeasDiff(null); setIdeasJsonText(""); setIdeasErr(null);
  };

  const handleIdeasExport = () => {
    const json = JSON.stringify(_liveIdeas, null, 2);
    const uri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a");
    a.href = uri;
    a.download = "ceg-ideas-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const tryUnlock = () => {
    if (passcode === ADMIN_PASSCODE) { setUnlocked(true); setPasscodeErr(false); }
    else setPasscodeErr(true);
  };

  const computeDiff = (incoming) => {
    const liveMap = Object.fromEntries(liveTiles.map(t => [t.id, t]));
    const inMap = Object.fromEntries(incoming.map(t => [t.id, t]));
    const added = incoming.filter(t => !liveMap[t.id]);
    const removed = liveTiles.filter(t => !inMap[t.id]);
    const updated = incoming.filter(t => liveMap[t.id] && JSON.stringify(liveMap[t.id]) !== JSON.stringify(t));
    const unchanged = incoming.filter(t => liveMap[t.id] && JSON.stringify(liveMap[t.id]) === JSON.stringify(t));
    return { added, removed, updated, unchanged };
  };

  const validateTiles = (arr) => {
    if (!Array.isArray(arr)) return "Root must be a JSON array.";
    for (let i = 0; i < arr.length; i++) {
      const t = arr[i];
      for (const f of ["id","name","type","status","cat","desc","useCase"]) {
        if (!t[f]) return `Tile ${i+1} (id: "${t.id||"?"}"): missing required field "${f}"`;
      }
      if (!["in-platform","enterprise-skill","local-skill","automated"].includes(t.type)) {
        return `Tile ${i+1}: invalid type "${t.type}".`;
      }
      if (!["now","next","later"].includes(t.status)) {
        return `Tile ${i+1}: invalid status "${t.status}".`;
      }
      if (t.triggers && !Array.isArray(t.triggers)) {
        return `Tile ${i+1}: "triggers" must be an array when present.`;
      }
    }
    return null;
  };

  const parseAndValidate = (text) => {
    setUploadErr(null); setParsed(null); setDiff(null);
    try {
      const data = JSON.parse(text.trim());
      const err = validateTiles(data);
      if (err) { setUploadErr(err); return; }
      const d = computeDiff(data);
      setParsed(data);
      setDiff(d);
    } catch(e) {
      setUploadErr("Invalid JSON: " + e.message);
    }
  };

  const handleTextChange = (val) => {
    setJsonText(val);
    if (val.trim().startsWith("[")) parseAndValidate(val);
    else { setParsed(null); setDiff(null); setUploadErr(null); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setJsonText(text);
      parseAndValidate(text);
    };
    reader.readAsText(file);
  };

  const handleApply = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      await storage.set(STORAGE_CATALOG_KEY, JSON.stringify(parsed), true);
      onCatalogUpdate(parsed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(e) {
      setUploadErr("Storage write failed: " + e.message);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    await storage.delete(STORAGE_CATALOG_KEY, true);
    onCatalogUpdate(TILES_FALLBACK);
    setResetConfirm(false);
    setParsed(null); setDiff(null); setJsonText(""); setUploadErr(null);
  };

  const handleExport = () => {
    const json = JSON.stringify(liveTiles, null, 2);
    const uri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a");
    a.href = uri;
    a.download = "ceg-catalog-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Locked state ─────────────────────────────────────────────────────────────
  if (!unlocked) return (
    <div>
      <div style={{fontSize:24,fontWeight:700,color:B.text,marginBottom:4}}>Admin</div>
      <div style={{fontSize:14,color:B.muted,marginBottom:24}}>Catalog and idea portal management. Restricted access.</div>
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,
        padding:"28px",maxWidth:360}}>
        <div style={{fontSize:13,fontWeight:600,color:B.text,marginBottom:12}}>Enter admin passcode</div>
        <div style={{display:"flex",gap:8}}>
          <input type="password" value={passcode}
            onChange={e=>{setPasscode(e.target.value);setPasscodeErr(false);}}
            onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
            placeholder="Passcode"
            style={{flex:1,padding:"10px 12px",fontSize:14,border:`1px solid ${passcodeErr?"#ef4444":B.border}`,
              borderRadius:7,fontFamily:"inherit",outline:"none"}}/>
          <button onClick={tryUnlock}
            style={{background:B.blue,color:"#fff",fontWeight:700,fontSize:13,
              padding:"10px 18px",borderRadius:7,border:"none",cursor:"pointer"}}>
            Unlock
          </button>
        </div>
        {passcodeErr && <div style={{fontSize:12,color:"#a02020",marginTop:8}}>Incorrect passcode.</div>}
      </div>
    </div>
  );

  // ── Unlocked state ────────────────────────────────────────────────────────────
  const isOverride = liveTiles !== TILES_FALLBACK;
  const byType = (type) => liveTiles.filter(t => t.type === type).length;

  return (
    <div>
      <div style={{fontSize:24,fontWeight:700,color:B.text,marginBottom:4}}>Admin</div>
      <div style={{fontSize:14,color:B.muted,marginBottom:24}}>Manage the live skill catalog and idea portal.</div>

      {/* Catalog status card */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,
        padding:"18px 22px",marginBottom:20,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",
            color:B.muted,marginBottom:8}}>Live Catalog</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[
              {label:"Total",val:liveTiles.length},
              {label:"In-Platform",val:byType("in-platform")},
              {label:"Enterprise",val:byType("enterprise-skill")},
              {label:"Local",val:byType("local-skill")},
              {label:"Automated",val:byType("automated")},
            ].map(s => (
              <div key={s.label} style={{textAlign:"center",minWidth:52}}>
                <div style={{fontSize:22,fontWeight:700,color:B.blue}}>{s.val}</div>
                <div style={{fontSize:10.5,color:B.dim,marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
          {isOverride && (
            <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:4,
              background:"rgba(99,223,78,0.12)",color:"#1a6010",border:"1px solid rgba(99,223,78,0.3)"}}>
              ✓ Custom catalog active
            </span>
          )}
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleExport}
              style={{background:B.surface2,color:B.muted,fontWeight:600,fontSize:12,
                padding:"8px 14px",borderRadius:6,border:`1px solid ${B.border}`,cursor:"pointer"}}>
              Export JSON ↓
            </button>
            {isOverride && !resetConfirm && (
              <button onClick={()=>setResetConfirm(true)}
                style={{background:"rgba(239,68,68,0.06)",color:"#a02020",fontWeight:600,
                  fontSize:12,padding:"8px 14px",borderRadius:6,
                  border:"1px solid rgba(239,68,68,0.2)",cursor:"pointer"}}>
                Reset to Defaults
              </button>
            )}
            {resetConfirm && (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#a02020"}}>Are you sure?</span>
                <button onClick={handleReset}
                  style={{background:"#ef4444",color:"#fff",fontWeight:700,fontSize:12,
                    padding:"7px 12px",borderRadius:6,border:"none",cursor:"pointer"}}>Yes, reset</button>
                <button onClick={()=>setResetConfirm(false)}
                  style={{background:"none",border:"none",color:B.dim,fontSize:12,cursor:"pointer"}}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload section */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,padding:"22px 24px",marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:B.text,marginBottom:4}}>Update Catalog</div>
        <div style={{fontSize:12.5,color:B.muted,marginBottom:16,lineHeight:1.6}}>
          Upload or paste a JSON array of tile objects. All required fields: <code style={{fontSize:11.5,
            background:B.surface2,padding:"1px 5px",borderRadius:3}}>
            id, name, type, status, cat, desc, useCase
          </code>. A diff preview will appear before anything is applied.
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",gap:2,marginBottom:14,background:B.surface2,
          borderRadius:7,padding:3,width:"fit-content"}}>
          {[{id:"paste",label:"Paste JSON"},{id:"upload",label:"Upload File"}].map(m => (
            <button key={m.id} onClick={()=>setInputMode(m.id)}
              style={{padding:"6px 16px",borderRadius:5,fontSize:12.5,fontWeight:600,
                border:"none",cursor:"pointer",fontFamily:"inherit",
                background:inputMode===m.id?B.white:"transparent",
                color:inputMode===m.id?B.text:B.dim,
                boxShadow:inputMode===m.id?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
              {m.label}
            </button>
          ))}
        </div>

        {inputMode === "paste" ? (
          <textarea value={jsonText} onChange={e=>handleTextChange(e.target.value)}
            rows={8} placeholder='[\n  {\n    "id": "my-skill",\n    "name": "My Skill",\n    "type": "enterprise-skill",\n    "status": "now",\n    "roles": ["CSM","CSG"],\n    "cat": "Account Intelligence",\n    "desc": "What this skill does.",\n    "useCase": "When to use it.",\n    "triggers": ["say this to trigger"]\n  }\n]'
            style={{width:"100%",padding:"10px 12px",fontSize:12.5,fontFamily:"'SF Mono',monospace",
              border:`1px solid ${uploadErr?"#ef4444":B.border}`,borderRadius:7,outline:"none",
              boxSizing:"border-box",resize:"vertical",lineHeight:1.6,color:B.text}}/>
        ) : (
          <div>
            <input type="file" accept=".json" ref={fileRef} onChange={handleFileUpload}
              style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()}
              style={{background:B.surface2,border:`2px dashed ${B.border}`,borderRadius:8,
                padding:"20px 32px",cursor:"pointer",fontSize:13.5,color:B.muted,
                fontFamily:"inherit",width:"100%",textAlign:"center"}}>
              📂 Click to select a .json file
            </button>
            {jsonText && (
              <div style={{fontSize:12,color:B.dim,marginTop:8}}>
                File loaded — {jsonText.length.toLocaleString()} characters
              </div>
            )}
          </div>
        )}

        {/* Validation error */}
        {uploadErr && (
          <div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.06)",
            border:"1px solid rgba(239,68,68,0.25)",borderRadius:6,fontSize:13,color:"#a02020"}}>
            ⚠ {uploadErr}
          </div>
        )}

        {/* Diff preview */}
        {diff && parsed && (
          <div style={{marginTop:16}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",
              color:B.muted,marginBottom:10}}>Change Preview</div>
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              {[
                {label:`${diff.added.length} Added`,color:"#1a6010",bg:"rgba(99,223,78,0.10)",bd:"rgba(99,223,78,0.3)"},
                {label:`${diff.updated.length} Updated`,color:"#805700",bg:"rgba(245,158,11,0.08)",bd:"rgba(245,158,11,0.3)"},
                {label:`${diff.removed.length} Removed`,color:"#a02020",bg:"rgba(239,68,68,0.06)",bd:"rgba(239,68,68,0.2)"},
                {label:`${diff.unchanged.length} Unchanged`,color:B.dim,bg:B.surface2,bd:B.border},
              ].map(s => (
                <span key={s.label} style={{fontSize:12,fontWeight:700,padding:"4px 12px",
                  borderRadius:20,background:s.bg,color:s.color,border:`1px solid ${s.bd}`}}>
                  {s.label}
                </span>
              ))}
            </div>

            {diff.added.length > 0 && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11.5,fontWeight:700,color:"#1a6010",marginBottom:6}}>Added</div>
                {diff.added.map(t => (
                  <div key={t.id} style={{fontSize:12.5,padding:"6px 10px",marginBottom:4,
                    background:"rgba(99,223,78,0.06)",borderRadius:5,color:B.text,
                    border:"1px solid rgba(99,223,78,0.2)"}}>
                    <strong>{t.name}</strong> <span style={{color:B.dim}}>({t.id})</span>
                  </div>
                ))}
              </div>
            )}
            {diff.updated.length > 0 && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11.5,fontWeight:700,color:"#805700",marginBottom:6}}>Updated</div>
                {diff.updated.map(t => (
                  <div key={t.id} style={{fontSize:12.5,padding:"6px 10px",marginBottom:4,
                    background:"rgba(245,158,11,0.06)",borderRadius:5,color:B.text,
                    border:"1px solid rgba(245,158,11,0.2)"}}>
                    <strong>{t.name}</strong> <span style={{color:B.dim}}>({t.id})</span>
                  </div>
                ))}
              </div>
            )}
            {diff.removed.length > 0 && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11.5,fontWeight:700,color:"#a02020",marginBottom:6}}>Removed</div>
                {diff.removed.map(t => (
                  <div key={t.id} style={{fontSize:12.5,padding:"6px 10px",marginBottom:4,
                    background:"rgba(239,68,68,0.04)",borderRadius:5,color:B.text,
                    border:"1px solid rgba(239,68,68,0.15)"}}>
                    <strong>{t.name}</strong> <span style={{color:B.dim}}>({t.id})</span>
                  </div>
                ))}
              </div>
            )}

            {saveSuccess && (
              <Callout type="success" icon="✅">
                <strong>Catalog updated.</strong> {parsed.length} tiles now live for all users.
              </Callout>
            )}

            <button onClick={handleApply} disabled={saving}
              style={{background:saving?B.surface2:B.blue,color:saving?B.dim:"#fff",
                fontWeight:700,fontSize:14,padding:"11px 24px",borderRadius:7,
                border:"none",cursor:saving?"default":"pointer",marginTop:4}}>
              {saving ? "Applying..." : `Apply ${parsed.length} Tiles →`}
            </button>
          </div>
        )}
      </div>


      {/* ── Idea Catalog Management ───────────────────────────────────────────── */}
      <div style={{marginTop:28,paddingTop:24,borderTop:`2px solid ${B.border}`}}>
        <div style={{fontSize:20,fontWeight:700,color:B.text,marginBottom:4}}>Idea Catalog</div>
        <div style={{fontSize:14,color:B.muted,marginBottom:20}}>
          Manage the ideas shown in the Pipeline. Statuses: under-review · committed · delivered
        </div>

        {/* Ideas status card */}
        <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,
          padding:"18px 22px",marginBottom:20,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",
              color:B.muted,marginBottom:8}}>Live Ideas</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {[
                {label:"Total",val:_liveIdeas.length},
                ...Object.entries(IDEA_STATUS_META).map(([k,m]) => ({
                  label:m.label.replace(" ✓",""),
                  val:_liveIdeas.filter(i=>i.status===k).length
                }))
              ].map(s => (
                <div key={s.label} style={{textAlign:"center",minWidth:52}}>
                  <div style={{fontSize:20,fontWeight:700,color:B.blue}}>{s.val}</div>
                  <div style={{fontSize:10,color:B.dim,marginTop:1}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            {_liveIdeas !== IDEAS_FALLBACK && (
              <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:4,
                background:"rgba(99,223,78,0.12)",color:"#1a6010",border:"1px solid rgba(99,223,78,0.3)"}}>
                ✓ Custom ideas active
              </span>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={handleIdeasExport}
                style={{background:B.surface2,color:B.muted,fontWeight:600,fontSize:12,
                  padding:"8px 14px",borderRadius:6,border:`1px solid ${B.border}`,cursor:"pointer"}}>
                Export JSON ↓
              </button>
              {_liveIdeas !== IDEAS_FALLBACK && !ideasResetConfirm && (
                <button onClick={()=>setIdeasResetConfirm(true)}
                  style={{background:"rgba(239,68,68,0.06)",color:"#a02020",fontWeight:600,
                    fontSize:12,padding:"8px 14px",borderRadius:6,
                    border:"1px solid rgba(239,68,68,0.2)",cursor:"pointer"}}>
                  Reset to Defaults
                </button>
              )}
              {ideasResetConfirm && (
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#a02020"}}>Are you sure?</span>
                  <button onClick={handleIdeasReset}
                    style={{background:"#ef4444",color:"#fff",fontWeight:700,fontSize:12,
                      padding:"7px 12px",borderRadius:6,border:"none",cursor:"pointer"}}>Yes, reset</button>
                  <button onClick={()=>setIdeasResetConfirm(false)}
                    style={{background:"none",border:"none",color:B.dim,fontSize:12,cursor:"pointer"}}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ideas upload section */}
        <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,padding:"22px 24px",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:B.text,marginBottom:4}}>Update Idea Catalog</div>
          <div style={{fontSize:12.5,color:B.muted,marginBottom:16,lineHeight:1.6}}>
            Required fields per idea: <code style={{fontSize:11.5,background:B.surface2,padding:"1px 5px",borderRadius:3}}>
              id, title, problem, category, status
            </code>. Valid statuses: <code style={{fontSize:11.5,background:B.surface2,padding:"1px 5px",borderRadius:3}}>
              under-review · committed · delivered
            </code>
          </div>

          {/* Mode toggle */}
          <div style={{display:"flex",gap:2,marginBottom:14,background:B.surface2,
            borderRadius:7,padding:3,width:"fit-content"}}>
            {[{id:"paste",label:"Paste JSON"},{id:"upload",label:"Upload File"}].map(m => (
              <button key={m.id} onClick={()=>setIdeasInputMode(m.id)}
                style={{padding:"6px 16px",borderRadius:5,fontSize:12.5,fontWeight:600,
                  border:"none",cursor:"pointer",fontFamily:"inherit",
                  background:ideasInputMode===m.id?B.white:"transparent",
                  color:ideasInputMode===m.id?B.text:B.dim,
                  boxShadow:ideasInputMode===m.id?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                {m.label}
              </button>
            ))}
          </div>

          {ideasInputMode === "paste" ? (
            <textarea value={ideasJsonText} onChange={e=>handleIdeasTextChange(e.target.value)}
              rows={7} placeholder={'[\n  {\n    "id": "idea-1",\n    "title": "My Idea",\n    "problem": "Description of the problem...",\n    "category": "Account Intelligence",\n    "status": "under-review"\n  }\n]'}
              style={{width:"100%",padding:"10px 12px",fontSize:12.5,fontFamily:"'SF Mono',monospace",
                border:`1px solid ${ideasErr?"#ef4444":B.border}`,borderRadius:7,outline:"none",
                boxSizing:"border-box",resize:"vertical",lineHeight:1.6,color:B.text}}/>
          ) : (
            <div>
              <input type="file" accept=".json" ref={ideasFileRef} onChange={handleIdeasFileUpload}
                style={{display:"none"}}/>
              <button onClick={()=>ideasFileRef.current?.click()}
                style={{background:B.surface2,border:`2px dashed ${B.border}`,borderRadius:8,
                  padding:"20px 32px",cursor:"pointer",fontSize:13.5,color:B.muted,
                  fontFamily:"inherit",width:"100%",textAlign:"center"}}>
                📂 Click to select a .json file
              </button>
              {ideasJsonText && (
                <div style={{fontSize:12,color:B.dim,marginTop:8}}>
                  File loaded — {ideasJsonText.length.toLocaleString()} characters
                </div>
              )}
            </div>
          )}

          {ideasErr && (
            <div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.06)",
              border:"1px solid rgba(239,68,68,0.25)",borderRadius:6,fontSize:13,color:"#a02020"}}>
              ⚠ {ideasErr}
            </div>
          )}

          {/* Diff preview */}
          {ideasDiff && ideasParsed && (
            <div style={{marginTop:16}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",
                color:B.muted,marginBottom:10}}>Change Preview</div>
              <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                {[
                  {label:`${ideasDiff.added.length} Added`,color:"#1a6010",bg:"rgba(99,223,78,0.10)",bd:"rgba(99,223,78,0.3)"},
                  {label:`${ideasDiff.updated.length} Updated`,color:"#805700",bg:"rgba(245,158,11,0.08)",bd:"rgba(245,158,11,0.3)"},
                  {label:`${ideasDiff.removed.length} Removed`,color:"#a02020",bg:"rgba(239,68,68,0.06)",bd:"rgba(239,68,68,0.2)"},
                  {label:`${ideasDiff.unchanged.length} Unchanged`,color:B.dim,bg:B.surface2,bd:B.border},
                ].map(s => (
                  <span key={s.label} style={{fontSize:12,fontWeight:700,padding:"4px 12px",
                    borderRadius:20,background:s.bg,color:s.color,border:`1px solid ${s.bd}`}}>
                    {s.label}
                  </span>
                ))}
              </div>

              {ideasDiff.added.length > 0 && (
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11.5,fontWeight:700,color:"#1a6010",marginBottom:6}}>Added</div>
                  {ideasDiff.added.map(t => (
                    <div key={t.id} style={{fontSize:12.5,padding:"6px 10px",marginBottom:4,
                      background:"rgba(99,223,78,0.06)",borderRadius:5,color:B.text,
                      border:"1px solid rgba(99,223,78,0.2)"}}>
                      <strong>{t.title}</strong>
                      <span style={{fontSize:11,marginLeft:8,color:B.dim}}>{t.status} · {t.category}</span>
                    </div>
                  ))}
                </div>
              )}
              {ideasDiff.updated.length > 0 && (
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11.5,fontWeight:700,color:"#805700",marginBottom:6}}>Updated</div>
                  {ideasDiff.updated.map(t => (
                    <div key={t.id} style={{fontSize:12.5,padding:"6px 10px",marginBottom:4,
                      background:"rgba(245,158,11,0.06)",borderRadius:5,color:B.text,
                      border:"1px solid rgba(245,158,11,0.2)"}}>
                      <strong>{t.title}</strong>
                      <span style={{fontSize:11,marginLeft:8,color:B.dim}}>{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {ideasDiff.removed.length > 0 && (
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11.5,fontWeight:700,color:"#a02020",marginBottom:6}}>Removed</div>
                  {ideasDiff.removed.map(t => (
                    <div key={t.id} style={{fontSize:12.5,padding:"6px 10px",marginBottom:4,
                      background:"rgba(239,68,68,0.04)",borderRadius:5,color:B.text,
                      border:"1px solid rgba(239,68,68,0.15)"}}>
                      <strong>{t.title}</strong>
                    </div>
                  ))}
                </div>
              )}

              {ideasSaveSuccess && (
                <Callout type="success" icon="✅">
                  <strong>Idea catalog updated.</strong> {ideasParsed.length} ideas now live.
                </Callout>
              )}

              <button onClick={handleIdeasApply} disabled={ideasSaving}
                style={{background:ideasSaving?B.surface2:B.blue,color:ideasSaving?B.dim:"#fff",
                  fontWeight:700,fontSize:14,padding:"11px 24px",borderRadius:7,
                  border:"none",cursor:ideasSaving?"default":"pointer",marginTop:4}}>
                {ideasSaving ? "Applying..." : `Apply ${ideasParsed.length} Ideas →`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,padding:"18px 22px"}}>
        <div style={{fontSize:13,fontWeight:700,color:B.text,marginBottom:10}}>How to update the catalog</div>
        {[
          ["1. Export","Click Export JSON ↓ above to download the current live catalog as a .json file."],
          ["2. Edit","Open the file in any text editor, or paste it into Claude and describe your changes in plain English. Claude will return the updated JSON."],
          ["3. Upload","Paste the updated JSON or upload the file here. A diff preview will show exactly what changes before anything is applied."],
          ["4. Apply","Click Apply. The catalog updates immediately for all users on next load."],
        ].map(([step, text]) => (
          <div key={step} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
            <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,
              background:B.accentBg,color:B.blue,whiteSpace:"nowrap",marginTop:1}}>{step}</span>
            <span style={{fontSize:13,color:B.muted,lineHeight:1.6}}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageAdmin
