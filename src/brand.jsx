import React from 'react';
import {Layers,Factory,CircuitBoard,Workflow,Cpu,BookOpen,Calculator,Bookmark,BookMarked,Package,Wallet,Store,ClipboardList,Truck} from 'lucide-react';

// The brand of Industriverse PCBA: the reel glyph of Supply, the Route mark, the Route chip and the
// three lines with their pages. The mark is three joined squares: Engineering, Supply, Production.

// Supply's glyph: a component reel, drawn on the same 24 px grid and 2 px stroke as lucide.
export function ReelIcon({size=24,strokeWidth=2,className='',...rest}){
 return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={('lucide reel-icon '+className).trim()} aria-hidden="true" focusable="false" {...rest}>
  <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>
  <circle cx="12" cy="6.5" r="1.25"/><circle cx="16.76" cy="14.75" r="1.25"/><circle cx="7.24" cy="14.75" r="1.25"/>
 </svg>;
}

// The product mark: three 6 px squares joined by a 1.5 px line, in the current colour.
export function RouteMark({size=28,className='brand-mark'}){
 return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 28 28" className={className} aria-hidden="true" focusable="false">
  <path d="M2 14h24" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="2" y="11" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="20" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
 </svg>;
}

export const SITE='Industriverse PCBA';
export const HOME='Home';
// Each page is [leaf id, label, icon]. The leaf id is what navigate() and the child components use;
// the label is what people read (Jobs is the leaf 'Production'). Engineering is the board work; the
// factory floor (the 3D SMT line and the machines) belongs to Production.
export const LINES=[
 {id:'engineering',label:'Engineering',icon:Layers,ink:'#0B6569',pages:[['Board studio','Board studio',CircuitBoard],['Board types','Board types',BookOpen]]},
 {id:'supply',label:'Supply',icon:ReelIcon,ink:'#8C2760',pages:[['BOM tool','BOM tool',Calculator],['Saved lists','Saved lists',Bookmark],['Part master','Part master',BookMarked],['Inventory','Inventory',Package],['Purchases','Purchases',Wallet],['Vendors','Vendors',Store]]},
 {id:'production',label:'Production',icon:Factory,ink:'#1F4FA8',pages:[['Production','Jobs',ClipboardList],['SMT line','SMT line',Workflow],['Machines','Machines',Cpu],['Dispatch','Dispatch',Truck]]},
];
export const LINE_INK=Object.fromEntries(LINES.map(l=>[l.id,l.ink]));
export const HUB_INK={light:'#131B23',dark:'#1B242D'};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const PAGES=LINES.flatMap(l=>l.pages.map(([leaf,label,icon])=>({leaf,label,icon,line:l.id,slug:slug(label)})));
export const LINE_OF=Object.fromEntries(PAGES.map(p=>[p.leaf,p.line]));
export const lineById=id=>LINES.find(l=>l.id===id)||null;
export const pageInfo=leaf=>PAGES.find(p=>p.leaf===leaf)||null;
// Old links and bookmarks (#Overview, #Board%20studio, #Alerts …) keep working.
export const LEGACY={Overview:HOME,Home:HOME,Help:HOME,Alerts:'Inventory',Sourcing:'Board studio','Component directory':'Part master',Jobs:'Production','3D line':'SMT line'};
export const resolveLeaf=p=>{const x=LEGACY[p]||p;return LINE_OF[x]?x:HOME};
// '#/' is Home, '#/<line>/<page>' a page (a page that moved line is still found by its name), '#/<line>' the line's last-used page; anything else is an old page name.
export function pageFromHash(raw,last={}){
 let h='';try{h=decodeURIComponent(String(raw||'').replace(/^#/,''))}catch{h=''}
 if(!h||h==='/')return HOME;
 if(h[0]==='/'){const [,l,s]=h.split('/');const ln=lineById(l);if(!ln)return HOME;
  const p=s&&(PAGES.find(q=>q.line===l&&q.slug===s)||PAGES.find(q=>q.slug===s));return p?p.leaf:(LINE_OF[last[l]]===l?last[l]:ln.pages[0][0])}
 return resolveLeaf(h);
}
export const hashOf=leaf=>{const p=pageInfo(leaf);return p?`#/${p.line}/${p.slug}`:'#/'};

// A state lamp: the word with its shape, never colour alone.
const SHAPES={
 run:<path d="M4 2.5 12 7l-8 4.5z" fill="currentColor"/>,
 hold:<><rect x="3.5" y="2.5" width="2.5" height="9" fill="currentColor"/><rect x="8" y="2.5" width="2.5" height="9" fill="currentColor"/></>,
 stop:<rect x="3" y="3" width="8" height="8" fill="currentColor"/>,
 queued:<circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>,
 done:<path d="m3 7.2 2.6 2.6L11 4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
};
const LAMP_KIND={Running:'run',Hold:'hold',Rework:'hold',Stopped:'stop',Short:'stop',Queued:'queued',Done:'done'};
export function Lamp({state}){const k=LAMP_KIND[state]||'queued';
 return <span className={'lamp '+k}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">{SHAPES[k]}</svg>{state}</span>}

// The Route chip: three nodes in fixed order, solid where the record exists in that line. A solid node
// names its record on hover and opens it. records: {engineering:{name,kind}, supply:{…}, production:{…}}.
const NOUN={engineering:'board',supply:'list',production:'job'};
export function Route({records={},current=null,onOpen}){
 const said=LINES.map(l=>{const r=records[l.id];return r?`${NOUN[l.id]} ${r.name} in ${l.label}`:`no ${NOUN[l.id]} yet`}).join(', ');
 return <span className="route" role="group" aria-label={'Route: '+said}>
  {LINES.map((l,i)=>{const r=records[l.id],cls='route-node'+(r?' filled':'')+(current===l.id?' current':'');
   return <React.Fragment key={l.id}>{i>0&&<i className="route-link" aria-hidden="true"/>}
    {r&&onOpen&&current!==l.id?<button type="button" className={cls} data-line={l.id} title={`${l.label}: ${r.name}`} aria-label={`Open ${NOUN[l.id]} ${r.name} in ${l.label}`} onClick={()=>onOpen(l.id)}/>
     :<span className={cls} data-line={l.id} title={r?`${l.label}: ${r.name}`:`${l.label}: no ${NOUN[l.id]} yet`} aria-hidden="true"/>}
   </React.Fragment>})}
 </span>;
}
