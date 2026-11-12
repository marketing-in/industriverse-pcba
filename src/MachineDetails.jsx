import React,{useState} from 'react';
import {Search,Check,X,ExternalLink} from 'lucide-react';
import {DETAIL_FIELDS,cleanDetails} from './machines.js';

const LABEL=Object.fromEntries(DETAIL_FIELDS.map(([k,l,,u])=>[k,typeof u==='string'?`${l} (${u})`:l]));
// Details of one machine (or one station of a line): typed in, or looked up online from maker + model.
// A lookup is shown first with its sources; "Use these" fills only what it found, and nothing is saved
// until Save. The machine's own year built is never taken from the web (only the model's launch year).
export default function MachineDetails({title,value,onSave,notify=()=>{}}){
 const [draft,setDraft]=useState(()=>({...(value||{})})),[busy,setBusy]=useState(false),[found,setFound]=useState(null);
 const set=(k,v)=>setDraft(d=>({...d,[k]:v}));
 const lookup=async()=>{if(!String(draft.model||'').trim()){notify('Enter the model first (and the maker), then look it up.');return}setBusy(true);setFound(null);
  try{const r=await fetch(`/api/machineinfo?maker=${encodeURIComponent(draft.maker||'')}&model=${encodeURIComponent(draft.model)}`);let j;try{j=await r.json()}catch{throw Error('The lookup service is offline. Run npm run server.')}
   if(!r.ok)throw Error(j.error||'Lookup failed.');if(!Object.keys(j.found||{}).length){notify(`No specifications stated for ${j.query} in the search results. Type them in from the nameplate or data sheet.`);return}setFound(j)}
  catch(e){notify(e.message)}finally{setBusy(false)}};
 const use=()=>{setDraft(d=>{const n={...d};for(const [k,v] of Object.entries(found.found))if(k in LABEL)n[k]=v;n.source={kind:'web',at:found.fetchedAt,urls:[...new Set(Object.values(found.from||{}))]};return n});setFound(null)};
 const save=e=>{e.preventDefault();onSave(cleanDetails(draft));notify(`${title}: details saved.`)};
 return <form className="machine-details" onSubmit={save} aria-label={`Details of ${title}`}>
  <div className="md-grid">{DETAIL_FIELDS.map(([k,l,kind,max])=><label key={k} className={k==='notes'?'wide':''}>{LABEL[k]}
   {k==='notes'?<textarea rows="2" maxLength={max} value={draft[k]??''} onChange={e=>set(k,e.target.value)}/>
   :<input value={draft[k]??''} inputMode={kind==='text'?undefined:'numeric'} maxLength={kind==='text'?max:9} placeholder={k==='year'?'From the nameplate':k==='introduced'?'e.g. 2018':''} onChange={e=>set(k,e.target.value)}/>}</label>)}</div>
  {found&&<div className="md-found" role="region" aria-label="Found online">
   <strong>Found for {found.query}</strong><small className="muted">{found.via==='gemini'?'Read by Gemini':'Read'} from {found.sources?.length||0} web page{found.sources?.length===1?'':'s'}; the link beside a value opens the page it came from. Check them against the maker's data sheet.</small>
   <ul>{Object.entries(found.found).map(([k,v])=><li key={k}><span>{LABEL[k]||k}</span><b>{typeof v==='number'&&k!=='introduced'&&k!=='year'?v.toLocaleString('en-IN'):v}</b>{found.from?.[k]&&<a href={found.from[k]} target="_blank" rel="noreferrer" title={found.from[k]}><ExternalLink size={12}/></a>}</li>)}</ul>
   <div className="md-acts"><button type="button" className="button small primary" onClick={use}><Check size={13}/>Use these</button><button type="button" className="button small" onClick={()=>setFound(null)}><X size={13}/>Discard</button></div></div>}
  <div className="md-acts">
   <button type="button" className="button small" disabled={busy} onClick={lookup}><Search size={13}/>{busy?'Looking up…':'Look up online'}</button>
   <button type="submit" className="button small primary"><Check size={13}/>Save details</button>
   {value&&<button type="button" className="text-button danger" onClick={()=>{setDraft({});onSave(null);notify(`${title}: details cleared.`)}}>Clear</button>}
   {draft.source?.kind&&<small className="muted">{draft.source.kind==='web'?'Includes values from the web':draft.source.kind==='file'?'Loaded from a machine list':''}</small>}
  </div>
 </form>;
}
