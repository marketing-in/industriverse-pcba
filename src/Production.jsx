import {detailsOf,detailLine,footprint} from './machines.js';
import React,{useEffect,useMemo,useState} from 'react';
import {Factory,Timer,Gauge,CalendarCheck,CheckCircle2,CircleDashed,Wrench,ArrowRight,ClipboardCheck,History,Calculator,Check,Settings2,CalendarClock,ShieldCheck,Shuffle} from 'lucide-react';
import {ReelIcon} from './brand.jsx';
import {loadLists} from './savedLists.js';
import FactorySetup from './FactorySetup.jsx';
import {AREAS,LINE_STATIONS,stationsOf,areaOf,modelOf,estimateJob,floorSummary,lastJob,jobDays,completedJobs,activeJobs,formatDate,bookJob,finishJob,setMachineStatus,todayIso,addDays,STATUSES,completeStage,autoAdvance,stageInfo,STAGE_GROUPS,reworkStage,calendarOf,setCalendar,WEEKDAYS,calendarText,groupBySetup,changeovers,setupText,remaskCount,setMasked,moveJobToLine,moveJobStart,jobState} from './production.js';

const fmt=n=>Number(n).toLocaleString('en-US');
const TONE={Likely:'green',Possible:'green',Tight:'amber','Not by that date':'red','Not feasible':'red','Not enough data':'neutral'};
const STATUS_ICON={running:CircleDashed,idle:CheckCircle2,maintenance:Wrench};
// A job's lamp: the state word with its shape, never colour alone. The current stage segment takes the
// same colour through --stage-state on the job row.
const LAMP_SHAPES={
 run:<path d="M4 2.5 12 7l-8 4.5z" fill="currentColor"/>,
 hold:<><rect x="3.5" y="2.5" width="2.5" height="9" fill="currentColor"/><rect x="8" y="2.5" width="2.5" height="9" fill="currentColor"/></>,
 stop:<rect x="3" y="3" width="8" height="8" fill="currentColor"/>,
 queued:<circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>,
 done:<path d="m3 7.2 2.6 2.6L11 4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>};
const LAMP_KIND={Running:'run',Hold:'hold',Rework:'hold',Stopped:'stop',Queued:'queued',Done:'done'};
const STAGE_STATE={Running:'var(--green)',Hold:'var(--lamp-amber)',Rework:'var(--lamp-amber)',Stopped:'var(--red)',Queued:'var(--hair)',Done:'var(--series-1)'};
function JobLamp({state}){const k=LAMP_KIND[state]||'queued';
 return <span className={'lamp '+k}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">{LAMP_SHAPES[k]}</svg>{state}</span>}

// A machine's picture from its 3D model (machineView.js, loaded on demand with three.js): null while
// rendering, false without WebGL.
function useMachinePicture(model,status){
 const [pic,setPic]=useState(null);
 useEffect(()=>{if(!model){setPic(false);return}let live=true;setPic(null);const t=setTimeout(()=>import('./machineView.js').then(v=>{if(live)setPic(v.machinePicture(model,status)||false)}).catch(()=>{if(live)setPic(false)}),20);return()=>{live=false;clearTimeout(t)}},[model,status]);
 return pic;
}
function MachineCard({m,job,setState}){
 const stations=stationsOf(m),standard=stations.length===LINE_STATIONS.length&&stations.every((x,i)=>x===LINE_STATIONS[i]);
 const kind=modelOf(m),line=kind==='smt',model=line&&!standard?null:kind,pic=useMachinePicture(model,m.status),aligned=pic&&line&&standard,Icon=STATUS_ICON[m.status];
 const figure=model&&pic!==false&&<figure className="machine-figure">{pic?<img src={pic.src} alt={`${m.name}, 3D model`} draggable="false"/>:<div className="machine-figure-wait" aria-hidden="true"/>}</figure>;
 return <li className={'machine-card '+(line?'line ':'')+m.status}>
  {!line&&figure}
  <div className="machine-card-head"><span className="machine-icon"><Icon size={15}/></span><span className="machine-copy"><strong>{m.name}</strong><small>{line?(job?job.board:'No job'):m.kind+(job?` · ${job.board}`:'')}</small></span>{m.status==='maintenance'&&<span className='lamp hold'><svg width='14' height='14' viewBox='0 0 14 14' aria-hidden='true' focusable='false'>{LAMP_SHAPES.hold}</svg>Maintenance</span>}
   <select aria-label={`${m.name} status`} value={m.status} onChange={e=>setState(s=>setMachineStatus(s,m.id,e.target.value))}>{STATUSES.map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></div>
  {line&&figure}
  {line&&<ol className={'machine-stations'+(aligned?' aligned':'')+(standard?'':' custom')} aria-label={`${m.name} stations`}>{stations.map((st,i)=>{const d=detailsOf(m,st);return <li key={st} title={d?[st,detailLine(d),footprint(d)].filter(Boolean).join(' · '):undefined} style={aligned?{left:`${pic.marks[i].x*100}%`}:undefined}>{st}</li>})}</ol>}
  {!line&&m.details&&<p className="machine-detail">{[detailLine(m.details),footprint(m.details)].filter(Boolean).join(' · ')}</p>}
  {line&&m.equipment&&Object.keys(m.equipment).length>0&&<p className="machine-detail">{stations.filter(st=>detailsOf(m,st)).map(st=>`${st}: ${detailLine(detailsOf(m,st))}`).join(' · ')}</p>}
 </li>;
}

// The job's stages grouped as the factory runs them: material, factory line, assembly, testing and
// final product. Each stage's width follows its share of the job's time.
function StageTrack({info,board}){
 return <div className="stage-groups" role="list" aria-label={`Process stages for ${board}`}>{STAGE_GROUPS.map(g=>{const list=info.stages.filter(st=>st.group===g),share=list.reduce((a,st)=>a+st.share,0);
  const state=list.every(st=>st.done)?'done':list.some(st=>st.active)?'active':'';
  return <div key={g} role="listitem" className={'stage-group '+state} style={{flex:`${Math.round(share*100)} 1 72px`}}><small>{g}</small>
   <ol className="stage-track">{list.map(st=><li key={st.key} className={(st.done?'done':st.active?'active':'')+(st.gate?' gate':'')} style={{flexGrow:st.share*100}} title={`${st.name}${st.gate?' (quality gate)':''}: ${st.about}${st.done?` Done ${formatDate(st.done)}.`:''}`}><i/>{st.done&&<Check size={10}/>}<span>{st.name}</span></li>)}</ol></div>})}</div>;
}
// One plain line under the track: where the job is now and what comes next.
function StageNow({info,job}){
 const now=info.stages[info.current],next=info.stages[info.current+1];
 if(!now)return <p className="stage-now"><strong>All stages done</strong> <span className="muted">Mark the job finished to free its line.</span></p>;
 return <p className="stage-now"><strong>{now.name}</strong> <span className="muted">Stage {info.current+1} of {info.stages.length}{now.gate?' · quality gate':''}{info.queued?` · starts ${formatDate(job.started)}`:''}{next?` · next: ${next.name}`:' · last stage'}</span></p>;
}
// At a quality gate: boards that failed go to rework and come back to the same gate.
function ReworkForm({job,stage,onRework}){
 const [n,setN]=useState(''),[note,setNote]=useState('');
 return <form className="rework-form" onSubmit={e=>{e.preventDefault();const k=Math.round(+n||0);if(k>0){onRework(k,note);setN('');setNote('')}}}>
  <span>{stage.name} is a quality gate.</span>
  <input type="number" min="1" max={job.qty} step="1" inputMode="numeric" aria-label={`Boards of ${job.board} failed at ${stage.name}`} placeholder="Failed" value={n} onChange={e=>setN(e.target.value)}/>
  <input aria-label="Defect" placeholder="Defect, e.g. solder bridge" maxLength="60" value={note} onChange={e=>setNote(e.target.value)}/>
  <button className="button small" type="submit" disabled={!(+n>0)}>Send to rework</button>
 </form>;
}
// Shift calendar: how many shifts a day, how long, and which weekdays the floor works. Finish dates
// count working days; more shifts than past jobs ran on make each day produce more.
function ShiftCalendar({state,setState,notify}){
 const cal=calendarOf(state);const save=patch=>setState(s=>setCalendar(s,{...calendarOf(s),...patch}));
 return <section className="panel shift-panel" aria-label="Shift calendar">
  <div className="panel-heading"><div className="title-row"><CalendarClock size={18}/><h2>Shift calendar</h2></div><small className="muted">{calendarText(cal)}</small></div>
  <div className="shift-body">
   <label>Shifts per day<select aria-label="Shifts per day" value={cal.shifts} onChange={e=>{save({shifts:+e.target.value});notify?.(`${e.target.value} shift${e.target.value==='1'?'':'s'} a day: estimates updated.`)}}>{[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
   <label>Hours per shift<input type="number" min="1" max="12" step="0.5" aria-label="Hours per shift" value={cal.hoursPerShift} onChange={e=>save({hoursPerShift:+e.target.value||8})}/></label>
   <div className="shift-days" role="group" aria-label="Working days">{[1,2,3,4,5,6,0].map(d=>{const on=cal.workdays.includes(d);return <button key={d} type="button" aria-pressed={on} className={'pcb-chip'+(on?' on':'')} onClick={()=>{const w=on?cal.workdays.filter(x=>x!==d):[...cal.workdays,d];if(w.length)save({workdays:w})}}>{WEEKDAYS[d]}</button>})}</div>
  </div>
 </section>;
}
// A job's extra controls: its line setup, masking before coating, and moving it to another line or start.
function JobExtras({job,state,setState,today,notify}){
 const lines=state.machines.filter(m=>m.kind==='SMT line'),own=lines.filter(m=>m.job===job.id),queued=job.started>today;
 return <div className="job-extras">
  <span className="job-setup" title="Jobs with the same setup can run back to back without a changeover">{job.setup?`Setup: ${setupText(job.setup)}`:'Setup not available'}</span>
  {job.coating&&<span className="job-mask"><ShieldCheck size={13}/><label className="check-inline"><input type="checkbox" checked={!!job.coating.masked} onChange={e=>setState(s=>setMasked(s,job.id,e.target.checked,today))}/>Masking before coating</label><small>{job.coating.keepouts} keep-out{job.coating.keepouts===1?'':'s'} per board{remaskCount(job)?` · remask ${remaskCount(job)} board${remaskCount(job)===1?'':'s'} after rework`:''}</small></span>}
  <span className="job-move"><Shuffle size={13}/>{queued?<label>Move start<input type="date" min={today} aria-label={`Move the start of ${job.board}`} defaultValue={job.started} onBlur={e=>{if(e.target.value&&e.target.value!==job.started){setState(s=>moveJobStart(s,job.id,e.target.value,today));notify?.(`${job.board}: start moved.`)}}}/></label>
   :<label>Line<select aria-label={`Line for ${job.board}`} value={own[0]?.id||''} onChange={e=>{setState(s=>moveJobToLine(s,job.id,e.target.value,today));notify?.(`${job.board} moved to ${lines.find(l=>l.id===e.target.value)?.name}.`)}}>
    {!own.length&&<option value="">Not on a line</option>}{lines.map(l=>{const busy=l.job&&l.job!==job.id,down=l.status==='maintenance';return <option key={l.id} value={l.id} disabled={busy||down}>{l.name}{busy?' (busy)':down?' (maintenance)':''}</option>})}</select></label>}</span>
 </div>;
}
// Production capacity page: what the floor is doing now, how long the last job took, and a live
// feasibility estimate for a request from another board company.
export function Production({state,setState,boardModel=[],board,notify,onOpenList=null,onOpenLists=null,onSetUpFactory=null}){
 const today=todayIso();
 const [req,setReq]=useState(()=>({customer:'',board:board?.name||'',qty:'500',components:String(boardModel.length||lastJob(state.jobs)?.components||100),due:addDays(today,21)}));
 // The selected board (picked in Engineering or anywhere else) fills the new request, unless another board name was typed.
 const shownBoard=React.useRef(board?.name||'');
 useEffect(()=>{const name=board?.name||'',prev=shownBoard.current;shownBoard.current=name;if(!name||name===prev)return;
  setReq(r=>!r.board.trim()||r.board===prev?{...r,board:name,components:String(boardModel.length||r.components)}:r)},[board?.id]);// eslint-disable-line react-hooks/exhaustive-deps
 // Jobs of the selected board: by its saved list (made from this board) or by the board name.
 const listBoards=useMemo(()=>new Map(loadLists().map(l=>[l.id,l.state?.fromBoard||null])),[state.jobs]);
 const ofBoard=j=>!!board&&((j.listId&&listBoards.get(j.listId)===board.id)||String(j.board||'').trim().toLowerCase()===String(board.name||'').trim().toLowerCase());
 const [onlyBoard,setOnlyBoard]=useState(false);
 const auto=state.auto!==false;const [setup,setSetup]=useState(false);
 // The factory is set up in Production, Machines when the shell passes onSetUpFactory; otherwise here.
 const openSetup=onSetUpFactory||(()=>setSetup(true));
 // Auto-calculator: on open and every minute, stages whose planned time has passed complete, finished
 // jobs free their lines, queued jobs start, and estimates update from the new history.
 useEffect(()=>{if(!auto)return;const tick=()=>setState(s=>{const next=autoAdvance(s,todayIso());return JSON.stringify(next.jobs)===JSON.stringify(s.jobs)&&JSON.stringify(next.machines)===JSON.stringify(s.machines)?s:next});tick();const t=setInterval(tick,60000);return()=>clearInterval(t)},[auto,setState]);
 const floor=useMemo(()=>floorSummary(state.machines,state.jobs),[state]);
 const last=lastJob(state.jobs),history=completedJobs(state.jobs),active=activeJobs(state.jobs);
 const est=useMemo(()=>estimateJob(state.machines,state.jobs,{...req,calendar:calendarOf(state)},today),[state,req,today]);
 const [grouped,setGrouped]=useState(false);const boardJobs=active.filter(ofBoard),listed=onlyBoard?boardJobs:active;const shown=grouped?groupBySetup(listed):listed;
 const set=k=>e=>setReq(r=>({...r,[k]:e.target.value}));
 const book=()=>{setState(s=>bookJob(s,est,req,today));notify?.(`${req.board.trim()||'New board'} for ${req.customer.trim()||'new customer'} booked: ${est.days} days from ${formatDate(est.start)}.`)};
 const useBoard=()=>setReq(r=>({...r,board:board?.name||r.board,components:String(boardModel.length||r.components)}));
 return <div className="production">
  <div className="stats-grid prod-stats">
   <div className="stat"><div className="stat-top"><span>Last job took</span><Timer size={18}/></div><div className="stat-value">{last?<>{jobDays(last)}<small className="stat-unit"> days</small></>:<small className="stat-unit na">Not available</small>}</div><div className="stat-note">{last?`${last.board} · ${fmt(last.qty)} boards · finished ${formatDate(last.finished)}`:'None yet'}</div></div>
   <div className="stat"><div className="stat-top"><span>Machines working now</span><Factory size={18}/></div><div className="stat-value">{floor.running}<small className="stat-unit"> of {floor.total}</small></div><div className={'stat-note '+(floor.maintenance?'amber':'')}>{floor.idle} idle · {floor.maintenance} in maintenance</div></div>
   <div className="stat"><div className="stat-top"><span>SMT lines free</span><Gauge size={18}/></div><div className="stat-value">{floor.idleLines}<small className="stat-unit"> of {floor.lines}</small></div><div className={'stat-note '+(est.window?.waiting?'amber':'green')}>{est.window?.waiting?<><span className="tiny-dot"/>Next free {formatDate(est.window.freesWith?.expected)}</>:<><CheckCircle2 size={13}/>Free today</>}</div></div>
   <div className="stat"><div className="stat-top"><span>Jobs in progress</span><CalendarCheck size={18}/></div><div className="stat-value">{active.length}</div><div className="stat-note">{active[0]?`${active[0].board} · expected ${formatDate(active[0].expected)}`:'Floor is clear'}</div></div>
  </div>
  <section className="panel jobs-panel" aria-label="Jobs on the floor">
   <div className="panel-heading"><div className="title-row"><CalendarCheck size={18}/><h2>Jobs on the floor</h2></div>{board&&<label className="check-inline only-board"><input type="checkbox" checked={onlyBoard} onChange={e=>setOnlyBoard(e.target.checked)}/>Only {board.name} <b className="numeric">{boardJobs.length}</b></label>}<label className="check-inline group-setup"><input type="checkbox" checked={grouped} onChange={e=>setGrouped(e.target.checked)}/>Group by setup</label><label className="auto-switch"><input type="checkbox" checked={auto} onChange={e=>setState(s=>({...s,auto:e.target.checked}))}/><span/>Auto calculator</label></div>
   {active.length===0&&<div className="empty"><p>{state.jobs.length?'No jobs in progress.':'No jobs yet.'} A job starts when a quoted list is continued to production.</p>{onOpenLists&&<button type="button" className="button handoff" onClick={onOpenLists}><ReelIcon size={16}/>Open saved lists</button>}</div>}
   {active.length>0&&onlyBoard&&!boardJobs.length&&<div className="empty"><p>No jobs for {board?.name} on the floor.</p><button type="button" className="button" onClick={()=>setOnlyBoard(false)}>Show all jobs</button></div>}
   {active.some(j=>j.setup)&&<p className="setup-changes muted">Stencil changeovers in this order: <b>{changeovers(shown)}</b>{!grouped&&changeovers(groupBySetup(active))<changeovers(active)?` · ${changeovers(groupBySetup(active))} when grouped by setup`:''}</p>}
   {shown.map(j=>{const info=stageInfo(j,today),next=info.stages[info.current],js=jobState(j,today);return <div className={'job-row'+(ofBoard(j)?' this-board':'')} key={j.id} data-state={js.toLowerCase()} title={ofBoard(j)?`A job for the selected board, ${board.name}`:undefined} style={STAGE_STATE[js]?{'--stage-state':STAGE_STATE[js]}:undefined}>
    <div className="job-head"><JobLamp state={js}/><span><strong>{j.board}</strong><small>{j.customer} · {fmt(j.qty)} boards · {j.lines} line{j.lines===1?'':'s'}</small></span><span className={'badge '+(info.queued?'neutral':info.drift>0?'red':info.drift<0?'green':'neutral')}><span/>{info.queued?`Starts ${formatDate(j.started)}`:`Finish ${formatDate(j.expected)}`}</span></div>
    <StageTrack info={info} board={j.board}/><StageNow info={info} job={j}/><JobExtras job={j} state={state} setState={setState} today={today} notify={notify}/>
    <div className="job-calc"><small>{info.queued?'Queued':`${info.remaining} day${info.remaining===1?'':'s'} left`}{info.drift?` · ${Math.abs(info.drift)} day${Math.abs(info.drift)===1?'':'s'} ${info.drift<0?'ahead of':'behind'} plan`:' · on plan'}</small></div>
    {next?.gate&&!info.queued&&<ReworkForm job={j} stage={next} onRework={(n,note)=>{setState(s=>reworkStage(s,j.id,n,today,note));notify?.(`${n} board${n===1?'':'s'} of ${j.board} sent to rework at ${next.name}.`)}}/>}<div className="job-foot"><small>Started {formatDate(j.started)} · {j.notes}{j.serials?` · serials ${j.serials.first} to ${j.serials.last}`:''}{j.rework&&Object.keys(j.rework).length?` · rework ${Object.values(j.rework).reduce((a,b)=>a+b,0)} boards`:''}{j.quote?` · quote ${j.quote}`:''}{j.kit?` · kit: ${j.kit.own} of ${j.kit.lines} lines from own stock, ${j.kit.buy} to buy`:''}</small><span className="job-buttons">{j.listId&&onOpenList&&<button type="button" className="button small handoff" onClick={()=>onOpenList(j.listId)}><ReelIcon size={14}/>Open its BOM</button>}{next&&!info.queued&&<button type="button" className="button small primary" onClick={()=>{setState(s=>completeStage(s,j.id,today));notify?.(`${next.name} done for ${j.board}.`)}}>Complete {next.name}</button>}<button type="button" className="button small" onClick={()=>{setState(s=>finishJob(s,j.id,today));notify?.(`${j.board} marked finished.`)}}>Mark finished</button></span></div></div>})}
  </section>
  <section className="panel floor-panel" aria-label="Machines">
   <div className="panel-heading"><div className="title-row"><Factory size={18}/><h2>{setup?'Set up the factory':'Machines'}</h2>{!setup&&<span className="count-label">{state.machines.length}</span>}</div>{!setup&&state.floorSet&&state.machines.length>0&&<button className="button small" onClick={openSetup}><Settings2 size={14}/>Set up the factory</button>}</div>
   {setup?<FactorySetup state={state} setState={setState} notify={notify} onDone={()=>setSetup(false)}/>:<>
   {!state.floorSet&&state.machines.length>0&&<div className="studio-note setup-hint"><Settings2 size={15}/><span>This is a typical floor: two SMT lines, wave and selective solder, two test stations. Set it up to match your factory: create your lines, add your machines.</span><button className="button small primary" onClick={openSetup}>Set up the factory</button></div>}
   {state.machines.length===0&&<div className="empty"><p>No machines yet. Estimates and bookings use the lines and machines you create here.</p><button className="button primary" onClick={openSetup}>Set up the factory</button></div>}
   <div className="floor-body">{AREAS.map(([area,title])=>{const list=state.machines.filter(m=>areaOf(m.kind)===area);return list.length>0&&<div key={area} className={'floor-area '+area}><h3 className="machine-area-title">{title}</h3>
    <ul className="machine-cards">{list.map(m=><MachineCard key={m.id} m={m} job={m.job&&state.jobs.find(j=>j.id===m.job)} setState={setState}/>)}</ul></div>})}</div></>}
  </section>
  <div className="prod-layout">
   <section className="panel quote-panel" aria-label="New request">
    <div className="panel-heading"><div className="title-row"><ClipboardCheck size={18}/><h2>New request</h2></div><button className="text-button" type="button" onClick={useBoard}>Use open board <ArrowRight size={14}/></button></div>
    <form className="quote-form" onSubmit={e=>{e.preventDefault();if(est.ok)book()}}>
     <div className="form-grid">
      <label>Customer<input name="customer" value={req.customer} onChange={set('customer')} placeholder="Company"/></label>
      <label>Board<input name="board" value={req.board} onChange={set('board')} placeholder="Name or rev"/></label>
      <label>Quantity of boards<input name="qty" type="number" min="1" step="1" inputMode="numeric" value={req.qty} onChange={set('qty')}/></label>
      <label>Components per board<input name="components" type="number" min="1" step="1" inputMode="numeric" value={req.components} onChange={set('components')}/></label>
      <label>Requested delivery<input name="due" type="date" value={req.due} min={today} onChange={set('due')}/></label>
     </div>
     <div className={'verdict '+(TONE[est.verdict]||'neutral')} role="status" aria-live="polite">
      <div className="verdict-head"><strong className="verdict-word">{est.verdict}</strong>{est.ok&&<span className="badge neutral">{Math.round(est.confidence*100)}% confidence</span>}</div>
      {est.ok&&<div className="verdict-facts"><div><small>Takes</small><strong>{est.days} day{est.days===1?'':'s'}</strong></div><div><small>Start</small><strong>{formatDate(est.start)}</strong></div><div><small>Finish</small><strong>{formatDate(est.finish)}</strong></div><div><small>Lines</small><strong>{est.linesUsed}</strong></div></div>}
      <ol className="reason-list">{est.reasons.map((r,i)=><li key={i}>{r}</li>)}</ol>
      <div className="verdict-actions"><button type="submit" className="button primary" disabled={!est.ok}>Book this job <ArrowRight size={15}/></button></div>
     </div>
    </form>
   </section>
   <div className="prod-side">
    <ShiftCalendar state={state} setState={setState} notify={notify}/>
   </div>
  </div>
  <section className="panel calc-log" aria-label="Calculator log"><div className="panel-heading"><div className="title-row"><Calculator size={18}/><h2>Estimate calculator</h2></div></div>
   {(state.log||[]).length?<ol className="log-list">{state.log.slice(0,8).map((l,i)=><li key={i}><time>{formatDate(l.at)}</time><span>{l.text}</span></li>)}</ol>:<p className="studio-note"><Calculator size={15}/> No updates yet.</p>}
  </section>
  <section className="panel history-panel" aria-label="Job history">
   <div className="panel-heading"><div className="title-row"><History size={18}/><h2>Finished jobs</h2><span className="count-label">{history.length}</span></div></div>
   <div className="table-scroll"><table><thead><tr><th>Board</th><th>Customer</th><th>Boards</th><th>Lines</th><th>Started</th><th>Finished</th><th>Days</th><th>Per line per day</th></tr></thead><tbody>{history.map(j=><tr key={j.id}><td><strong>{j.board}</strong>{j.notes&&<small className="price-note">{j.notes}</small>}</td><td>{j.customer}</td><td className="numeric">{fmt(j.qty)}</td><td className="numeric">{j.lines}</td><td>{formatDate(j.started)}</td><td>{formatDate(j.finished)}</td><td className="numeric">{jobDays(j)}</td><td className="numeric">{fmt(Math.round(j.qty/(jobDays(j)*Math.max(1,j.lines))))}</td></tr>)}{history.length===0&&<tr><td colSpan="8" className="muted">None yet.</td></tr>}</tbody></table></div>
  </section>
 </div>;
}
export default Production;
