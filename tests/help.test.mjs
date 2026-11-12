// Help and tours: every page has help, every tour is short and points at pages that exist, and the
// three lines hold the pages they should (the factory floor is in Production, no price sources page).
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'rolldown';

// Bundled inside the project so the bundle finds react and lucide-react in node_modules.
const cache=new URL('../node_modules/.cache/',import.meta.url).pathname;mkdirSync(cache,{recursive:true});
const dir=mkdtempSync(join(cache,'help-test-'));
const file=join(dir,'help.mjs');
await build({input:new URL('../src/help.js',import.meta.url).pathname,external:[/^react/,/^lucide-react/],logLevel:'silent',output:{file,format:'esm'}});
const help=await import(pathToFileURL(file).href);
const brandFile=join(dir,'brand.mjs');
await build({input:new URL('../src/brand.jsx',import.meta.url).pathname,external:[/^react/,/^lucide-react/],logLevel:'silent',output:{file:brandFile,format:'esm'}});
const brand=await import(pathToFileURL(brandFile).href);
test.after(()=>rmSync(dir,{recursive:true,force:true}));
const {PAGE_HELP,TOURS,SHORTCUTS,searchHelp,helpEntries,tourById,loadTourState,markTour,TOURS_KEY}=help;

test('every page of every line, and Home, has help with what it is for and how to use it',()=>{
 const entries=helpEntries();
 assert.ok(entries.length>=13);
 for(const e of entries){assert.ok(e.what&&e.what.length>20,`${e.label} says what it is for`);assert.ok(Array.isArray(e.how)&&e.how.length>=2,`${e.label} has how-to lines`)}
 assert.deepEqual(Object.keys(PAGE_HELP).sort(),entries.map(e=>e.leaf).sort(),'no help for a page that does not exist');
});

test('the lines: Engineering is the board work, the factory floor is in Production, no price sources page',()=>{
 const byLine=l=>helpEntries().filter(e=>e.line===l).map(e=>e.label);
 assert.deepEqual(byLine('engineering'),['Board studio','Board types']);
 assert.deepEqual(byLine('supply'),['BOM tool','Saved lists','Part master','Inventory','Purchases','Vendors']);
 assert.deepEqual(byLine('production'),['Jobs','SMT line','Machines','Dispatch']);
 assert.equal(helpEntries().some(e=>/price sources|integrations/i.test(e.label)),false);
});

test('tours: one for the whole flow and one per line, seven steps or fewer, each step on a real page with a target',()=>{
 assert.deepEqual(TOURS.map(t=>t.id),['flow','engineering','supply','production']);
 const pages=new Set(helpEntries().map(e=>e.leaf));
 for(const t of TOURS){
  assert.ok(t.steps.length>=3&&t.steps.length<=7,`${t.id} has 3 to 7 steps`);
  for(const s of t.steps){
   assert.ok(s.page===null||pages.has(s.page),`${t.id}: ${s.title} opens a real page`);
   assert.ok(Array.isArray(s.target)&&s.target.length&&s.target.every(x=>typeof x==='string'&&x),`${t.id}: ${s.title} has a target`);
   assert.ok(s.title&&s.body,`${t.id}: step has words`);
   assert.doesNotMatch(s.title+' '+s.body,/→|->|!|welcome/i,'copy rules: no arrows, no exclamation marks, no welcome');
  }
  if(t.line)assert.ok(t.steps.every(s=>helpEntries().find(e=>e.leaf===s.page)?.line===t.line),`${t.id} stays on its line`);
 }
 assert.equal(tourById('supply').title,'Supply');assert.equal(tourById('nope'),null);
});

test('help search finds pages by task words and names the shortcuts',()=>{
 assert.deepEqual(searchHelp('gerber').map(e=>e.label).slice(0,2),['Board studio','BOM tool']);
 assert.ok(searchHelp('dispatch').some(e=>e.label==='Dispatch'));
 assert.ok(searchHelp('production stations').some(e=>e.label==='SMT line'),'line names are searchable');
 assert.equal(searchHelp('zzzz').length,0);
 assert.equal(searchHelp('').length,helpEntries().length);
 assert.ok(SHORTCUTS.some(([k])=>k==='?'));
});

test('finished and closed tours are kept per account',()=>{
 const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 try{
  const a={email:'a@example.test'},b={email:'b@example.test'};
  assert.deepEqual(loadTourState(a),{});
  markTour(a,'flow','done');markTour(a,'supply','closed');
  assert.deepEqual(loadTourState(a),{flow:'done',supply:'closed'});
  assert.deepEqual(loadTourState(b),{},'another account still gets the offer');
  assert.deepEqual(loadTourState(null),{});markTour(null,'flow','closed');assert.equal(loadTourState(null).flow,'closed');
  assert.ok([...store.keys()].every(k=>k.startsWith(TOURS_KEY+':')));
  store.set(TOURS_KEY+':a@example.test','not json');assert.deepEqual(loadTourState(a),{});
 }finally{delete globalThis.localStorage}
});
test('links: moved pages keep their old addresses, the removed page opens Home',()=>{
 const {pageFromHash,hashOf,resolveLeaf,HOME}=brand;
 assert.equal(hashOf('SMT line'),'#/production/smt-line');assert.equal(hashOf('Machines'),'#/production/machines');
 assert.equal(pageFromHash('#/production/smt-line'),'SMT line');
 assert.equal(pageFromHash('#/engineering/smt-line'),'SMT line','an old Engineering link still opens the SMT line');
 assert.equal(pageFromHash('#/engineering/machines'),'Machines');
 assert.equal(pageFromHash('#/supply/price-sources',{supply:'Inventory'}),'Inventory','the removed page opens the line\'s last page');
 assert.equal(resolveLeaf('Integrations'),HOME);assert.equal(resolveLeaf('Price sources'),HOME);
 assert.equal(pageFromHash('#3D line'),'SMT line');
});
