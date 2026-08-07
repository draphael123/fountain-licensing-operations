"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Readiness = "Ready" | "Nearly ready" | "Blocked" | "Research needed";

type StateRecord = {
  code: string;
  name: string;
  readiness: Readiness;
  tier: string;
  programs: string[];
  coverage: number;
  target: string;
  summary: string;
  blockers: { title: string; owner: string; impact: string; priority: "High" | "Medium" }[];
  providers: { label: string; role: string; status: string }[];
  evidence: string[];
};

const states: StateRecord[] = [
  {
    code: "CO", name: "Colorado", readiness: "Ready", tier: "Tier 1", programs: ["TRT", "HRT", "GLP"], coverage: 4, target: "Available now",
    summary: "Provider coverage and operating requirements are complete for all three programs.",
    blockers: [],
    providers: [{ label: "Provider A", role: "NP", status: "Active" }, { label: "Provider B", role: "MD", status: "Active" }],
    evidence: ["Provider licenses verified", "Corporate registration confirmed", "Last reviewed Aug 4, 2026"],
  },
  {
    code: "WV", name: "West Virginia", readiness: "Nearly ready", tier: "Tier 2", programs: ["TRT", "HRT", "GLP"], coverage: 3, target: "Est. 3–5 weeks",
    summary: "Clinical coverage is in place. One physician license and a corporate authorization remain.",
    blockers: [
      { title: "Complete physician license", owner: "Licensing", impact: "Unlocks all programs", priority: "High" },
      { title: "File certificate of authorization", owner: "Legal", impact: "Required before launch", priority: "Medium" },
    ],
    providers: [{ label: "Provider C", role: "NP", status: "Active" }, { label: "Provider D", role: "MD", status: "Application planned" }],
    evidence: ["NP practice threshold confirmed", "In-state office requirement documented", "Last reviewed Aug 1, 2026"],
  },
  {
    code: "RI", name: "Rhode Island", readiness: "Blocked", tier: "Tier 1", programs: ["Non-controlled"], coverage: 2, target: "No target",
    summary: "Licensing is progressing, but the operating model lacks a compliant local clinical address and lab pathway.",
    blockers: [
      { title: "Establish clinical business address", owner: "Operations", impact: "Required for controlled substances", priority: "High" },
      { title: "Confirm viable lab pathway", owner: "Clinical Ops", impact: "Blocks standard service model", priority: "High" },
    ],
    providers: [{ label: "Provider A", role: "NP", status: "Application submitted" }, { label: "Provider E", role: "MD", status: "Not started" }],
    evidence: ["Address requirement needs legal confirmation", "Lab availability assessed", "Last reviewed Jul 28, 2026"],
  },
  {
    code: "HI", name: "Hawaii", readiness: "Nearly ready", tier: "Tier 1", programs: ["HRT", "GLP", "Async"], coverage: 2, target: "Est. 4–6 weeks",
    summary: "Non-controlled and asynchronous programs are viable. Controlled prescribing requires physical in-state presence.",
    blockers: [{ title: "Complete foreign qualification", owner: "Legal", impact: "Unlocks non-controlled launch", priority: "High" }],
    providers: [{ label: "Provider F", role: "NP", status: "Active" }, { label: "Provider G", role: "NP", status: "Pending review" }],
    evidence: ["Controlled-substance limitation documented", "Shipping pathway confirmed", "Last reviewed Aug 2, 2026"],
  },
  {
    code: "OK", name: "Oklahoma", readiness: "Research needed", tier: "Tier 3", programs: ["Async", "Non-controlled"], coverage: 1, target: "Under review",
    summary: "An asynchronous model may be viable, but clinical and corporate interpretations need approval.",
    blockers: [
      { title: "Approve async care interpretation", owner: "Clinical Legal", impact: "Defines viable program scope", priority: "High" },
      { title: "Confirm entity qualification", owner: "Legal", impact: "Required before launch", priority: "Medium" },
    ],
    providers: [{ label: "Provider B", role: "MD", status: "Application submitted" }],
    evidence: ["Store-and-forward rule requires review", "Entity requirements drafted", "Last reviewed Jul 25, 2026"],
  },
  {
    code: "SC", name: "South Carolina", readiness: "Blocked", tier: "Tier 3", programs: ["MD-led"], coverage: 0, target: "No target",
    summary: "The current model requires local physician coverage that is not yet available.",
    blockers: [{ title: "Secure in-state physician coverage", owner: "Provider Network", impact: "Unlocks clinical operations", priority: "High" }],
    providers: [],
    evidence: ["Collaboration requirement documented", "Physician search not started", "Last reviewed Jul 30, 2026"],
  },
];

const statusClass: Record<Readiness, string> = {
  Ready: "status-ready", "Nearly ready": "status-nearly", Blocked: "status-blocked", "Research needed": "status-research",
};

export default function Dashboard() {
  const [selected, setSelected] = useState<StateRecord>(states[1]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<"states" | "actions">("states");

  const visible = useMemo(() => states.filter((state) =>
    (filter === "All" || state.readiness === filter) &&
    `${state.name} ${state.code} ${state.programs.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [filter, query]);

  const actions = states.flatMap((state) => state.blockers.map((blocker) => ({ state, ...blocker })))
    .sort((a, b) => Number(b.priority === "High") - Number(a.priority === "High"));

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">F</span><span>New States</span><span className="prototype">Synthetic prototype</span></div>
        <div className="access"><Link className="tool-link" href="/application-studio">Open Application Studio →</Link><span className="lock">●</span><span>Private workspace</span><form action="/api/logout" method="post"><button className="sign-out" type="submit">Sign out</button></form></div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="nav-label">Workspace</div>
          <button className={panel === "states" ? "nav active" : "nav"} onClick={() => setPanel("states")}><span>◫</span> Launch readiness</button>
          <button className={panel === "actions" ? "nav active" : "nav"} onClick={() => setPanel("actions")}><span>✓</span> Action queue <b>{actions.length}</b></button>
          <div className="nav-label nav-section">Data boundaries</div>
          <div className="privacy-card">
            <span className="shield">◆</span>
            <strong>Minimum necessary data</strong>
            <p>No SSNs, birth dates, home addresses, personal contacts, or identity documents.</p>
          </div>
          <div className="source-note"><span className="source-dot" /> Synthetic dataset<br/><small>Not connected to source systems</small></div>
        </aside>

        <div className="content">
          {panel === "states" ? (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">Launch readiness</p><h1>Where can we launch next?</h1><p>See market readiness, blockers, and the next action—without exposing sensitive provider data.</p></div>
                <button className="refresh">↻ &nbsp; Data reviewed Aug 4</button>
              </div>

              <div className="summary-strip">
                <div><span className="signal green"/><strong>1</strong><small>Ready now</small></div>
                <div><span className="signal amber"/><strong>2</strong><small>Nearly ready</small></div>
                <div><span className="signal red"/><strong>2</strong><small>Blocked</small></div>
                <div><span className="signal blue"/><strong>1</strong><small>Needs research</small></div>
                <div className="opportunity"><small>Highest-leverage action</small><strong>Complete WV physician license</strong><span>Unlocks 3 programs →</span></div>
              </div>

              <div className="split-view">
                <section className="state-list">
                  <div className="toolbar">
                    <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search states or programs" /></label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by readiness">
                      <option>All</option><option>Ready</option><option>Nearly ready</option><option>Blocked</option><option>Research needed</option>
                    </select>
                  </div>
                  <div className="list-head"><span>Market</span><span>Programs</span><span>Coverage</span><span>Readiness</span></div>
                  {visible.map((state) => (
                    <button key={state.code} className={selected.code === state.code ? "state-row selected" : "state-row"} onClick={() => setSelected(state)}>
                      <span className="market"><b>{state.code}</b><span><strong>{state.name}</strong><small>{state.tier}</small></span></span>
                      <span className="programs">{state.programs.slice(0, 2).map(p => <i key={p}>{p}</i>)}{state.programs.length > 2 && <i>+{state.programs.length - 2}</i>}</span>
                      <span className="coverage"><strong>{state.coverage}</strong><small>providers</small></span>
                      <span className={`status ${statusClass[state.readiness]}`}><i />{state.readiness}</span>
                    </button>
                  ))}
                  {visible.length === 0 && <div className="empty">No markets match this view.</div>}
                </section>

                <aside className="detail">
                  <div className="detail-top"><div className="state-badge">{selected.code}</div><div><h2>{selected.name}</h2><span className={`status ${statusClass[selected.readiness]}`}><i />{selected.readiness}</span></div><button aria-label="Close details">×</button></div>
                  <p className="detail-summary">{selected.summary}</p>
                  <div className="detail-meta"><div><small>Target</small><strong>{selected.target}</strong></div><div><small>Programs</small><strong>{selected.programs.join(" · ")}</strong></div></div>

                  <h3>What’s blocking launch</h3>
                  {selected.blockers.length ? selected.blockers.map((b, i) => (
                    <div className="blocker" key={b.title}><span>{i + 1}</span><div><strong>{b.title}</strong><p>{b.impact}</p><small>{b.owner} · {b.priority} priority</small></div></div>
                  )) : <div className="clear"><span>✓</span><div><strong>No open blockers</strong><p>This market is operationally ready.</p></div></div>}

                  <h3>Provider coverage</h3>
                  {selected.providers.length ? selected.providers.map((p) => (
                    <div className="provider" key={p.label}><span>{p.label.slice(-1)}</span><div><strong>{p.label}</strong><small>{p.role}</small></div><em>{p.status}</em></div>
                  )) : <div className="empty compact">No provider coverage assigned.</div>}

                  <details><summary>Evidence & verification <span>{selected.evidence.length}</span></summary>{selected.evidence.map(e => <p key={e}>• {e}</p>)}</details>
                </aside>
              </div>
            </>
          ) : (
            <section className="actions-page">
              <div className="page-heading"><div><p className="eyebrow">Action queue</p><h1>What should we do next?</h1><p>Prioritized work based on market impact and launch dependency.</p></div></div>
              <div className="action-list">
                {actions.map((a, i) => <div className="action-item" key={`${a.state.code}-${a.title}`}><span className="action-rank">{String(i + 1).padStart(2, "0")}</span><div className="action-main"><div><span className="mini-state">{a.state.code}</span><strong>{a.title}</strong></div><p>{a.impact}</p></div><span className={`priority ${a.priority.toLowerCase()}`}>{a.priority}</span><div className="owner"><small>Owner</small>{a.owner}</div><button onClick={() => { setSelected(a.state); setPanel("states"); }}>Review →</button></div>)}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
