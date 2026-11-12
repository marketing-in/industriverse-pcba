// BOM tool → Analysis: what a board needs on the floor, from its own pads (Gerber / KiCad copper).
// - Solder paste per board and per job, from the stencil apertures semi-cobot's printer model plans
//   (aperture area × stencil thickness × transfer efficiency × paste density), per side, with high
//   volume (step-up stencil, overprint), less volume (windowpane on exposed pads) and double volume
//   (pin-in-paste for through-hole pins); thermal paste and conductive adhesive per board.
// - Pin count: per part and per BOM line, top and bottom, SMD and through-hole, solder joints.
// - DNP (do not populate) parts are left out of paste, pins, placements and buying.
// - Consumables per board and per job with their cost, optionally added to the quotation.
// Pure functions, no DOM; amounts in USD like the rest of the BOM tool.
import {boardPads,planPrinter} from './factoryLine.js';
import {partPads} from './blueprint.js';

export const PASTE_DENSITY=4.36;      // mg per mm³: SAC305, 88.5 % metal by weight (alloy 7.38, flux ~1.05 g/cm³)
export const THERMAL_DENSITY=2.5;     // mg per mm³, silicone thermal grease
export const ADHESIVE_DENSITY=3.3;    // mg per mm³, silver-filled epoxy
export const ANALYSIS_DEFAULTS={lossPct:20,jarG:500,jarUsd:60,stepUpOn:false,stepUpUm:150,stepUpTypes:['connector','inductor'],overprintPct:0,windowpaneOn:true,windowpanePct:65,
 pip:{on:false,holeMm:1.0,pinMm:0.64,boardMm:1.6,filletMm3:0.3},thermal:[],thermalUsdPerG:0.5,adhesive:{dots:0,dotMm3:0.05,usdPerG:2},
 coating:{on:false,keepouts:null,filmUm:50},consumables:{},inQuote:false};
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const pos=(v,d=0)=>Math.max(0,num(v,d));
export const analysisOptions=o=>({...ANALYSIS_DEFAULTS,...(o||{}),pip:{...ANALYSIS_DEFAULTS.pip,...(o?.pip||{})},adhesive:{...ANALYSIS_DEFAULTS.adhesive,...(o?.adhesive||{})},coating:{...ANALYSIS_DEFAULTS.coating,...(o?.coating||{})},consumables:{...(o?.consumables||{})},thermal:Array.isArray(o?.thermal)?o.thermal:[]});
const sideOf=p=>p.side==='bottom'?'bottom':'top';
const fitted=(parts,dnp)=>(parts||[]).filter(p=>!p.suggested&&!dnp.has(String(p.ref).toUpperCase()));

// DNP designators: lines marked DNP in the BOM, and parts the board files mark DNP.
export function dnpRefs(rows,parts){
 const out=new Set();for(const r of rows||[])if(r.dnp)for(const ref of r.refs||[])out.add(String(ref).toUpperCase());
 for(const p of parts||[])if(p.dnp)out.add(String(p.ref).toUpperCase());return out;
}
// The exposed (thermal) pad of a bottom-terminated part: its biggest pad, at least 2 mm² and three
// times the part's typical pad.
function exposedPads(parts){
 const out=new Set();
 for(const p of parts){if(!/QFN|DFN|\bSON\b|LGA|MLF|PowerPAD|DPAK|TO-?252|TO-?263|D2PAK|SOT-?223|LFCSP/i.test(String(p.package||'')+' '+String(p.mpn||'')))continue;
  const pads=(partPads(p)||[]).map((q,i)=>({i,a:q.w*q.h,hole:q.hole>0})).filter(q=>!q.hole);if(pads.length<3)continue;
  const big=pads.reduce((m,q)=>q.a>m.a?q:m),rest=pads.filter(q=>q!==big).map(q=>q.a).sort((a,b)=>a-b),typical=rest[rest.length>>1]||0;
  if(big.a>=2&&big.a>=3*typical)out.add(p.ref+'#'+big.i)}
 return out;
}

export function pasteAnalysis(parts,options,{boards=1,dnp=new Set()}={}){
 const o=analysisOptions(options),list=fitted(parts,dnp),byRef=new Map(list.map(p=>[p.ref,p])),exposed=exposedPads(list);
 const sides=[];
 for(const side of ['top','bottom']){const onSide=list.filter(p=>sideOf(p)===side),pads=boardPads(onSide);if(!pads.length)continue;
  const pr=planPrinter(pads);const stepT=Math.max(pr.stencil,pos(o.stepUpUm,150)/1000);let area=0,vol=0,stepUp=0,windows=0;
  for(const a of pr.apertures){const p=byRef.get(a.ref),raw=a.w*a.h;let open=raw,t=pr.stencil;
   if(exposed.has(a.ref+'#'+a.i)&&o.windowpaneOn){open=raw*Math.min(1,pos(o.windowpanePct,65)/100);windows++}
   else open=raw*(1+pos(o.overprintPct)/100);
   if(o.stepUpOn&&p&&o.stepUpTypes.includes(p.type)){t=stepT;stepUp++}
   area+=raw;vol+=open*t*Math.min(1,a.te)}
  sides.push({side,stencilMm:pr.stencil,stepUpMm:stepUp?stepT:null,apertures:pr.apertures.length,lowAr:pr.lowAr.length,areaMm2:area,volumeMm3:vol,grams:vol*PASTE_DENSITY/1000,stepUp,windows})}
 // Through-hole pins by pin-in-paste: the paste fills the hole around the pin plus the fillets and
 // shrinks to about half when it melts (≈ 52 % metal by volume), so it takes twice the solder volume.
 const tht=list.reduce((n,p)=>n+(partPads(p)||[]).filter(q=>q.hole>0).length,0);
 const pp=o.pip,pinMm3=Math.max(0,2*((Math.PI*pos(pp.holeMm)**2/4-pos(pp.pinMm)**2)*pos(pp.boardMm)+pos(pp.filletMm3)));
 const pipMm3=pp.on?tht*pinMm3:0,pipGrams=pipMm3*PASTE_DENSITY/1000;
 const smdGrams=sides.reduce((s,x)=>s+x.grams,0),perBoard=smdGrams+pipGrams,loss=pos(o.lossPct)/100,n=Math.max(0,Math.round(num(boards,1)));
 const perJob=perBoard*n*(1+loss),jarG=Math.max(1,pos(o.jarG,500));
 const thermalMm3=o.thermal.reduce((s,t)=>s+pos(t.w)*pos(t.h)*pos(t.bondMm)*Math.max(0,Math.round(pos(t.count,1))),0);
 const adhesiveMm3=Math.max(0,Math.round(pos(o.adhesive.dots)))*pos(o.adhesive.dotMm3);
 return {sides,smdGrams,tht,pinMm3,pipMm3,pipGrams,perBoard,perJob,lossPct:pos(o.lossPct),jarG,jars:perJob>0?Math.ceil(perJob/jarG):0,pasteUsd:perJob*pos(o.jarUsd)/jarG,
  thermalMm3,thermalGrams:thermalMm3*THERMAL_DENSITY/1000,adhesiveMm3,adhesiveGrams:adhesiveMm3*ADHESIVE_DENSITY/1000,boards:n};
}

// Pins per part and per BOM line; totals by side and by soldering method. Joints = pins of fitted parts.
export function pinAnalysis(parts,rows=[],{dnp=new Set()}={}){
 const all=(parts||[]).filter(p=>!p.suggested);
 const per=all.map(p=>{const pads=partPads(p)||[],thtPins=pads.filter(q=>q.hole>0).length;return {ref:p.ref,mpn:p.mpn||p.inv?.mpn||'',package:p.package||'',side:sideOf(p),pins:pads.length,thtPins,smdPins:pads.length-thtPins,dnp:dnp.has(String(p.ref).toUpperCase())}});
 const fit=per.filter(x=>!x.dnp),sum=(l,k)=>l.reduce((s,x)=>s+x[k],0);
 const byRef=new Map(per.map(x=>[String(x.ref).toUpperCase(),x]));
 const lines=(rows||[]).map(r=>{const refs=(r.refs||[]).map(x=>byRef.get(String(x).toUpperCase())).filter(Boolean);return {id:r.id,mpn:r.mpn,dnp:!!r.dnp,parts:refs.length,pinsEach:refs.length?Math.round(sum(refs,'pins')/refs.length):null,pins:sum(refs,'pins')}});
 return {parts:per,lines,total:per.length,fitted:fit.length,dnp:per.length-fit.length,top:fit.filter(x=>x.side==='top').length,bottom:fit.filter(x=>x.side==='bottom').length,
  pins:sum(fit,'pins'),pinsTop:sum(fit.filter(x=>x.side==='top'),'pins'),pinsBottom:sum(fit.filter(x=>x.side==='bottom'),'pins'),smdPins:sum(fit,'smdPins'),thtPins:sum(fit,'thtPins'),
  joints:sum(fit,'pins'),twoSided:fit.some(x=>x.side==='bottom')&&fit.some(x=>x.side==='top'),most:[...fit].sort((a,b)=>b.pins-a.pins).slice(0,5)};
}

// Consumables per board and per job. Each has a sensible default quantity from the board and the
// analysis; the user can change any quantity and price or switch it off.
export function consumables(paste,pins,options,{board=null,boards=1}={}){
 const o=analysisOptions(options),n=Math.max(0,Math.round(num(boards,1))),sides=Math.max(1,paste.sides.length),loss=pos(o.lossPct)/100;
 const areaCm2=board?.width>0&&board?.height>0?board.width*board.height/100:0;
 const waveJoints=o.pip.on?0:pins.thtPins,coating=o.coating.on;
 const keepouts=o.coating.keepouts!=null&&o.coating.keepouts!==''?Math.round(pos(o.coating.keepouts)):pins.parts.filter(x=>!x.dnp&&/^(J|P|CN|CON|TP|SW)\d/i.test(x.ref)).length;
 const base=[
  {key:'paste',name:'Solder paste',per:'board',qty:paste.perBoard*(1+loss),unit:'g',unitUsd:pos(o.jarUsd)/Math.max(1,pos(o.jarG,500)),why:`${paste.lossPct}% losses included`},
  {key:'stencil',name:'Stencil',per:'job',qty:sides,unit:'pcs',unitUsd:80,why:'one per printed side'},
  {key:'wipe',name:'Under-stencil wipe roll',per:'board',qty:.04*sides,unit:'m',unitUsd:1.5,why:'a wipe every 5 boards'},
  {key:'ipa',name:'IPA for cleaning',per:'board',qty:2*sides,unit:'ml',unitUsd:.01,why:'stencil and board cleaning'},
  {key:'thermal',name:'Thermal paste',per:'board',qty:paste.thermalGrams,unit:'g',unitUsd:pos(o.thermalUsdPerG),why:'from the heatsink areas'},
  {key:'adhesive',name:'Conductive adhesive',per:'board',qty:paste.adhesiveGrams,unit:'g',unitUsd:pos(o.adhesive.usdPerG),why:'from the dots'},
  {key:'solderbar',name:'Solder bar (wave / selective)',per:'board',qty:waveJoints*.06,unit:'g',unitUsd:.04,why:`${waveJoints} through-hole joints`},
  {key:'flux',name:'Flux (wave / selective)',per:'board',qty:waveJoints?areaCm2*.01:0,unit:'ml',unitUsd:.02,why:'sprayed over the board'},
  {key:'mask',name:'Masking boots / tape',per:'board',qty:coating?keepouts:0,unit:'pcs',unitUsd:.05,why:`${keepouts} keep-out${keepouts===1?'':'s'} before coating`},
  {key:'coating',name:'Conformal coating',per:'board',qty:coating?areaCm2*100*pos(o.coating.filmUm,50)/1000/1000/.35:0,unit:'ml',unitUsd:.08,why:`${pos(o.coating.filmUm,50)} µm dry film, 35 % solids`},
  {key:'esd',name:'ESD bag and label',per:'board',qty:1,unit:'pcs',unitUsd:.12,why:'per board shipped'}];
 const rows=base.map(c=>{const u=o.consumables[c.key]||{};const qty=u.qty!=null&&u.qty!==''?pos(u.qty):c.qty,unitUsd=u.unitUsd!=null&&u.unitUsd!==''?pos(u.unitUsd):c.unitUsd;
  const on=u.on!=null?!!u.on:qty>0;const per=on?qty*unitUsd:0;return {...c,qty,unitUsd,on,auto:u.qty==null||u.qty==='',costUsd:per,jobUsd:on?(c.per==='job'?qty*unitUsd:qty*unitUsd*n):0}});
 const perBoardUsd=rows.filter(r=>r.on&&r.per==='board').reduce((s,r)=>s+r.costUsd,0),fixedUsd=rows.filter(r=>r.on&&r.per==='job').reduce((s,r)=>s+r.costUsd,0);
 return {rows,perBoardUsd,fixedUsd,jobUsd:perBoardUsd*n+fixedUsd,keepouts};
}

// The setup a job needs on the line: production groups jobs with the same setup to save changeovers.
export function setupOf(paste){const s=paste?.sides||[];if(!s.length)return null;const t=Math.round(s[0].stencilMm*1000);return {stencilUm:t,stepUpUm:s.some(x=>x.stepUpMm)?Math.round(Math.max(...s.map(x=>x.stepUpMm||0))*1000):null,sides:s.length,paste:'SAC305 T4',key:`${t}|${s.length}|${s.some(x=>x.stepUpMm)?'step':''}`}}
