"use client";

import { useMemo, useState } from "react";

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

const labels: Record<FieldStatus, string> = { verified:"Verified", confirm:"Confirm", missing:"Missing" };

export default function ApplicationStudio() {
  const [packetId, setPacketId] = useState(packets[0].id);
  const [sectionName, setSectionName] = useState(packets[0].sections[0].name);
  const [values, setValues] = useState<Record<string,string>>({});
  const [toast, setToast] = useState("");
  const packet = packets.find(p => p.id === packetId)!;
  const section = packet.sections.find(s => s.name === sectionName) ?? packet.sections[0];
  const allFields = packet.sections.flatMap(s => s.fields);
  const complete = allFields.filter(f => f.status === "verified").length;
  const percent = Math.round((complete / allFields.length) * 100);
  const issues = allFields.filter(f => f.status !== "verified").length;

  const selectPacket = (id:string) => {
    const next = packets.find(p => p.id === id)!;
    setPacketId(id); setSectionName(next.sections[0].name); setToast("");
  };

  const sectionCounts = useMemo(() => packet.sections.map(s => ({
    name:s.name, done:s.fields.filter(f => f.status === "verified").length, total:s.fields.length,
  })), [packet]);

  return (
    <section className="studio-page">
      <div className="studio-heading">
        <div><p className="eyebrow">Application Studio</p><h1>Prepare the packet. Review the exceptions.</h1><p>Reusable answers, state-specific requirements, and human approval in one controlled workspace.</p></div>
        <button className="new-packet" onClick={() => setToast("New packet setup will connect to the approved provider profile.")}>＋ New packet</button>
      </div>

      {toast && <div className="studio-toast" role="status">{toast}<button onClick={() => setToast("")}>×</button></div>}

      <div className="packet-queue" aria-label="Application packets">
        {packets.map(p => {
          const fields=p.sections.flatMap(s=>s.fields); const done=fields.filter(f=>f.status==="verified").length;
          return <button key={p.id} className={p.id===packet.id?"packet-card active":"packet-card"} onClick={()=>selectPacket(p.id)}>
            <span className="packet-state">{p.state.slice(0,2).toUpperCase()}</span>
            <span><strong>{p.type}</strong><small>{p.provider} · due {p.due}</small></span>
            <em>{done}/{fields.length}</em>
          </button>;
        })}
      </div>

      <div className="studio-workbench">
        <aside className="packet-rail">
          <div className="packet-id"><small>Packet</small><strong>{packet.id}</strong><span>{packet.board}</span></div>
          <div className="completion"><div><strong>{percent}%</strong><small>review ready</small></div><span><i style={{width:`${percent}%`}} /></span></div>
          <div className="rail-label">Application sections</div>
          {sectionCounts.map(s => <button key={s.name} className={section.name===s.name?"section-link active":"section-link"} onClick={()=>setSectionName(s.name)}>
            <span className={s.done===s.total?"section-check done":"section-check"}>{s.done===s.total?"✓":s.total-s.done}</span>
            <span><strong>{s.name}</strong><small>{s.done} of {s.total} verified</small></span>
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
          <div className="review-stat"><span className="verified"/><div><strong>{complete} verified</strong><small>Mapped from approved sources</small></div></div>
          <div className="review-stat"><span className="confirm"/><div><strong>{allFields.filter(f=>f.status==="confirm").length} confirmations</strong><small>Provider or specialist response</small></div></div>
          <div className="review-stat"><span className="missing"/><div><strong>{allFields.filter(f=>f.status==="missing").length} missing</strong><small>Required before submission</small></div></div>
          <hr/><h4>Submission boundary</h4><p>This workspace prepares a review packet. A licensing specialist must verify attestations, sign, pay, and submit through the official state portal.</p>
          <button onClick={()=>setToast("Review worksheet prepared. No sensitive attachments were included.")}>Prepare review worksheet</button>
        </aside>
      </div>
    </section>
  );
}
