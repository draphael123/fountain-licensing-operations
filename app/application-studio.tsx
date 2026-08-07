"use client";

import { useMemo, useState } from "react";
import StudioOperations, { StudioNavigation, type StudioView } from "./studio-operations";

type FieldStatus = "verified" | "confirm" | "missing";
type Field = { id: string; label: string; value: string; status: FieldStatus; source: string; sensitive?: boolean };
type Section = { name: string; fields: Field[] };
type Packet = { id: string; state: string; board: string; type: string; provider: string; due: string; sections: Section[] };

const packets: Packet[] = [
  { id: "WV-RN-042", state: "West Virginia", board: "Board of Medicine", type: "Initial physician license", provider: "Provider D", due: "Sep 18", sections: [
    { name: "Identity", fields: [
      { id:"legal-name", label:"Legal name", value:"Taylor Morgan, MD", status:"verified", source:"Provider profile · Aug 6" },
      { id:"dob", label:"Date of birth", value:"•• / •• / 1988", status:"verified", source:"Secure profile · Aug 6", sensitive:true },
      { id:"address", label:"Home address", value:"Restricted — open secure profile", status:"confirm", source:"Provider confirmation required", sensitive:true },
    ]},
    { name: "Education & training", fields: [
      { id:"school", label:"Medical school", value:"North Valley School of Medicine", status:"verified", source:"Primary source verification · Jul 22" },
      { id:"graduation", label:"Graduation date", value:"05 / 2014", status:"verified", source:"Transcript · Jul 22" },
      { id:"residency", label:"Residency completion", value:"06 / 2018", status:"verified", source:"Training verification · Jul 29" },
    ]},
    { name: "Professional history", fields: [
      { id:"employment", label:"Current employer", value:"Fountain Medical Group, P.C.", status:"verified", source:"Employment profile · Aug 1" },
      { id:"gap", label:"Activity gap explanation", value:"", status:"missing", source:"Gap detected: Jul–Sep 2021" },
      { id:"discipline", label:"Disciplinary history attestation", value:"No", status:"confirm", source:"Provider must personally attest" },
    ]},
    { name: "Documents", fields: [
      { id:"cv", label:"Current CV", value:"Taylor_Morgan_CV_2026.pdf", status:"verified", source:"Updated Aug 3" },
      { id:"photo", label:"Passport-style photo", value:"", status:"missing", source:"Required by state template" },
    ]},
  ]},
  { id: "HI-RN-018", state: "Hawaii", board: "Medical Board", type: "License renewal", provider: "Provider F", due: "Oct 31", sections: [
    { name:"Renewal changes", fields:[
      { id:"practice", label:"Practice address changed", value:"No", status:"confirm", source:"Compare with prior filing" },
      { id:"cme", label:"CME hours completed", value:"42", status:"verified", source:"CME ledger · Aug 2" },
      { id:"attestation", label:"Renewal attestations", value:"Pending provider review", status:"confirm", source:"Personal attestation required" },
    ]},
    { name:"Documents", fields:[{ id:"cme-doc", label:"CME completion evidence", value:"2024-26_CME_Summary.pdf", status:"verified", source:"Learning system · Aug 2" }]},
  ]},
  { id: "CO-CSR-011", state: "Colorado", board: "Pharmacy Board", type: "Controlled substance renewal", provider: "Provider A", due: "Nov 12", sections: [
    { name:"Registration", fields:[
      { id:"dea", label:"Federal registration", value:"•••••••41", status:"verified", source:"Secure credential vault · Aug 4", sensitive:true },
      { id:"practice", label:"Primary practice location", value:"Denver clinical site", status:"verified", source:"Entity profile · Jul 30" },
      { id:"pdmp", label:"PDMP compliance attestation", value:"Pending provider review", status:"confirm", source:"Personal attestation required" },
    ]},
  ]},
];

const labels: Record<FieldStatus, string> = { verified:"Available", confirm:"Action required", missing:"Missing" };

const westVirginiaCrossCheck: Packet = {
  id: "WV-MD-INITIAL", state: "West Virginia", board: "Board of Medicine", type: "Initial physician license", provider: "Provider D", due: "Sep 18", sections: [
    { name: "Eligibility", fields: [
      { id:"medical-school", label:"Approved medical school graduation", value:"Matched: MD degree and school verification", status:"verified", source:"Sanitized credential profile · verified Jul 22" },
      { id:"gme", label:"Required graduate medical education", value:"Matched: ACGME training exceeds minimum", status:"verified", source:"Sanitized training record · verified Jul 29" },
      { id:"exam", label:"USMLE examination sequence", value:"Matched: Steps 1–3 within required sequence", status:"verified", source:"Sanitized exam record · verified Jul 22" },
      { id:"standing", label:"License standing and eligibility review", value:"Matched: no unresolved suspension or revocation flag", status:"verified", source:"Sanitized license inventory · reviewed Aug 6" },
    ]},
    { name: "Applications & attestations", fields: [
      { id:"ua", label:"FSMB Uniform Application core data", value:"Available: reusable profile mapped", status:"verified", source:"Approved provider profile · Aug 6" },
      { id:"chronology", label:"Complete activity chronology since medical school", value:"", status:"missing", source:"Three-month gap requires explanation" },
      { id:"addendum", label:"West Virginia Online Addendum", value:"Provider review required", status:"confirm", source:"Professional Practice, Character and Fitness responses" },
      { id:"fee", label:"Initial application fee", value:"$400 — licensing specialist action", status:"confirm", source:"Payment is never completed automatically" },
      { id:"photo-affidavit", label:"Original notarized photo affidavit and release", value:"", status:"missing", source:"Original must be mailed; email or fax not accepted" },
    ]},
    { name: "External checks", fields: [
      { id:"fingerprints", label:"WV-specific fingerprint background check", value:"", status:"missing", source:"New IdentoGo check required; other checks cannot be reused" },
      { id:"npdb", label:"NPDB self-query generated within 30 days", value:"", status:"missing", source:"Provider must initiate a current self-query" },
      { id:"ama", label:"AMA Physician Profile sent to the Board", value:"Request not yet confirmed", status:"confirm", source:"Third-party delivery must be verified" },
      { id:"licenses", label:"Other state license inventory", value:"Matched: license list available for Board screening", status:"verified", source:"Sanitized license inventory · Aug 6" },
    ]},
    { name: "Credential evidence", fields: [
      { id:"identity", label:"Identity document or FCVS identity verification", value:"Restricted — available in secure vault", status:"verified", source:"Secure credential vault · access logged", sensitive:true },
      { id:"diploma", label:"Medical school diploma or FCVS verification", value:"Matched: diploma copy available", status:"verified", source:"Sanitized document index · Jul 22" },
      { id:"training", label:"Training verification and completion evidence", value:"Matched: program verification and certificate", status:"verified", source:"Sanitized document index · Jul 29" },
    ]},
  ],
};

const applicationPackets = [westVirginiaCrossCheck, ...packets.slice(1)];

export default function ApplicationStudio() {
  const [view, setView] = useState<StudioView>("crosscheck");
  const [packetId, setPacketId] = useState(applicationPackets[0].id);
  const [sectionName, setSectionName] = useState(applicationPackets[0].sections[0].name);
  const [values, setValues] = useState<Record<string,string>>({});
  const [toast, setToast] = useState("");
  const [stateFilter, setStateFilter] = useState("All states");
  const [typeFilter, setTypeFilter] = useState("All license types");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const states = [...new Set(applicationPackets.map(p => p.state))];
  const licenseTypes = [...new Set(applicationPackets.map(p => p.type))];
  const providers = [...new Set(applicationPackets.map(p => p.provider))];
  const filteredPackets = useMemo(() => applicationPackets.filter(p => {
    const fields = p.sections.flatMap(s => s.fields);
    const matchesStatus = statusFilter === "All statuses"
      || (statusFilter === "Missing information" && fields.some(f => f.status === "missing"))
      || (statusFilter === "Needs confirmation" && fields.some(f => f.status === "confirm"))
      || (statusFilter === "Review ready" && fields.every(f => f.status === "verified"));
    return (stateFilter === "All states" || p.state === stateFilter)
      && (typeFilter === "All license types" || p.type === typeFilter)
      && (providerFilter === "All providers" || p.provider === providerFilter)
      && matchesStatus;
  }), [stateFilter, typeFilter, providerFilter, statusFilter]);
  const packet = filteredPackets.find(p => p.id === packetId) ?? filteredPackets[0] ?? applicationPackets[0];
  const section = packet.sections.find(s => s.name === sectionName) ?? packet.sections[0];
  const allFields = packet.sections.flatMap(s => s.fields);
  const complete = allFields.filter(f => f.status === "verified").length;
  const percent = Math.round((complete / allFields.length) * 100);
  const issues = allFields.filter(f => f.status !== "verified").length;

  const selectPacket = (id:string) => {
    const next = applicationPackets.find(p => p.id === id)!;
    setPacketId(id); setSectionName(next.sections[0].name); setToast("");
  };

  const clearFilters = () => {
    setStateFilter("All states");
    setTypeFilter("All license types");
    setProviderFilter("All providers");
    setStatusFilter("All statuses");
  };

  const sectionCounts = useMemo(() => packet.sections.map(s => ({
    name:s.name, done:s.fields.filter(f => f.status === "verified").length, total:s.fields.length,
  })), [packet]);

  return (
    <section className="studio-page">
      <div className="studio-heading">
        <div><p className="eyebrow">Application Studio</p><h1>What does the state require—and what do we have?</h1><p>Cross-check official requirements against approved provider information before work begins.</p></div>
        <button className="new-packet" onClick={() => setView("intake")}>＋ New packet</button>
      </div>

      {toast && <div className="studio-toast" role="status">{toast}<button onClick={() => setToast("")}>×</button></div>}

      <StudioNavigation view={view} onChange={setView} />

      {view === "crosscheck" ? <>
      <div className="studio-filters" aria-label="Filter application packets">
        <div className="filter-heading"><span>Filter packets</span><strong>{filteredPackets.length} of {applicationPackets.length}</strong></div>
        <label><span>State</span><select value={stateFilter} onChange={e => setStateFilter(e.target.value)}><option>All states</option>{states.map(state => <option key={state}>{state}</option>)}</select></label>
        <label><span>License type</span><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option>All license types</option>{licenseTypes.map(type => <option key={type}>{type}</option>)}</select></label>
        <label><span>Provider</span><select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}><option>All providers</option>{providers.map(provider => <option key={provider}>{provider}</option>)}</select></label>
        <label><span>Review status</span><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All statuses</option><option>Missing information</option><option>Needs confirmation</option><option>Review ready</option></select></label>
        <button className="clear-filters" type="button" onClick={clearFilters} disabled={stateFilter === "All states" && typeFilter === "All license types" && providerFilter === "All providers" && statusFilter === "All statuses"}>Clear</button>
      </div>

      <div className="packet-queue" aria-label="Application packets">
        {filteredPackets.map(p => {
          const fields=p.sections.flatMap(s=>s.fields); const done=fields.filter(f=>f.status==="verified").length;
          return <button key={p.id} className={p.id===packet.id?"packet-card active":"packet-card"} onClick={()=>selectPacket(p.id)}>
            <span className="packet-state">{p.state.slice(0,2).toUpperCase()}</span>
            <span><strong>{p.type}</strong><small>{p.provider} · due {p.due}</small></span>
            <em>{done}/{fields.length}</em>
          </button>;
        })}
      </div>

      {filteredPackets.length > 0 && packet.id === "WV-MD-INITIAL" && <div className="crosscheck-source">
        <div><span className="source-badge">Real requirement set</span><strong>West Virginia initial physician license</strong><p>Requirements mapped from the Board of Medicine physician application instructions. Provider matches use sanitized demonstration data.</p></div>
        <div className="crosscheck-totals"><span><b>{complete}</b> available</span><span><b>{allFields.filter(f=>f.status==="confirm").length}</b> actions</span><span><b>{allFields.filter(f=>f.status==="missing").length}</b> missing</span></div>
        <a href="https://www.fsmb.org/siteassets/ua/states/049/instructions.pdf" target="_blank" rel="noreferrer">Open board instructions ↗</a>
      </div>}

      {filteredPackets.length === 0 ? <div className="filter-empty"><strong>No packets match these filters</strong><p>Clear one or more filters to return to the application queue.</p><button type="button" onClick={clearFilters}>Clear all filters</button></div> : <div className="studio-workbench">
        <aside className="packet-rail">
          <div className="packet-id"><small>Packet</small><strong>{packet.id}</strong><span>{packet.board}</span></div>
          <div className="completion"><div><strong>{percent}%</strong><small>review ready</small></div><span><i style={{width:`${percent}%`}} /></span></div>
          <div className="rail-label">Application sections</div>
          {sectionCounts.map(s => <button key={s.name} className={section.name===s.name?"section-link active":"section-link"} onClick={()=>setSectionName(s.name)}>
            <span className={s.done===s.total?"section-check done":"section-check"}>{s.done===s.total?"✓":s.total-s.done}</span>
            <span><strong>{s.name}</strong><small>{s.done} of {s.total} available</small></span>
          </button>)}
          <div className="safety-note"><strong>Secure handling</strong><p>Sensitive values stay masked. Personal attestations are never completed automatically.</p></div>
        </aside>

        <main className="application-sheet">
          <div className="sheet-header"><div><p>{packet.state} · {packet.board}</p><h2>{packet.type}</h2><span>{packet.provider}</span></div><div className="sheet-status"><small>Needs attention</small><strong>{issues} items</strong></div></div>
          <div className="section-title"><span>{String(packet.sections.indexOf(section)+1).padStart(2,"0")}</span><div><h3>{section.name}</h3><p>Review mapped answers and resolve exceptions before approval.</p></div></div>
          <div className="field-stack">
            {section.fields.map(field => <div className={`application-field field-${field.status}`} key={field.id}>
              <div className="field-label"><label htmlFor={field.id}>{field.label}</label>{field.sensitive&&<span>Restricted</span>}</div>
              <input id={field.id} value={values[`${packet.id}-${field.id}`] ?? field.value} placeholder="Information required" onChange={e=>setValues(v=>({...v,[`${packet.id}-${field.id}`]:e.target.value}))} />
              <div className="field-meta"><span className={`field-state ${field.status}`}>{labels[field.status]}</span><small>{field.source}</small>{field.status!=="verified"&&<button onClick={()=>setToast(`${field.label} has been added to the provider review request.`)}>Request answer</button>}</div>
            </div>)}
          </div>
          <div className="sheet-actions"><button className="secondary" onClick={()=>setToast("Draft changes saved for this browser session.")}>Save draft</button><button className="primary" disabled={issues>0} title={issues?"Resolve open items before review":"Send for licensing review"}>Send for licensing review</button></div>
        </main>

        <aside className="review-panel">
          <p className="eyebrow">Review summary</p><h3>{issues ? `${issues} items need attention` : "Ready for review"}</h3>
          <div className="review-stat"><span className="verified"/><div><strong>{complete} available</strong><small>Matched to approved sources</small></div></div>
          <div className="review-stat"><span className="confirm"/><div><strong>{allFields.filter(f=>f.status==="confirm").length} confirmations</strong><small>Provider or specialist response</small></div></div>
          <div className="review-stat"><span className="missing"/><div><strong>{allFields.filter(f=>f.status==="missing").length} missing</strong><small>Required before submission</small></div></div>
          <hr/><h4>Submission boundary</h4><p>This workspace prepares a review packet. A licensing specialist must verify attestations, sign, pay, and submit through the official state portal.</p>
          <button onClick={()=>setToast("Review worksheet prepared. No sensitive attachments were included.")}>Prepare review worksheet</button>
        </aside>
      </div>}
      </> : <StudioOperations view={view} notify={setToast} />}
    </section>
  );
}
