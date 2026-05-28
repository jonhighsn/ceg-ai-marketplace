export const B = {
  blue: '#032D42', teal: '#044355', wasabi: '#63DF4E', snGreen: '#81B5A1',
  bg: '#F4F6F8', white: '#FFFFFF', surface: '#FFFFFF', surface2: '#F0F4F7',
  border: '#DDE3E9', borderDark: '#C5CDD6',
  text: '#032D42', muted: '#4A6070', dim: '#8A9BAA',
  accentBg: 'rgba(3,45,66,0.06)', wasabiBg: 'rgba(99,223,78,0.12)',
}

export const SKILL_REPO_URL = "https://servicenow.sharepoint.com/sites/pe_eic/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2Fpe%5Feic%2FShared%20Documents%2FGeneral%2FSkill%20Up%20Academies%2FSchool%20of%20AI%2FAI%20Native%20Enablement%20Toolkit%2FClaude%2FClaude%20Skills%20Repository&viewid=379ada0d%2D04eb%2D4d58%2D85be%2D855a3ba460f5"
export const CEG_HUB_URL = 'https://claude.ai'
export const STORAGE_INTAKE_KEY = 'storefront:intake-submissions'
export const ADMIN_PASSCODE = 'ceg2026'
export const STORAGE_CATALOG_KEY = 'storefront:catalog-override'
export const STORAGE_VOTES_KEY = 'storefront:idea-votes'
export const STORAGE_USER_VOTES_KEY = 'storefront:user-votes'
export const CSP_URL = "https://success.servicenow.com/now/cwf/agent/home"
export const STORAGE_IDEAS_SEEDED_KEY = 'storefront:ideas-seeded-override'
export const REPO_OWNER = 'jonhighsn'
export const REPO_NAME = 'ceg-ai-marketplace'
export const DATA_BRANCH = 'data'
export const DATA_RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${DATA_BRANCH}/catalog.json`
export const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
export const STORAGE_GITHUB_PAT_KEY = 'storefront:github-pat'
export const STORAGE_CATALOG_SHA_KEY = 'storefront:catalog-sha'
export const SUBMIT_FORM_URL = "https://my.servicenow.com/esc?id=service_catalog&spa=1&sc_catalog=c95aaa98dba5cb4487e977c9bf96196f,cac30a4ddb6497403d7958a8dc961930,0ec1a76347332100158b949b6c9a7102,efd64078db9d1300b2e2d34b5e96194e,3e75ccbcdb5d1300b2e2d34b5e9619a6,42c07a15db951700b2e2d34b5e9619f1,0c0369b4db555300b2e2d34b5e9619fe,118448b4db9d1300b2e2d34b5e961902,1b8e663adb59d700e65cf7441d961965,706540f4db9d1300b2e2d34b5e961919,a17688b4db9d1300b2e2d34b5e961906,8994ca1ddbfceb80426ec170ba961944,32e6f66fdb8284501e4d5ad3ca9619ed,0bbdfdf91b5b5410e04565302a4bcb9a,a929c32f1ba0245052afc956624bcb22,32d6f100dbc56050f36213e8139619da,e0d08b13c3330100c8b837659bba8fb4,79022366c38e6910953ba6bc7a0131a9,4c82a476c3694250b40cedbeb001314f,9a9e75f91b124210828f21b0604bcb97&sc_category=undefined&sc_cat_item=8eb839a2476032106bc48fbdd46d4303"

export const TYPE_META = {
  'in-platform': { label: 'In-Platform', color: 'teal', icon: '⚡' },
  'enterprise-skill': { label: 'Enterprise Skill', color: 'blue', icon: '🤖' },
  'local-skill': { label: 'Local Skill', color: 'amber', icon: '📦' },
  automated: { label: 'Automated', color: 'purple', icon: '⚙️' },
}

export const STATUS_META = {
  now: { label: 'Now', color: 'green' },
  next: { label: 'Coming Next', color: 'blue' },
  later: { label: 'Coming Later', color: 'amber' },
}

export const TYPE_SORT_ORDER = { 'in-platform': 0, 'enterprise-skill': 1, 'local-skill': 2, automated: 3 }

export const IDEA_STATUS_META = {
  'under-review': { label: 'Under Review', color: 'amber', dot: '#d97706' },
  committed: { label: 'Committed', color: 'blue', dot: '#032D42' },
  delivered: { label: 'Delivered', color: 'green', dot: '#1a6010' },
}

export const VALID_IDEA_STATUSES = ['under-review', 'committed', 'delivered']
