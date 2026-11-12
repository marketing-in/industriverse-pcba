import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanDetails,numberOf,setDetails,detailsOf,detailLine,footprint,stationName,machineRowsFromTable,importMachineList,machineListTemplate} from '../src/machines.js';
import {handleApi,machineFromSnippets} from '../api.mjs';

const floor=()=>({machines:[{id:'line-a',name:'SMT line 1',kind:'SMT line',status:'idle',job:null,stations:['Loader','Printer','Pick & place','Reflow','AOI']},{id:'m-w',name:'Wave solder 1',kind:'Wave solder',status:'idle',job:null}],jobs:[]});

test('machine details are cleaned: numbers, years and lengths in range, text trimmed',()=>{
 assert.deepEqual(cleanDetails({maker:'  Yamaha ',model:'YSM20R',year:'2019',introduced:'1890',length:'1,280 mm',width:'1690',height:'14500000',weight:'1.950,5',speed:'95,000 CPH',junk:'x'}),
  {maker:'Yamaha',model:'YSM20R',year:2019,length:1280,width:1690,weight:1950.5,speed:'95,000 CPH'});
 assert.equal(cleanDetails({maker:'',year:'abc'}),null,'nothing usable → no details');
 assert.equal(numberOf('1,250'),1250);assert.equal(numberOf('1.250,5'),1250.5);assert.equal(numberOf('12.5'),12.5);assert.equal(numberOf(''),null);
 const d={maker:'DEK',model:'Horizon 03iX',year:2016,length:1350,width:1240,height:1550};
 assert.equal(detailLine(d),'DEK Horizon 03iX · 2016');assert.equal(footprint(d),'1,350 × 1,240 × 1,550 mm');
 assert.deepEqual(cleanDetails({model:'X',source:{kind:'web',urls:['https://a.example/x','javascript:alert(1)']}}).source.urls,['https://a.example/x'],'only https sources');
});

test('details are kept per machine, and per station on a line',()=>{
 let s=setDetails(floor(),'line-a','Printer',{maker:'DEK',model:'Horizon 03iX',year:2016});
 s=setDetails(s,'m-w',null,{maker:'ERSA',model:'POWERFLOW e N2'});
 assert.equal(detailsOf(s.machines[0],'Printer').model,'Horizon 03iX');assert.equal(detailsOf(s.machines[0],'Reflow'),null);
 assert.equal(detailsOf(s.machines[1]).maker,'ERSA');
 s=setDetails(s,'line-a','Printer',null);assert.deepEqual(s.machines[0].equipment,{},'cleared');
 assert.equal(stationName('Stencil printer'),'Printer');assert.equal(stationName('chip shooter'),'Pick & place');assert.equal(stationName('Reflow oven'),'Reflow');assert.equal(stationName('Glue dispenser'),'Glue dispenser');
});

test('a machine list fills lines and machines, adds stations, creates the rest, and never wipes with blanks',()=>{
 const table=machineListTemplate().trim().split('\n').map(l=>l.split(','));
 table.push(['SMT line 1','X-ray','SMT line','Nordson','Quadra 7','','2021','','','','','','','']);
 table.push(['SMT line 2','Printer','SMT line','ASM','DEK TQ','','2022','','','','','','','']);
 table.push(['Coating cell','','Conformal coating','PVA','Delta 8','','','','','','','','','']);
 let r=importMachineList(floor(),machineRowsFromTable(table));
 const line=r.state.machines.find(m=>m.name==='SMT line 1');
 assert.deepEqual(Object.keys(line.equipment).sort(),['Pick & place','Printer','Reflow','X-ray']);assert.ok(line.stations.includes('X-ray'),'missing station added');
 assert.equal(line.equipment['Pick & place'].speed,'95000 CPH');assert.equal(line.equipment.Printer.source.kind,'file');
 const line2=r.state.machines.find(m=>m.name==='SMT line 2');assert.equal(line2.kind,'SMT line');assert.deepEqual(line2.stations,['Printer']);
 assert.equal(r.state.machines.find(m=>m.name==='Coating cell').kind,'Conformal coating');
 assert.equal(r.state.machines.find(m=>m.name==='Wave solder 1').details.maker,'ERSA');
 assert.equal(r.created,2);
 // A later list with a blank year keeps the year already known.
 r=importMachineList(r.state,machineRowsFromTable([['Line','Station','Model','Year'],['SMT line 1','Printer','Horizon 03iX VectorGuard','']]));
 const p=r.state.machines.find(m=>m.name==='SMT line 1').equipment.Printer;assert.equal(p.model,'Horizon 03iX VectorGuard');assert.equal(p.year,2016);
 assert.throws(()=>machineRowsFromTable([['Maker','Model'],['Yamaha','YSM20R']]),/Line" or "Machine" column/);
 // Dimensions in one column.
 const rows=machineRowsFromTable([['Machine','Dimensions (mm)','Weight'],['Wave solder 1','4800 x 1600 x 1700','1800 kg']]);
 r=importMachineList(floor(),rows);const w=r.state.machines.find(m=>m.name==='Wave solder 1').details;assert.deepEqual([w.length,w.width,w.height,w.weight],[4800,1600,1700,1800]);
});

test('machine lookup: search snippets without Gemini; Gemini values only with real sources and sane numbers',async()=>{
 assert.equal((await handleApi(new Request('http://x/api/machineinfo?model=Y'))).status,400);
 assert.equal((await handleApi(new Request('http://x/api/machineinfo?maker=A&model=Unique1'),{})).status,503,'no search key');
 const s=machineFromSnippets([{title:'Spec',link:'https://a.example/1',snippet:'Machine dimensions 5.0 m x 1.37 m x 1.6 m, weight approx. 2,200 kg'}]);
 assert.deepEqual([s.found.lengthMm,s.found.widthMm,s.found.heightMm,s.found.weightKg],[5000,1370,1600,2200]);
 const serp={organic_results:[{title:'Heller 1913 MK5',link:'https://heller.example/1913',snippet:'13 heated zones, 5,000 x 1,370 x 1,600 mm'},{title:'insecure',link:'http://bad.example/',snippet:''}]};
 const gem={lengthMm:5000,widthMm:1370,heightMm:160000,weightKg:2200,introduced:2012,maker:'Heller',model:'1913 MK5',kind:'reflow oven',power:'',speed:'',notes:'13 zones',
  sources:[{field:'lengthMm',url:'https://heller.example/1913'},{field:'weightKg',url:'https://made-up.example/'}]};
 let calls=0;const fetcher=async(u)=>{u=String(u);calls++;if(u.includes('serpapi'))return new Response(JSON.stringify(serp));
  if(u.includes('generativelanguage'))return new Response(JSON.stringify({model:'gemini-test',steps:[{type:'model_output',content:[{text:JSON.stringify(gem)}]}]}));return new Response('',{status:404})};
 const r=await handleApi(new Request('http://x/api/machineinfo?maker=Heller&model=1913%20MK5'),{SERPAPI_KEY:'k',GEMINI_API_KEY:'g'},fetcher);const j=await r.json();
 assert.equal(r.status,200);assert.equal(j.via,'gemini');
 assert.equal(j.found.length,5000);assert.equal(j.found.height,undefined,'160 m tall is dropped');assert.equal(j.found.introduced,2012);assert.equal(j.found.notes,'13 zones');
 assert.equal(j.from.length,'https://heller.example/1913');assert.equal(j.from.weight,undefined,'a source that was not in the results is dropped');
 assert.deepEqual(j.sources.map(x=>x.url),['https://heller.example/1913'],'only https results');
 const again=await handleApi(new Request('http://x/api/machineinfo?maker=Heller&model=1913%20MK5'),{SERPAPI_KEY:'k',GEMINI_API_KEY:'g'},fetcher);assert.equal((await again.json()).cached,true);assert.equal(calls,2,'second lookup served from the cache');
});
