import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {CircleHelp,X,Search,Play,RotateCcw,Check,ArrowRight,Database,Trash2,ChevronLeft,ChevronRight} from 'lucide-react';
import {LINES,HOME,pageInfo,lineById} from './brand.jsx';
import {TOURS,SHORTCUTS,PAGE_HELP,searchHelp,tourById} from './help.js';

// Help: every page and what it is for, the tours, keyboard shortcuts and sample data, in one side sheet.
// Opened from the ? button in the top bar, the ? key or Search and jump. The page you are on comes first.
export function HelpPanel({page,tours={},hasSamples,onClose,onStartTour,onGo,onLoadSamples,onRemoveSamples}){
 const ref=useRef(null),[q,setQ]=useState('');
 useEffect(()=>{const d=ref.current,prev=document.activeElement;d.showModal();d.querySelector('input')?.focus();return()=>{try{d.close()}catch{};prev?.focus?.()}},[]);
 const found=useMemo(()=>searchHelp(q),[q]);
 const here=PAGE_HELP[page]?{leaf:page,label:page===HOME?'Home':pageInfo(page)?.label||page,line:pageInfo(page)?.line||null,...PAGE_HELP[page]}:null;
 const groups=[{id:null,label:'Home'},...LINES].map(l=>({...l,entries:found.filter(e=>e.line===(l.id||null))})).filter(g=>g.entries.length);
 return <dialog ref={ref} className="help-panel" aria-labelledby="help-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}>
  <div className="help-head"><h2 id="help-title"><CircleHelp size={20} aria-hidden="true"/>Help</h2><button type="button" className="icon-button" aria-label="Close help" onClick={onClose}><X size={20}/></button></div>
  <div className="help-body">
   <label className="help-search"><Search size={16} aria-hidden="true"/><span className="sr-only">Search help</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search help: Gerber, quotation, stock, dispatch…"/></label>
   {!q&&here&&<section className="help-here" data-line={here.line||undefined} aria-labelledby="help-here-title">
    <h3 id="help-here-title"><small>On this page</small>{here.label}</h3><p>{here.what}</p><ul>{here.how.map(h=><li key={h}>{h}</li>)}</ul></section>}
   {!q&&<section aria-labelledby="help-tours-title"><h3 id="help-tours-title">Tours</h3>
    <ul className="help-tours">{TOURS.map(t=>{const l=t.line&&lineById(t.line),Icon=l?.icon,done=tours[t.id]==='done';
     return <li key={t.id} data-line={t.line||undefined}><span className="help-tour-mark" aria-hidden="true">{Icon?<Icon size={18}/>:<Play size={16}/>}</span>
      <span className="help-tour-text"><strong>{t.title}</strong><small>{t.about} {t.steps.length} steps.</small></span>
      {done&&<span className="help-done"><Check size={14} aria-hidden="true"/>Done</span>}
      <button type="button" className={'button small'+(done?'':' primary')} onClick={()=>onStartTour(t.id)} aria-label={`${done?'Take again':'Start'}: ${t.title} tour`}>{done?<><RotateCcw size={14}/>Again</>:<><Play size={14}/>Start</>}</button></li>})}</ul></section>}
   <section aria-labelledby="help-pages-title"><h3 id="help-pages-title">{q?`Pages matching “${q}”`:'Every page'}</h3>
    {groups.map(g=>{const Icon=g.icon;return <div className="help-line" key={g.label} data-line={g.id||undefined}>
     <h4>{Icon?<span className="help-line-mark" aria-hidden="true"><Icon size={14}/></span>:null}{g.label}</h4>
     {g.entries.map(e=><details key={e.leaf} open={!!q||e.leaf===page}><summary><strong>{e.label}</strong><span>{e.what}</span></summary>
      <ul>{e.how.map(h=><li key={h}>{h}</li>)}</ul>
      {e.leaf!==page&&<button type="button" className="text-button" onClick={()=>{onClose();onGo(e.leaf)}}>Open {e.label}<ArrowRight size={14}/></button>}</details>)}</div>})}
    {!found.length&&<p className="muted">Nothing in Help matches “{q}”. Try a page name, a file type or a task such as “quotation”.</p>}
   </section>
   {!q&&<section aria-labelledby="help-keys-title"><h3 id="help-keys-title">Keyboard</h3>
    <dl className="help-keys">{SHORTCUTS.map(([k,v])=><div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl></section>}
   {!q&&<section aria-labelledby="help-samples-title"><h3 id="help-samples-title">Sample data</h3>
    <p className="muted">{hasSamples?'Sample components and jobs are loaded. Remove them to keep only your own records.':'Twelve sample components and four production jobs, so every page and tour has something to show.'}</p>
    {hasSamples?<button type="button" className="button" onClick={onRemoveSamples}><Trash2 size={16}/>Remove sample data</button>:<button type="button" className="button" onClick={onLoadSamples}><Database size={16}/>Load sample data</button>}</section>}
  </div>
 </dialog>;
}

// A tour step points at a real control: the page is opened, the control is found, scrolled into view
// and lit; the rest of the page is dimmed but stays usable. The card sits beside the control when it
// fits, else docks at the bottom. Esc closes, the arrow keys move.
const PAD=6,GAP=12,EDGE=16;
const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}};
function findTarget(sels){for(const s of sels||[]){const el=document.querySelector(s);if(el&&el.getClientRects().length)return el}return null}
function place(rect,card,vw,vh){
 const w=card.w,h=card.h;if(vw<640||!rect)return {dock:true};
 const fits=(x,y)=>x>=EDGE&&y>=EDGE&&x+w<=vw-EDGE&&y+h<=vh-EDGE;
 const clampX=x=>Math.min(Math.max(EDGE,x),vw-w-EDGE),clampY=y=>Math.min(Math.max(EDGE,y),vh-h-EDGE);
 const tries=[[clampX(rect.left),rect.bottom+GAP],[clampX(rect.left),rect.top-GAP-h],[rect.right+GAP,clampY(rect.top)],[rect.left-GAP-w,clampY(rect.top)]];
 for(const [x,y] of tries)if(fits(x,y))return {x,y};
 return {dock:true};
}
export function Tour({tourId,step,page,onStep,onClose,onGo}){
 const tour=tourById(tourId),s=tour?.steps[step],last=tour&&step===tour.steps.length-1;
 const [rect,setRect]=useState(null),[found,setFound]=useState(false),[pos,setPos]=useState({dock:true});
 const cardRef=useRef(null),titleRef=useRef(null),target=useRef(null);
 // Open the step's page, then wait for its control (pages and 3D views load on demand).
 useEffect(()=>{if(!s)return;target.current=null;setFound(false);setRect(null);
  if(s.page!==null&&s.page!==undefined&&s.page!==page)onGo(s.page);
  let tries=0,timer=0,live=true;
  const look=()=>{if(!live)return;const el=findTarget(s.target);
   if(el){target.current=el;setFound(true);const big=el.getBoundingClientRect().height>innerHeight*.6;el.scrollIntoView({block:big?'start':'center',inline:'nearest',behavior:reduced()?'auto':'smooth'});return}
   if(++tries<40)timer=setTimeout(look,100);else setFound(false)};
  timer=setTimeout(look,s.page&&s.page!==page?120:0);
  return()=>{live=false;clearTimeout(timer)}},[tourId,step]);// eslint-disable-line react-hooks/exhaustive-deps
 // Follow the control while the page scrolls, resizes or settles.
 useEffect(()=>{if(!found)return;let raf=0,prev='';
  const tick=()=>{const el=target.current;if(el&&el.isConnected){const r=el.getBoundingClientRect(),k=[r.left,r.top,r.width,r.height].map(Math.round).join();if(k!==prev){prev=k;setRect({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height})}}
   else{const el2=findTarget(s?.target);if(el2)target.current=el2}
   raf=requestAnimationFrame(tick)};
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[found,s]);
 useLayoutEffect(()=>{const c=cardRef.current;if(!c)return;const b=c.getBoundingClientRect();setPos(place(found?rect:null,{w:b.width,h:b.height},innerWidth,innerHeight))},[rect,found,step]);
 useEffect(()=>{titleRef.current?.focus({preventScroll:true})},[tourId,step]);
 useEffect(()=>{const k=e=>{const t=e.target,typing=t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
   if(e.key==='Escape'){if(document.querySelector('dialog[open]'))return;e.preventDefault();onClose('closed')}
   else if(!typing&&e.key==='ArrowRight'){e.preventDefault();last?onClose('done'):onStep(step+1)}
   else if(!typing&&e.key==='ArrowLeft'&&step>0){e.preventDefault();onStep(step-1)}};
  addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[step,last]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!tour||!s)return null;
 const line=tour.line||(s.page&&pageInfo(s.page)?.line)||undefined;
 const spot=found&&rect?{left:Math.max(4,rect.left-PAD),top:Math.max(4,rect.top-PAD),width:Math.min(innerWidth-8,rect.width+PAD*2),height:Math.min(innerHeight-8,rect.height+PAD*2)}:null;
 return <div className="tour" data-line={line}>
  {spot?<div className="tour-spot" style={spot} aria-hidden="true"/>:<div className="tour-dim" aria-hidden="true"/>}
  <div ref={cardRef} className={'tour-card'+(pos.dock?' docked':'')} style={pos.dock?undefined:{left:pos.x,top:pos.y}} role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-body">
   <div className="tour-meta"><span>{tour.title} tour</span><span aria-live="polite">Step {step+1} of {tour.steps.length}</span></div>
   <ol className="tour-dots" aria-hidden="true">{tour.steps.map((_,i)=><li key={i} className={i<step?'past':i===step?'now':''}/>)}</ol>
   <h2 id="tour-title" ref={titleRef} tabIndex={-1}>{s.title}</h2>
   <p id="tour-body">{s.body}</p>
   <div className="tour-actions">
    <button type="button" className="text-button" onClick={()=>onClose('closed')}>Skip tour</button>
    <span>{step>0&&<button type="button" className="button small" onClick={()=>onStep(step-1)}><ChevronLeft size={14}/>Back</button>}
     <button type="button" className="button small primary" onClick={()=>last?onClose('done'):onStep(step+1)}>{last?<><Check size={14}/>Done</>:<>Next<ChevronRight size={14}/></>}</button></span>
   </div>
  </div>
 </div>;
}
