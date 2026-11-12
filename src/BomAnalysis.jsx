import React from 'react';
import {Plus,Trash2,TriangleAlert,Droplets,Cpu,CircleSlash,ShieldCheck,Package,Layers} from 'lucide-react';

const g3=v=>(Math.round(v*1000)/1000).toLocaleString('en-IN',{maximumFractionDigits:3});
const g1=v=>(Math.round(v*10)/10).toLocaleString('en-IN',{maximumFractionDigits:1});
const int=v=>Math.round(v||0).toLocaleString('en-IN');
const TYPES=[['connector','Connectors'],['inductor','Inductors'],['module','Modules / shields'],['switch','Switches'],['chip','ICs']];

// BOM tool → Analysis: what this board needs on the floor. Everything comes from the board's own pads
// (the Gerber or KiCad files from the Bare PCB step) and the BOM lines; settings change the figures live.
export default function BomAnalysis({board,rows,an,a,setA,setDnp,boards,money,typed,shownAmt,openLine}){
 const {paste,pins,cons,dnp}=an;
 const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
 const field=(label,value,onChange,{unit,step='any',min=0}={})=><label className="an-field"><span className="an-label">{label}</span><span className="an-input"><input type="number" min={min} step={step} value={value} onChange={e=>onChange(e.target.value)}/>{unit&&<em>{unit}</em>}</span></label>;
 // Prices shown in the display currency: 2 decimals, 3 below 1 (₹0.833 per ml).
 const shown=usd=>{const v=money.value(usd);return +v.toFixed(Math.abs(v)<1?3:2)};
 const shownPrice=(x,fallbackUsd)=>{if(x==null)return shown(fallbackUsd);const v=Number(shownAmt(x));return Number.isFinite(v)?+v.toFixed(Math.abs(v)<1?3:2):''};
 const priceField=(label,key,fallbackUsd,unit)=>field(`${label} (${money.currency})`,shownPrice(a[key],fallbackUsd),v=>setA({[key]:typed(v)}),{unit});
 const setPip=p=>setA({pip:{...a.pip,...p}}),setCoat=p=>setA({coating:{...a.coating,...p}}),setAdh=p=>setA({adhesive:{...a.adhesive,...p}});
 const setCons=(k,p)=>setA({consumables:{...a.consumables,[k]:{...(a.consumables?.[k]||{}),...p}}});
 const noBoard=!board;
 return <div className="bom-analysis">
  {noBoard&&<div className="studio-note warn"><TriangleAlert size={15}/> Paste, pins and solder joints come from the board's pads. Upload the Gerber (or KiCad / pick-and-place files) in Bare PCB to fill them; DNP, thermal paste, adhesive and consumables work without it.</div>}
  <div className="an-summary" role="group" aria-label="Analysis summary">
   <div><small>Solder paste per board</small><strong>{g3(paste.perBoard)} g</strong><span>{paste.sides.map(s=>`${s.side} ${Math.round(s.stencilMm*1000)} µm`).join(' · ')||'no printed side'}</span></div>
   <div><small>Paste for {int(boards)} boards</small><strong>{g1(paste.perJob)} g</strong><span>{paste.jars} jar{paste.jars===1?'':'s'} of {int(paste.jarG)} g · {paste.lossPct}% losses</span></div>
   <div><small>Solder joints per board</small><strong>{int(pins.joints)}</strong><span>{int(pins.smdPins)} SMD · {int(pins.thtPins)} through-hole</span></div>
   <div><small>Components fitted</small><strong>{int(pins.fitted)}</strong><span>{int(pins.top)} top · {int(pins.bottom)} bottom · {int(dnp.size)} DNP</span></div>
   <div><small>Consumables per board</small><strong>{money.fmt(cons.perBoardUsd)}</strong><span>{money.fmt(cons.jobUsd)} for the job{a.inQuote?' · in the quotation':''}</span></div>
  </div>

  <section className="panel an-sec" aria-label="Solder paste">
   <div className="panel-heading"><div className="title-row"><Droplets size={17}/><h2>Solder paste</h2></div><small className="muted">aperture area × stencil thickness × transfer efficiency × 4.36 mg/mm³ (SAC305)</small></div>
   {paste.sides.length>0?<table className="saved-table an-table"><thead><tr><th>Side</th><th className="numeric">Stencil</th><th className="numeric">Apertures</th><th className="numeric">Area ratio &lt; 0.66</th><th className="numeric">Aperture area</th><th className="numeric">Paste volume</th><th className="numeric">Grams</th></tr></thead>
    <tbody>{paste.sides.map(s=><tr key={s.side}><td>{s.side==='top'?'Top':'Bottom'}</td><td className="numeric">{Math.round(s.stencilMm*1000)} µm{s.stepUpMm?` + ${s.stepUp} at ${Math.round(s.stepUpMm*1000)} µm`:''}</td><td className="numeric">{int(s.apertures)}{s.windows?` (${s.windows} windowpane)`:''}</td><td className={'numeric '+(s.lowAr?'warn-text':'')}>{int(s.lowAr)}</td><td className="numeric">{g1(s.areaMm2)} mm²</td><td className="numeric">{g1(s.volumeMm3)} mm³</td><td className="numeric"><b>{g3(s.grams)} g</b></td></tr>)}
     {paste.pipMm3>0&&<tr><td>Pin-in-paste</td><td className="numeric">—</td><td className="numeric">{int(paste.tht)} pins</td><td className="numeric">—</td><td className="numeric">—</td><td className="numeric">{g1(paste.pipMm3)} mm³</td><td className="numeric"><b>{g3(paste.pipGrams)} g</b></td></tr>}
     <tr className="an-total"><td colSpan="6">Per board</td><td className="numeric"><b>{g3(paste.perBoard)} g</b></td></tr></tbody></table>
   :<p className="muted bom-off">{noBoard?'No board pads yet.':'This board has no SMD pads to print.'}</p>}
   <div className="an-grid">
    <div className="an-box"><h3>Job and jars</h3>{field('Losses',a.lossPct,v=>setA({lossPct:num(v)}),{unit:'%'})}{field('Jar size',a.jarG,v=>setA({jarG:num(v,500)}),{unit:'g'})}{priceField('Jar price','jarPrice',60)}</div>
    <div className="an-box"><h3>High volume</h3>
     <label className="check-inline"><input type="checkbox" checked={!!a.stepUpOn} onChange={e=>setA({stepUpOn:e.target.checked})}/>Step-up stencil for</label>
     <div className="an-chips">{TYPES.map(([k,l])=><label key={k} className={'pcb-chip'+((a.stepUpTypes||[]).includes(k)?' on':'')}><input type="checkbox" checked={(a.stepUpTypes||[]).includes(k)} onChange={e=>setA({stepUpTypes:e.target.checked?[...(a.stepUpTypes||[]),k]:(a.stepUpTypes||[]).filter(x=>x!==k)})}/>{l}</label>)}</div>
     {field('Step-up thickness',a.stepUpUm,v=>setA({stepUpUm:num(v,150)}),{unit:'µm',step:10})}{field('Overprint',a.overprintPct,v=>setA({overprintPct:num(v)}),{unit:'%'})}</div>
    <div className="an-box"><h3>Less volume</h3><label className="check-inline"><input type="checkbox" checked={!!a.windowpaneOn} onChange={e=>setA({windowpaneOn:e.target.checked})}/>Windowpane on exposed pads (QFN, DPAK)</label>{field('Coverage',a.windowpanePct,v=>setA({windowpanePct:num(v,65)}),{unit:'%'})}</div>
    <div className="an-box"><h3>Double volume</h3><label className="check-inline"><input type="checkbox" checked={!!a.pip?.on} onChange={e=>setPip({on:e.target.checked})}/>Through-hole by pin-in-paste ({int(paste.tht)} pins)</label>
     {field('Hole',a.pip.holeMm,v=>setPip({holeMm:num(v)}),{unit:'mm'})}{field('Pin (square)',a.pip.pinMm,v=>setPip({pinMm:num(v)}),{unit:'mm'})}{field('Board',a.pip.boardMm,v=>setPip({boardMm:num(v)}),{unit:'mm'})}{field('Fillets',a.pip.filletMm3,v=>setPip({filletMm3:num(v)}),{unit:'mm³'})}
     <small className="muted">{g1(paste.pinMm3)} mm³ per pin = 2 × solder (paste is ≈ 52 % metal by volume)</small></div>
   </div>
  </section>

  <section className="panel an-sec" aria-label="Thermal paste and conductive adhesive">
   <div className="panel-heading"><div className="title-row"><Layers size={17}/><h2>Thermal paste and conductive adhesive</h2></div><small className="muted">{g3(paste.thermalGrams)} g thermal · {g3(paste.adhesiveGrams)} g adhesive per board</small></div>
   <div className="an-grid">
    <div className="an-box wide"><h3>Thermal paste under heatsinks</h3>
     {(a.thermal||[]).map((t,i)=><div key={i} className="an-row">{['name','w','h','bondMm','count'].map(k=><label key={k} className="an-field">{{name:'Part',w:'Width (mm)',h:'Length (mm)',bondMm:'Bond line (mm)',count:'Count'}[k]}<input type={k==='name'?'text':'number'} min="0" step="any" value={t[k]??''} onChange={e=>setA({thermal:a.thermal.map((x,j)=>j===i?{...x,[k]:k==='name'?e.target.value:e.target.value}:x)})}/></label>)}
      <button type="button" className="icon-button" aria-label="Remove heatsink" onClick={()=>setA({thermal:a.thermal.filter((_,j)=>j!==i)})}><Trash2 size={14}/></button></div>)}
     <button type="button" className="text-button" onClick={()=>setA({thermal:[...(a.thermal||[]),{name:'',w:20,h:20,bondMm:.1,count:1}]})}><Plus size={13}/>Add a heatsink</button>
     {priceField('Thermal paste price per g','thermalPrice',.5)}</div>
    <div className="an-box"><h3>Conductive adhesive</h3>{field('Dots per board',a.adhesive.dots,v=>setAdh({dots:num(v)}),{step:1})}{field('Volume per dot',a.adhesive.dotMm3,v=>setAdh({dotMm3:num(v)}),{unit:'mm³'})}{priceField('Price per g','adhesivePrice',2)}</div>
   </div>
  </section>

  <section className="panel an-sec" aria-label="Pin count">
   <div className="panel-heading"><div className="title-row"><Cpu size={17}/><h2>Pin count</h2></div><small className="muted">{int(pins.pins)} pins on fitted parts: {int(pins.pinsTop)} top, {int(pins.pinsBottom)} bottom{pins.twoSided?' · two-sided board':''}</small></div>
   {pins.parts.length?<>
    <div className="an-grid"><div className="an-box"><h3>Most pins</h3><ul className="an-list">{pins.most.map(x=><li key={x.ref}><span className="mono">{x.ref}</span><span>{x.mpn||x.package}</span><b>{int(x.pins)}</b></li>)}</ul></div>
     <div className="an-box"><h3>By method</h3><ul className="an-list"><li><span>SMD (stencil)</span><b>{int(pins.smdPins)}</b></li><li><span>Through-hole ({a.pip?.on?'pin-in-paste':'wave / selective'})</span><b>{int(pins.thtPins)}</b></li><li><span>Solder joints</span><b>{int(pins.joints)}</b></li></ul></div></div>
    <div className="table-scroll"><table className="saved-table an-table"><thead><tr><th>Part number</th><th className="numeric">Parts</th><th className="numeric">Pins each</th><th className="numeric">Pins per board</th></tr></thead>
     <tbody>{pins.lines.filter(l=>l.parts>0).map(l=><tr key={l.id} className={l.dnp?'an-dnp':''}><td><button type="button" className="link-button" onClick={()=>openLine(l.id)}>{l.mpn}</button>{l.dnp&&<span className="badge neutral"><span/>DNP</span>}</td><td className="numeric">{int(l.parts)}</td><td className="numeric">{l.pinsEach??'—'}</td><td className="numeric">{l.dnp?<em className="na">not fitted</em>:int(l.pins)}</td></tr>)}</tbody></table></div>
   </>:<p className="muted bom-off">Pins come from the board's pads: upload the Gerber in Bare PCB.</p>}
  </section>

  <section className="panel an-sec" aria-label="DNP">
   <div className="panel-heading"><div className="title-row"><CircleSlash size={17}/><h2>DNP: do not populate</h2><span className="count-label">{rows.filter(r=>r.dnp).length}</span></div><small className="muted">A DNP line stays on the BOM but is not bought, placed or printed.</small></div>
   <div className="table-scroll"><table className="saved-table an-table"><thead><tr><th>DNP</th><th>Part number</th><th>References</th><th className="numeric">Qty per board</th></tr></thead>
    <tbody>{rows.map(r=><tr key={r.id} className={r.dnp?'an-dnp':''}><td><input type="checkbox" aria-label={`${r.mpn} do not populate`} checked={!!r.dnp} onChange={e=>setDnp(r.id,e.target.checked)}/></td><td>{r.mpn}</td><td className="mono an-refs">{(r.refs||[]).join(' ')||'—'}</td><td className="numeric">{int(r.qty)}</td></tr>)}</tbody></table></div>
  </section>

  <section className="panel an-sec" aria-label="Masking and coating">
   <div className="panel-heading"><div className="title-row"><ShieldCheck size={17}/><h2>Masking and conformal coating</h2></div></div>
   <div className="an-grid"><div className="an-box wide"><label className="check-inline"><input type="checkbox" checked={!!a.coating?.on} onChange={e=>setCoat({on:e.target.checked})}/>Conformal coating: mask the keep-outs (connectors, test points, switches) before coating, and remask after rework</label>
    {field('Keep-outs per board',a.coating?.keepouts??cons.keepouts,v=>setCoat({keepouts:v===''?null:num(v)}),{step:1})}{field('Dry film',a.coating?.filmUm??50,v=>setCoat({filmUm:num(v,50)}),{unit:'µm',step:5})}
    <small className="muted">Production shows the masking for this job and counts boards to remask from its rework.</small></div></div>
  </section>

  <section className="panel an-sec" aria-label="Consumables">
   <div className="panel-heading"><div className="title-row"><Package size={17}/><h2>Consumables</h2></div><label className="check-inline"><input type="checkbox" checked={!!a.inQuote} onChange={e=>setA({inQuote:e.target.checked})}/>Add to the quotation</label></div>
   <div className="table-scroll"><table className="saved-table an-table an-cons"><thead><tr><th>Use</th><th>Consumable</th><th className="numeric">Quantity</th><th className="numeric">Unit price ({money.currency})</th><th className="numeric">Per board</th><th className="numeric">For {int(boards)} boards</th></tr></thead>
    <tbody>{cons.rows.map(c=><tr key={c.key} className={c.on?'':'an-off'}><td><input type="checkbox" aria-label={`Use ${c.name}`} checked={c.on} onChange={e=>setCons(c.key,{on:e.target.checked})}/></td>
     <td>{c.name}<small className="muted"> {c.why}</small></td>
     <td className="numeric"><span className="an-input"><input type="number" min="0" step="any" aria-label={`${c.name} quantity`} value={c.auto?+c.qty.toFixed(c.qty<10?3:1):a.consumables?.[c.key]?.qty} onChange={e=>setCons(c.key,{qty:e.target.value})}/><em>{c.unit}{c.per==='job'?' / job':''}</em></span></td>
     <td className="numeric"><input type="number" min="0" step="any" className="an-price" aria-label={`${c.name} unit price`} value={shownPrice(a.consumables?.[c.key]?.price,c.unitUsd)} onChange={e=>setCons(c.key,{price:typed(e.target.value)})}/></td>
     <td className="numeric">{c.per==='job'?<em className="na">per job</em>:money.fmt(c.costUsd)}</td><td className="numeric">{money.fmt(c.jobUsd)}</td></tr>)}
     <tr className="an-total"><td/><td>Total</td><td/><td/><td className="numeric"><b>{money.fmt(cons.perBoardUsd)}</b></td><td className="numeric"><b>{money.fmt(cons.jobUsd)}</b></td></tr></tbody></table></div>
  </section>
 </div>;
}
