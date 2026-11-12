import React,{useEffect,useState} from 'react';
import {LINES,RouteMark,SITE} from './brand.jsx';

// Front door: sign in, or create the admin account on first run. Without the local server sign-in is
// off and one button opens the workspace for this tab. Beside the form, the three lines drawn static:
// the product's real structure, not a claim.
const ABOUT={
 engineering:'Boards, Gerber files, part models and 3D board views.',
 supply:'Bare PCB, components, prices, stock and vendors.',
 production:'Jobs, the 3D SMT line, machines and dispatch.',
};

function AdminPanel({auth,onSignedIn,onOpen}){
 const first=auth.enabled&&!auth.admin;
 const [tab,setTab]=useState('in'),[form,setForm]=useState({name:'',email:'',password:''}),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const signup=first||tab==='up';
 const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');
  try{const r=await fetch(signup?'/api/auth/signup':'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(signup?form:{email:form.email,password:form.password})});
   const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Sign-in failed. Check the email and password, then try again.');
   onSignedIn(j.user)}
  catch(err){setError(err.message)}finally{setBusy(false)}};
 if(!auth.enabled)return <section className="intro-admin" aria-label="Admin">
  <h1>Open the workspace</h1>
  <p className="muted">Sign-in is off on this server. Records stay in this browser.</p>
  <button type="button" className="button primary full" onClick={onOpen}>Open</button></section>;
 return <section className="intro-admin" aria-label="Admin">
  <h1>{first?'Create the admin account':signup?'Create an account':'Sign in'}</h1>
  {first&&<p className="muted">The first account is the admin. It can add and remove the team later.</p>}
  {auth.down&&<div className="notice" role="alert"><span><strong>The server did not answer.</strong> {auth.down} Try again.</span></div>}
  <form onSubmit={submit} className="intro-form">
   {signup&&<label>Name<input autoComplete="name" value={form.name} onChange={set('name')} required maxLength={60}/></label>}
   <label>Email<input type="email" autoComplete={signup?'email':'username'} value={form.email} onChange={set('email')} required/></label>
   <label>Password<input type="password" autoComplete={signup?'new-password':'current-password'} value={form.password} onChange={set('password')} required minLength={signup?10:1} aria-describedby={signup?'pw-rule':undefined}/>{signup&&<small id="pw-rule">At least 10 characters</small>}</label>
   {error&&<p className="intro-error" role="alert">{error}</p>}
   <button type="submit" className="button primary full" disabled={busy} aria-busy={busy||undefined}>{signup?(busy?'Creating the account…':'Create account'):(busy?'Signing in…':'Sign in')}</button>
  </form>
  {!first&&<button type="button" className="text-button intro-switch" onClick={()=>{setTab(signup?'in':'up');setError('')}}>{signup?'I have an account: sign in':'No account yet: create one'}</button>}
 </section>;
}

export default function Intro({auth,onSignedIn,onOpen}){
 useEffect(()=>{const t=document.title;document.title=SITE;return()=>{document.title=t}},[]);
 return <div className="intro">
  <header className="intro-top"><span className="brand"><RouteMark/><span>{SITE}</span></span></header>
  <div className="intro-grid">
   <AdminPanel auth={auth} onSignedIn={onSignedIn} onOpen={onOpen}/>
   <section className="intro-route" aria-label="The three lines">
    <p className="intro-name">{SITE}</p>
    <ol>{LINES.map(l=><li key={l.id} data-line={l.id}><span className="lane-mark" data-line={l.id}><l.icon size={24}/></span><div><strong>{l.label}</strong><p>{ABOUT[l.id]}</p></div></li>)}</ol>
   </section>
  </div>
 </div>;
}
