import test from 'node:test';
import assert from 'node:assert/strict';

// A small localStorage for the browser-side stores.
const mem=new Map();
globalThis.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k),clear:()=>mem.clear()};

const {VENDOR_KINDS,VENDORS,CAPABILITY_FIELDS,VENDOR_STORE,vendorsOf,addVendor,removeVendor,setVendorNote,loadVendorData,saveVendorData,migrateVendorData,pickerList,vendorOffersFor}=await import('../src/vendors.js');
const lists=await import('../src/savedLists.js');
const {filterSerp,serpIdentity,serpPack,compareSuppliers}=await import('../api.mjs');

test('the vendor registry covers the six kinds, with unique ids and https links',()=>{
 assert.deepEqual(VENDOR_KINDS.map(k=>k.id),['semiconductor','distributor','passive','pcb','testlab','logistics']);
 assert.deepEqual(VENDOR_KINDS.map(k=>k.short),['Semiconductor','Distributor','Passive','PCB','Test lab','Logistics']);
 assert.ok(VENDORS.every(v=>VENDOR_KINDS.some(k=>k.id===v.kind)),'no built-in vendor of a removed kind');
 assert.deepEqual(Object.keys(CAPABILITY_FIELDS).sort(),VENDOR_KINDS.map(k=>k.id).sort(),'capability fields only for the six kinds');
 assert.ok(!/enclos|mould|mold/i.test(JSON.stringify([VENDOR_KINDS,VENDORS,CAPABILITY_FIELDS])));
 for(const k of VENDOR_KINDS)assert.ok(VENDORS.some(v=>v.kind===k.id),k.id+' has vendors');
 assert.equal(new Set(VENDORS.map(v=>v.id)).size,VENDORS.length);assert.ok(VENDORS.every(v=>/^https:\/\//.test(v.url)));
 assert.deepEqual(VENDORS.filter(v=>v.api).map(v=>v.api).sort(),['digikey','master','mouser','nexar','tme'],'channel A distributors carry their API id');
});

test('vendors added and described by the user appear in the BOM tool pickers',()=>{
 mem.clear();let d=loadVendorData();
 d=addVendor(d,{kind:'pcb',name:'  Pune Circuits ',url:'javascript:alert(1)',about:'Local PCB fabricator'});
 assert.equal(d.custom.length,1);assert.equal(d.custom[0].name,'Pune Circuits');assert.equal(d.custom[0].url,'','only http(s) links are kept');
 assert.equal(addVendor(d,{kind:'nope',name:'X'}),d,'unknown kinds are refused');
 assert.equal(addVendor(d,{kind:'mould',name:'X'}),d,'removed kinds are refused');assert.equal(addVendor(d,{kind:'enclosure',name:'X'}),d);
 const id=d.custom[0].id;d=setVendorNote(d,id,{layers:'1–6',leadDays:'4'});assert.ok(saveVendorData(d));
 const mine=vendorsOf('pcb').find(v=>v.id===id);assert.equal(mine.layers,'1–6');
 assert.ok(pickerList('pcb').some(([name])=>name==='Pune Circuits'));
 d=removeVendor(d,id);assert.equal(d.custom.length,0);assert.equal(d.notes[id],undefined);
});

test('saved lists keep the whole BOM, revise in place, duplicate and reopen in the BOM tool',()=>{
 mem.clear();
 const state={project:'Gateway GW-1',customer:'Orion',boards:250,rows:[{id:'a',mpn:'LM358P',qty:2}],pcb:{material:'fr4'},demo:true};
 const r1=lists.saveList(state,{customerTotal:1234.5},{now:'2026-11-10T10:00:00Z'});
 assert.equal(r1.entry.name,'Gateway GW-1');assert.ok(!('enclosure' in r1.entry),'no housing summary');assert.equal(r1.entry.total,1234.5);assert.equal(r1.entry.revision,1);assert.equal(r1.entry.state.demo,undefined);
 const r2=lists.saveList({...state,listId:r1.entry.id,boards:300},{customerTotal:1400},{status:'ordered',jobId:'job-x'});
 assert.equal(r2.lists.length,1,'same list updated');assert.equal(r2.entry.revision,2);assert.equal(r2.entry.boards,300);assert.equal(r2.entry.jobId,'job-x');assert.equal(r2.entry.createdAt,'2026-11-10T10:00:00Z');
 const dup=lists.duplicateList(r1.entry.id);assert.equal(dup.length,2);assert.equal(dup[0].status,'draft');assert.equal(dup[0].jobId,null);assert.notEqual(dup[0].id,r1.entry.id);
 assert.ok(lists.openList(dup[0].id));const open=JSON.parse(localStorage.getItem(lists.BOM_STORE));assert.equal(open.listId,dup[0].id);assert.equal(open.rows[0].mpn,'LM358P');
 assert.equal(lists.setListStatus(r1.entry.id,'archived').find(l=>l.id===r1.entry.id).status,'archived');
 assert.equal(lists.removeList(r1.entry.id).length,1);assert.equal(lists.openList('missing'),false);
});

test('open-market listings are restricted to the exact product, not by price',()=>{
 assert.ok(serpIdentity('LM358P Dual Op Amp DIP-8','LM358P'));assert.ok(serpIdentity('irf-540n mosfet','IRF540N'));
 assert.ok(!serpIdentity('LM358PWR TSSOP','LM358P'),'a longer part number is a different product');assert.ok(!serpIdentity('XLM358P','LM358P'));assert.ok(!serpIdentity('anything','AB'),'too short to match safely');
 assert.equal(serpPack('NE555 timer 10 pcs'),10);assert.equal(serpPack('Pack of 25 LM7805'),25);assert.equal(serpPack('LM7805 regulator'),1);
 const r=filterSerp({shopping_results:[
  {title:'LM358P op amp',source:'Shop A',extracted_price:1},{title:'LM358P op amp DIP-8',source:'Shop A',extracted_price:.8},
  {title:'LM358P module kit for Arduino',source:'Shop B',extracted_price:3},{title:'Replacement for LM358P',source:'Shop C',extracted_price:1},
  {title:'LM358P 10 pcs',source:'Shop D',extracted_price:4},{title:'LM358PW',source:'Shop E',extracted_price:1}]},'LM358P');
 assert.deepEqual(r.offers.map(o=>[o.seller,o.price]),[['Shop A',.8],['Shop D',.4]]);assert.deepEqual(r.hidden,{identity:1,type:2,seller:1});
 assert.ok(r.offers.every(o=>o.trust==='unverified'&&o.marketType==='marketplace'));assert.equal(r.offers[1].moq,10);
 // Prices are not restricted: an exact listing far below the distributors stays, marked unverified.
 const cheap=filterSerp({shopping_results:[{title:'LM358P op amp',source:'Far Shop',extracted_price:.01}]},'LM358P');assert.equal(cheap.offers[0].price,.01);assert.equal(cheap.hidden.identity+cheap.hidden.type+cheap.hidden.seller,0);
});

test('vendor register: products a vendor lists become offers on matching BOM lines',async()=>{
 mem.clear();const {addProduct,removeProduct,productsOf,vendorOffersFor}=await import('../src/vendors.js');const {allOffers,marketLabel,isAuthorized}=await import('../src/bom.js');
 let d=addVendor(loadVendorData(),{kind:'distributor',name:'Chennai Components',url:'https://example.com'});const id=d.custom[0].id;
 d=addProduct(d,id,{mpn:'SS14',manufacturer:'onsemi',stock:'4000',price:'3.5',currency:'INR',moq:'100',leadDays:'3'},'2026-11-10T00:00:00Z');
 d=addProduct(d,id,{mpn:'ss-14',stock:'5000',price:'3',currency:'INR'});assert.equal(productsOf(d,id).length,1,'the same part number is updated, not duplicated');assert.equal(productsOf(d,id)[0].stock,5000);
 assert.equal(addProduct(d,id,{mpn:'  '}),d,'a part number is needed');
 const offers=vendorOffersFor('SS14',d,100);assert.equal(offers.length,1);
 assert.deepEqual({seller:offers[0].seller,priceUsd:offers[0].priceUsd,stock:offers[0].stock,marketType:offers[0].marketType},{seller:'Chennai Components',priceUsd:.03,stock:5000,marketType:'registered'});
 assert.equal(marketLabel('registered'),'Registered vendor');assert.equal(isAuthorized(offers[0]),false,'a registered vendor is not an authorised distributor');
 assert.equal(allOffers({offers:[{seller:'DigiKey'}],vendorOffers:offers}).length,2);assert.deepEqual(vendorOffersFor('SS16',d),[]);
 d=removeProduct(d,productsOf(d,id)[0].id);assert.equal(productsOf(d,id).length,0);
 d=addProduct(d,id,{mpn:'LM358P'});assert.equal(removeVendor(d,id).products.length,0,'removing a vendor removes its products');
});

test('one-click quotation request: the supplier email from the Vendors page and a written-out mail',async()=>{
 mem.clear();const {emailOf,vendorEmail,rfqMail}=await import('../src/rfq.js');
 assert.equal(emailOf('Ravi, ravi.k@chennai-comp.in, +91 98400'),'ravi.k@chennai-comp.in');assert.equal(emailOf('no mail'),'');
 let d=loadVendorData();d=setVendorNote(d,'distributor:digikey',{email:'quotes@example.com'});saveVendorData(d);
 assert.equal(vendorEmail('DigiKey'),'quotes@example.com');assert.equal(vendorEmail('Digi-Key'),'quotes@example.com','spelling of the seller name does not matter');
 d=addVendor(d,{kind:'distributor',name:'Chennai Components'});d=setVendorNote(d,d.custom[0].id,{contact:'Ravi, ravi.k@chennai-comp.in'});saveVendorData(d);
 assert.equal(vendorEmail('Chennai Components'),'ravi.k@chennai-comp.in','an address in the contact field is used');assert.equal(vendorEmail('Mouser'),'');
 const m=rfqMail({seller:'DigiKey',to:'quotes@example.com',lines:[{mpn:'1N4148W',manufacturer:'Diodes Inc',qty:1500,refs:['D1','D2']},{mpn:'SS14',qty:200}],project:'Gateway GW-1',due:'2026-12-15',boards:250,from:{company:'Orion Boards Pvt Ltd',contact:'Asha',address:'Chennai'},date:new Date('2026-11-10T00:00:00Z')});
 assert.equal(m.subject,'Request for quotation – Gateway GW-1 – 2 parts');
 assert.match(m.body,/^Dear DigiKey team,\n\nPlease quote the parts below, for delivery by 2026-12-15\./);assert.match(m.body,/Project: Gateway GW-1 \(250 boards\)/);
 assert.match(m.body,/1\. 1N4148W \(Diodes Inc\) – quantity 1,500 – ref D1 D2\n2\. SS14 – quantity 200/);assert.match(m.body,/Asha\nOrion Boards Pvt Ltd\nChennai\nSent 2026-11-10$/);
 assert.ok(m.href.startsWith('mailto:quotes%40example.com?subject=Request%20for%20quotation'));
 const many=rfqMail({seller:'Mouser',lines:Array.from({length:120},(_,i)=>({mpn:'PART-NUMBER-'+i,qty:1000}))});
 assert.ok(many.href.length<=1800,'kept short enough for mail programs');assert.match(many.body,/… and \d+ more parts \(list to follow\)\./);assert.ok(many.href.startsWith('mailto:?subject='),'no address known: the mail opens without one');
});

test('migration: saved lists from older versions lose the housing fields and a total that included it',()=>{
 mem.clear();
 const old=(id,box)=>({id,name:'Old '+id,customer:'Orion',boards:100,lines:1,pcb:true,enclosure:box?'custom moulded':'',total:500,status:'quoted',revision:1,history:[],
  state:{project:'Old '+id,rows:[{id:'a',mpn:'LM358P',qty:1}],pcb:{material:'fr4'},...(box?{box:{material:'ABS plastic',kind:'custom',unit:2},mould:{cavities:1,tooling:900,unit:1}}:{box:{material:'',kind:'shelf'},mould:{cavities:1}})}});
 localStorage.setItem(lists.LISTS_STORE,JSON.stringify([old('l1',true),old('l2',false),{id:'l3',name:'Current',total:42,state:{rows:[]}}]));
 const got=lists.loadLists();
 assert.equal(got.length,3);
 for(const l of got){assert.ok(!('enclosure' in l));assert.ok(!('box' in l.state)&&!('mould' in l.state)&&!('enclosure' in l.state))}
 assert.equal(got[0].total,null,'a total that included a priced housing no longer matches the list');assert.equal(got[1].total,500,'an unpriced housing did not change the total');
 assert.equal(got[2].total,42);assert.equal(got[0].state.rows[0].mpn,'LM358P','the rest of the list is kept');
 assert.ok(!/"box"|"mould"|"enclosure"/.test(localStorage.getItem(lists.LISTS_STORE)),'the cleaned lists are written back');
 assert.ok(lists.openList('l1'));assert.ok(!('box' in JSON.parse(localStorage.getItem(lists.BOM_STORE))),'reopened in the BOM tool without the housing');
 assert.deepEqual(lists.migrateList(got[2]),got[2]);assert.equal(lists.migrateList(got[2]),got[2],'a current entry is returned as it is');
});

test('migration: the BOM tool state drops box, mould and enclosure, and new saves never carry them',()=>{
 mem.clear();
 const v={project:'P',rows:[],pcb:{material:'fr4'},box:{material:'Nylon'},mould:{tooling:1},enclosure:'x',boards:10};
 const s=lists.stripRemovedFields(v);assert.deepEqual(s,{project:'P',rows:[],pcb:{material:'fr4'},boards:10});assert.ok('box' in v,'the input is not changed');
 const same={project:'P'};assert.equal(lists.stripRemovedFields(same),same);assert.equal(lists.stripRemovedFields(null),null);
 const r=lists.saveList(v,{customerTotal:10});assert.ok(!('box' in r.entry.state)&&!('mould' in r.entry.state)&&!('enclosure' in r.entry.state));
});

test('migration: removed vendor kinds are dropped, but a vendor that listed component products moves to Distributors with them',()=>{
 mem.clear();
 localStorage.setItem(VENDOR_STORE,JSON.stringify({
  custom:[{id:'mould:custom-pune-tool-room-x',kind:'mould',name:'Pune Tool Room',builtIn:false},{id:'enclosure:custom-box-co-y',kind:'enclosure',name:'Box Co',builtIn:false},{id:'pcb:custom-pune-circuits-z',kind:'pcb',name:'Pune Circuits',builtIn:false}],
  notes:{'mould:protolabs':{materials:'ABS'},'enclosure:polycase':{ranges:'IP67'},'distributor:digikey':{email:'quotes@example.com'}},
  products:[{id:'p1',vendorId:'mould:custom-pune-tool-room-x',mpn:'SS14',price:3,currency:'USD'},{id:'p2',vendorId:'pcb:custom-pune-circuits-z',mpn:'SS14',price:4,currency:'USD'}]}));
 const d=loadVendorData();
 assert.deepEqual(d.custom.map(v=>v.name),['Pune Circuits','Pune Tool Room'],'Box Co had no products and is dropped');
 assert.equal(d.custom[1].kind,'distributor');assert.equal(d.custom[1].id,'distributor:custom-pune-tool-room-x');
 assert.deepEqual(Object.keys(d.notes),['distributor:digikey'],'notes of removed vendors without products go');
 assert.deepEqual(d.products.map(p=>[p.id,p.vendorId]),[['p1','distributor:custom-pune-tool-room-x'],['p2','pcb:custom-pune-circuits-z']]);
 assert.deepEqual(vendorOffersFor('SS14',d).map(o=>o.seller).sort(),['Pune Circuits','Pune Tool Room'],'the moved vendor still offers its products');
 assert.ok(vendorsOf(null,d).every(v=>VENDOR_KINDS.some(k=>k.id===v.kind)));
 assert.deepEqual(migrateVendorData(null),{custom:[],notes:{},products:[]});
 assert.deepEqual(migrateVendorData({custom:'x',notes:5,products:{}}),{custom:[],notes:{},products:[]});
});

test('migration: a housing material with no price leaves the stored total alone',()=>{
 mem.clear();
 const e={id:'s1',name:'Shelf',total:300,status:'quoted',revision:1,history:[],state:{rows:[],pcb:{material:'fr4'},box:{material:'ABS plastic',kind:'shelf',unit:null,tooling:null}}};
 assert.equal(lists.migrateList(e).total,300);
 assert.equal(lists.migrateList({...e,state:{...e.state,box:{material:'ABS plastic',kind:'shelf',unit:{v:40,c:'INR'}}}}).total,null);
});

test('open BOM: a demo left by the old tour gives way to the user\'s own BOM',()=>{
 mem.clear();
 localStorage.setItem(lists.BOM_STORE,JSON.stringify({demo:true,project:'Demo · Motor controller',rows:[{id:'d',mpn:'X'}]}));
 localStorage.setItem('semicobot-bom-backup-v1',JSON.stringify({project:'Mine',rows:[{id:'a',mpn:'LM358P'}]}));
 assert.equal(lists.settleOpenBom().project,'Mine');
 assert.equal(JSON.parse(localStorage.getItem(lists.BOM_STORE)).project,'Mine');
 assert.equal(localStorage.getItem('semicobot-bom-backup-v1'),null);
 mem.clear();localStorage.setItem(lists.BOM_STORE,JSON.stringify({demo:true,rows:[{id:'d'}]}));
 assert.equal(lists.settleOpenBom(),null,'no backup: no open BOM');
});

test('open BOM: unsaved work is detected, opening the same list keeps its edits, and a job is linked without a new revision',()=>{
 mem.clear();
 assert.equal(lists.unsavedBom(),null,'nothing open');
 const st={project:'Widget',customer:'Orion',boards:10,rows:[{id:'a',mpn:'LM358P',qty:2}],pcb:{material:'fr4'}};
 localStorage.setItem(lists.BOM_STORE,JSON.stringify(st));
 assert.equal(lists.unsavedBom(),'Widget','lines with no list are unsaved work');
 const {entry}=lists.saveList(st,{customerTotal:100});
 localStorage.setItem(lists.BOM_STORE,JSON.stringify({...st,listId:entry.id}));
 assert.equal(lists.unsavedBom(),null,'just saved: nothing to lose');
 const edited={...st,listId:entry.id,rows:[{id:'a',mpn:'LM358P',qty:5}]};
 localStorage.setItem(lists.BOM_STORE,JSON.stringify(edited));
 assert.equal(lists.unsavedBom(),'Widget');
 assert.ok(lists.openList(entry.id));
 assert.equal(JSON.parse(localStorage.getItem(lists.BOM_STORE)).rows[0].qty,5,'reopening the open list keeps the edits');
 const linked=lists.setListJob(entry.id,'job-1');
 assert.equal(linked.jobId,'job-1');assert.equal(linked.status,'ordered');assert.equal(linked.revision,1,'no extra revision');
 const before=localStorage.getItem(lists.BOM_STORE);
 assert.ok(lists.startBomFor('board-9'));
 assert.equal(localStorage.getItem(lists.BOM_STORE),before,'the open BOM is left for the BOM tool to put aside');assert.equal(localStorage.getItem(lists.BOM_START),'board-9');
});

test('one BOM per board: switching boards puts work aside as a draft and brings it back; else the newest list',()=>{
 mem.clear();
 assert.equal(lists.bomForBoard('b1'),null,'nothing for a new board: start from the board');
 assert.equal(lists.stashDraft('b1',{rows:[]}),false,'an empty BOM is not kept');
 assert.ok(lists.stashDraft('b1',{project:'Widget',fromBoard:'b1',rows:[{id:'a',mpn:'LM358P',qty:3}],box:{material:'ABS'}}));
 const got=lists.bomForBoard('b1');
 assert.equal(got.from,'draft');assert.equal(got.state.rows[0].qty,3);assert.ok(!('box' in got.state)&&!('stashedAt' in got.state));
 assert.equal(lists.bomForBoard('b1'),null,'a draft is taken once');
 const {entry:old}=lists.saveList({project:'Sensor',fromBoard:'b2',rows:[{id:'x',mpn:'SS14',qty:1}]},{});
 const {entry:newer}=lists.saveList({project:'Sensor v2',fromBoard:'b2',rows:[{id:'y',mpn:'SS14',qty:2}]},{});
 const l=lists.bomForBoard('b2');
 assert.equal(l.from,'list');assert.equal(l.state.listId,newer.id);assert.equal(lists.listForBoard('b2').id,newer.id);assert.equal(lists.listBoard(old.id),'b2');
 assert.ok(lists.openList(old.id));assert.equal(JSON.parse(localStorage.getItem(lists.BOM_STORE)).followed,'b2','an opened list belongs to its board');
 for(let i=0;i<14;i++)lists.stashDraft('d'+i,{project:'P'+i},new Date(Date.UTC(2026,0,1+i)).toISOString());
 assert.equal(Object.keys(lists.loadDrafts()).length,12,'only the newest drafts are kept');assert.ok(!('d0' in lists.loadDrafts()));
});
