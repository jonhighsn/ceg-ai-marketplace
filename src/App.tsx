import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  Bot,
  Boxes,
  ChevronRight,
  CircleGauge,
  Clock3,
  FileText,
  Filter,
  Layers3,
  Library,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'
import './App.css'

type Skill = {
  id: number
  name: string
  category: string
  owner: string
  summary: string
  impact: string
  installs: number
  risk: 'Low' | 'Medium'
  updated: string
  status: 'Approved' | 'Pilot' | 'Needs review'
  tags: string[]
}

const skills: Skill[] = [
  {
    id: 1,
    name: 'Executive Brief Builder',
    category: 'Field Ops',
    owner: 'CEG Strategy',
    summary: 'Turns account notes, risks, and outcomes into concise exec-ready briefs.',
    impact: 'Saves 2.4h per briefing',
    installs: 42,
    risk: 'Low',
    updated: 'May 24',
    status: 'Approved',
    tags: ['Briefing', 'Accounts', 'Summaries'],
  },
  {
    id: 2,
    name: 'Renewal Risk Lens',
    category: 'Customer Health',
    owner: 'Value Engineering',
    summary: 'Flags churn signals from meeting notes and maps each signal to a CEG motion.',
    impact: '18 active plays',
    installs: 31,
    risk: 'Medium',
    updated: 'May 22',
    status: 'Pilot',
    tags: ['Risk', 'Churn', 'Next best action'],
  },
  {
    id: 3,
    name: 'Workflow Intake Classifier',
    category: 'Automation',
    owner: 'AI Enablement',
    summary: 'Classifies new workflow ideas by maturity, data needs, review path, and owner.',
    impact: '74% faster triage',
    installs: 58,
    risk: 'Low',
    updated: 'May 18',
    status: 'Approved',
    tags: ['Intake', 'Routing', 'Governance'],
  },
  {
    id: 4,
    name: 'Office Hours Synthesizer',
    category: 'Knowledge',
    owner: 'Product Advisory',
    summary: 'Converts customer office hours transcripts into product themes and evidence.',
    impact: '12 teams using',
    installs: 27,
    risk: 'Medium',
    updated: 'May 16',
    status: 'Needs review',
    tags: ['Research', 'Themes', 'Evidence'],
  },
]

const categories = ['All', 'Field Ops', 'Customer Health', 'Automation', 'Knowledge']

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState(skills[0].id)

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return skills.filter((skill) => {
      const matchesCategory = category === 'All' || skill.category === category
      const matchesQuery =
        !normalizedQuery ||
        [skill.name, skill.summary, skill.owner, skill.category, ...skill.tags]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const selectedSkill =
    filteredSkills.find((skill) => skill.id === selectedId) ?? filteredSkills[0] ?? skills[0]

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={19} strokeWidth={2.2} />
          </div>
          <div>
            <strong>CEG AI</strong>
            <span>Marketplace</span>
          </div>
        </div>

        <nav className="nav-list">
          <a className="nav-item active" href="#catalog">
            <Library size={18} />
            Catalog
          </a>
          <a className="nav-item" href="#workflows">
            <Workflow size={18} />
            Workflows
          </a>
          <a className="nav-item" href="#governance">
            <ShieldCheck size={18} />
            Governance
          </a>
          <a className="nav-item" href="#kits">
            <Boxes size={18} />
            Kits
          </a>
        </nav>

        <section className="review-card" aria-labelledby="review-heading">
          <div className="review-icon">
            <LockKeyhole size={18} />
          </div>
          <h2 id="review-heading">Trust queue</h2>
          <p>3 skills awaiting data review before broader CEG rollout.</p>
          <button type="button">Review</button>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Skill catalog</h1>
            <p>Discover, request, and reuse approved AI workflows for CEG teams.</p>
          </div>
          <button className="primary-action" type="button">
            <Bot size={18} />
            Submit skill
          </button>
        </header>

        <section className="toolbar" aria-label="Catalog filters">
          <label className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skills, owners, tags"
              type="search"
            />
          </label>
          <div className="filter-group" aria-label="Category">
            <Filter size={17} />
            {categories.map((item) => (
              <button
                className={item === category ? 'filter active' : 'filter'}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <div className="content-grid">
          <section className="catalog" id="catalog" aria-label="Marketplace catalog">
            {filteredSkills.map((skill) => (
              <button
                className={skill.id === selectedSkill.id ? 'skill-row selected' : 'skill-row'}
                key={skill.id}
                onClick={() => setSelectedId(skill.id)}
                type="button"
              >
                <div className="skill-leading">
                  <span className="skill-icon">
                    <Layers3 size={19} />
                  </span>
                  <div>
                    <div className="skill-title-line">
                      <h2>{skill.name}</h2>
                      <span className={`status ${skill.status.toLowerCase().replaceAll(' ', '-')}`}>
                        {skill.status}
                      </span>
                    </div>
                    <p>{skill.summary}</p>
                    <div className="tag-row">
                      {skill.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="skill-meta">
                  <span>{skill.category}</span>
                  <strong>{skill.installs}</strong>
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </section>

          <aside className="detail-panel" aria-label="Selected skill details">
            <div className="detail-header">
              <span className="detail-icon">
                <BadgeCheck size={21} />
              </span>
              <span className={`status ${selectedSkill.status.toLowerCase().replaceAll(' ', '-')}`}>
                {selectedSkill.status}
              </span>
            </div>

            <h2>{selectedSkill.name}</h2>
            <p>{selectedSkill.summary}</p>

            <div className="metrics">
              <div>
                <CircleGauge size={18} />
                <span>Impact</span>
                <strong>{selectedSkill.impact}</strong>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Risk</span>
                <strong>{selectedSkill.risk}</strong>
              </div>
              <div>
                <Clock3 size={18} />
                <span>Updated</span>
                <strong>{selectedSkill.updated}</strong>
              </div>
            </div>

            <dl className="owner-list">
              <div>
                <dt>Owner</dt>
                <dd>{selectedSkill.owner}</dd>
              </div>
              <div>
                <dt>Installs</dt>
                <dd>{selectedSkill.installs} teams</dd>
              </div>
              <div>
                <dt>Review path</dt>
                <dd>CEG AI governance</dd>
              </div>
            </dl>

            <div className="detail-actions">
              <button className="primary-action" type="button">
                <Sparkles size={17} />
                Request access
              </button>
              <button className="secondary-action" type="button">
                <FileText size={17} />
                View playbook
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default App
