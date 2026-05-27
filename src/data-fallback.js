// AUTO-GENERATED -- do not edit manually.
// Update public/data/tiles.json and public/data/ideas.json instead.
export const TILES_FALLBACK = [
  {
    "id": "account-command-center",
    "name": "Account Command Center",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Builds a dark-ops console HTML artifact with full account intelligence — contracts, health scores, pipeline, contacts, and more for any company.",
    "useCase": "Before any customer engagement — get the complete account picture in a single artifact.",
    "triggers": [
      "account command center",
      "account command center for"
    ]
  },
  {
    "id": "account-lookup",
    "name": "Account Lookup",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Searches and identifies ServiceNow accounts by name; handles disambiguation and reuses account context across the session.",
    "useCase": "Used automatically when any skill needs to resolve a company name to an account ID.",
    "triggers": [
      "look up account",
      "find account",
      "account number"
    ]
  },
  {
    "id": "contact-intelligence-profile",
    "name": "Contact Intelligence Profile",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Seven views of customer contact data: Card, Dashboard, Top Contacts, Network, Buying Group, Events & Sessions, and Segmentation. Powered by Snowflake CDL.",
    "useCase": "Identify who's engaged, who's gone dark, and who to activate before a renewal or EBC.",
    "triggers": [
      "contact profile",
      "top contacts at",
      "buying group",
      "who attended",
      "contact-intelligence"
    ]
  },
  {
    "id": "ai-adoption-advisor",
    "name": "AI Adoption Advisor",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Value & Adoption",
    "desc": "Post-sale AI adoption coaching for CEG/Sales teams — maturity assessments, use case ID, AI roadmaps, adoption plans, lever suggestions, playbooks, and expert services recommendations.",
    "useCase": "Customer hasn't activated Now Assist? Get a maturity assessment and recommended enablement path.",
    "triggers": [
      "AI adoption",
      "Now Assist adoption",
      "AI maturity assessment"
    ]
  },
  {
    "id": "sales-to-post-sale-brief",
    "name": "Sales-to-Post-Sale Brief",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Generates a comprehensive sales-to-post-sale handoff brief using opportunity data from Snowflake and product adoption metrics from Value Melody.",
    "useCase": "New logo just closed — get a full handoff brief before the first CSM call.",
    "triggers": [
      "handoff brief",
      "sales to post-sale brief",
      "transition brief"
    ]
  },
  {
    "id": "ai-renewal-intelligence",
    "name": "AI Renewal Intelligence",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Renewals & Pipeline",
    "desc": "Account rep-facing renewal advisor offering a 6-option menu: customer landscape, top 3 renewal risks, upsell/cross-sell, renewal outreach email, product footprint flags, and 2–3 page renewal summary.",
    "useCase": "Renewal coming up — get a risk assessment, upsell angles, and a draft outreach in one workflow.",
    "triggers": [
      "renewal insights",
      "renewal prep",
      "renewal risks",
      "renewal advisor",
      "renewal flags"
    ]
  },
  {
    "id": "value-melody-coach",
    "name": "Value Melody Coach",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Value & Adoption",
    "desc": "Post-API reference guide for value analysis execution — formatting, analysis instructions, and core behaviors after VE_Pipeline returns data.",
    "useCase": "Building a business case or BVA — this orchestrates the full value deliverable end to end.",
    "triggers": [
      "business case",
      "SVP",
      "BVA",
      "value narrative for"
    ]
  },
  {
    "id": "value-melody-analyst",
    "name": "Value Melody Analyst",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Value & Adoption",
    "desc": "Primary workflow for creating value deliverables: business cases, SVPs, BVAs, and narratives. Controls workflow over the Analyst skill when both are loaded.",
    "useCase": "After Value Melody data returns — use this to structure, format, and present the output correctly.",
    "triggers": [
      "Value Melody",
      "Hey Melody",
      "Hi Melody"
    ]
  },
  {
    "id": "analytics-data-connector",
    "name": "Analytics Data Connector",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "System",
    "desc": "Retrieves opportunity, territory, and account analytics from Snowflake. No direct user triggers — routed to automatically by other skills.",
    "useCase": "Powers the data behind Territory Planning, Weekly Momentum, Deal Review, and other data-driven skills.",
    "triggers": [
      "analytics data connector"
    ]
  },
  {
    "id": "ai-coach-engage-meeting-prep",
    "name": "AI Coach — Meeting Prep",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Coaching & Strategy",
    "desc": "Meeting briefs, talking points, and discussion strategies — quick 30-sec or comprehensive 2–3 min. Includes strategic event briefs for K26, World Forum, Summits, and EBCs.",
    "useCase": "Before any customer meeting — get a tailored brief with context, agenda, and talking points.",
    "triggers": [
      "meeting prep",
      "talking points",
      "pre-call brief",
      "KBYG",
      "brief for"
    ]
  },
  {
    "id": "ai-coach-plan-territory-planning",
    "name": "AI Coach — Territory Planning",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Coaching & Strategy",
    "desc": "Generates full FY26 Territory Plans as an HTML file for ServiceNow AEs — Snowflake pipeline data, web research, and account prioritization. Can take up to 10 minutes.",
    "useCase": "QBR season or new territory assignment — get a data-grounded territory plan in the standard format.",
    "triggers": [
      "territory planning for",
      "territory plan for",
      "my territory overview"
    ]
  },
  {
    "id": "weekly-momentum-checklist",
    "name": "Weekly Momentum Checklist",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Renewals & Pipeline",
    "desc": "Generates a Weekly Momentum Checklist HTML artifact for an AE with 4 tabs: Summary, In Quarter Pipeline, Out Quarter Pipeline, and Planning Checklist. Takes 3–5 minutes.",
    "useCase": "Use before Monday 1:1s — surfaces red flags in pipeline before they become problems.",
    "triggers": [
      "weekly momentum",
      "momentum checklist",
      "1:1 prep",
      "pipeline review for"
    ]
  },
  {
    "id": "deal-review-prep",
    "name": "Deal Review Prep",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Renewals & Pipeline",
    "desc": "Preps an FLSM/leader for a 1:1 deal review — specific account deals or top 5 by NNACV across a territory, workflow, or account.",
    "useCase": "Before a deal review 1:1 — get the deal context, health signals, and talking points in under 2 minutes.",
    "triggers": [
      "deal review prep for",
      "top deals to review for"
    ]
  },
  {
    "id": "ceg-servicenow-pptx",
    "name": "CEG QBR Generator",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Content & Deliverables",
    "desc": "Generates CEG Quarterly Business Review PowerPoint decks from Snowflake metrics. Exclusively for requests containing 'CEG' AND one of: QBR, quarterly review, metrics deck.",
    "useCase": "Generate a QBR-ready deck with live CEG metrics. Say 'CEG QBR' to trigger.",
    "triggers": [
      "CEG QBR",
      "CEG Quarterly Review",
      "CEG Metrics deck"
    ]
  },
  {
    "id": "servicenow-corporate-pptx",
    "name": "ServiceNow Corporate PPTX",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Content & Deliverables",
    "desc": "Creates ServiceNow-branded PowerPoint presentations using the official Corporate Template with Infinite Blue backgrounds, Wasabi Green accents, and glass container layouts.",
    "useCase": "Any presentation for a customer or exec — get a fully branded SN deck in minutes.",
    "triggers": [
      "create a presentation",
      "corporate deck",
      "ServiceNow Slides"
    ]
  },
  {
    "id": "smart-brevity-docx",
    "name": "Smart Brevity DOCX",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "Content & Deliverables",
    "desc": "Enforces smart brevity principles and 2–5 page limits for all Word document creation — reports, briefs, memos, and proposals.",
    "useCase": "Write a memo or brief — get tight, scannable output with no filler.",
    "triggers": [
      "write a brief",
      "create a memo",
      "draft a report",
      "word document"
    ]
  },
  {
    "id": "html-artifact-brand-skill-v1",
    "name": "HTML Artifact Brand Skill",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "System",
    "desc": "Applies ServiceNow brand guidelines (Infinite Blue, Wasabi Green, typography) to HTML and React artifacts — dashboards, tools, data visualizations, and web interfaces.",
    "useCase": "Ensures any HTML artifact produced by other skills is automatically on-brand.",
    "triggers": []
  },
  {
    "id": "servicenow-brand-standards-reference",
    "name": "SN Brand Standards Reference",
    "type": "enterprise-skill",
    "status": "now",
    "cat": "System",
    "desc": "Ambient brand policy inherited by all downstream content skills — voice, tone, writing style, approved colors, and typography. Also serves as a standalone brand reference.",
    "useCase": "Ask about ServiceNow brand standards, voice guidelines, or approved colors and fonts.",
    "triggers": [
      "brand standards",
      "brand colors",
      "brand guidelines",
      "ServiceNow fonts"
    ]
  },
  {
    "id": "csp-ask-ai-exec-summary",
    "name": "Ask AI: Account Executive Summary",
    "type": "in-platform",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Covers account health, financials, renewals, and pipeline — generated directly from Account 360 in CSP.",
    "useCase": "To get an up-to-date executive overview of your account directly out of Acct360 in CSP.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "csp-ask-ai-adoption-gaps",
    "name": "Ask AI: Account Adoption Gaps",
    "type": "in-platform",
    "status": "now",
    "cat": "Value & Adoption",
    "desc": "Highlights undeployed ACV and unused licensed products for your account.",
    "useCase": "To get an overview of adoption gaps for your account directly out of Acct360 in CSP.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "csp-ask-ai-handoff-brief",
    "name": "Ask AI: Account Handoff Brief",
    "type": "in-platform",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Includes deal context, commitments, stakeholders, and risks — generated in CSP.",
    "useCase": "To get a handoff brief directly out of Acct360 in CSP.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "csp-ask-ai-agentic-reframe",
    "name": "Ask AI: Agentic Business Reframe Plan",
    "type": "in-platform",
    "status": "now",
    "cat": "Account Intelligence",
    "desc": "Generates an Agentic Business Reframe Plan directly from Account 360 in CSP.",
    "useCase": "To get an Agentic Business Reframe Plan directly out of Acct360 in CSP.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "csp-ask-ai-adoption-advisor",
    "name": "Ask AI: AI Adoption Advisor",
    "type": "in-platform",
    "status": "now",
    "cat": "Value & Adoption",
    "desc": "Creates a post-sales AI Adoption Advisor guide with adoption recommendations and analysis.",
    "useCase": "To get AI Adoption recommendations and analysis directly out of Acct360 in CSP.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "csp-ask-ai-value-adoption-plan",
    "name": "Ask AI: Value Adoption Plan",
    "type": "in-platform",
    "status": "now",
    "cat": "Value & Adoption",
    "desc": "Generates a comprehensive Value Adoption Plan directly from Account 360 in CSP.",
    "useCase": "To get a value adoption plan directly out of Acct360 in CSP.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "csp-renewal-package-generator",
    "name": "Renewal Package Generator",
    "type": "in-platform",
    "status": "now",
    "cat": "Renewals & Pipeline",
    "desc": "Consolidates key renewal and account information in one place, making renewal preparation simpler, easier, and faster.",
    "useCase": "When you need to prepare for a renewal — navigate to RAM Workspace in CSP and select Generate Renewal Package.",
    "url": "https://success.servicenow.com/now/cwf/agent/home"
  },
  {
    "id": "es-genius",
    "name": "ES Genius",
    "type": "in-platform",
    "status": "now",
    "cat": "Knowledge",
    "desc": "ServiceNow Expert chatbot to answer questions on implementation, best practices, and platform guidance.",
    "useCase": "To get expert guidance on implementation, best practices, etc.",
    "url": "https://esgenius.servicenow.com/ask-expert"
  },
  {
    "id": "customer-dashboard-asset-generator",
    "name": "Customer Dashboard — Asset Generator",
    "type": "in-platform",
    "status": "now",
    "cat": "Content & Deliverables",
    "desc": "Within the Customer Dashboard, click the Generate cell next to your account to access an asset hub where you can generate numerous documents and decks.",
    "useCase": "When you need to generate documentation for your customer.",
    "url": "https://app.powerbi.com/groups/me/apps/e7a9ec59-ba43-434e-a776-a4054704b1f6/reports/359372cf-39ac-4fcd-a397-7b39e7e125bb/ReportSectionf35666a2c84bcdcb0983?ctid=8bcff170-9979-491e-8683-d8ced0850bad&experience=power-bi"
  }
]

export const IDEAS_FALLBACK = [
  {
    "id": "pipeline-1",
    "title": "Pre-Interlock Intelligence Agent",
    "problem": "Automatically generates a structured account brief when a CSM receives a new account assignment, pulling from Account Plan, Dynamics, Surf, and Customer Dashboard. Delivered directly in CSP before the Interlock, without any manual research.",
    "category": "Account Intelligence",
    "status": "committed"
  },
  {
    "id": "pipeline-2",
    "title": "QIR Research Agent",
    "problem": "Auto-generates a comprehensive QIR brief inside CSP by pulling health scores, adoption data, value reports, product metrics, and historical customer context from multiple systems into a single ready-to-use artifact. The CSM can review, adjust, and ask follow-up questions via conversational AI before the meeting.",
    "category": "Account Intelligence",
    "status": "committed"
  },
  {
    "id": "pipeline-3",
    "title": "Post-Meeting Synthesis + Email Management Agent",
    "problem": "Listens to every customer meeting and automatically generates internal summaries, customer-facing recaps, structured action items, and CSP touchpoints from the raw transcript. Selected customer emails can also be brought into CSP as logged touchpoints.",
    "category": "Account Intelligence",
    "status": "committed"
  },
  {
    "id": "pipeline-4",
    "title": "Resource Connection Agent",
    "problem": "Enables CSMs to search across all ServiceNow content sources (Best Practices, SNU, Community, AI Agent Gallery) from a single panel inside CSP and receive cited, customer-ready answers. When digital content isn't sufficient, it routes the request to the right internal expert through a structured workflow with tracking and resolution logging.",
    "category": "Knowledge",
    "status": "committed"
  },
  {
    "id": "pipeline-5",
    "title": "Portfolio Intelligence Agent",
    "problem": "Aggregates escalations, system-generated risk signals, scheduled tasks, and inbound customer outreach into a single ranked action feed on the CSM's landing page. The feed continuously re-ranks accounts and refreshes recommended next-best actions as new signals arrive.",
    "category": "Risk Management",
    "status": "committed"
  },
  {
    "id": "pipeline-6",
    "title": "Scheduling Automation Agent",
    "problem": "Automates meeting coordination across Teams and Zoom by reading account context, identifying the right stakeholders, and surfacing available times across the group. Handles recurring ceremony setup, rules-based triggers, customer self-scheduling links, and automatic availability refresh if no response is received.",
    "category": "Account Intelligence",
    "status": "committed"
  },
  {
    "id": "pipeline-7",
    "title": "CRIR Risk Mitigation Plan Agent",
    "problem": "Automatically enriches each incoming CRIR risk record with a draft mitigation plan containing a risk summary, root cause hypothesis, prioritised next-best actions, suggested owners, and links to relevant accelerators. The CSM reviews, adjusts, and activates the plan directly from the risk record.",
    "category": "Risk Management",
    "status": "committed"
  },
  {
    "id": "pipeline-8",
    "title": "Value Realization Agent",
    "problem": "Auto-generates a Value Blueprint for each customer based on their entitlements and business outcomes, and produces a quarterly Value Outcome Review tracking progress against the blueprint with next-best action recommendations. Both are generated automatically at assignment and at QIR time respectively, and are available on demand.",
    "category": "Value & Adoption",
    "status": "committed"
  },
  {
    "id": "pipeline-9",
    "title": "Support Intelligence Agent",
    "problem": "Automatically surfaces active support cases, critical escalations, and recurring problem trends across a CSM's account portfolio in their workspace. Delivers proactive P1/P2 alerts and pre-meeting support summaries before every customer-facing call.",
    "category": "Risk Management",
    "status": "committed"
  },
  {
    "id": "pipeline-10",
    "title": "Product Adoption Roadmap Agent",
    "problem": "Generates a personalised adoption roadmap pre-populated with proven sequencing and milestones based on the customer's entitlements, business objectives, and industry context. The roadmap spans the customer's full ServiceNow product footprint and is available for CSM review and adjustment before any adoption conversation.",
    "category": "Value & Adoption",
    "status": "committed"
  }
]
