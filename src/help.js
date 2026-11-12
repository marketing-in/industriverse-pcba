// Help and tours: what every page does, how to use it, and short guided tours that point at the real
// controls. Plain data, so the tests can check that every page has help and every step has a target.
// A step's target is a list of selectors; the first one on the page is spotlit. A step without a page
// stays on the page that is open.
import {LINES,HOME,PAGES} from './brand.jsx';

export const PAGE_HELP={
 [HOME]:{what:'The three lines and what is waiting to cross from one to the next. Every number is real and opens the page it counts.',
  how:['Add files to start with a board of your own, or load sample data to try everything first.','Start a BOM for a board that has no priced list.','Open a quotation that is ready to continue to production.']},
 'Board studio':{what:'Open a customer board and check it in 2D and 3D.',
  how:['Import blueprint reads a Gerber ZIP, .kicad_pcb, pick-and-place .pos, ibom.html, a PDF or a picture.','Switch between 2D and 3D, then click a component to see its part, package and stock.','Import BOM links part numbers to the board when the CAD files have none.','The board you add or pick becomes the selected board on every line.']},
 'Board types':{what:'A library of common board types and the supporting parts each one needs.',
  how:['Search by name or filter by category.','The best match for the selected board is shown first.']},
 'BOM tool':{what:'Turn the selected board into a priced bill of materials and a quotation, in four steps.',
  how:['Bare PCB: drop the Gerber ZIP; size, layers and finish are read from it, then set the quantity.','Components: lines come from the board or from an Excel or CSV BOM. Get prices checks own stock, authorised distributors, registered vendors, then the open market.','Analysis (optional): risks, lead times and alternates.','Quotation: margin, currency and PDF. Save list, then Continue to production.']},
 'Saved lists':{what:'Every BOM you saved, with its revisions and status.',
  how:['Filter by Draft, Quoted, Ordered or Archived.','Open a list to keep working on it in the BOM tool; its board is selected on every line.','Compare two revisions to see what changed.']},
 'Part master':{what:'Reference data for the parts you buy: description, package, specs, use and alternates.',
  how:['Search by part number, value or package.','Import an Excel file of part details to add your own.']},
 'Inventory':{what:'Your own stock: quantities, minimums, locations and prices.',
  how:['Needs attention shows parts below minimum, out of stock or at end of life.','Add a component, import from Excel or export to Excel.','Completed boards take their parts out of stock by themselves.']},
 'Purchases':{what:'Purchase orders, received stock, and what was spent and earned.',
  how:['Record a purchase, then Mark received to add the parts to inventory.','By month and By job show spend against income.','Stock moves lists every change to inventory.']},
 'Vendors':{what:'The suppliers you buy from, with their contacts and the products they offer.',
  how:['Register a vendor and the products it sells.','Registered vendor prices are checked after authorised distributors.']},
 'Production':{what:'Jobs on the floor through twelve stages and their quality gates.',
  how:['A quoted list becomes a job from its quotation (Continue to production), or fill in a New request here.','Each job shows its stage, state lamp and gates: Pass gate, Hold, Rework or Move job.','Only the selected board filters the jobs to that board.','Set shifts and working days in the shift calendar.']},
 'SMT line':{what:'The selected board running through your SMT line in 3D, station by station.',
  how:['The line is built from the stations set up in Machines; the standard seven-station line is shown until then.','Click a machine to see its maker, model, year and size.']},
 'Machines':{what:'Your factory floor: SMT lines with their stations, and every other machine.',
  how:['Create line names an SMT line and the stations it has, in order.','Add machine adds wave solder, test, coating and other equipment.','Details holds each machine’s maker, model, year and size; import them from Excel.']},
 'Dispatch':{what:'Boards in production, completed, ready and dispatched, per job.',
  how:['Mark boards completed or dispatched as they leave the floor.','Completed boards take their components out of inventory.']},
};

export const SHORTCUTS=[['Ctrl K or ⌘K','Search and jump to any page, part number, list or board'],['?','Open Help'],['Esc','Close Help, a dialog or the tour'],['Left and right arrow keys','Back and next in a tour']];

// Tours: one for the whole flow, one per line. Each stays at seven steps or fewer.
export const TOURS=[
 {id:'flow',title:'From board to shipped job',about:'The three lines and how one board travels through them.',steps:[
  {page:HOME,target:['.sidebar nav[aria-label="Lines"]'],title:'Three lines',body:'Engineering prepares the board, Supply prices and buys it, Production builds and ships it. The rail opens any line.'},
  {page:HOME,target:['.hub'],title:'Home',body:'What is on each line now, and what is waiting to cross to the next one. Every number opens the page it counts.'},
  {page:'Board studio',target:['.page-heading .heading-actions','.studio-layout'],title:'Start with a board',body:'Import blueprint reads a Gerber ZIP, KiCad board, pick-and-place file, PDF or picture. The board becomes the selected board on every line.'},
  {page:'BOM tool',target:['.page-heading .board-select'],title:'One selected board',body:'Pick another board here, or on any page, and the BOM tool, the SMT line and Jobs all switch to it. Your BOM for each board is kept.'},
  {page:'BOM tool',target:['nav[aria-label="BOM workflow"]'],title:'Price it in four steps',body:'Bare PCB, Components, Analysis and Quotation. Save the list, then continue it to production from the quotation.'},
  {page:'Production',target:['section[aria-label="Jobs on the floor"]','section[aria-label="New request"]'],title:'Build and ship',body:'The job follows twelve stages with quality gates, on your SMT lines, until Dispatch.'},
  {page:null,target:['.topbar .help-open'],title:'Help is always here',body:'Open Help for every page and the other tours. Ctrl\u00a0K searches pages, part numbers, lists and boards.'},
 ]},
 {id:'engineering',line:'engineering',title:'Engineering',about:'Bring in a board and check it.',steps:[
  {page:'Board studio',target:['.page-heading .heading-actions'],title:'Import a board',body:'Import blueprint for Gerber, KiCad, pick-and-place, PDF or picture files. Import BOM adds part numbers the CAD files did not have.'},
  {page:'Board studio',target:['.studio-layout .board-panel'],title:'2D and 3D',body:'Switch the view, turn the board and click any component. The board picker above chooses the selected board.'},
  {page:'Board studio',target:['.studio-layout .board-list'],title:'Inspect a component',body:'The inspector shows the part, its package and whether it is in stock. Add part model attaches a GLB.'},
  {page:'Board studio',target:['section[aria-label="Board knowledge"]','.studio-layout'],title:'Board knowledge',body:'The likely board type and the supporting parts each chip still needs.'},
  {page:'Board types',target:['.btype-filters','main'],title:'Board types',body:'The library behind board knowledge. Search it or filter by category.'},
 ]},
 {id:'supply',line:'supply',title:'Supply',about:'From a board to a priced quotation and stock.',steps:[
  {page:'BOM tool',target:['nav[aria-label="BOM workflow"]'],title:'The BOM tool',body:'Four steps for the bare PCB and its components. The selected board fills it; an Excel or CSV BOM works too.'},
  {page:'BOM tool',target:['section[aria-label="Bare PCB setup"]','section[aria-label="Components"]','.bom-workflow'],title:'Bare PCB',body:'Drop the Gerber ZIP: size, layers and finish are read from it. Set the quantity and the price is estimated.'},
  {page:'Saved lists',target:['section[aria-label="Saved lists"]','.saved-lists'],title:'Saved lists',body:'Every saved BOM with its revisions. Open one to keep working, or compare two revisions.'},
  {page:'Part master',target:['section[aria-label="Part master"]'],title:'Part master',body:'Descriptions, packages, specs and alternates for the parts you buy.'},
  {page:'Inventory',target:['.inventory-panel','main'],title:'Inventory',body:'Your own stock comes first when a BOM is priced. Needs attention lists what is low or out.'},
  {page:'Purchases',target:['.purchases-page'],title:'Purchases',body:'Record a purchase and mark it received to add the parts to stock. See spend and income by month and by job.'},
  {page:'Vendors',target:['.vendors-page'],title:'Vendors',body:'Register the suppliers you buy from and the products each one offers.'},
 ]},
 {id:'production',line:'production',title:'Production',about:'Jobs, the factory floor and dispatch.',steps:[
  {page:'Production',target:['section[aria-label="New request"]'],title:'New request',body:'A job comes from a quoted list, or from a request here. The selected board fills the board and its component count.'},
  {page:'Production',target:['section[aria-label="Jobs on the floor"]'],title:'Jobs on the floor',body:'Twelve stages in five groups, with gates. Each lamp says Running, Hold, Rework, Stopped, Queued or Done.'},
  {page:'SMT line',target:['.line-panel'],title:'SMT line in 3D',body:'The selected board through your own line, station by station. Click a machine for its details.'},
  {page:'Machines',target:['form[aria-label="Create line"]','main'],title:'Machines',body:'Create your SMT lines with their stations, add the other machines, and keep each one’s details.'},
  {page:'Dispatch',target:['.board-flow','main'],title:'Dispatch',body:'Boards in production, completed, ready and dispatched. Completed boards take their parts out of stock.'},
 ]},
];
export const tourById=id=>TOURS.find(t=>t.id===id)||null;

// Help search: page names, what they do, how-to lines and line names.
export function helpEntries(){
 return [{leaf:HOME,label:'Home',line:null},...PAGES.map(p=>({leaf:p.leaf,label:p.label,line:p.line}))].map(e=>({...e,...PAGE_HELP[e.leaf]}));
}
export function searchHelp(q){
 const words=String(q||'').toLowerCase().split(/\s+/).filter(Boolean),all=helpEntries();
 if(!words.length)return all;
 const lineName=id=>LINES.find(l=>l.id===id)?.label||'';
 return all.filter(e=>{const hay=[e.label,lineName(e.line),e.what,...(e.how||[])].join(' ').toLowerCase();return words.every(w=>hay.includes(w))});
}

// Which tours a person has finished or closed, per account, so a shared browser keeps them apart.
export const TOURS_KEY='semicobot-tours-v1';
const keyFor=user=>TOURS_KEY+':'+(user?.email||user?.id||'local');
export function loadTourState(user){try{const v=JSON.parse(localStorage.getItem(keyFor(user)));return v&&typeof v==='object'?v:{}}catch{return {}}}
export function markTour(user,id,how='done'){const next={...loadTourState(user),[id]:how};try{localStorage.setItem(keyFor(user),JSON.stringify(next))}catch{}return next}
