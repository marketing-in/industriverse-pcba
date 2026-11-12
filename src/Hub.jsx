import React from 'react';
import {FileUp,Database} from 'lucide-react';
import {LINES,hashOf,Lamp} from './brand.jsx';
import {stageInfo,STAGES,calendarOf,calendarText,jobState} from './production.js';
import {revLetter} from './savedLists.js';

// Home: the Route map. Three lanes (what is on each line now) and two joints (what is waiting to cross
// to the next line), with real counts from this workspace only. Zero is written as a word.
const num=v=>Number(v||0).toLocaleString('en-IN');
const many=(k,one,more=one+'s')=>k===1?one:more;
// The list name in the identifier face, its revision in words beside it.
const ListName=({l,name})=>l?<><span className="mono">{l.name}</span>{l.revision?` rev ${revLetter(l.revision)}`:''}</>:<span className="mono">{name}</span>;
const boardName=b=>`${b.name}${b.revision?` rev ${b.revision}`:''}`;
const firstFew=(names,max=3)=>names.length>max?`${names.slice(0,max).join(', ')} and ${names.length-max} more`:names.join(', ');
const lineOf=id=>LINES.find(l=>l.id===id);

function LaneHead({id,onGo}){const l=lineOf(id),Icon=l.icon;
 return <a className="lane-head" href={hashOf(l.pages[0][0])} onClick={e=>{e.preventDefault();onGo(null,{line:id})}}>
  <span className="lane-mark" data-line={id}><Icon size={24}/></span><h2>{l.label}</h2></a>}
// A number in a sentence links to the page it counts.
function Fact({value,one,more,to,filter,onGo}){
 return <a className="fact" href={hashOf(to)} onClick={e=>{e.preventDefault();onGo(to,filter?{filter}:{})}}><b>{num(value)}</b> {many(value,one,more)}</a>}
function Joint({from,to,children,action}){
 return <div className="hub-joint" data-from={from} data-to={to}>
  <span className="joint-route" aria-hidden="true"><i data-line={from}/><i data-line={to}/></span>
  {children?<><p>{children}</p>{action}</>:<p className="joint-idle">Nothing waiting</p>}</div>}

export default function Hub({boards=[],activeBoardId,parts=[],attention=0,lists=[],bomOpen=null,production,hasSamples,onGo,onOpenBoard,onStartBom,onOpenList,onAddFiles,onLoadSamples}){
 const Reel=lineOf('supply').icon;
 // Engineering
 const gerber=boards.filter(b=>b.surface||b.gerberSource||/gerber/i.test(b.source||'')).length;
  const lastBoard=boards.find(b=>b.id===activeBoardId)||boards[boards.length-1]||null;
 const fromBoard=new Set(lists.map(l=>l.state?.from).filter(Boolean));
 const unpriced=boards.filter(b=>!fromBoard.has(b.name));
 // Supply
 const byStatus=['draft','quoted','ordered','archived'].map(s=>[s,lists.filter(l=>l.status===s).length]).filter(([,k])=>k);
 const inStock=parts.filter(p=>+p.stock>0).length;
 const openList=bomOpen&&((bomOpen.rows||[]).length||bomOpen.project)?{name:bomOpen.project||bomOpen.from||'Untitled BOM',lines:(bomOpen.rows||[]).length,list:lists.find(l=>l.id===bomOpen.listId)||null}:null;
 const ready=lists.filter(l=>l.status==='quoted'&&!l.jobId);
 // Production
 const machines=production?.machines||[],smt=machines.filter(m=>m.kind==='SMT line').length;
 const jobs=production?.jobs||[],active=jobs.filter(j=>!j.finished).map(j=>({j,state:jobState(j),info:stageInfo(j)}));
 const count=s=>active.filter(a=>a.state===s).length,running=count('Running'),rework=count('Rework'),queued=count('Queued'),held=count('Hold'),stopped=count('Stopped');
 const order={Stopped:0,Hold:1,Rework:2,Running:3,Queued:4,Done:5};const shown=[...active].sort((a,b)=>order[a.state]-order[b.state]).slice(0,3);
 const firstRun=!boards.length;
 return <div className="hub">
  <section className="hub-lane" data-line="engineering" aria-label="Engineering">
   <LaneHead id="engineering" onGo={onGo}/>
   <p className="lane-facts">
    {boards.length?<><Fact value={boards.length} one="board" to="Board studio" onGo={onGo}/> in the studio, {gerber?<>{num(gerber)} with Gerber files.</>:'none with Gerber files.'}</>:<>No boards of your own yet. Board studio shows the <a className="fact" href={hashOf('Board studio')} onClick={e=>{e.preventDefault();onGo('Board studio')}}>sample board CTRL-01</a>.</>}
   </p>
   {firstRun?<div className="lane-resume" role="region" aria-label="Get started">
     <p>No board loaded. Add a Gerber ZIP, a .kicad_pcb, a .pos file or a .glb.</p>
     <div className="lane-actions"><button type="button" className="button primary" onClick={onAddFiles}><FileUp size={16}/>Add files</button>{!hasSamples&&<button type="button" className="text-button" onClick={onLoadSamples}><Database size={16}/>Load sample data</button>}</div>
    </div>
    :<div className="lane-resume"><p>Last open: <span className="mono">{boardName(lastBoard)}</span>, Board studio</p><button type="button" className="button" onClick={()=>onOpenBoard(lastBoard.id)}>Resume board</button></div>}
  </section>
  <Joint from="engineering" to="supply" action={unpriced.length?<button type="button" className="button handoff" onClick={()=>onStartBom(unpriced[0].id)}><Reel size={16}/>Start a BOM</button>:null}>
   {unpriced.length?<>{num(unpriced.length)} {many(unpriced.length,'board has','boards have')} no priced list: <span className="mono">{firstFew(unpriced.map(boardName))}</span></>:null}
  </Joint>
  <section className="hub-lane" data-line="supply" aria-label="Supply">
   <LaneHead id="supply" onGo={onGo}/>
   <p className="lane-facts">
    {lists.length?<><Fact value={lists.length} one="saved list" to="Saved lists" onGo={onGo}/>: {byStatus.map(([s,k])=>`${num(k)} ${s}`).join(', ')}.</>:'No saved lists yet.'}{' '}
    {parts.length?<><Fact value={inStock} one="part number" to="Inventory" onGo={onGo}/> in stock, {attention?<Fact value={attention} one="needs attention" more="need attention" to="Inventory" filter="Needs attention" onGo={onGo}/>:'none below minimum'}.</>:'No parts in stock yet.'}
   </p>
   {openList?<div className="lane-resume"><p>Open list: <ListName l={openList.list} name={openList.name}/>, {num(openList.lines)} {many(openList.lines,'line')}</p><button type="button" className="button" onClick={()=>onGo('BOM tool')}>Resume list</button></div>
    :lists.length?<div className="lane-resume"><p>Last saved: <ListName l={lists[0]}/></p><button type="button" className="button" onClick={()=>onOpenList(lists[0].id)}>Open the list</button></div>
    :<div className="lane-resume"><p className="muted">Starts when a board has a BOM.</p></div>}
  </section>
  <Joint from="supply" to="production" action={ready.length?<button type="button" className="button" onClick={()=>onOpenList(ready[0].id)}><Reel size={16}/>Open its quotation</button>:null}>
   {ready.length?<>{num(ready.length)} quoted {many(ready.length,'list is','lists are')} ready for production: <ListName l={ready[0]}/>, {num(ready[0].boards)} {many(ready[0].boards,'board')}{ready.length>1?` and ${ready.length-1} more`:''}. Continue to production from its quotation.</>:null}
  </Joint>
  <section className="hub-lane" data-line="production" aria-label="Production">
   <LaneHead id="production" onGo={onGo}/>
   <p className="lane-facts">
    {active.length?<>{running?<><Fact value={running} one="job running" more="jobs running" to="Production" onGo={onGo}/></>:'No jobs running'}{rework?<>, <Fact value={rework} one="in rework" more="in rework" to="Production" onGo={onGo}/></>:''}{queued?<>, <Fact value={queued} one="queued" more="queued" to="Production" onGo={onGo}/></>:''}{held?<>, <Fact value={held} one="on hold" more="on hold" to="Production" onGo={onGo}/></>:''}{stopped?<>, <Fact value={stopped} one="stopped" more="stopped" to="Production" onGo={onGo}/></>:''}.</>:'No jobs running.'}{' '}
    {smt?<><Fact value={smt} one="SMT line" to="SMT line" onGo={onGo}/>, <Fact value={machines.length} one="machine" to="Machines" onGo={onGo}/>. </>:machines.length?<><Fact value={machines.length} one="machine" to="Machines" onGo={onGo}/>, no SMT line yet. </>:'No machines set up. '}
    Shifts: {calendarText(calendarOf(production))}.
   </p>
   {shown.length?<ul className="hub-jobs" aria-label="Active jobs">{shown.map(({j,state,info})=>{const st=STAGES[info.current];
     return <li key={j.id}><button type="button" className="hub-job" onClick={()=>onGo('Production')}><span className="job-name">{j.customer} · {j.board} × {num(j.qty)}</span><Lamp state={state}/><span className="job-stage">{st?`${st.name}, stage ${info.current+1} of ${STAGES.length}`:'All stages done'}</span>
      <ol className="stage-track hub-track" aria-hidden="true" style={state==='Rework'?{'--stage-state':'var(--lamp-amber)','--stage-state-edge':'var(--warning)'}:undefined}>{info.stages.map(x=><li key={x.key} className={(x.done?'done':x.active&&state!=='Queued'?'active':'')+(x.gate?' gate':'')}><i/></li>)}</ol></button></li>})}</ul>
    :<div className="lane-resume"><p className="muted">Starts when a quoted list is continued to production.</p></div>}
  </section>
 </div>;
}
