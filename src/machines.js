// Machine details on the factory floor: maker, model, serial, year built, the model's launch year,
// footprint (L × W × H mm), weight, power, speed and notes. A standalone machine keeps them in
// m.details; an SMT line keeps one set per station in m.equipment ({Printer: {...}, Reflow: {...}}).
// They are typed in Factory setup, fetched online (/api/machineinfo, maker + model) or loaded from a
// machine list (Excel or CSV), and shown on the Production page and in the 3D line.
// Pure functions, no DOM, so they run in Node tests too.
import {MACHINE_KINDS,LINE_STATIONS,stationsOf,addLine,addMachine} from './production.js';

// [key, label, kind]: kind 'text' (max length), 'year' or a number with its unit.
export const DETAIL_FIELDS=[
 ['maker','Maker','text',60],['model','Model','text',80],['serial','Serial number','text',60],
 ['year','Year built','year'],['introduced','Model introduced','year'],
 ['length','Length','num','mm'],['width','Width','num','mm'],['height','Height','num','mm'],
 ['weight','Weight','num','kg'],['power','Power','text',60],['speed','Speed / capacity','text',80],['notes','Notes','text',300]];
const LIMITS={length:[50,60000],width:[50,20000],height:[50,10000],weight:[1,100000]};
const thisYear=()=>new Date().getFullYear();
const text=(v,max)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,max);
// "1,250" / "1.250,5" / "1250 mm" → 1250; empty or out of range → null.
export function numberOf(v){if(typeof v==='number')return Number.isFinite(v)?v:null;const s=String(v??'').trim();if(!s)return null;
 const m=s.replace(/\s/g,'').match(/-?\d[\d.,]*/);if(!m)return null;let t=m[0];
 if(/,\d{3}(?!\d)/.test(t)&&!/\.\d+,/.test(t))t=t.replace(/,/g,'');else if(/\.\d{3},/.test(t))t=t.replace(/\./g,'').replace(',','.');else t=t.replace(',','.');
 const n=parseFloat(t);return Number.isFinite(n)?n:null}
export function cleanDetails(d){
 if(!d||typeof d!=='object')return null;const out={};
 for(const [k,,kind,max] of DETAIL_FIELDS){const v=d[k];
  if(kind==='text'){const t=text(v,max);if(t)out[k]=t}
  else if(kind==='year'){const n=Math.round(numberOf(v));if(n>=1950&&n<=thisYear()+1)out[k]=n}
  else{const n=numberOf(v),[lo,hi]=LIMITS[k];if(n!=null&&n>=lo&&n<=hi)out[k]=Math.round(n*10)/10}}
 if(d.source&&typeof d.source==='object'){const s={kind:['web','file','manual'].includes(d.source.kind)?d.source.kind:'manual',at:text(d.source.at,40)};
  const urls=(Array.isArray(d.source.urls)?d.source.urls:[]).filter(u=>/^https:\/\//.test(String(u))).slice(0,5).map(u=>String(u).slice(0,300));if(urls.length)s.urls=urls;if(Object.keys(out).length)out.source=s}
 return Object.keys(out).filter(k=>k!=='source').length?out:null;
}
export const detailsOf=(m,station=null)=>(station?m?.equipment?.[station]:m?.details)||null;
// Sets (or, with empty details, clears) one machine's or one station's details.
export function setDetails(state,id,station,details){
 const d=cleanDetails(details);
 return {...state,machines:state.machines.map(m=>{if(m.id!==id)return m;
  if(station){const eq={...(m.equipment||{})};if(d)eq[station]=d;else delete eq[station];return {...m,equipment:eq}}
  const next={...m};if(d)next.details=d;else delete next.details;return next})};
}
// One line for lists and the 3D line: "Yamaha YSM20R · 2019".
export function detailLine(d){if(!d)return '';return [[d.maker,d.model].filter(Boolean).join(' '),d.year].filter(Boolean).join(' · ')}
export const footprint=d=>d&&(d.length||d.width||d.height)?[d.length,d.width,d.height].map(v=>v?Math.round(v).toLocaleString('en-IN'):'?').join(' × ')+' mm':'';

// Station names as people write them → the line's own names.
const ALIAS=[[/^(pcb\s*)?(magazine\s*)?(un)?loader|^board\s*loader/i,'Loader'],[/stencil|screen\s*print|paste\s*print|^printer/i,'Printer'],[/^spi\b|solder\s*paste\s*insp/i,'SPI'],
 [/pick|place|p\s*&\s*p|pnp|mounter|chip\s*shooter|placement/i,'Pick & place'],[/reflow|oven/i,'Reflow'],[/^aoi\b|optical\s*insp/i,'AOI'],[/x-?ray|^axi\b/i,'X-ray']];
export function stationName(raw,stations=LINE_STATIONS){const t=text(raw,30);if(!t)return '';
 const own=stations.find(s=>s.toLowerCase()===t.toLowerCase());if(own)return own;
 for(const [re,name] of ALIAS)if(re.test(t))return name;return t}

// A machine list: header row + rows. Columns (any order, common names accepted): Line or Machine,
// Station, Kind, Maker, Model, Serial, Year, Introduced, Length, Width, Height (or Dimensions
// "1250 x 1440 x 1450"), Weight, Power, Speed, Notes.
const HEAD={line:/^(line|machine|machine name|line name|name|equipment)$/i,station:/^(station|process|step|position)$/i,kind:/^(kind|type|machine type|category)$/i,
 maker:/^(maker|manufacturer|brand|make|oem|mfr)$/i,model:/^(model|model no\.?|model number|series)$/i,serial:/^(serial|serial no\.?|serial number|s\/n)$/i,
 year:/^(year|year built|built|mfg year|manufacture year|year of manufacture|yom)$/i,introduced:/^(introduced|model year|launched|launch year)$/i,
 length:/^(length|l|length \(mm\)|depth along line)$/i,width:/^(width|w|width \(mm\)|depth)$/i,height:/^(height|h|height \(mm\))$/i,dimensions:/^(dimensions?|size|l\s*x\s*w\s*x\s*h|footprint)( \(mm\))?$/i,
 weight:/^(weight|mass|weight \(kg\))$/i,power:/^(power|power supply|supply|electrical)$/i,speed:/^(speed|capacity|throughput|cph|uph)$/i,notes:/^(notes?|remarks?|comments?)$/i};
export function machineRowsFromTable(table){
 const rows=(table||[]).filter(r=>Array.isArray(r)&&r.some(c=>String(c??'').trim()));if(rows.length<2)return [];
 const head=rows[0].map(c=>String(c??'').trim()),col={};for(const [k,re] of Object.entries(HEAD)){const i=head.findIndex(h=>re.test(h));if(i>=0)col[k]=i}
 if(col.line==null)throw new Error('The machine list needs a "Line" or "Machine" column naming each line or machine.');
 return rows.slice(1).map(r=>{const o={};for(const [k,i] of Object.entries(col))o[k]=r[i]==null?'':typeof r[i]==='number'?r[i]:String(r[i]).trim();
  if(o.dimensions&&!(o.length||o.width||o.height)){const n=String(o.dimensions).split(/\s*[x×*]\s*/i).map(numberOf);[o.length,o.width,o.height]=[n[0]??'',n[1]??'',n[2]??'']}
  return o}).filter(o=>text(o.line,60));
}
// Loads a machine list into the floor: rows for a line name that exists fill that line's station (a
// station the line lacks is added); other names fill a machine; unknown names become new lines (when
// the row names a station or the kind "SMT line") or new machines of the row's kind.
export function importMachineList(state,rows,{at=new Date().toISOString()}={}){
 let s=state;const counts={updated:0,created:0,skipped:0};
 for(const r of rows||[]){const name=text(r.line,60);const details={...r,source:{kind:'file',at}};
  if(!cleanDetails(details)&&!r.station){counts.skipped++;continue}
  let m=s.machines.find(x=>x.name.toLowerCase()===name.toLowerCase());
  const lineRow=!!r.station||/smt|line/i.test(String(r.kind||''))&&!MACHINE_KINDS.slice(1).some(k=>k.toLowerCase()===String(r.kind).toLowerCase());
  if(!m){if(lineRow){const st=stationName(r.station)||'';s=addLine(s,{name,stations:st?[st]:LINE_STATIONS});const nm=s.machines[s.machines.length-1];if(st)nm.stations=[st];nm.fromList=true}
   else s=addMachine(s,{name,kind:MACHINE_KINDS.find(k=>k.toLowerCase()===String(r.kind||'').toLowerCase())||'Other'});
   m=s.machines[s.machines.length-1];counts.created++}
  else counts.updated++;
  if(m.kind==='SMT line'){const st=stationName(r.station,stationsOf(m));if(!st){counts.skipped++;continue}
   if(!stationsOf(m).includes(st))s={...s,machines:s.machines.map(x=>x.id===m.id?{...x,stations:[...stationsOf(x),st].slice(0,16)}:x)};
   s=setDetails(s,m.id,st,{...detailsOf(s.machines.find(x=>x.id===m.id),st),...strip(details)})}
  else s=setDetails(s,m.id,null,{...detailsOf(m),...strip(details)})}
 s={...s,machines:s.machines.map(({fromList,...m})=>m)};
 return {state:s,...counts};
}
// Blank cells in a list never wipe what is already known.
const strip=o=>Object.fromEntries(Object.entries(o).filter(([,v])=>v!==''&&v!=null));

export function machineListTemplate(){
 return ['Line,Station,Kind,Maker,Model,Serial,Year,Length,Width,Height,Weight,Power,Speed,Notes',
  'SMT line 1,Printer,SMT line,DEK,Horizon 03iX,,2016,1350,1240,1550,1100,3 kVA,,',
  'SMT line 1,Pick & place,SMT line,Yamaha,YSM20R,,2019,1280,1690,1450,1950,,95000 CPH,',
  'SMT line 1,Reflow,SMT line,Heller,1913 MK5,,2018,5000,1370,1600,2200,,,13 zones',
  'Wave solder 1,,Wave solder,ERSA,POWERFLOW e N2,,2015,4800,1600,1700,1800,,,'].join('\n')+'\n';
}
