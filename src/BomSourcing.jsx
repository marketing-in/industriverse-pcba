import React,{useState} from 'react';
import {ArrowUpRight,ChartNoAxesCombined} from 'lucide-react';
import {dayKey,partKey} from './bomPlanning.js';
import {formatDate} from './production.js';
import {formatMoney} from './money.js';
import {pickerList} from './vendors.js';

const integer=n=>Math.round(n).toLocaleString('en-IN');
// Vendor lists come from the shared registry (vendors.js), so vendors added on the Vendors page appear here.
export const PCB_VENDORS=pickerList('pcb');

export function VendorDirectory({vendors,title,selected,onSelect}){
 return <section className="vendor-directory" aria-label={title}>
  <h3>{title}</h3><p className="muted">Open a supplier for a quote and confirm the material, dimensions, lead time and freight.</p>
  <div className="vendor-grid">{vendors.map(([name,description,url])=><article key={name}>
   <strong>{name}</strong><small>{description}</small><div>
    <a className="text-button" href={url} target="_blank" rel="noreferrer">Request quote <ArrowUpRight size={16}/></a>
    <button className="button small" type="button" aria-pressed={selected===name} onClick={()=>onSelect(name)}>{selected===name?'Selected':'Select'}</button>
   </div>
  </article>)}</div>
 </section>;
}

function PriceHistory({samples,money}){
 if(!samples.length)return <p className="muted">No dated price observations at this supplier and order quantity yet. Refresh prices to start recording.</p>;
 const min=Math.min(...samples.map(s=>s.price)),max=Math.max(...samples.map(s=>s.price));
 const from=Date.parse(samples[0].day),span=Date.parse(samples.at(-1).day)-from;
 const points=samples.map(s=>({x:span?20+((Date.parse(s.day)-from)/span)*320:180,y:max===min?49:83-(s.price-min)/(max-min)*68,...s}));
 return <>
  <svg className="price-history" viewBox="0 0 360 98" role="img" aria-label="Observed unit price over time">
   <path d="M20 83H340 M20 49H340 M20 15H340" className="chart-grid"/>
   <polyline points={points.map(p=>p.x+','+p.y).join(' ')} className="chart-price"/>
   {points.map(p=><circle key={p.day} cx={p.x} cy={p.y} r="3.5"><title>{formatDate(p.day)} · {money.fmt(p.price,{unit:true})}</title></circle>)}
  </svg>
  <div className="chart-axis"><span>{formatDate(samples[0].day)}</span><span>{money.fmt(min,{unit:true})}–{money.fmt(max,{unit:true})}</span><span>{formatDate(samples.at(-1).day)}</span></div>
  <details><summary>Recorded prices ({samples.length})</summary><ul>{samples.map(p=><li key={p.day}>{p.day} · {money.fmt(p.price,{unit:true})} · {p.stock==null?'Stock unknown':integer(p.stock)+' in stock'}</li>)}</ul></details>
 </>;
}

export function ComponentPlanning({rows,calcs,outlooks,hikes,onHikes,purchases,onPurchase,money}){
 const today=dayKey(new Date().toISOString());
 const [chosen,setChosen]=useState(''),[qty,setQty]=useState(''),[paid,setPaid]=useState(''),[date,setDate]=useState(today),[supplier,setSupplier]=useState('');
 const index=Math.max(0,rows.findIndex(r=>r.id===chosen));
 const row=rows[index],calc=calcs[index],o=outlooks[index];
 if(!row)return null;
 const purchaseLog=purchases[partKey(row.mpn)]||[];
 const format=v=>money.fmt(v,{unit:true});
 const range=r=>r?format(r.low)+' – '+format(r.high):'Not available';
 const advice=o.pressure==='Shortage'?'Get a second quote or split the order. Current stock cannot cover this build.':
  o.pressure==='High'?'Confirm stock and lead time with the supplier before waiting.':
  o.pressure==='Low'?'Stock coverage is strong at the reported level. Compare price breaks and order timing.':
  o.pressure==='Moderate'?'Check the supplier’s quote validity against your purchase date.':'Get a supplier quote to evaluate purchase timing.';
 const submit=e=>{
  e.preventDefault();
  if(!date||date>today||!Number.isInteger(+qty)||+qty<1||paid===''||!Number.isFinite(+paid)||+paid<0)return;
  onPurchase(row.mpn,{date,qty:+qty,unit:+paid,currency:money.currency,supplier:supplier.trim()||calc.offer?.seller||''});
  setQty('');setPaid('');setSupplier('');
 };
 return <section className="panel sourcing-panel" aria-label="Component purchase analysis">
  <div className="sourcing-heading"><div><h2><ChartNoAxesCombined size={16}/> Purchase outlook</h2><p className="muted">Track supplier prices, stock pressure, and what you actually paid.</p></div>
   <label>Component<select aria-label="Component for purchase analysis" value={row.id} onChange={e=>{setChosen(e.target.value);setQty('');setPaid('');setSupplier('')}}>{rows.map(r=><option key={r.id} value={r.id}>{r.mpn}</option>)}</select></label>
  </div>
  <div className="sourcing-metrics">
   <div><small>Current unit price</small><strong>{o.price==null?'Not available':format(o.price)}</strong><span>{calc.offer?.seller||'No supplier selected'}{calc.orderQty>0?' · '+integer(calc.orderQty)+' to order':''}{row.fetchedAt?' · checked '+formatDate(dayKey(row.fetchedAt)):''}</span></div>
   <div><small>3-day unit price</small><strong>{range(o.three)}</strong><span>Planning range</span></div>
   <div><small>9-day unit price</small><strong>{range(o.nine)}</strong><span>Planning range</span></div>
   <div><small>Stock pressure</small><strong>{o.pressure}</strong><span>{o.stock==null?'Supplier stock unavailable':integer(o.stock)+' in stock · '+integer(calc.buy)+' needed'}</span></div>
  </div>
  {calc.buy>0&&<p className="sourcing-advice"><strong>Buying decision</strong> {advice} {o.price!=null&&<>Estimated spend at the current rate: <strong>{money.fmt(o.price*calc.orderQty)}</strong> before freight.</>}</p>}
  <div className="sourcing-columns">
   <div><h3>Supplier price history</h3><PriceHistory samples={o.samples} money={money}/>
    <p className="muted">{o.stockChange==null?'Stock movement needs observations on different days.':`Observed stock change: ${o.stockChange>0?'+':''}${integer(o.stockChange)} units.`} Stock pressure compares reported availability with your planned purchase. Stock changes can also reflect restocking and inventory adjustments.</p>
    <p className="muted">{o.trendReady?'Ranges combine the recorded price trend with the selected uplift.':'Ranges use the current price and selected uplift. Trend estimates need three distinct observation days.'} Supplier prices and actual demand can change.</p>
    <div className="bom-pcb-dims">{[['three','3-day uplift (%)'],['nine','9-day uplift (%)']].map(([key,label])=><label key={key}>{label}<input type="number" min="0" max="100" step=".1" value={hikes[key]} onChange={e=>onHikes(key,e.target.value)}/></label>)}</div>
   </div>
   <div><h3>Purchase history</h3><form className="purchase-entry" onSubmit={submit}>
    <label>Purchase date<input type="date" max={today} value={date} onChange={e=>setDate(e.target.value)} required/></label>
    <label>Quantity bought<input type="number" min="1" step="1" value={qty} onChange={e=>setQty(e.target.value)} required/></label>
    <label>Paid per unit ({money.currency})<input type="number" min="0" step="any" value={paid} onChange={e=>setPaid(e.target.value)} required/></label>
    <label>Purchase supplier<input maxLength="80" value={supplier} placeholder={calc.offer?.seller||'Optional'} onChange={e=>setSupplier(e.target.value)}/></label>
    <button className="button small" type="submit">Record purchase</button>
   </form>
   {purchaseLog.length?<div className="table-scroll"><table className="ship-table"><thead><tr><th>Date</th><th>Qty</th><th>Paid per unit</th></tr></thead><tbody>{purchaseLog.map((p,i)=><tr key={i}><td>{formatDate(p.date)}{p.supplier&&<small>{p.supplier}</small>}</td><td>{integer(p.qty)}</td><td>{formatMoney(p.unit,p.currency||'USD',1,{unit:true})}</td></tr>)}</tbody></table></div>:<p className="muted">No purchases recorded for this part. Enter actual order details after buying.</p>}
   </div>
  </div>
 </section>;
}

