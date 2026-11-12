import React,{useRef,useState} from 'react';
import {Plus,Trash2,ArrowUp,ArrowDown,X,Check,ClipboardList,Upload,Download} from 'lucide-react';
import {MACHINE_KINDS,LINE_STATIONS,stationsOf,addLine,addMachine,updateMachine,removeMachine,moveMachine,clearFloor} from './production.js';
import {setDetails,detailsOf,detailLine,machineRowsFromTable,importMachineList,machineListTemplate} from './machines.js';
import MachineDetails from './MachineDetails.jsx';

function parseCsv(text){const rows=[];let row=[],cell='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')q=false;else cell+=c}else if(c==='"')q=true;else if(c===','||c===';'||c==='\t'){row.push(cell);cell=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=c}if(cell||row.length){row.push(cell);rows.push(row)}return rows}
async function readTable(file){
 if(file.size>5e6)throw Error('Choose a machine list smaller than 5 MB.');
 if(/\.xlsx$/i.test(file.name)){const {default:ExcelJS}=await import('exceljs');const wb=new ExcelJS.Workbook();await wb.xlsx.load(await file.arrayBuffer());const ws=wb.worksheets[0];if(!ws)throw Error('The workbook has no sheet.');const t=[];
  ws.eachRow({includeEmpty:false},row=>{const vals=[];row.eachCell({includeEmpty:true},(c,i)=>{const v=c.value;vals[i-1]=v&&typeof v==='object'?(v.text??v.result??v.richText?.map(x=>x.text).join('')??''):v});t.push(vals)});return t}
 if(/\.(csv|txt|tsv)$/i.test(file.name))return parseCsv(await file.text());
 throw Error('Load the machine list as .xlsx or .csv.');
}

// Station picker for a line: the usual stations in order as switches, plus any station of your own.
function Stations({value,onChange,label}){
 const extra=value.filter(s=>!LINE_STATIONS.includes(s));const [add,setAdd]=useState('');
 const toggle=st=>{const on=value.includes(st);const next=on?value.filter(x=>x!==st):[...LINE_STATIONS.filter(x=>x===st||value.includes(x)),...extra];if(next.length)onChange(next)};
 const addOwn=()=>{const t=add.trim();if(t&&!value.includes(t)){onChange([...value,t]);setAdd('')}};
 return <div className="station-pick" role="group" aria-label={label}>
  {LINE_STATIONS.map(st=><label key={st} className={'pcb-chip'+(value.includes(st)?' on':'')}><input type="checkbox" checked={value.includes(st)} onChange={()=>toggle(st)}/>{st}</label>)}
  {extra.map(st=><span key={st} className="pcb-chip on">{st}<button type="button" className="chip-x" aria-label={`Remove ${st}`} onClick={()=>value.length>1&&onChange(value.filter(x=>x!==st))}><X size={11}/></button></span>)}
  <span className="station-add"><input value={add} maxLength="30" placeholder="Own station, e.g. Glue dispenser" aria-label={`${label}: add a station`} onChange={e=>setAdd(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addOwn()}}}/><button type="button" className="button small" onClick={addOwn} disabled={!add.trim()}><Plus size={13}/>Add</button></span>
 </div>;
}

// Set up the factory: create lines with the stations they really have, add the other machines,
// rename, reorder or remove them. Jobs on a removed machine keep running in the plan.
export default function FactorySetup({state,setState,notify=()=>{},onDone}){
 const [line,setLine]=useState({name:'',stations:[...LINE_STATIONS]});
 const [mach,setMach]=useState({name:'',kind:'Wave solder'});
 // Machine details: which machine is open, and for a line which station.
 const [open,setOpen]=useState(null),[station,setStation]=useState(null);const listInput=useRef(null);
 const openDetails=m=>{if(open===m.id){setOpen(null);return}setOpen(m.id);setStation(m.kind==='SMT line'?(stationsOf(m).find(st=>detailsOf(m,st))||stationsOf(m)[0]):null)};
 const loadList=async file=>{if(!file)return;try{const rows=machineRowsFromTable(await readTable(file));if(!rows.length)throw Error(`${file.name} has no machine rows.`);
  const res=importMachineList(state,rows);setState(res.state);
  notify(`${file.name}: ${res.updated} row${res.updated===1?'':'s'} filled existing machines, ${res.created} new machine${res.created===1?'':'s'} or line${res.created===1?'':'s'} created${res.skipped?`, ${res.skipped} skipped (no details)`:''}.`)}
  catch(e){notify(e.message)}};
 const template=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([machineListTemplate()],{type:'text/csv'}));a.download='machine-list-template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 const summary=m=>{if(m.kind!=='SMT line')return detailLine(m.details);const known=stationsOf(m).filter(st=>detailsOf(m,st));return known.length?known.map(st=>`${st}: ${detailLine(detailsOf(m,st))||'details'}`).join(' · '):''};
 const lines=state.machines.filter(m=>m.kind==='SMT line').length;
 const createLine=e=>{e.preventDefault();setState(s=>addLine(s,line));notify(`${line.name.trim()||'New SMT line'} created with ${line.stations.length} stations.`);setLine({name:'',stations:[...LINE_STATIONS]})};
 const createMachine=e=>{e.preventDefault();setState(s=>addMachine(s,mach));notify(`${mach.name.trim()||mach.kind} added.`);setMach(m=>({...m,name:''}))};
 const remove=m=>{if(m.job&&!confirm(`${m.name} is running a job. Remove it from the floor anyway?`))return;setState(s=>removeMachine(s,m.id));notify(`${m.name} removed.`)};
 return <div className="factory-setup">
  <div className="setup-forms">
   <form className="setup-card" onSubmit={createLine} aria-label="Create line">
    <h3>Create line</h3><p className="muted">An SMT line with the stations it has, in order. Line {lines+1} on your floor.</p>
    <label>Line name<input value={line.name} maxLength="60" placeholder={`SMT line ${lines+1}`} onChange={e=>setLine(l=>({...l,name:e.target.value}))}/></label>
    <Stations label="Stations of the new line" value={line.stations} onChange={stations=>setLine(l=>({...l,stations}))}/>
    <button className="button primary" type="submit"><Plus size={15}/>Create line</button>
   </form>
   <form className="setup-card" onSubmit={createMachine} aria-label="Add machine">
    <h3>Add machine</h3><p className="muted">Wave or selective solder, test, burn-in, coating, depaneling, assembly benches or anything else.</p>
    <label>Kind<select value={mach.kind} onChange={e=>setMach(m=>({...m,kind:e.target.value}))}>{MACHINE_KINDS.filter(k=>k!=='SMT line').map(k=><option key={k}>{k}</option>)}</select></label>
    <label>Name<input value={mach.name} maxLength="60" placeholder={mach.kind==='Other'?'e.g. Ultrasonic cleaner':mach.kind} onChange={e=>setMach(m=>({...m,name:e.target.value}))}/></label>
    <button className="button primary" type="submit"><Plus size={15}/>Add machine</button>
   </form>
  </div>
  <div className="setup-sub-row"><h3 className="setup-sub">Your floor · {state.machines.length} machine{state.machines.length===1?'':'s'}, {lines} line{lines===1?'':'s'}</h3>
   <span className="setup-list-acts"><button type="button" className="button small" onClick={()=>listInput.current?.click()}><Upload size={13}/>Load machine list</button><button type="button" className="text-button" onClick={template}><Download size={13}/>Template (.csv)</button>
   <input ref={listInput} type="file" accept=".xlsx,.csv,.txt,.tsv" hidden aria-label="Machine list file" onChange={e=>{loadList(e.target.files?.[0]);e.target.value=''}}/></span></div>
  {state.machines.length===0?<p className="muted bom-off">The floor is empty. Create your first line or add a machine above.</p>:
  <ol className="setup-list">{state.machines.map((m,i)=><li key={m.id}>
   <div className="setup-row">
    <input className="setup-name" aria-label={`Name of ${m.name}`} defaultValue={m.name} maxLength="60" onBlur={e=>{if(e.target.value.trim()!==m.name)setState(s=>updateMachine(s,m.id,{name:e.target.value}))}}/>
    {m.kind==='SMT line'?<span className="badge neutral"><span/>SMT line · {stationsOf(m).length} stations</span>:<select aria-label={`Kind of ${m.name}`} value={m.kind} onChange={e=>setState(s=>updateMachine(s,m.id,{kind:e.target.value}))}>{MACHINE_KINDS.filter(k=>k!=='SMT line').map(k=><option key={k}>{k}</option>)}</select>}
    <span className="setup-acts"><button type="button" className={'button small'+(open===m.id?' active':'')} aria-expanded={open===m.id} aria-label={`Details of ${m.name}`} onClick={()=>openDetails(m)}><ClipboardList size={13}/>Details</button><button type="button" className="icon-button" aria-label={`Move ${m.name} up`} disabled={i===0} onClick={()=>setState(s=>moveMachine(s,m.id,-1))}><ArrowUp size={14}/></button><button type="button" className="icon-button" aria-label={`Move ${m.name} down`} disabled={i===state.machines.length-1} onClick={()=>setState(s=>moveMachine(s,m.id,1))}><ArrowDown size={14}/></button><button type="button" className="icon-button" aria-label={`Remove ${m.name}`} onClick={()=>remove(m)}><Trash2 size={14}/></button></span>
   </div>
   {summary(m)&&<p className="setup-detail-line">{summary(m)}</p>}
   {m.kind==='SMT line'&&<Stations label={`Stations of ${m.name}`} value={stationsOf(m)} onChange={stations=>setState(s=>updateMachine(s,m.id,{stations}))}/>}
   {open===m.id&&<div className="setup-details">
    {m.kind==='SMT line'&&<div className="segmented md-stations" role="group" aria-label={`Station of ${m.name}`}>{stationsOf(m).map(st=><button type="button" key={st} aria-pressed={station===st} className={station===st?'active':''} onClick={()=>setStation(st)}>{st}{detailsOf(m,st)?' ✓':''}</button>)}</div>}
    <MachineDetails key={m.id+'|'+(station||'')} title={m.kind==='SMT line'?`${m.name} · ${station}`:m.name} value={detailsOf(m,m.kind==='SMT line'?station:null)} notify={notify}
     onSave={d=>setState(s=>setDetails(s,m.id,m.kind==='SMT line'?station:null,d))}/></div>}
  </li>)}</ol>}
  <div className="setup-foot"><button type="button" className="button primary" onClick={()=>{setState(s=>({...s,floorSet:true}));onDone?.()}}><Check size={15}/>Done</button>
   {state.machines.length>0&&<button type="button" className="text-button danger" onClick={()=>{if(confirm('Remove every machine and start an empty floor?')){setState(s=>clearFloor(s));notify('Floor cleared. Create your lines and machines.')}}}>Start from an empty floor</button>}</div>
 </div>;
}
