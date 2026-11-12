// Saved BOM lists: a snapshot of the whole BOM tool (bare PCB, components, analysis, shipping and
// pricing) that can be reopened later exactly as it was. Kept in this browser, newest first.
export const LISTS_STORE='semicobot-saved-lists-v1';
export const BOM_STORE='semicobot-bom-tool-v1';
export const LIST_STATUSES=['draft','quoted','ordered','archived'];
const MAX_LISTS=40;

// Migration: the product no longer prices a housing for the board. BOM states saved by older versions may
// still carry the fields 'box', 'mould' and 'enclosure'; they are dropped wherever a state is read.
const REMOVED_STATE_FIELDS=['box','mould','enclosure'];
export function stripRemovedFields(state){
 if(!state||typeof state!=='object')return state;
 if(!REMOVED_STATE_FIELDS.some(k=>k in state))return state;
 const out={...state};for(const k of REMOVED_STATE_FIELDS)delete out[k];return out;
}
// A saved-list entry from an older version: no summary field for the housing, no housing in the state. When the
// old housing was priced, the stored total included it and no longer matches the list, so it reads as not priced
// until the list is saved again.
export function migrateList(entry){
 if(!entry||typeof entry!=='object')return entry;
 const old=entry.state&&typeof entry.state==='object'&&REMOVED_STATE_FIELDS.some(k=>k in entry.state);
 if(!old&&!('enclosure' in entry))return entry;
 const box=entry.state?.box||{},mould=entry.state?.mould||{},has=v=>v!=null&&v!==''&&!(typeof v==='object'&&(v.v==null||v.v===''));
 const priced=!!box.material&&(box.kind==='custom'?has(mould.unit)||has(mould.tooling):has(box.unit)||has(box.tooling));
 const {enclosure:_drop,...rest}=entry;
 return {...rest,state:stripRemovedFields(entry.state),...(priced?{total:null}:{})};
}
export function loadLists(){try{const v=JSON.parse(localStorage.getItem(LISTS_STORE));if(!Array.isArray(v))return [];
 const lists=v.filter(x=>x&&x.id&&x.state),out=lists.map(migrateList);
 if(out.some((l,i)=>l!==lists[i]))store(out);
 return out}catch{return []}}
function store(lists){try{localStorage.setItem(LISTS_STORE,JSON.stringify(lists.slice(0,MAX_LISTS)));return true}catch{return false}}

// The figures shown in the list without opening it.
export function listSummary(state,totals={}){
 return {name:String(state.project||state.from||'Untitled BOM').slice(0,80),customer:String(state.customer||'').slice(0,80),boards:state.boards||0,lines:(state.rows||[]).length,
  pcb:!!state.pcb?.material&&!totals.pcbUnpriced,total:Number.isFinite(totals.customerTotal)?totals.customerTotal:null};
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
  if(o.qty!==r.qty)what.push(`qty ${o.qty} to ${r.qty}`);if(o.dnp!==r.dnp)what.push(r.dnp?'now DNP':'now fitted');
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
 const snapshot={...stripRemovedFields(state),listId:id,demo:undefined};
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
// Put a saved list into the BOM tool; it loads it the next time it opens. When that list is already the
// open one, the open state (with any edits not saved yet) is kept as it is.
export function openList(id){const l=loadLists().find(x=>x.id===id);if(!l)return false;
 if(readJSON(BOM_STORE)?.listId===id)return true;
 try{localStorage.setItem(BOM_STORE,JSON.stringify({...l.state,listId:l.id,followed:l.state?.fromBoard||null}));return true}catch{return false}}
// The board a saved list was made from (its id), when it was made from a board.
export const listBoard=id=>loadLists().find(x=>x.id===id)?.state?.fromBoard||null;
// The newest saved list made from a board.
export const listForBoard=boardId=>boardId?loadLists().find(x=>x.state?.fromBoard===boardId)||null:null;

// One open BOM per board. The board selected in Engineering is the board everywhere: when another board is
// selected, the BOM tool puts the work it holds aside under its board (a draft) and shows the new board's
// draft, else its newest saved list, else a new BOM from the board. Nothing typed is lost by switching.
export const BOM_DRAFTS='semicobot-bom-drafts-v1';
const MAX_DRAFTS=12;
const hasWork=st=>!!st&&((st.rows||[]).length>0||!!st.project);
export function loadDrafts(){const v=readJSON(BOM_DRAFTS);return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
export function stashDraft(boardId,state,now=new Date().toISOString()){
 if(!boardId||!hasWork(state))return false;
 const d={...loadDrafts(),[boardId]:{...stripRemovedFields(state),demo:undefined,stashedAt:now}};
 const keep=Object.entries(d).sort((a,b)=>String(b[1].stashedAt).localeCompare(String(a[1].stashedAt))).slice(0,MAX_DRAFTS);
 try{localStorage.setItem(BOM_DRAFTS,JSON.stringify(Object.fromEntries(keep)));return true}catch{return false}}
export function takeDraft(boardId){const d=loadDrafts(),v=d[boardId];if(!v)return null;delete d[boardId];
 try{localStorage.setItem(BOM_DRAFTS,JSON.stringify(d))}catch{}const {stashedAt:_s,...st}=v;return st}
// What the BOM tool shows for a board: its draft, else its newest saved list, else null (start from the board).
export function bomForBoard(boardId){const d=takeDraft(boardId);if(d)return {state:d,from:'draft'};
 const l=listForBoard(boardId);return l?{state:{...l.state,listId:l.id},from:'list',list:l}:null}
// Give a saved list its production job without writing a new revision (the content did not change).
export function setListJob(id,jobId){const next=loadLists().map(l=>l.id===id?{...l,jobId,status:'ordered'}:l);store(next);return next.find(l=>l.id===id)||null}

const readJSON=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
// The removed BOM demo tour parked the user's own BOM under this key while the demo ran.
const BOM_BACKUP='semicobot-bom-backup-v1';
// The BOM tool's open state as the rest of the app should see it: a demo left behind by the old tour gives
// way to the user's own BOM (the same rule the BOM tool applies when it loads), and housing fields are gone.
export function settleOpenBom(){const v=readJSON(BOM_STORE);
 if(v?.demo){const own=localStorage.getItem(BOM_BACKUP);try{localStorage.removeItem(BOM_BACKUP);if(own)localStorage.setItem(BOM_STORE,own);else localStorage.removeItem(BOM_STORE)}catch{}return own?stripRemovedFields(readJSON(BOM_STORE)):null}
 return v&&typeof v==='object'?stripRemovedFields(v):null}
// Work in the BOM tool that is not in a saved list yet: lines with no list, or a list changed since it was
// saved. Returns its name, or null when nothing would be lost by replacing the open BOM.
const stable=v=>JSON.stringify(v,(k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(n=>[n,x[n]])):x);
const comparable=st=>{const {listId:_l,demo:_d,...rest}=stripRemovedFields(st)||{};return stable(rest)};
export function unsavedBom(){const v=settleOpenBom();if(!v||!((v.rows||[]).length||v.project))return null;
 const l=v.listId&&loadLists().find(x=>x.id===v.listId);const name=v.project||v.from||'Untitled BOM';
 if(!l)return (v.rows||[]).length?name:null;
 return comparable(l.state)===comparable(v)?null:name}
// Start a new BOM for one board (Home, "Start a BOM"): the BOM tool puts its current work aside as that board's
// draft and fills a new BOM from the board.
export const BOM_START='semicobot-bom-start-v1';
export function startBomFor(boardId){try{localStorage.setItem(BOM_START,String(boardId));return true}catch{return false}}
