import test from 'node:test';
import assert from 'node:assert/strict';
import {pasteAnalysis,pinAnalysis,consumables,dnpRefs,setupOf,PASTE_DENSITY} from '../src/analysis.js';
import {referenceBoard} from '../src/data.js';
import {rowsFromTable,rowCost,quoteTotals} from '../src/bom.js';
import {parseBomText} from '../src/bomFile.js';
import {compareRevisions,revLetter} from '../src/savedLists.js';
import {seedProduction,estimateJob,setCalendar,calendarOf,nextWorkday,addWorkdays,moveJobToLine,moveJobStart,setMasked,remaskCount,groupBySetup,changeovers,jobFromOrder} from '../src/production.js';

const parts=referenceBoard.parts;
test('solder paste per board, per job and in jars, as in the requirements PDF',()=>{
 const p=pasteAnalysis(parts,{},{boards:100});
 assert.equal(p.sides.length,1);assert.equal(p.sides[0].stencilMm,.12);assert.equal(p.sides[0].apertures,140);
 assert.equal(Math.round(p.perBoard*1000),86,'0.086 g per board');assert.equal(PASTE_DENSITY,4.36);
 assert.equal(Math.round(p.perJob*10)/10,10.3,'100 boards + 20 % losses');assert.equal(p.jars,1);
 const pip=pasteAnalysis(parts,{pip:{on:true}},{boards:1});assert.equal(Math.round(pip.pinMm3*100)/100,1.8,'1.8 mm³ per pin-in-paste pin');assert.equal(pip.tht,6);assert.equal(Math.round(pip.perBoard*1000),133);
 const wide=pasteAnalysis(parts,{overprintPct:20},{boards:1});assert.ok(wide.perBoard>p.perBoard*1.15,'overprint adds paste');
 const heat=pasteAnalysis(parts,{thermal:[{w:20,h:20,bondMm:.1,count:1}],adhesive:{dots:40,dotMm3:.05}},{boards:1});
 assert.equal(Math.round(heat.thermalGrams*100)/100,.1);assert.equal(Math.round(heat.adhesiveGrams*1000),7);
});

test('DNP parts leave paste, pins, buying and the quote',()=>{
 const rows=[{id:'a',mpn:'GRM',refs:['C1','C2'],qty:2,dnp:true},{id:'b',mpn:'STM32',refs:['U1'],qty:1}];
 const dnp=dnpRefs(rows,parts);assert.deepEqual([...dnp].sort(),['C1','C2']);
 assert.ok(pasteAnalysis(parts,{},{dnp}).perBoard<pasteAnalysis(parts,{}).perBoard);
 const pins=pinAnalysis(parts,rows,{dnp});assert.equal(pins.dnp,2);assert.equal(pins.fitted,parts.length-2);assert.equal(pins.joints,pins.pins);assert.equal(pins.lines[0].dnp,true);
 assert.equal(rowCost(rows[0],{boards:50}).need,0,'a DNP line is never bought');assert.equal(rowCost(rows[1],{boards:50}).need,50);
 const t=rowsFromTable([['Designator','MPN','Qty','Fitted'],['R1','RC0402','1','yes'],['R2','RC0402B','1','No'],['C9','DNP','1','']]);
 assert.deepEqual(t.map(r=>!!r.dnp),[false,true,true]);
 const m=parseBomText('Designator,MPN,DNP\nR1,RC1,\nR2,RC2,x\n');assert.equal(m.get('R1').dnp,undefined);assert.equal(m.get('R2').dnp,true);
});

test('consumables per board and per job, and into the quotation',()=>{
 const p=pasteAnalysis(parts,{},{boards:100}),pins=pinAnalysis(parts,[]),c=consumables(p,pins,{},{board:referenceBoard,boards:100});
 const paste=c.rows.find(r=>r.key==='paste');assert.ok(Math.abs(paste.qty-p.perBoard*1.2)<1e-9);assert.equal(c.rows.find(r=>r.key==='stencil').per,'job');
 assert.ok(Math.abs(c.jobUsd-(c.perBoardUsd*100+c.fixedUsd))<1e-9);
 const off=consumables(p,pins,{consumables:{esd:{on:false},stencil:{qty:2}}},{board:referenceBoard,boards:100});
 assert.equal(off.rows.find(r=>r.key==='esd').costUsd,0);assert.equal(off.rows.find(r=>r.key==='stencil').qty,2);
 const coat=consumables(p,pins,{coating:{on:true,filmUm:50}},{board:referenceBoard,boards:1});assert.ok(coat.rows.find(r=>r.key==='coating').qty>0);assert.ok(coat.keepouts>=0);
 const base=quoteTotals([],{boards:100}),withC=quoteTotals([],{boards:100,consumables:{on:true,cost:c.jobUsd,margin:10}});
 assert.equal(withC.consumablesCost,c.jobUsd);assert.ok(withC.customerTotal>base.customerTotal);assert.equal(quoteTotals([],{boards:100,consumables:{on:false,cost:99}}).consumablesCost,0);
 assert.deepEqual(setupOf(p),{stencilUm:120,stepUpUm:null,sides:1,paste:'SAC305 T4',key:'120|1|'});
});

test('BOM revisions: letters and what changed',()=>{
 assert.deepEqual([1,2,26,27,28].map(revLetter),['A','B','Z','AA','AB']);
 const a={boards:100,total:500,rows:[{mpn:'R1',qty:4,dnp:false,refs:['R1','R2','R3','R4']},{mpn:'U1',qty:1,dnp:false,refs:['U1']}]};
 const b={boards:200,total:900,rows:[{mpn:'R1',qty:3,dnp:false,refs:['R1','R2','R3']},{mpn:'C9',qty:1,dnp:true,refs:['C9']}]};
 const d=compareRevisions(a,b);assert.deepEqual(d.added.map(r=>r.mpn),['C9']);assert.deepEqual(d.removed.map(r=>r.mpn),['U1']);
 assert.deepEqual(d.changed,[{mpn:'R1',what:['qty 4 → 3','−R4']}]);assert.deepEqual(d.boards,[100,200]);
});

test('shift calendar, masking, setup grouping and moving jobs',()=>{
 const cal={shifts:2,hoursPerShift:8,workdays:[1,2,3,4,5,6]};
 assert.equal(nextWorkday('2026-11-15',cal),'2026-11-16','Sunday → Monday');assert.equal(addWorkdays('2026-11-13',3,cal),'2026-11-17');assert.equal(addWorkdays('2026-11-13',3),'2026-11-16');
 const st=seedProduction('2026-11-12'),before=estimateJob(st.machines,st.jobs,{qty:1000,components:60,calendar:calendarOf(st)},'2026-11-12');
 const s2=setCalendar(st,cal,'2026-11-12'),after=estimateJob(s2.machines,s2.jobs,{qty:1000,components:60,calendar:calendarOf(s2)},'2026-11-12');
 assert.ok(after.days<before.days,'two shifts finish sooner');assert.ok(s2.jobs.filter(j=>j.finished).every(j=>j.shifts===1),'history keeps the shifts it ran on');
 // An order with a coating and a setup becomes a job that masks and can be grouped.
 const r=jobFromOrder(s2,{customer:'A',board:'B',qty:200,components:40,setup:{key:'120|1|',stencilUm:120,sides:1},coating:{keepouts:3}},'2026-11-12');
 assert.equal(r.job.coating.keepouts,3);assert.equal(r.job.setup.stencilUm,120);
 let s3=setMasked(r.state,r.job.id,true,'2026-11-12');assert.equal(s3.jobs.find(j=>j.id===r.job.id).coating.masked,'2026-11-12');
 assert.equal(remaskCount({coating:{},rework:{qa:2,testing:1}}),3);assert.equal(remaskCount({rework:{qa:2}}),0);
 const jobs=[{setup:{key:'a'}},{setup:{key:'b'}},{setup:{key:'a'}},{}];assert.equal(changeovers(jobs),2);assert.equal(changeovers(groupBySetup(jobs)),1);
 // Move a running job to a free line.
 const line=s3.machines.find(m=>m.kind==='SMT line'&&m.job),free=s3.machines.find(m=>m.kind==='SMT line'&&!m.job&&m.status!=='maintenance');
 if(line&&free){const s4=moveJobToLine(s3,line.job,free.id,'2026-11-12');assert.equal(s4.machines.find(m=>m.id===free.id).job,line.job);assert.equal(s4.machines.find(m=>m.id===line.id).status,'idle')}
 const q={...r.state,jobs:r.state.jobs.map(j=>j.id===r.job.id?{...j,started:'2026-11-20',expected:'2026-11-25'}:j)};
 const moved=moveJobStart(q,r.job.id,'2026-11-23','2026-11-12').jobs.find(j=>j.id===r.job.id);assert.equal(moved.started,'2026-11-23');assert.ok(moved.expected>'2026-11-25');
});
