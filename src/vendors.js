// Vendor registry: every kind of company the business buys from or works with, in one list.
// The built-in entries are public companies with their own websites; what each one can do for a
// given job (capacity, prices, lead times) is never assumed and is filled in by the user per vendor.
// User-added vendors and per-vendor notes are kept in the browser (VENDOR_STORE).

export const VENDOR_KINDS=[
 {id:'semiconductor',label:'Semiconductor makers',short:'Semiconductor',about:'Manufacturers of diodes, transistors, ICs and power devices.'},
 {id:'distributor',label:'Distributors',short:'Distributor',about:'Authorised distributors. Those with an API key on the server price BOM lines live.'},
 {id:'passive',label:'Passive and electromechanical makers',short:'Passive',about:'Resistors, capacitors, inductors, connectors, relays and switches.'},
 {id:'pcb',label:'PCB fabricators',short:'PCB',about:'Bare board fabrication from Gerber files.'},
 {id:'testlab',label:'Test and certification labs',short:'Test lab',about:'Safety, EMC and compliance testing.'},
 {id:'logistics',label:'Logistics',short:'Logistics',about:'Couriers and freight for inbound parts and customer delivery.'}];

const v=(kind,name,url,about,extra={})=>({id:kind+':'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind,name,url,about,builtIn:true,...extra});

export const VENDORS=[
 v('semiconductor','Texas Instruments','https://www.ti.com','Analog, power management, MCUs, interface and logic.'),
 v('semiconductor','STMicroelectronics','https://www.st.com','STM32 MCUs, power discretes, sensors and analog.'),
 v('semiconductor','Infineon','https://www.infineon.com','Power MOSFETs, IGBTs, gate drivers and MCUs.'),
 v('semiconductor','NXP','https://www.nxp.com','MCUs, processors, interface and automotive ICs.'),
 v('semiconductor','onsemi','https://www.onsemi.com','Power discretes, SiC devices, sensors and analog.'),
 v('semiconductor','Microchip','https://www.microchip.com','PIC and AVR MCUs, FPGAs, memory and analog.'),
 v('semiconductor','Renesas','https://www.renesas.com','MCUs, power and timing ICs.'),
 v('semiconductor','Analog Devices','https://www.analog.com','Data converters, amplifiers, power and RF.'),
 v('semiconductor','Nexperia','https://www.nexperia.com','Diodes, small-signal transistors, MOSFETs and logic.'),
 v('semiconductor','ROHM','https://www.rohm.com','Discretes, SiC power, power ICs and resistors.'),
 v('semiconductor','Diodes Incorporated','https://www.diodes.com','Diodes, rectifiers, MOSFETs and analog.'),
 v('semiconductor','Toshiba','https://toshiba.semicon-storage.com','Power devices, optocouplers and motor drivers.'),
 v('semiconductor','Vishay','https://www.vishay.com','Diodes, MOSFETs, optoelectronics and passives.'),
 v('semiconductor','Littelfuse','https://www.littelfuse.com','Circuit protection, TVS diodes and power semiconductors.'),
 v('distributor','DigiKey','https://www.digikey.com','Authorised distributor, Product Information API v4.',{api:'digikey'}),
 v('distributor','Mouser','https://www.mouser.com','Authorised distributor, Search API.',{api:'mouser'}),
 v('distributor','Nexar / Octopart','https://octopart.com','Multi-distributor stock and pricing through the Nexar Supply API.',{api:'nexar'}),
 v('distributor','TME','https://www.tme.eu','Authorised distributor, TME API.',{api:'tme'}),
 v('distributor','Master Electronics','https://www.masterelectronics.com','Authorised distributor; search endpoint from the account manager.',{api:'master'}),
 v('distributor','Arrow','https://www.arrow.com','Authorised distributor.'),
 v('distributor','Avnet','https://www.avnet.com','Authorised distributor.'),
 v('distributor','Farnell / element14','https://www.farnell.com','Authorised distributor.'),
 v('distributor','RS Components','https://www.rs-online.com','Authorised distributor.'),
 v('distributor','LCSC','https://www.lcsc.com','Component distributor linked to JLCPCB assembly.'),
 v('passive','Murata','https://www.murata.com','MLCCs, inductors, EMI filters and modules.'),
 v('passive','TDK','https://www.tdk.com','Capacitors, inductors, ferrites and sensors.'),
 v('passive','Yageo','https://www.yageo.com','Chip resistors and MLCCs; KEMET is part of the group.'),
 v('passive','Samsung Electro-Mechanics','https://www.samsungsem.com','MLCCs and inductors.'),
 v('passive','KEMET','https://www.kemet.com','Tantalum, ceramic and film capacitors.'),
 v('passive','Panasonic Industry','https://industry.panasonic.com','Capacitors, resistors, relays and switches.'),
 v('passive','Bourns','https://www.bourns.com','Resistors, inductors, circuit protection and trimmers.'),
 v('passive','Würth Elektronik','https://www.we-online.com','Inductors, EMC components, connectors and capacitors.'),
 v('passive','TE Connectivity','https://www.te.com','Connectors, relays and sensors.'),
 v('passive','Molex','https://www.molex.com','Connectors and cable assemblies.'),
 v('passive','Amphenol','https://www.amphenol.com','Connectors and interconnect.'),
 v('passive','JST','https://www.jst.com','Wire-to-board connectors.'),
 v('passive','Hirose','https://www.hirose.com','Board-to-board, FPC and RF connectors.'),
 v('passive','Phoenix Contact','https://www.phoenixcontact.com','Terminal blocks, connectors and DIN-rail housings.'),
 v('passive','Omron','https://components.omron.com','Relays, switches and sensors.'),
 v('pcb','JLCPCB','https://jlcpcb.com/quote','Prototype and production PCB fabrication.'),
 v('pcb','PCBWay','https://www.pcbway.com/orderonline.aspx','PCB fabrication and specialty materials.'),
 v('pcb','Eurocircuits','https://www.eurocircuits.com/pcb-price-calculator/','Prototype and small-series PCB fabrication.'),
 v('pcb','Seeed Fusion','https://www.seeedstudio.com/fusion_pcb.html','PCB fabrication and assembly quotes.'),
 v('pcb','Sierra Circuits','https://www.protoexpress.com','Quick-turn and HDI PCB fabrication.'),
 v('pcb','Advanced Circuits','https://www.4pcb.com','Prototype and production PCB fabrication.'),
 v('pcb','AT&S','https://ats.net','High-end and HDI PCB and substrate production.'),
 v('testlab','UL Solutions','https://www.ul.com','Safety testing and certification.'),
 v('testlab','TÜV SÜD','https://www.tuvsud.com','Testing, inspection and certification.'),
 v('testlab','TÜV Rheinland','https://www.tuv.com','Testing, inspection and certification.'),
 v('testlab','Intertek','https://www.intertek.com','Product testing and certification.'),
 v('testlab','SGS','https://www.sgs.com','Testing, inspection and certification.'),
 v('testlab','Bureau Veritas','https://www.bureauveritas.com','Testing, inspection and certification.'),
 v('testlab','DEKRA','https://www.dekra.com','Testing, inspection and certification.'),
 v('logistics','DHL Express','https://www.dhl.com','International express courier.'),
 v('logistics','FedEx','https://www.fedex.com','International express courier.'),
 v('logistics','UPS','https://www.ups.com','International courier and freight.'),
 v('logistics','Blue Dart','https://www.bluedart.com','Express courier in India.'),
 v('logistics','Delhivery','https://www.delhivery.com','Courier and freight in India.')];

// Capability fields the user fills per vendor kind; unfilled fields show as not confirmed.
export const CAPABILITY_FIELDS={
 pcb:[['layers','Layers','1–8'],['minTrace','Smallest track / gap','0.1 mm'],['leadDays','Build time (days)','5'],['certs','Certifications','ISO 9001, IPC-6012']],
 testlab:[['standards','Standards','IEC 62368-1, CISPR 32'],['leadDays','Lead time (days)','20']],
 logistics:[['services','Services','express, economy, freight'],['regions','Regions','India, worldwide']],
 semiconductor:[['families','Families','MOSFETs, LDOs']],passive:[['families','Families','MLCC, chip resistors']],distributor:[['terms','Terms','net 30, MOQ']]};

export const VENDOR_STORE='semicobot-vendors-v1';
// Migration: vendor kinds that no longer exist (older versions also listed housing and tooling makers).
// A vendor of a removed kind that listed component part numbers keeps them: it moves to Distributors with its
// notes, so those products stay offers on BOM lines. A vendor of a removed kind with no products is dropped.
const kindOf=id=>String(id||'').split(':')[0];
const knownKind=kind=>VENDOR_KINDS.some(k=>k.id===kind);
const movedId=id=>'distributor:'+String(id).slice(String(id).indexOf(':')+1);
const titleOf=id=>String(id).slice(String(id).indexOf(':')+1).replace(/^custom-/,'').replace(/-[a-z0-9]{6,}$/,'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function migrateVendorData(d){
 const custom=Array.isArray(d?.custom)?d.custom.filter(Boolean):[],notes=d?.notes&&typeof d.notes==='object'?d.notes:{},products=Array.isArray(d?.products)?d.products.filter(Boolean):[];
 const keep=new Set(products.filter(p=>!knownKind(kindOf(p.vendorId))).map(p=>p.vendorId));
 if(!keep.size)return {custom:custom.filter(x=>knownKind(x.kind)),notes:Object.fromEntries(Object.entries(notes).filter(([id])=>knownKind(kindOf(id)))),products};
 const moved=[...keep].map(id=>{const own=custom.find(x=>x.id===id);return {...(own||{url:'',about:'',builtIn:false}),id:movedId(id),kind:'distributor',name:own?.name||notes[id]?.name||titleOf(id),builtIn:false}});
 const outNotes={};for(const [id,v] of Object.entries(notes)){if(knownKind(kindOf(id)))outNotes[id]=v;else if(keep.has(id))outNotes[movedId(id)]=v}
 return {custom:[...custom.filter(x=>knownKind(x.kind)),...moved],notes:outNotes,
  products:products.map(p=>keep.has(p.vendorId)?{...p,vendorId:movedId(p.vendorId)}:p)};
}
export function loadVendorData(){try{return migrateVendorData(JSON.parse(localStorage.getItem(VENDOR_STORE)))}catch{return {custom:[],notes:{},products:[]}}}
export function saveVendorData(data){try{localStorage.setItem(VENDOR_STORE,JSON.stringify(data));return true}catch{return false}}

// Every vendor of a kind (built-in first, then the user's own), with the user's notes and capability values merged in.
export function vendorsOf(kind,data=loadVendorData()){
 return [...VENDORS,...data.custom].filter(x=>!kind||x.kind===kind).map(x=>({...x,...(data.notes[x.id]||{})}));
}
export function addVendor(data,{kind,name,url='',about=''}){
 const clean=String(name||'').trim().slice(0,80);if(!clean||!VENDOR_KINDS.some(k=>k.id===kind))return data;
 const id=kind+':custom-'+clean.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now().toString(36);
 const link=/^https?:\/\//i.test(String(url).trim())?String(url).trim().slice(0,200):'';
 return {...data,custom:[...data.custom,{id,kind,name:clean,url:link,about:String(about).trim().slice(0,160),builtIn:false}]};
}
export function removeVendor(data,id){const notes={...data.notes};delete notes[id];return {...data,custom:data.custom.filter(x=>x.id!==id),notes,products:(data.products||[]).filter(p=>p.vendorId!==id)}}

// --- Vendor register: the products a vendor has --------------------------------------------------
// A vendor lists part numbers with stock, price, MOQ and lead time. The BOM tool finds them by part
// number and shows them as "Registered vendor" offers next to the distributor and marketplace offers.
const compact=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
export function addProduct(data,vendorId,p,now=new Date().toISOString()){
 const mpn=String(p.mpn||'').trim().slice(0,60);if(!mpn||!vendorId)return data;
 const n=v=>{const x=Number(v);return Number.isFinite(x)&&x>=0?x:null};
 const item={id:'prod-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),vendorId,mpn,manufacturer:String(p.manufacturer||'').trim().slice(0,60),description:String(p.description||'').trim().slice(0,120),
  stock:n(p.stock),price:n(p.price),currency:p.currency==='INR'?'INR':'USD',moq:n(p.moq),leadDays:n(p.leadDays),updatedAt:now};
 return {...data,products:[...(data.products||[]).filter(x=>!(x.vendorId===vendorId&&compact(x.mpn)===compact(mpn))),item]};
}
export function removeProduct(data,id){return {...data,products:(data.products||[]).filter(p=>p.id!==id)}}
export const productsOf=(data,vendorId)=>(data.products||[]).filter(p=>p.vendorId===vendorId);
// Offers in the BOM tool's shape for one part number; prices kept in USD at the given rate.
export function vendorOffersFor(mpn,data=loadVendorData(),inrPerUsd=90){
 const key=compact(mpn);if(!key)return [];const vendors=new Map(vendorsOf(null,data).map(v=>[v.id,v]));
 return (data.products||[]).filter(p=>compact(p.mpn)===key&&vendors.has(p.vendorId)).map(p=>{const v=vendors.get(p.vendorId);
  const usd=p.price==null?null:p.currency==='INR'?p.price/inrPerUsd:p.price;
  return {mpn:p.mpn,manufacturer:p.manufacturer||'',description:p.description||'',seller:v.name,source:'register',marketType:'registered',authorized:false,stock:p.stock,priceUsd:usd,breaksUsd:usd==null?[]:[{qty:Math.max(1,p.moq||1),price:usd}],moq:p.moq,leadDays:p.leadDays,url:v.url||null,contact:v.contact||null,dateCode:null,registeredAt:p.updatedAt}});
}
export function setVendorNote(data,id,patch){return {...data,notes:{...data.notes,[id]:{...(data.notes[id]||{}),...patch}}}}
// The [name, about, url] triples the BOM tool's vendor pickers take.
export const pickerList=kind=>vendorsOf(kind).map(x=>[x.name,x.about,x.url]);
