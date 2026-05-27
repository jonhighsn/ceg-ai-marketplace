import { useState, useEffect, useRef, useMemo } from "react";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
  blue:"#032D42", teal:"#044355", wasabi:"#63DF4E", snGreen:"#81B5A1",
  bg:"#F4F6F8", white:"#FFFFFF", surface:"#FFFFFF", surface2:"#F0F4F7",
  border:"#DDE3E9", borderDark:"#C5CDD6",
  text:"#032D42", muted:"#4A6070", dim:"#8A9BAA",
  accentBg:"rgba(3,45,66,0.06)", wasabiBg:"rgba(99,223,78,0.12)",
};

// ── Constants ─────────────────────────────────────────────────────────────────
const SKILL_REPO_URL = "https://servicenow.sharepoint.com/sites/pe_eic/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2Fpe%5Feic%2FShared%20Documents%2FGeneral%2FSkill%20Up%20Academies%2FSchool%20of%20AI%2FAI%20Native%20Enablement%20Toolkit%2FClaude%2FClaude%20Skills%20Repository&viewid=379ada0d%2D04eb%2D4d58%2D85be%2D855a3ba460f5";
const CEG_HUB_URL = "https://claude.ai"; // update to actual hub artifact link
const STORAGE_INTAKE_KEY = "storefront:intake-submissions";
const ADMIN_PASSCODE = "ceg2026";
const STORAGE_CATALOG_KEY = "storefront:catalog-override";
const STORAGE_VOTES_KEY = "storefront:idea-votes";          // shared — vote counts
const STORAGE_USER_VOTES_KEY = "storefront:user-votes";     // personal — which ideas voted
const CSP_URL = "https://success.servicenow.com/now/cwf/agent/home";
const STORAGE_IDEAS_SEEDED_KEY = "storefront:ideas-seeded-override";

// ── Shared primitives ─────────────────────────────────────────────────────────
const Callout = ({type="info",icon,children}) => {
  const s={
    info:{bg:"rgba(129,181,161,0.10)",bd:"rgba(129,181,161,0.35)",c:"#2d6a57"},
    warning:{bg:"rgba(245,158,11,0.08)",bd:"rgba(245,158,11,0.35)",c:"#92600a"},
    danger:{bg:"rgba(239,68,68,0.06)",bd:"rgba(239,68,68,0.3)",c:"#a02020"},
    success:{bg:"rgba(99,223,78,0.10)",bd:"rgba(99,223,78,0.35)",c:"#2d6020"},
  }[type];
  return (
    <div style={{display:"flex",gap:10,padding:"12px 14px",borderRadius:6,marginBottom:14,
      fontSize:13.5,lineHeight:1.55,background:s.bg,border:`1px solid ${s.bd}`,color:s.c}}>
      <span style={{flexShrink:0,fontSize:14,marginTop:1}}>{icon}</span><span>{children}</span>
    </div>
  );
};

const TagPill = ({color="green",children}) => {
  const s={
    green:{bg:"rgba(99,223,78,0.14)",c:"#1a6010",bd:"rgba(99,223,78,0.4)"},
    blue:{bg:"rgba(3,45,66,0.08)",c:B.blue,bd:"rgba(3,45,66,0.2)"},
    teal:{bg:"rgba(129,181,161,0.15)",c:"#2d6a57",bd:"rgba(129,181,161,0.4)"},
    amber:{bg:"rgba(245,158,11,0.10)",c:"#805700",bd:"rgba(245,158,11,0.35)"},
    purple:{bg:"rgba(139,92,246,0.10)",c:"#5b21b6",bd:"rgba(139,92,246,0.35)"},
  }[color]||{bg:"rgba(3,45,66,0.08)",c:B.blue,bd:"rgba(3,45,66,0.2)"};
  return <span style={{display:"inline-flex",alignItems:"center",fontSize:10.5,fontWeight:700,padding:"2px 8px",
    borderRadius:4,letterSpacing:"0.3px",textTransform:"uppercase",
    background:s.bg,color:s.c,border:`1px solid ${s.bd}`}}>{children}</span>;
};

const SubLabel = ({children}) => (
  <span style={{fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",
    color:B.blue,marginBottom:8,marginTop:18,display:"block",
    borderBottom:`2px solid ${B.wasabi}`,paddingBottom:4}}>{children}</span>
);

// ── Tile metadata ─────────────────────────────────────────────────────────────
const TYPE_META = {
  "in-platform":      {label:"In-Platform",      color:"teal",   icon:"⚡"},
  "enterprise-skill": {label:"Enterprise Skill",  color:"blue",   icon:"🤖"},
  "local-skill":      {label:"Local Skill",       color:"amber",  icon:"📦"},
  "automated":        {label:"Automated",         color:"purple", icon:"⚙️"},
};
const STATUS_META = {
  now:   {label:"Now",         color:"green"},
  next:  {label:"Coming Next", color:"blue"},
  later: {label:"Coming Later",color:"amber"},
};

// ── Tiles catalog ─────────────────────────────────────────────────────────────
const TILES = [

  // ── Enterprise Claude Skills ─────────────────────────────────────────────────
  {id:"account-command-center", name:"Account Command Center",
   type:"enterprise-skill", status:"now", cat:"Account Intelligence",
   desc:"Builds a dark-ops console HTML artifact with full account intelligence — contracts, health scores, pipeline, contacts, and more for any company.",
   useCase:"Before any customer engagement — get the complete account picture in a single artifact.",
   triggers:["account command center","account command center for"]},

  {id:"account-lookup", name:"Account Lookup",
   type:"enterprise-skill", status:"now", cat:"Account Intelligence",
   desc:"Searches and identifies ServiceNow accounts by name; handles disambiguation and reuses account context across the session.",
   useCase:"Used automatically when any skill needs to resolve a company name to an account ID.",
   triggers:["look up account","find account","account number"]},

  {id:"contact-intelligence-profile", name:"Contact Intelligence Profile",
   type:"enterprise-skill", status:"now", cat:"Account Intelligence",
   desc:"Seven views of customer contact data: Card, Dashboard, Top Contacts, Network, Buying Group, Events & Sessions, and Segmentation. Powered by Snowflake CDL.",
   useCase:"Identify who's engaged, who's gone dark, and who to activate before a renewal or EBC.",
   triggers:["contact profile","top contacts at","buying group","who attended","contact-intelligence"]},

  {id:"ai-adoption-advisor", name:"AI Adoption Advisor",
   type:"enterprise-skill", status:"now", cat:"Value & Adoption",
   desc:"Post-sale AI adoption coaching for CEG/Sales teams — maturity assessments, use case ID, AI roadmaps, adoption plans, lever suggestions, playbooks, and expert services recommendations.",
   useCase:"Customer hasn't activated Now Assist? Get a maturity assessment and recommended enablement path.",
   triggers:["AI adoption","Now Assist adoption","AI maturity assessment"]},

  {id:"sales-to-post-sale-brief", name:"Sales-to-Post-Sale Brief",
   type:"enterprise-skill", status:"now", cat:"Account Intelligence",
   desc:"Generates a comprehensive sales-to-post-sale handoff brief using opportunity data from Snowflake and product adoption metrics from Value Melody.",
   useCase:"New logo just closed — get a full handoff brief before the first CSM call.",
   triggers:["handoff brief","sales to post-sale brief","transition brief"]},

  {id:"ai-renewal-intelligence", name:"AI Renewal Intelligence",
   type:"enterprise-skill", status:"now", cat:"Renewals & Pipeline",
   desc:"Account rep-facing renewal advisor offering a 6-option menu: customer landscape, top 3 renewal risks, upsell/cross-sell, renewal outreach email, product footprint flags, and 2–3 page renewal summary.",
   useCase:"Renewal coming up — get a risk assessment, upsell angles, and a draft outreach in one workflow.",
   triggers:["renewal insights","renewal prep","renewal risks","renewal advisor","renewal flags"]},

  {id:"value-melody-coach", name:"Value Melody Coach",
   type:"enterprise-skill", status:"now", cat:"Value & Adoption",
   desc:"Post-API reference guide for value analysis execution — formatting, analysis instructions, and core behaviors after VE_Pipeline returns data.",
   useCase:"Building a business case or BVA — this orchestrates the full value deliverable end to end.",
   triggers:["business case","SVP","BVA","value narrative for"]},

  {id:"value-melody-analyst", name:"Value Melody Analyst",
   type:"enterprise-skill", status:"now", cat:"Value & Adoption",
   desc:"Primary workflow for creating value deliverables: business cases, SVPs, BVAs, and narratives. Controls workflow over the Analyst skill when both are loaded.",
   useCase:"After Value Melody data returns — use this to structure, format, and present the output correctly.",
   triggers:["Value Melody","Hey Melody","Hi Melody"]},

  {id:"analytics-data-connector", name:"Analytics Data Connector",
   type:"enterprise-skill", status:"now", cat:"System",
   desc:"Retrieves opportunity, territory, and account analytics from Snowflake. No direct user triggers — routed to automatically by other skills.",
   useCase:"Powers the data behind Territory Planning, Weekly Momentum, Deal Review, and other data-driven skills.",
   triggers:["analytics data connector"]},

  {id:"ai-coach-engage-meeting-prep", name:"AI Coach — Meeting Prep",
   type:"enterprise-skill", status:"now", cat:"Coaching & Strategy",
   desc:"Meeting briefs, talking points, and discussion strategies — quick 30-sec or comprehensive 2–3 min. Includes strategic event briefs for K26, World Forum, Summits, and EBCs.",
   useCase:"Before any customer meeting — get a tailored brief with context, agenda, and talking points.",
   triggers:["meeting prep","talking points","pre-call brief","KBYG","brief for"]},

  {id:"ai-coach-plan-territory-planning", name:"AI Coach — Territory Planning",
   type:"enterprise-skill", status:"now", cat:"Coaching & Strategy",
   desc:"Generates full FY26 Territory Plans as an HTML file for ServiceNow AEs — Snowflake pipeline data, web research, and account prioritization. Can take up to 10 minutes.",
   useCase:"QBR season or new territory assignment — get a data-grounded territory plan in the standard format.",
   triggers:["territory planning for","territory plan for","my territory overview"]},

  {id:"weekly-momentum-checklist", name:"Weekly Momentum Checklist",
   type:"enterprise-skill", status:"now", cat:"Renewals & Pipeline",
   desc:"Generates a Weekly Momentum Checklist HTML artifact for an AE with 4 tabs: Summary, In Quarter Pipeline, Out Quarter Pipeline, and Planning Checklist. Takes 3–5 minutes.",
   useCase:"Use before Monday 1:1s — surfaces red flags in pipeline before they become problems.",
   triggers:["weekly momentum","momentum checklist","1:1 prep","pipeline review for"]},

  {id:"deal-review-prep", name:"Deal Review Prep",
   type:"enterprise-skill", status:"now", cat:"Renewals & Pipeline",
   desc:"Preps an FLSM/leader for a 1:1 deal review — specific account deals or top 5 by NNACV across a territory, workflow, or account.",
   useCase:"Before a deal review 1:1 — get the deal context, health signals, and talking points in under 2 minutes.",
   triggers:["deal review prep for","top deals to review for"]},

  {id:"ceg-servicenow-pptx", name:"CEG QBR Generator",
   type:"enterprise-skill", status:"now", cat:"Content & Deliverables",
   desc:"Generates CEG Quarterly Business Review PowerPoint decks from Snowflake metrics. Exclusively for requests containing 'CEG' AND one of: QBR, quarterly review, metrics deck.",
   useCase:"Generate a QBR-ready deck with live CEG metrics. Say 'CEG QBR' to trigger.",
   triggers:["CEG QBR","CEG Quarterly Review","CEG Metrics deck"]},

  {id:"servicenow-corporate-pptx", name:"ServiceNow Corporate PPTX",
   type:"enterprise-skill", status:"now", cat:"Content & Deliverables",
   desc:"Creates ServiceNow-branded PowerPoint presentations using the official Corporate Template with Infinite Blue backgrounds, Wasabi Green accents, and glass container layouts.",
   useCase:"Any presentation for a customer or exec — get a fully branded SN deck in minutes.",
   triggers:["create a presentation","corporate deck","ServiceNow Slides"]},

  {id:"smart-brevity-docx", name:"Smart Brevity DOCX",
   type:"enterprise-skill", status:"now", cat:"Content & Deliverables",
   desc:"Enforces smart brevity principles and 2–5 page limits for all Word document creation — reports, briefs, memos, and proposals.",
   useCase:"Write a memo or brief — get tight, scannable output with no filler.",
   triggers:["write a brief","create a memo","draft a report","word document"]},

  {id:"html-artifact-brand-skill-v1", name:"HTML Artifact Brand Skill",
   type:"enterprise-skill", status:"now", cat:"System",
   desc:"Applies ServiceNow brand guidelines (Infinite Blue, Wasabi Green, typography) to HTML and React artifacts — dashboards, tools, data visualizations, and web interfaces.",
   useCase:"Ensures any HTML artifact produced by other skills is automatically on-brand.",
   triggers:[]},

  {id:"servicenow-brand-standards-reference", name:"SN Brand Standards Reference",
   type:"enterprise-skill", status:"now", cat:"System",
   desc:"Ambient brand policy inherited by all downstream content skills — voice, tone, writing style, approved colors, and typography. Also serves as a standalone brand reference.",
   useCase:"Ask about ServiceNow brand standards, voice guidelines, or approved colors and fonts.",
   triggers:["brand standards","brand colors","brand guidelines","ServiceNow fonts"]},

  // ── CSP AI Features ───────────────────────────────────────────────────────────
  {id:"csp-ask-ai-exec-summary", name:"Ask AI: Account Executive Summary",
   type:"in-platform", status:"now", cat:"Account Intelligence",
   desc:"Covers account health, financials, renewals, and pipeline — generated directly from Account 360 in CSP.",
   useCase:"To get an up-to-date executive overview of your account directly out of Acct360 in CSP.",
   url:CSP_URL},

  {id:"csp-ask-ai-adoption-gaps", name:"Ask AI: Account Adoption Gaps",
   type:"in-platform", status:"now", cat:"Value & Adoption",
   desc:"Highlights undeployed ACV and unused licensed products for your account.",
   useCase:"To get an overview of adoption gaps for your account directly out of Acct360 in CSP.",
   url:CSP_URL},

  {id:"csp-ask-ai-handoff-brief", name:"Ask AI: Account Handoff Brief",
   type:"in-platform", status:"now", cat:"Account Intelligence",
   desc:"Includes deal context, commitments, stakeholders, and risks — generated in CSP.",
   useCase:"To get a handoff brief directly out of Acct360 in CSP.",
   url:CSP_URL},

  {id:"csp-ask-ai-agentic-reframe", name:"Ask AI: Agentic Business Reframe Plan",
   type:"in-platform", status:"now", cat:"Account Intelligence",
   desc:"Generates an Agentic Business Reframe Plan directly from Account 360 in CSP.",
   useCase:"To get an Agentic Business Reframe Plan directly out of Acct360 in CSP.",
   url:CSP_URL},

  {id:"csp-ask-ai-adoption-advisor", name:"Ask AI: AI Adoption Advisor",
   type:"in-platform", status:"now", cat:"Value & Adoption",
   desc:"Creates a post-sales AI Adoption Advisor guide with adoption recommendations and analysis.",
   useCase:"To get AI Adoption recommendations and analysis directly out of Acct360 in CSP.",
   url:CSP_URL},

  {id:"csp-ask-ai-value-adoption-plan", name:"Ask AI: Value Adoption Plan",
   type:"in-platform", status:"now", cat:"Value & Adoption",
   desc:"Generates a comprehensive Value Adoption Plan directly from Account 360 in CSP.",
   useCase:"To get a value adoption plan directly out of Acct360 in CSP.",
   url:CSP_URL},

  {id:"csp-renewal-package-generator", name:"Renewal Package Generator",
   type:"in-platform", status:"now", cat:"Renewals & Pipeline",
   desc:"Consolidates key renewal and account information in one place, making renewal preparation simpler, easier, and faster.",
   useCase:"When you need to prepare for a renewal — navigate to RAM Workspace in CSP and select Generate Renewal Package.",
   url:CSP_URL},

  // ── Other AI Tools ────────────────────────────────────────────────────────────
  {id:"es-genius", name:"ES Genius",
   type:"in-platform", status:"now", cat:"Knowledge",
   desc:"ServiceNow Expert chatbot to answer questions on implementation, best practices, and platform guidance.",
   useCase:"To get expert guidance on implementation, best practices, etc.",
   url:"https://esgenius.servicenow.com/ask-expert"},

  {id:"customer-dashboard-asset-generator", name:"Customer Dashboard — Asset Generator",
   type:"in-platform", status:"now", cat:"Content & Deliverables",
   desc:"Within the Customer Dashboard, click the Generate cell next to your account to access an asset hub where you can generate numerous documents and decks.",
   useCase:"When you need to generate documentation for your customer.",
   url:"https://app.powerbi.com/groups/me/apps/e7a9ec59-ba43-434e-a776-a4054704b1f6/reports/359372cf-39ac-4fcd-a397-7b39e7e125bb/ReportSectionf35666a2c84bcdcb0983?ctid=8bcff170-9979-491e-8683-d8ced0850bad&experience=power-bi"},

];


// ── TileCard ──────────────────────────────────────────────────────────────────
const TileCard = ({tile, onSelect}) => {
  const [hov, setHov] = useState(false);
  const tm = TYPE_META[tile.type];
  const sm = STATUS_META[tile.status];
  const available = tile.status === "now";
  return (
    <div onClick={() => onSelect(tile)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{background:B.white, border:`1px solid ${hov?B.snGreen:B.border}`,
        borderRadius:10, padding:"16px 18px", cursor:"pointer",
        boxShadow: hov?"0 4px 16px rgba(3,45,66,0.10)":"0 1px 3px rgba(3,45,66,0.05)",
        transition:"box-shadow 0.15s, border-color 0.15s", display:"flex", flexDirection:"column"}}>
      <div style={{display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center"}}>
        <TagPill color={tm.color}>{tm.icon} {tm.label}</TagPill>
        {tile.status !== "now" && <TagPill color={sm.color}>{sm.label}</TagPill>}
      </div>
      <div style={{fontSize:15, fontWeight:700, color:B.text, marginBottom:4, lineHeight:1.3}}>{tile.name}</div>
      <div style={{fontSize:11, color:B.dim, marginBottom:8, letterSpacing:"0.2px"}}>
        {tile.cat}
      </div>
      <div style={{fontSize:13, color:B.muted, lineHeight:1.55, flex:1, marginBottom:12}}>{tile.desc}</div>
      <div style={{fontSize:11.5, fontWeight:600,
        color: available ? B.snGreen : B.dim}}>
        {!available ? "Coming Soon" :
         tile.type === "in-platform" ? "Available in CSP →" :
         tile.type === "enterprise-skill" ? `Say: "${tile.triggers?.[0]}" →` :
         tile.type === "local-skill" ? "Download & Install →" :
         "Automated · Running"}
      </div>
    </div>
  );
};

// ── TileModal ─────────────────────────────────────────────────────────────────
const TileModal = ({tile, onClose}) => {
  const [copied, setCopied] = useState(null);
  const tm = TYPE_META[tile.type];
  const sm = STATUS_META[tile.status];
  const available = tile.status === "now";

  const copyTrigger = (t) => {
    navigator.clipboard?.writeText(t).catch(()=>{});
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(3,45,66,0.45)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div onClick={e => e.stopPropagation()}
        style={{background:B.white, borderRadius:12, width:"100%", maxWidth:540,
          maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(3,45,66,0.25)"}}>
        {/* Header */}
        <div style={{background:B.blue, padding:"20px 24px", borderRadius:"12px 12px 0 0"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex", gap:6, marginBottom:8}}>
                <TagPill color={tm.color}>{tm.icon} {tm.label}</TagPill>
                {tile.status !== "now" && <TagPill color={sm.color}>{sm.label}</TagPill>}
              </div>
              <div style={{fontSize:20, fontWeight:700, color:"#fff", lineHeight:1.2}}>{tile.name}</div>
              <div style={{fontSize:12, color:"rgba(255,255,255,0.6)", marginTop:4}}>
                {tile.cat}
              </div>
            </div>
            <button onClick={onClose}
              style={{background:"rgba(255,255,255,0.12)", border:"none", color:"#fff",
                width:30, height:30, borderRadius:6, cursor:"pointer", fontSize:16,
                display:"flex",alignItems:"center",justifyContent:"center", flexShrink:0}}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{padding:"20px 24px"}}>
          <SubLabel>What it does</SubLabel>
          <div style={{fontSize:14, color:B.muted, lineHeight:1.65, marginBottom:16}}>{tile.desc}</div>

          <SubLabel>When to use it</SubLabel>
          <div style={{fontSize:14, color:B.muted, lineHeight:1.65, marginBottom:16,
            background:B.wasabiBg, padding:"10px 14px", borderRadius:6,
            borderLeft:`3px solid ${B.wasabi}`}}>{tile.useCase}</div>

          {/* Enterprise / Local skill triggers */}
          {(tile.type === "enterprise-skill" || tile.type === "local-skill") && tile.triggers && available && (
            <>
              <SubLabel>How to activate</SubLabel>
              {tile.type === "enterprise-skill" && (
                <div style={{fontSize:13, color:B.muted, marginBottom:10}}>
                  Pre-loaded for all CEG users. Just type any trigger phrase in Claude:
                </div>
              )}
              {tile.type === "local-skill" && (
                <div style={{fontSize:13, color:B.muted, marginBottom:10}}>
                  Download the skill file from SharePoint, install via Claude Settings, then use a trigger:
                </div>
              )}
              <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:16}}>
                {tile.triggers.map(t => (
                  <div key={t} onClick={() => copyTrigger(t)}
                    style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                      background:B.accentBg, border:`1px solid ${B.border}`, borderRadius:6,
                      padding:"8px 12px", cursor:"pointer",
                      transition:"background 0.1s"}}
                    onMouseEnter={e => e.currentTarget.style.background = B.wasabiBg}
                    onMouseLeave={e => e.currentTarget.style.background = B.accentBg}>
                    <span style={{fontSize:13, fontFamily:"monospace", color:B.text}}>"{t}"</span>
                    <span style={{fontSize:11, color: copied===t ? "#1a6010" : B.snGreen, fontWeight:600}}>
                      {copied===t ? "✓ Copied!" : "Copy"}
                    </span>
                  </div>
                ))}
              </div>
              {tile.type === "local-skill" && (
                <a href={SKILL_REPO_URL} target="_blank" rel="noreferrer"
                  style={{display:"inline-flex", alignItems:"center", gap:6,
                    background:B.blue, color:"#fff", fontWeight:700, fontSize:13,
                    padding:"10px 18px", borderRadius:6, textDecoration:"none"}}>
                  📦 Download from SharePoint →
                </a>
              )}
            </>
          )}

          {/* In-platform link */}
          {tile.type === "in-platform" && tile.url && available && (
            <>
              <SubLabel>Where to find it</SubLabel>
              <div style={{fontSize:13, color:B.muted, marginBottom:12}}>
                Available directly within the CSP platform. No separate installation required.
              </div>
              <a href={tile.url} target="_blank" rel="noreferrer"
                style={{display:"inline-flex", alignItems:"center", gap:6,
                  background:B.teal, color:"#fff", fontWeight:700, fontSize:13,
                  padding:"10px 18px", borderRadius:6, textDecoration:"none"}}>
                ⚡ Open in CSP →
              </a>
            </>
          )}

          {/* Automated info */}
          {tile.type === "automated" && available && (
            <>
              <SubLabel>How it works</SubLabel>
              <div style={{fontSize:13, color:B.muted, lineHeight:1.65, marginBottom:12}}>
                This workflow runs automatically — no action needed from you.
                Contact CEG Strategic Operations to confirm you're on the distribution list.
              </div>
            </>
          )}

          {/* Coming soon */}
          {!available && (
            <Callout type="info" icon="🗓">
              <strong>{sm.label}:</strong> This capability is on the roadmap and not yet available.
              Submit an idea or upvote a similar request in the <span style={{fontWeight:700}}>Submit Idea</span> tab.
            </Callout>
          )}
        </div>
      </div>
    </div>
  );
};


// ── SNSearchCard ──────────────────────────────────────────────────────────────
// Shared SN-style two-row input card used on Home and Pipeline
const Sparkle = ({size=28, style={}}) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
    <path d="M14 2C14 2 15.2 9.2 18.8 11.2C22.4 13.2 26 14 26 14C26 14 22.4 14.8 18.8 16.8C15.2 18.8 14 26 14 26C14 26 12.8 18.8 9.2 16.8C5.6 14.8 2 14 2 14C2 14 5.6 13.2 9.2 11.2C12.8 9.2 14 2 14 2Z"
      fill="url(#sg)" />
    <defs>
      <linearGradient id="sg" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#63DF4E"/>
        <stop offset="100%" stopColor="#0EA5E9"/>
      </linearGradient>
    </defs>
  </svg>
);

const SNSearchCard = ({
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


// ── Pure helpers (sort / filter / normalize / parse) ─────────────────────────
const TYPE_SORT_ORDER = { "in-platform": 0, "enterprise-skill": 1, "local-skill": 2, "automated": 3 };

const sortCatalogTiles = (tiles) =>
  [...tiles].sort((a, b) =>
    (TYPE_SORT_ORDER[a.type] ?? 99) - (TYPE_SORT_ORDER[b.type] ?? 99) ||
    a.name.localeCompare(b.name)
  );

const filterCatalogByQuery = (tiles, q) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return tiles;
  return tiles.filter(t =>
    [t.name, t.desc, t.useCase, t.cat, t.id].some(f => (f || "").toLowerCase().includes(needle))
  );
};

const normalizeIdeaStatus = (s) =>
  ({ planned: "committed", "in-progress": "committed", shipped: "delivered" }[s] || s);

const parseUnifiedSearch = (text) => {
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      // Accept both new {catalog:[]} and legacy {recommendations:[]} shapes
      catalog: Array.isArray(parsed.catalog)         ? parsed.catalog :
               Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      ideas:   Array.isArray(parsed.ideas)           ? parsed.ideas   : [],
    };
  } catch { return { catalog: [], ideas: [] }; }
};

// Dev assertions (uncomment in console to verify)
// const devAssert = (label, cond) => { if (!cond) console.error("FAIL:", label); };
// devAssert("in-platform first", sortCatalogTiles([{id:"a",type:"enterprise-skill",name:"A"},{id:"b",type:"in-platform",name:"B"}])[0].type === "in-platform");
// devAssert("normalize shipped→delivered", normalizeIdeaStatus("shipped") === "delivered");
// devAssert("normalize planned→committed", normalizeIdeaStatus("planned") === "committed");
// devAssert("filterCatalog empty query", filterCatalogByQuery([{name:"X",desc:"",useCase:"",cat:"",id:"x"}],"").length === 1);

// ── PageHome ──────────────────────────────────────────────────────────────────
const PageHome = ({tiles=TILES, ideas=[]}) => {
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
    } catch(e) { setAiResult({catalog:[], ideas:[]}); }
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
        eyebrow="CEG AI Storefront"
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
          {(matchedAiTiles.length > 0 || matchedAiIdeas.length > 0) ? (
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
const PageBrowse = ({tiles=TILES}) => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTile, setSelectedTile] = useState(null);

  const types = ["all", "in-platform", "enterprise-skill", "local-skill"];

  const filtered = useMemo(() => {
    const byType = typeFilter === "all" ? tiles : tiles.filter(t => t.type === typeFilter);
    const bySearch = filterCatalogByQuery(byType, searchQuery);
    return sortCatalogTiles(bySearch);
  }, [tiles, typeFilter, searchQuery]);

  const typeCounts = useMemo(() => {
    return Object.fromEntries(types.map(t => [t, t === "all" ? tiles.length :
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
        {types.map(t => {
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

      {/* Tile grid */}
      {filtered.length > 0 ? (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14}}>
          {filtered.map(t => <TileCard key={t.id} tile={t} onSelect={setSelectedTile} />)}
        </div>
      ) : (
        <div style={{textAlign:"center", padding:"40px 20px",
          background:B.white, border:`1px solid ${B.border}`, borderRadius:10}}>
          <div style={{fontSize:32, marginBottom:12}}>🔍</div>
          <div style={{fontSize:15, fontWeight:600, color:B.text, marginBottom:6}}>No capabilities match this filter</div>
          <div style={{fontSize:13, color:B.muted}}>Try a different type or role filter</div>
        </div>
      )}

      {selectedTile && <TileModal tile={selectedTile} onClose={() => setSelectedTile(null)} />}
    </div>
  );
};


// ── Pipeline data ─────────────────────────────────────────────────────────
const IDEA_STATUS_META = {
  "under-review": { label: "Under Review", color: "amber",  dot: "#d97706" },
  "committed":    { label: "Committed",    color: "blue",   dot: "#032D42" },
  "delivered":    { label: "Delivered",    color: "green",  dot: "#1a6010" },
};
const VALID_IDEA_STATUSES = ["under-review", "committed", "delivered"];

const SEEDED_IDEAS = [
  {id:"pipeline-1", title:"Pre-Interlock Intelligence Agent",
   problem:"Automatically generates a structured account brief when a CSM receives a new account assignment, pulling from Account Plan, Dynamics, Surf, and Customer Dashboard. Delivered directly in CSP before the Interlock, without any manual research.",
   category:"Account Intelligence",
   status:"committed"},
  {id:"pipeline-2", title:"QIR Research Agent",
   problem:"Auto-generates a comprehensive QIR brief inside CSP by pulling health scores, adoption data, value reports, product metrics, and historical customer context from multiple systems into a single ready-to-use artifact. The CSM can review, adjust, and ask follow-up questions via conversational AI before the meeting.",
   category:"Account Intelligence",
   status:"committed"},
  {id:"pipeline-3", title:"Post-Meeting Synthesis + Email Management Agent",
   problem:"Listens to every customer meeting and automatically generates internal summaries, customer-facing recaps, structured action items, and CSP touchpoints from the raw transcript. Selected customer emails can also be brought into CSP as logged touchpoints.",
   category:"Account Intelligence",
   status:"committed"},
  {id:"pipeline-4", title:"Resource Connection Agent",
   problem:"Enables CSMs to search across all ServiceNow content sources (Best Practices, SNU, Community, AI Agent Gallery) from a single panel inside CSP and receive cited, customer-ready answers. When digital content isn't sufficient, it routes the request to the right internal expert through a structured workflow with tracking and resolution logging.",
   category:"Knowledge",
   status:"committed"},
  {id:"pipeline-5", title:"Portfolio Intelligence Agent",
   problem:"Aggregates escalations, system-generated risk signals, scheduled tasks, and inbound customer outreach into a single ranked action feed on the CSM's landing page. The feed continuously re-ranks accounts and refreshes recommended next-best actions as new signals arrive.",
   category:"Risk Management",
   status:"committed"},
  {id:"pipeline-6", title:"Scheduling Automation Agent",
   problem:"Automates meeting coordination across Teams and Zoom by reading account context, identifying the right stakeholders, and surfacing available times across the group. Handles recurring ceremony setup, rules-based triggers, customer self-scheduling links, and automatic availability refresh if no response is received.",
   category:"Account Intelligence",
   status:"committed"},
  {id:"pipeline-7", title:"CRIR Risk Mitigation Plan Agent",
   problem:"Automatically enriches each incoming CRIR risk record with a draft mitigation plan containing a risk summary, root cause hypothesis, prioritised next-best actions, suggested owners, and links to relevant accelerators. The CSM reviews, adjusts, and activates the plan directly from the risk record.",
   category:"Risk Management",
   status:"committed"},
  {id:"pipeline-8", title:"Value Realization Agent",
   problem:"Auto-generates a Value Blueprint for each customer based on their entitlements and business outcomes, and produces a quarterly Value Outcome Review tracking progress against the blueprint with next-best action recommendations. Both are generated automatically at assignment and at QIR time respectively, and are available on demand.",
   category:"Value & Adoption",
   status:"committed"},
  {id:"pipeline-9", title:"Support Intelligence Agent",
   problem:"Automatically surfaces active support cases, critical escalations, and recurring problem trends across a CSM's account portfolio in their workspace. Delivers proactive P1/P2 alerts and pre-meeting support summaries before every customer-facing call.",
   category:"Risk Management",
   status:"committed"},
  {id:"pipeline-10", title:"Product Adoption Roadmap Agent",
   problem:"Generates a personalised adoption roadmap pre-populated with proven sequencing and milestones based on the customer's entitlements, business objectives, and industry context. The roadmap spans the customer's full ServiceNow product footprint and is available for CSM review and adjustment before any adoption conversation.",
   category:"Value & Adoption",
   status:"committed"},
];

const IdeaStatusBadge = ({status}) => {
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

// ── DiscoverySubmit ───────────────────────────────────────────────────────────
const SUBMIT_FORM_URL = "https://my.servicenow.com/esc?id=service_catalog&spa=1&sc_catalog=c95aaa98dba5cb4487e977c9bf96196f,cac30a4ddb6497403d7958a8dc961930,0ec1a76347332100158b949b6c9a7102,efd64078db9d1300b2e2d34b5e96194e,3e75ccbcdb5d1300b2e2d34b5e9619a6,42c07a15db951700b2e2d34b5e9619f1,0c0369b4db555300b2e2d34b5e9619fe,118448b4db9d1300b2e2d34b5e961902,1b8e663adb59d700e65cf7441d961965,706540f4db9d1300b2e2d34b5e961919,a17688b4db9d1300b2e2d34b5e961906,8994ca1ddbfceb80426ec170ba961944,32e6f66fdb8284501e4d5ad3ca9619ed,0bbdfdf91b5b5410e04565302a4bcb9a,a929c32f1ba0245052afc956624bcb22,32d6f100dbc56050f36213e8139619da,e0d08b13c3330100c8b837659bba8fb4,79022366c38e6910953ba6bc7a0131a9,4c82a476c3694250b40cedbeb001314f,9a9e75f91b124210828f21b0604bcb97&sc_category=undefined&sc_cat_item=8eb839a2476032106bc48fbdd46d4303";

const DiscoverySubmit = ({ submissions, setSubmissions, onSubmitSuccess }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null); // {catalog:[], ideas:[]}
  const [selectedTile, setSelectedTile] = useState(null);

  const CATEGORY_OPTIONS = ["Account Intelligence","Value & Adoption","Renewals & Pipeline",
    "Content & Deliverables","Risk Management","Onboarding","Knowledge","Other"];

  const hasResults = aiResult !== null && aiResult.length > 0;
  const noResults  = aiResult !== null && aiResult.length === 0;

  const matchedTiles = useMemo(() => {
    if (!aiResult) return [];
    return aiResult.map(r => ({ ...r, tile: TILES.find(t => t.id === r.id) })).filter(r => r.tile);
  }, [aiResult]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setAiResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a capability matching engine for the ServiceNow CEG AI catalog. Given a user idea or use case, find the best 1-3 existing capabilities that already satisfy it. Catalog: ${JSON.stringify(TILES.map(t=>({id:t.id,name:t.name,type:t.cat,desc:t.desc})))}. Return ONLY valid JSON: {"recommendations":[{"id":"tile-id","name":"name","reason":"1-2 sentences explaining how this already covers their use case","confidence":"high|medium"}]}. If nothing genuinely matches, return {"recommendations":[]}.`,
          messages: [{ role: "user", content: `My idea or use case: ${query}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAiResult(parsed.recommendations || []);
    } catch (e) { setAiResult([]); }
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
const PageIdeaPortal = ({ideas}) => {
  const _ideas = ideas || SEEDED_IDEAS;
  const [tab, setTab] = useState("catalog");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // votes: { [ideaId]: count }  — shared across all users
  const [votes, setVotes] = useState({});
  // userVotes: Set of idea IDs this user has already voted on — personal
  const [userVotes, setUserVotes] = useState(new Set());

  // Load submissions, votes, userVotes from storage
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage?.get(STORAGE_INTAKE_KEY, true);
        if (r?.value) setSubmissions(JSON.parse(r.value));
      } catch(e) {}
      try {
        const v = await window.storage?.get(STORAGE_VOTES_KEY, true);
        if (v?.value) setVotes(JSON.parse(v.value));
      } catch(e) {}
      try {
        const uv = await window.storage?.get(STORAGE_USER_VOTES_KEY, false);
        if (uv?.value) setUserVotes(new Set(JSON.parse(uv.value)));
      } catch(e) {}
    })();
  }, []);

  const handleVote = async (ideaId) => {
    if (userVotes.has(ideaId)) return; // already voted
    const newVotes = { ...votes, [ideaId]: (votes[ideaId] || 0) + 1 };
    const newUserVotes = new Set([...userVotes, ideaId]);
    setVotes(newVotes);
    setUserVotes(newUserVotes);
    try {
      await window.storage?.set(STORAGE_VOTES_KEY, JSON.stringify(newVotes), true);
      await window.storage?.set(STORAGE_USER_VOTES_KEY, JSON.stringify([...newUserVotes]), false);
    } catch(e) {}
  };

  const allIdeas = useMemo(() => {
    const userIdeas = submissions.map(s => ({...s, status:normalizeIdeaStatus(s.status||"under-review"), seeded:false}));
    return [..._ideas.map(i=>({...i,status:normalizeIdeaStatus(i.status)})), ...userIdeas];
  }, [submissions, _ideas]);

  const filteredIdeas = useMemo(() => {
    const byStatus = statusFilter === "all" ? allIdeas : allIdeas.filter(i => i.status === statusFilter);
    if (!searchQuery.trim()) return byStatus;
    const needle = searchQuery.trim().toLowerCase();
    return byStatus.filter(i =>
      [i.title, i.problem, i.category].some(f => (f||"").toLowerCase().includes(needle))
    );
  }, [allIdeas, statusFilter, searchQuery]);

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
          {submitted && (
            <Callout type="success" icon="✅">
              <strong>Idea submitted!</strong> It's now visible in the catalog with "Under Review" status.
            </Callout>
          )}

          {/* Search input */}
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ideas by title, category, or description..."
            style={{width:"100%",padding:"10px 14px",fontSize:14,
              border:`1px solid ${B.border}`,borderRadius:8,
              fontFamily:"inherit",outline:"none",
              boxSizing:"border-box",background:B.white,marginBottom:14}}
          />

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
        <DiscoverySubmit
          submissions={submissions}
          setSubmissions={setSubmissions}
          onSubmitSuccess={() => { setSubmitted(true); setTab("catalog"); setTimeout(() => setSubmitted(false), 2200); }}
        />
      )}
    </div>
  );
};


const PageAdmin = ({ liveTiles, onCatalogUpdate, liveIdeas, onIdeasUpdate }) => {
  const _liveIdeas = liveIdeas || SEEDED_IDEAS;
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
      await window.storage?.set(STORAGE_IDEAS_SEEDED_KEY, JSON.stringify(ideasParsed), true);
      onIdeasUpdate(ideasParsed);
      setIdeasSaveSuccess(true);
      setTimeout(() => setIdeasSaveSuccess(false), 3000);
    } catch(e) { setIdeasErr("Storage write failed: " + e.message); }
    setIdeasSaving(false);
  };

  const handleIdeasReset = async () => {
    await window.storage?.delete(STORAGE_IDEAS_SEEDED_KEY, true);
    onIdeasUpdate(SEEDED_IDEAS);
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
      await window.storage?.set(STORAGE_CATALOG_KEY, JSON.stringify(parsed), true);
      onCatalogUpdate(parsed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(e) {
      setUploadErr("Storage write failed: " + e.message);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    await window.storage?.delete(STORAGE_CATALOG_KEY, true);
    onCatalogUpdate(TILES);
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
  const isOverride = liveTiles !== TILES;
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
            {_liveIdeas !== SEEDED_IDEAS && (
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
              {_liveIdeas !== SEEDED_IDEAS && !ideasResetConfirm && (
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

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  {id:"home",  icon:"🏠", label:"Home"},
  {id:"browse",icon:"🗂",  label:"Browse Catalog"},
  {id:"submit",icon:"🚀", label:"Pipeline"},
];

const Sidebar = ({page, onPage, tiles=TILES}) => {
  return (
    <div style={{width:220, flexShrink:0, background:B.blue, display:"flex",
      flexDirection:"column", minHeight:"100vh", position:"sticky", top:0}}>
      {/* Logo */}
      <div style={{padding:"20px 18px 14px"}}>
        <div style={{fontSize:10, fontWeight:700, letterSpacing:"2px",
          textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginBottom:3}}>ServiceNow</div>
        <div style={{fontSize:15, fontWeight:700, color:"#fff", lineHeight:1.2}}>CEG AI Storefront</div>
      </div>


      {/* Nav items */}
      <div style={{padding:"10px 8px", flex:1}}>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => onPage(n.id)}
              style={{width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"10px 10px", borderRadius:7, marginBottom:2,
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                border: `1px solid ${active ? "rgba(255,255,255,0.15)" : "transparent"}`,
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                fontSize:13.5, fontWeight: active ? 700 : 500,
                cursor:"pointer", textAlign:"left", fontFamily:"inherit"}}>
              <span style={{fontSize:16}}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <button
          onClick={() => onPage("admin")}
          aria-label="Admin"
          title="Admin"
          style={{
            marginBottom:10, background:"none", border:"none",
            color:"rgba(255,255,255,0.3)", cursor:"pointer",
            fontSize:16, padding:"4px 2px", display:"flex",
            alignItems:"center", gap:6, fontFamily:"inherit",
            transition:"color 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
        >
          ⚙️
        </button>
        <a href={SKILL_REPO_URL} target="_blank" rel="noreferrer"
          style={{display:"flex", alignItems:"center", gap:7,
            color:"rgba(255,255,255,0.45)", fontSize:11.5, textDecoration:"none"}}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
          📦 Skill File Repository →
        </a>

      </div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [liveTiles, setLiveTiles] = useState(() => TILES);
  const [liveIdeas, setLiveIdeas] = useState(() => SEEDED_IDEAS);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  // Load tiles from storage on init — fall back to hardcoded TILES
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage?.get(STORAGE_CATALOG_KEY, true);
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          if (Array.isArray(parsed) && parsed.length > 0) setLiveTiles(parsed);
        }
      } catch(e) {}
      try {
        const ri = await window.storage?.get(STORAGE_IDEAS_SEEDED_KEY, true);
        if (ri?.value) {
          const parsed = JSON.parse(ri.value);
          if (Array.isArray(parsed) && parsed.length > 0) setLiveIdeas(parsed);
        }
      } catch(e) {}
      setTilesLoaded(true);
    })();
  }, []);


  // Cross-component nav events
  useEffect(() => {
    const handler = e => setPage(e.detail);
    window.addEventListener("storefront:nav", handler);
    return () => window.removeEventListener("storefront:nav", handler);
  }, []);

  if (!tilesLoaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",
      minHeight:"100vh",background:B.bg,color:B.muted,fontSize:14}}>
      Loading catalog...
    </div>
  );

  const PageComponent = {
    home: PageHome,
    browse: PageBrowse,
    submit: PageIdeaPortal,
    admin: PageAdmin,
  }[page] || PageHome;

  return (
    <div style={{display:"flex", minHeight:"100vh", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background:B.bg, color:B.text}}>
      <Sidebar page={page} onPage={setPage} tiles={liveTiles} />
      <div style={{flex:1, padding:"28px 32px", overflowY:"auto", minWidth:0}}>
        {page === "admin"
          ? <PageAdmin liveTiles={liveTiles} onCatalogUpdate={setLiveTiles} liveIdeas={liveIdeas} onIdeasUpdate={setLiveIdeas} />
          : <PageComponent tiles={liveTiles} ideas={liveIdeas} />}
      </div>
    </div>
  );
}
