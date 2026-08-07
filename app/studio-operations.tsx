"use client";

import { useState } from "react";

export type StudioView = "queue" | "crosscheck" | "intake" | "readiness" | "vault" | "requests" | "audit";

const tabs: { id: StudioView; label: string; count?: string }[] = [
  { id:"queue", label:"Work queue", count:"9" },
  { id:"crosscheck", label:"Cross-check", count:"3" },
  { id:"intake", label:"New application" },
  { id:"readiness", label:"Readiness matrix" },
  { id:"vault", label:"Provider vault" },
  { id:"requests", label:"Requests", count:"5" },
  { id:"audit", label:"Audit trail" },
];

export function StudioNavigation({ view, onChange }: { view: StudioView; onChange: (view: StudioView) => void }) {
  return <nav className="studio-tabs" aria-label="Application Studio tools">{tabs.map(tab => <button key={tab.id} className={view===tab.id?"active":""} onClick={()=>onChange(tab.id)}>{tab.label}{tab.count&&<span>{tab.count}</span>}</button>)}</nav>;
}

const matrix = [
  { provider:"Provider A", role:"MD", cells:[92,100,67,81] },
  { provider:"Provider D", role:"MD", cells:[56,75,33,64] },
  { provider:"Provider F", role:"MD", cells:[78,88,50,72] },
  { provider:"Provider G", role:"NP", cells:[42,82,25,59] },
];

const vaultRows = [
  ["Legal identity", "Restricted", "Verified Aug 6", "Current"],
  ["Medical education", "Primary source", "Verified Jul 22", "Current"],
  ["Training history", "Primary source", "Verified Jul 29", "Current"],
  ["Current CV", "Approved profile", "Updated Aug 3", "Current"],
  ["NPDB self-query", "Not stored", "Provider initiated", "Missing"],
  ["Passport", "Secure vault reference", "Expires Feb 2027", "Expiring"],
];

const auditRows = [
  ["Aug 7, 9:42 AM", "Requirement set reviewed", "WV initial physician", "Licensing Ops"],
  ["Aug 7, 9:18 AM", "Provider match completed", "Provider D · 9/16 available", "System"],
  ["Aug 6, 4:05 PM", "Restricted record accessed", "Identity verification reference", "Admin"],
  ["Aug 6, 2:31 PM", "Request created", "Activity chronology gap", "Licensing Ops"],
  ["Aug 4, 11:20 AM", "Source updated", "Colorado CSR requirements", "Compliance"],
];

export default function StudioOperations({ view, notify }: { view: Exclude<StudioView,"crosscheck">; notify: (message:string)=>void }) {
  const [provider, setProvider] = useState("Provider D");
  const [state, setState] = useState("West Virginia");
  const [pathway, setPathway] = useState("Direct initial licensure");
  const [requestStates, setRequestStates] = useState(["Open","Waiting","Open","Received","Open"]);

  if (view === "queue") return <section className="module-page queue-page">
    <ModuleHeader eyebrow="Operations home" title="What is stopping submission?" copy="Work the highest-impact exceptions first, then move complete packets into licensing review." />
    <div className="queue-metrics"><button><b>2</b><span>Ready for review</span><small>Move forward today</small></button><button><b>3</b><span>Waiting on provider</span><small>Oldest: 4 days</small></button><button><b>3</b><span>Missing external item</span><small>NPDB, prints, AMA</small></button><button><b>1</b><span>Source needs review</span><small>Potentially outdated</small></button></div>
    <div className="queue-layout"><div className="exception-board"><div className="board-head"><div><p className="eyebrow">Prioritized exceptions</p><h3>Next actions</h3></div><select aria-label="Filter exception owner"><option>All owners</option><option>Provider</option><option>Licensing Ops</option><option>Compliance</option></select></div>{[
      ["High","WV","Activity chronology gap","Provider D","Provider","Due Aug 12"],
      ["High","WV","Fingerprint check not started","Provider D","Provider","Due Aug 20"],
      ["High","HI","Renewal attestations incomplete","Provider F","Provider","Due Aug 14"],
      ["Medium","WV","AMA profile delivery unconfirmed","Provider D","Licensing Ops","Waiting"],
      ["Medium","CO","PDMP attestation needs review","Provider A","Provider","Due Aug 18"],
    ].map((r,i)=><button className="exception-row" key={r[2]} onClick={()=>notify(`${r[2]} opened in the action drawer.`)}><span className={`queue-priority ${r[0].toLowerCase()}`}>{r[0]}</span><span className="queue-state">{r[1]}</span><div><strong>{r[2]}</strong><p>{r[3]} · {r[4]}</p></div><time>{r[5]}</time><span>→</span></button>)}</div><aside className="source-inbox"><p className="eyebrow">Source-update inbox</p><h3>1 requirement set needs review</h3><div className="source-alert"><span>WV</span><div><strong>Physician instructions</strong><p>Source document is beyond the internal review threshold.</p><small>Official link available · reviewed 2022</small></div></div><button onClick={()=>notify("West Virginia source review assigned to Compliance.")}>Assign source review</button><hr/><h4>Recently confirmed</h4><p>Colorado controlled-substance renewal · Aug 4</p><p>Hawaii physician renewal · Aug 2</p></aside></div>
  </section>;

  if (view === "intake") return <section className="module-page">
    <ModuleHeader eyebrow="Guided intake" title="Start with the right pathway" copy="Select the provider and destination. Applicability rules determine which requirements should be included." />
    <div className="intake-grid">
      <div className="intake-form">
        <Step n="01" label="Provider"><select value={provider} onChange={e=>setProvider(e.target.value)}><option>Provider D</option><option>Provider A</option><option>Provider F</option></select></Step>
        <Step n="02" label="State"><select value={state} onChange={e=>setState(e.target.value)}><option>West Virginia</option><option>Hawaii</option><option>Colorado</option></select></Step>
        <Step n="03" label="Profession"><select><option>Physician · MD</option><option>Nurse practitioner</option><option>Physician assistant</option></select></Step>
        <Step n="04" label="Application pathway"><select value={pathway} onChange={e=>setPathway(e.target.value)}><option>Direct initial licensure</option><option>IMLC pathway</option><option>Renewal</option><option>Reactivation</option></select></Step>
        <button onClick={()=>notify(`${state} packet created for ${provider}. Applicability rules selected ${pathway.toLowerCase()}.`)}>Create cross-check</button>
      </div>
      <aside className="rule-preview"><p className="eyebrow">Rules preview</p><h3>4 conditional checks applied</h3><Rule ok text="U.S. medical graduate pathway"/><Rule ok text="FCVS identity verification available"/><Rule text="Activity gap explanation required"/><Rule text="New state-specific fingerprints required"/><div className="expiry-callout"><strong>Expiration warning</strong><p>Passport reference expires within 180 days. It remains usable but should be renewed.</p></div></aside>
    </div>
  </section>;

  if (view === "readiness") return <section className="module-page">
    <ModuleHeader eyebrow="Portfolio readiness" title="Who can apply where—right now?" copy="Compare provider readiness across state and license pathways before assigning work." />
    <div className="matrix-summary"><Stat n="14" label="Applications ready to begin"/><Stat n="6" label="Need provider attestations"/><Stat n="3" label="Blocked by expiring evidence"/></div>
    <div className="matrix-table"><div className="matrix-row head"><span>Provider</span><span>WV physician</span><span>HI renewal</span><span>CO controlled</span><span>OK physician</span></div>{matrix.map(row=><div className="matrix-row" key={row.provider}><span><strong>{row.provider}</strong><small>{row.role}</small></span>{row.cells.map((score,i)=><button key={i} onClick={()=>notify(`${row.provider}: ${score}% of requirements available.`)}><i style={{"--score":`${score}%`} as React.CSSProperties}/><b>{score}%</b><small>{score>=80?"Ready":score>=50?"Needs action":"Blocked"}</small></button>)}</div>)}</div>
  </section>;

  if (view === "vault") return <section className="module-page">
    <ModuleHeader eyebrow="Reusable information vault" title="Approved once. Reused carefully." copy="Only minimum-necessary metadata and secure references appear here; restricted document contents stay outside this prototype." />
    <div className="vault-banner"><span>◆</span><div><strong>Sanitized profile · Provider D</strong><p>No SSNs, full birth dates, home addresses, personal contact details, or document images.</p></div><button onClick={()=>notify("Profile freshness review queued for Licensing Ops.")}>Review freshness</button></div>
    <div className="data-table"><div className="data-row head"><span>Record</span><span>Handling</span><span>Evidence</span><span>Status</span></div>{vaultRows.map((r,i)=><div className="data-row" key={r[0]}>{r.map((cell,j)=><span key={j} className={j===3?`data-status ${cell.toLowerCase()}`:""}>{cell}</span>)}</div>)}</div>
  </section>;

  if (view === "requests") return <section className="module-page">
    <ModuleHeader eyebrow="Request center" title="Resolve missing information without email sprawl" copy="Route each exception to an accountable owner while keeping sensitive responses inside approved systems." />
    <div className="request-list">{[
      ["Activity chronology gap","Provider D","Due Aug 12","Provider"],
      ["Notarized photo affidavit","Provider D","Due Aug 15","Provider"],
      ["WV fingerprint check","Provider D","Due Aug 20","Provider"],
      ["AMA profile delivery","Licensing Ops","Received Aug 7","Internal"],
      ["Requirement freshness review","Compliance","Due Aug 14","Internal"],
    ].map((r,i)=><div className="request-row" key={r[0]}><span className="request-icon">{String(i+1).padStart(2,"0")}</span><div><strong>{r[0]}</strong><p>{r[1]} · {r[2]}</p></div><span className="request-owner">{r[3]}</span><select value={requestStates[i]} onChange={e=>setRequestStates(s=>s.map((v,x)=>x===i?e.target.value:v))}><option>Open</option><option>Waiting</option><option>Received</option><option>Closed</option></select></div>)}</div>
  </section>;

  return <section className="module-page">
    <ModuleHeader eyebrow="Submission audit" title="A defensible record of every handoff" copy="Track source review, provider confirmation, approval, payment, and submission without allowing the tool to attest on anyone's behalf." />
    <div className="audit-boundary"><strong>Human-control boundary</strong><span>Application Studio prepares and records. A licensing specialist verifies, signs, pays, and submits.</span><button onClick={()=>notify("Sanitized audit report prepared for export.")}>Export audit report</button></div>
    <div className="audit-list">{auditRows.map((r,i)=><div className="audit-row" key={i}><span className="audit-dot"/><time>{r[0]}</time><div><strong>{r[1]}</strong><p>{r[2]}</p></div><span>{r[3]}</span></div>)}</div>
  </section>;
}

function ModuleHeader({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}) { return <div className="module-header"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>; }
function Step({n,label,children}:{n:string;label:string;children:React.ReactNode}) { return <label className="intake-step"><span>{n}</span><strong>{label}</strong>{children}</label>; }
function Rule({ok,text}:{ok?:boolean;text:string}) { return <div className={`rule-item ${ok?"ok":"attention"}`}><span>{ok?"✓":"!"}</span><p>{text}</p></div>; }
function Stat({n,label}:{n:string;label:string}) { return <div><strong>{n}</strong><span>{label}</span></div>; }
