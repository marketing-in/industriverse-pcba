import React,{useEffect,useMemo,useState} from 'react';
import {Radar,RefreshCw,ExternalLink,CheckCircle2,CircleDashed,TriangleAlert} from 'lucide-react';
import {AXES,scoreSellers,summarise,radarPoints} from './supplierScore.js';
import {useMoney} from './currency.jsx';

const COLORS=['#c0612b','#4a6bc0','#2d8a55','#8a8577','#b8892a'];
const fmt=n=>Number(n).toLocaleString('en-US');
const money=(v,c)=>v==null?'Not available':`${c==='USD'?'$':c==='INR'?'₹':c==='EUR'?'€':c==='GBP'?'£':(c||'')+' '}${v<1?v.toFixed(v<.1?4:3):v.toFixed(2)}`;
const safeUrl=u=>typeof u==='string'&&/^https:\/\//.test(u)?u:null;

function RadarChart({series,active,setActive}){
 const size=300,c=size/2,r=104;
 const axisEnd=i=>{const a=-Math.PI/2+i*2*Math.PI/AXES.length;return [c+Math.cos(a)*r,c+Math.sin(a)*r,a]};
 const label=series.map(s=>`${s.seller} ${s.overall}`).join(', ');
 return <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Supplier radar: ${label}`}>
  {[25,50,75,100].map(v=><polygon key={v} points={AXES.map((_,i)=>{const [x,y]=axisEnd(i);return `${c+(x-c)*v/100},${c+(y-c)*v/100}`}).join(' ')} className="radar-ring"/>)}
  {AXES.map((a,i)=>{const [x,y,ang]=axisEnd(i);const lx=c+Math.cos(ang)*(r+22),ly=c+Math.sin(ang)*(r+22);return <g key={a.key}><line x1={c} y1={c} x2={x} y2={y} className="radar-axis"/><text x={lx} y={ly} textAnchor={Math.abs(Math.cos(ang))<.2?'middle':Math.cos(ang)>0?'start':'end'} dominantBaseline="middle" className="radar-label">{a.label}</text></g>})}
  {series.map((s,i)=>{const pts=radarPoints(s.scores,c,c,r);const on=active==null||active===i;return <g key={s.seller} className={'radar-series'+(on?'':' dim')} onPointerEnter={()=>setActive(i)} onPointerLeave={()=>setActive(null)}>
   <polygon points={pts.map(p=>p.join(',')).join(' ')} fill={COLORS[i]} fillOpacity={active===i?.28:.1} stroke={COLORS[i]} strokeWidth={active===i?2.5:1.6}/>
   {pts.map(([x,y],k)=><circle key={k} cx={x} cy={y} r={active===i?3.2:2.2} fill={COLORS[i]}/>)}</g>})}
 </svg>;
}

// Compares every supplier the server can reach for one part number: radar of the top five sellers,
// a one-line verdict, provider status, and the full offer table.
export function SupplierCompare({mpn,compact=false}){
 const [state,setState]=useState({status:'idle'});const [active,setActive]=useState(null);const [nonce,setNonce]=useState(0);
 useEffect(()=>{if(!mpn){setState({status:'idle'});return}
  const ctl=new AbortController();setState({status:'loading'});setActive(null);
  fetch('/api/compare?mpn='+encodeURIComponent(mpn),{signal:ctl.signal}).then(async r=>{let d;try{d=await r.json()}catch{throw Error('Supplier service offline. Run npm run server.')}if(!r.ok)throw Error(d.error||'Comparison failed.');return d})
   .then(data=>setState({status:'ready',data})).catch(e=>{if(e.name!=='AbortError')setState({status:'error',error:e.message})});
  return()=>ctl.abort()},[mpn,nonce]);
 const m$=useMoney();const scored=useMemo(()=>state.data?scoreSellers(state.data.offers):[],[state.data]);
 const top=scored.slice(0,5),sum=summarise(scored);
 if(!mpn)return null;
 return <section className={'compare'+(compact?' compact':'')} aria-label={`Supplier comparison for ${mpn}`}>
  <div className="compare-head"><div className="title-row"><Radar size={16}/><h3>Suppliers · {mpn}</h3></div><button type="button" className="text-button" onClick={()=>setNonce(n=>n+1)} disabled={state.status==='loading'}><RefreshCw size={16}/>{state.status==='loading'?'Loading…':'Refresh'}</button></div>
  {state.status==='loading'&&<div className="compare-loading" role="status"><span className="pulse"/>Querying suppliers…</div>}
  {state.status==='error'&&<div className="notice error" role="alert"><TriangleAlert size={16}/><span>{state.error}</span></div>}
  {state.status==='ready'&&<>
   <ul className="provider-chips" aria-label="Suppliers queried">{state.data.providers.map(p=><li key={p.id} className={'provider-chip '+p.status} title={p.status==='ok'?`${p.count} offer${p.count===1?'':'s'}`:p.error||('Needs '+p.need)}>{p.status==='ok'?<CheckCircle2 size={12}/>:p.status==='error'?<TriangleAlert size={12}/>:<CircleDashed size={12}/>}{p.name}<b>{p.status==='ok'?p.count:p.status==='error'?'error':'off'}</b></li>)}</ul>
   {!scored.length?<div className="empty compare-empty">No offers for this part number. Check the part number and ask again.</div>:<>
    {sum&&<p className="compare-verdict">Best: <strong>{sum.best.seller}</strong> ({sum.best.overall}/100).{sum.cheapest&&sum.cheapest!==sum.best?<> Cheapest: <strong>{sum.cheapest.seller}</strong>, {m$.fmt(sum.cheapest.priceUsd,{unit:true})}{sum.cheapest.authorized?'':' (marketplace)'}.</>:null}{sum.deepest?<> Deepest stock: <strong>{sum.deepest.seller}</strong>, {fmt(sum.deepest.stock)}.</>:null}</p>}
    <div className="compare-body">
     <RadarChart series={top} active={active} setActive={setActive}/>
     <ol className="radar-legend">{top.map((s,i)=><li key={s.seller} className={active===i?'on':''} onPointerEnter={()=>setActive(i)} onPointerLeave={()=>setActive(null)} onFocus={()=>setActive(i)} onBlur={()=>setActive(null)} tabIndex={0}><i style={{background:COLORS[i]}}/><span><strong>{s.seller}</strong><small>{s.authorized?'Authorised':'Open market · unverified'} · {s.sources.map(x=>x==='serpapi'?'Google Shopping':x).join(', ')}</small></span><b>{s.overall}</b>{!compact&&<span className="legend-axes">{AXES.map(a=><span key={a.key} title={a.hint}>{a.label} {s.scores[a.key]}</span>)}</span>}</li>)}</ol>
    </div>
    <div className="table-scroll"><table className="compare-table"><thead><tr><th>Seller</th><th>Unit price ({m$.currency})</th><th>Stock</th><th>Delivery</th><th>MOQ</th><th>Score</th><th aria-label="Link"/></tr></thead><tbody>{scored.map(s=><tr key={s.seller}><td><strong>{s.seller}</strong><small className="price-note">{s.authorized?'Authorised':'Open market · unverified'} · {s.sources.map(x=>x==='serpapi'?'Google Shopping':x).join(', ')}</small></td><td className="numeric">{s.priceUsd!=null?m$.fmt(s.priceUsd,{unit:true}):s.price!=null?money(s.price,s.currency):<em className="na">Not available</em>}{s.priceUsd!=null&&s.price!=null&&s.currency&&s.currency!==m$.currency&&<small className="price-note">quoted {money(s.price,s.currency)}</small>}</td><td className="numeric">{s.stock==null?'Not available':fmt(s.stock)}</td><td>{s.stock>0?'Ships now':s.leadDays!=null?`${s.leadDays}\u00a0days`:'Not available'}</td><td className="numeric">{s.moq==null?'Not available':fmt(s.moq)}</td><td className="numeric">{s.overall}</td><td>{safeUrl(s.url)&&<a href={safeUrl(s.url)} target="_blank" rel="noreferrer" aria-label={`Open ${s.seller} offer`}><ExternalLink size={16}/></a>}</td></tr>)}</tbody></table></div>
    
   </>}
  </>}
 </section>;
}
export default SupplierCompare;
