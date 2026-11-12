import React,{useState} from 'react';
import {GitCompare} from 'lucide-react';
import {FolderOpen,Copy,Trash2,ArrowRight,Factory,Bookmark} from 'lucide-react';
import {loadLists,removeList,duplicateList,openList,setListStatus,LIST_STATUSES,revLetter,revisionsOf,compareRevisions} from './savedLists.js';
import {useMoney} from './currency.jsx';
import {stageInfo} from './production.js';

const when=iso=>iso?new Date(iso).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'';
const TONE={draft:'neutral',quoted:'amber',ordered:'green',archived:'neutral'};

// Two revisions of one list side by side: lines added, removed or changed, boards and total.
function Compare({list,money}){
 const revs=revisionsOf(list),[from,setFrom]=useState(revs.length-2),[to,setTo]=useState(revs.length-1);
 const d=compareRevisions(revs[from],revs[to]);const pick=(v,set,label)=><select aria-label={label} value={v} onChange={e=>set(+e.target.value)}>{revs.map((r,i)=><option key={i} value={i}>Rev {revLetter(r.revision)} · {when(r.savedAt)}</option>)}</select>;
 return <div className="rev-compare" role="region" aria-label={`Compare revisions of ${list.name}`}>
  <div className="rev-pick">{pick(from,setFrom,'From revision')}<span>→</span>{pick(to,setTo,'To revision')}</div>
  {d.same&&!d.boards&&!d.total?<p className="muted">No changes between these revisions.</p>:<ul className="rev-changes">
   {d.boards&&<li><b>Boards</b> {d.boards[0]} → {d.boards[1]}</li>}
   {d.total&&<li><b>Customer total</b> {d.total[0]==null?'not priced':money.fmt(d.total[0])} → {d.total[1]==null?'not priced':money.fmt(d.total[1])}</li>}
   {d.added.map(r=><li key={'a'+r.mpn} className="ok-text">Added <b>{r.mpn}</b> × {r.qty}{r.dnp?' (DNP)':''}</li>)}
   {d.removed.map(r=><li key={'r'+r.mpn} className="warn-text">Removed <b>{r.mpn}</b> × {r.qty}</li>)}
   {d.changed.map(c=><li key={'c'+c.mpn}><b>{c.mpn}</b>: {c.what.join(' · ')}</li>)}</ul>}
 </div>;
}

// Saved lists: BOMs saved from the BOM tool's quotation step, with everything they held (PCB from the
// Gerber, components, enclosure, mould, shipping, pricing). Open puts one back in the BOM tool exactly
// as it was; an ordered list shows the production job it became.
export default function SavedLists({jobs=[],notify=()=>{},onOpen=()=>{},onOpenJob=()=>{}}){
 const money=useMoney();
 const [lists,setLists]=useState(loadLists),[filter,setFilter]=useState('all'),[cmp,setCmp]=useState(null);
 const shown=lists.filter(l=>filter==='all'||l.status===filter);
 const open=l=>{if(openList(l.id)){notify(`${l.name} opened in the BOM tool.`);onOpen()}else notify('Storage full: the list could not be opened.')};
 return <div className="saved-lists">
  <div className="vendor-tabs" role="tablist" aria-label="List status">{['all',...LIST_STATUSES].map(s=><button key={s} role="tab" aria-selected={filter===s} className={filter===s?'active':''} onClick={()=>setFilter(s)}>{s==='all'?'All':s[0].toUpperCase()+s.slice(1)}<b>{s==='all'?lists.length:lists.filter(l=>l.status===s).length}</b></button>)}</div>
  {lists.length===0?<section className="panel"><div className="empty"><Bookmark/><h3>No saved lists yet</h3><p>In the BOM tool, finish the quotation step and press Save list. The list keeps the Gerber, the BOM, the enclosure and the mould so you can come back to it.</p><button className="button primary" onClick={onOpen}>Open the BOM tool <ArrowRight size={15}/></button></div></section>
  :<section className="panel" aria-label="Saved lists"><div className="table-scroll"><table className="saved-table">
   <thead><tr><th>List</th><th>Customer</th><th className="numeric">Boards</th><th className="numeric">Lines</th><th>Bare PCB · enclosure</th><th className="numeric">Customer total</th><th>Status</th><th>Saved</th><th/></tr></thead>
   <tbody>{shown.map(l=>{const job=l.jobId?jobs.find(j=>j.id===l.jobId):null,info=job?stageInfo(job):null,stage=info?.stages[info.current];
    return <React.Fragment key={l.id}><tr>
     <td><strong>{l.name}</strong><small className="muted"> Rev {revLetter(l.revision)}{l.history?.length?` · ${l.history.length+1} revisions`:''}</small>{job&&<button className="text-button job-link" onClick={()=>onOpenJob(job)}><Factory size={12}/>{job.finished?'Finished':stage?stage.name:'In production'} · {job.board}</button>}</td>
     <td>{l.customer||<em className="na">—</em>}</td><td className="numeric">{Number(l.boards||0).toLocaleString('en-IN')}</td><td className="numeric">{l.lines}</td>
     <td>{[l.pcb?'PCB':'',l.enclosure].filter(Boolean).join(' · ')||<em className="na">—</em>}</td>
     <td className="numeric">{l.total==null?<em className="na">Not priced</em>:money.fmt(l.total)}</td>
     <td><select aria-label={`${l.name} status`} className={'status-select '+TONE[l.status]} value={l.status} onChange={e=>setLists(setListStatus(l.id,e.target.value))}>{LIST_STATUSES.map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></td>
     <td><small>{when(l.savedAt)}</small></td>
     <td className="saved-actions"><button className="button small primary" onClick={()=>open(l)}><FolderOpen size={14}/>Open</button>{l.history?.length>0&&<button className="icon-button" aria-label={`Compare revisions of ${l.name}`} aria-expanded={cmp===l.id} title="Compare revisions" onClick={()=>setCmp(cmp===l.id?null:l.id)}><GitCompare size={14}/></button>}<button className="icon-button" aria-label={`Duplicate ${l.name}`} title="Duplicate" onClick={()=>{setLists(duplicateList(l.id));notify(`${l.name} duplicated.`)}}><Copy size={14}/></button><button className="icon-button" aria-label={`Delete ${l.name}`} title="Delete" onClick={()=>{if(confirm(`Delete the saved list ${l.name}?`)){setLists(removeList(l.id));notify(`${l.name} deleted.`)}}}><Trash2 size={14}/></button></td>
    </tr>{cmp===l.id&&<tr className="g-detail-row"><td colSpan={9}><Compare list={l} money={money}/></td></tr>}</React.Fragment>})}</tbody></table></div>
   {shown.length===0&&<p className="muted bom-off">No list with this status.</p>}</section>}
 </div>;
}
