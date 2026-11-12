// Saved BOM lists: a snapshot of the whole BOM tool (PCB, components, enclosure, mould, shipping and
// pricing) that can be reopened later exactly as it was. Kept in this browser, newest first.
export const LISTS_STORE='semicobot-saved-lists-v1';
export const BOM_STORE='semicobot-bom-tool-v1';
export const LIST_STATUSES=['draft','quoted','ordered','archived'];
const MAX_LISTS=40;

export function loadLists(){try{const v=JSON.parse(localStorage.getItem(LISTS_STORE));return Array.isArray(v)?v.filter(x=>x&&x.id&&x.state):[]}catch{return []}}
function store(lists){try{localStorage.setItem(LISTS_STORE,JSON.stringify(lists.slice(0,MAX_LISTS)));return true}catch{return false}}

// The figures shown in the list without opening it.
export function listSummary(state,totals={}){
 return {name:String(state.project||state.from||'Untitled BOM').slice(0,80),customer:String(state.customer||'').slice(0,80),boards:state.boards||0,lines:(state.rows||[]).length,
  pcb:!!state.pcb?.material,enclosure:state.box?.material?(state.box.kind==='custom'?'custom moulded':'off the shelf'):'',total:Number.isFinite(totals.customerTotal)?totals.customerTotal:null};
}

// Revisions: Rev A, B … Z, AA. Each save of a list is a new revision; the earlier ones keep their lines
// (part number, quantity, DNP, references) and totals so two revisions can be compared.
export const revLetter=n=>{let k=Math.max(1,Math.round(n||1)),s='';while(k>0){k--;s=String.fromCharCode(65+k%26)+s;k=Math.floor(k/26)}return s};
const MAX_REVS=12;
const revOf=entry=>({revision:entry.revision,savedAt:entry.savedAt,boards:entry.boards,total:entry.total,status:entry.status,
 rows:(entry.state?.rows||[]).map(r=>({mpn:String(r.mpn||''),qty:Number(r.qty)||0,dnp:!!r.dnp,refs:(r.refs||[]).slice(0,200)}))});
// What changed from one revision to another, line by line (by part number).
export function compareRevisions(a,b){
 const key=r=>String(r.mpn||'').trim().toUpperCase(),am=new Map((a?.rows||[]).map(r=>[key(r),r])),bm=new Map((b?.rows||[]).map(r=>[key(r),r]));
 const added=[],removed=[],changed=[];
 for(const [k,r] of bm){const o=am.get(k);if(!o){added.push(r);continue}const what=[];
  if(o.qty!==r.qty)what.push(`qty ${o.qty} → ${r.qty}`);if(o.dnp!==r.dnp)what.push(r.dnp?'now DNP':'now fitted');
  const or=new Set(o.refs),nr=new Set(r.refs),plus=r.refs.filter(x=>!or.has(x)),minus=o.refs.filter(x=>!nr.has(x));
  if(plus.length)what.push('+'+plus.join(' '));if(minus.length)what.push('−'+minus.join(' '));if(what.length)changed.push({mpn:r.mpn,what})}
 for(const [k,r] of am)if(!bm.has(k))removed.push(r);
 return {added,removed,changed,boards:a?.boards!==b?.boards?[a?.boards,b?.boards]:null,total:a?.total!==b?.total?[a?.total,b?.total]:null,same:!added.length&&!removed.length&&!changed.length};
}
// All revisions of a list, oldest first, the current one last.
export const revisionsOf=l=>l?[...(l.history||[]),revOf(l)]:[];

// Save (or update, when the state carries the id of a saved list) and return {lists, entry} or null when storage is full.
export function saveList(state,totals,{status='quoted',jobId=null,now=new Date().toISOString()}={}){
 const lists=loadLists();const id=state.listId&&lists.some(l=>l.id===state.listId)?state.listId:'list-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 const old=lists.find(l=>l.id===id);
 const snapshot={...state,listId:id,demo:undefined};
 const entry={id,...listSummary(snapshot,totals),status,jobId:jobId||old?.jobId||null,createdAt:old?.createdAt||now,savedAt:now,revision:(old?.revision||0)+1,state:snapshot,
  history:old?[...(old.history||[]),revOf(old)].slice(-MAX_REVS):[]};
 const next=[entry,...lists.filter(l=>l.id!==id)];
 return store(next)?{lists:next,entry}:null;
}
export function removeList(id){const next=loadLists().filter(l=>l.id!==id);store(next);return next}
export function setListStatus(id,status){const next=loadLists().map(l=>l.id===id?{...l,status}:l);store(next);return next}
// A copy for a new quantity or customer: same content, new id, back to draft.
export function duplicateList(id,now=new Date().toISOString()){
 const lists=loadLists(),src=lists.find(l=>l.id===id);if(!src)return lists;
 const nid='list-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 const copy={...src,id:nid,name:(src.name+' (copy)').slice(0,80),status:'draft',jobId:null,createdAt:now,savedAt:now,revision:1,history:[],state:{...src.state,listId:nid,project:(src.state.project||src.name)+' (copy)'}};
 const next=[copy,...lists];store(next);return next;
}
// Put a saved list into the BOM tool; it loads it the next time it opens.
export function openList(id){const l=loadLists().find(x=>x.id===id);if(!l)return false;try{localStorage.setItem(BOM_STORE,JSON.stringify({...l.state,listId:l.id}));return true}catch{return false}}
