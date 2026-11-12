import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});let first=true;
for(const w of [1440,1024,390]){const page=await b.newPage({viewport:{width:w,height:900}});await page.goto('http://127.0.0.1:5173/');const p=page.getByRole('region',{name:'Admin'});await p.waitFor();
 if(first){await p.getByLabel('Name').fill('A');await p.getByLabel('Email').fill('a@b.co');await p.getByLabel('Password').fill('audit password 1');await p.getByRole('button',{name:'Create account'}).click();first=false}
 else{await p.getByLabel('Email').fill('a@b.co');await p.getByLabel('Password').fill('audit password 1');await p.getByRole('button',{name:'Sign in'}).click()}
 await page.getByRole('heading',{name:'Workspace overview'}).waitFor();await page.evaluate(()=>{location.hash='Production'});await page.waitForTimeout(800);
 const info=await page.evaluate(()=>{const rows=[...document.querySelectorAll('.machine-row')];const R=e=>{const r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]};
  const heads=[...document.querySelectorAll('.prod-side .panel-heading,.prod-layout .panel-heading')].map(h=>h.innerText.split('\n')[0]);
  return {heads,rows:rows.slice(0,8).map(r=>({text:r.innerText.replace(/\n/g,' | ').slice(0,70),row:R(r),icon:R(r.querySelector('.machine-icon')),copy:R(r.querySelector('.machine-copy')),sel:r.querySelector('select')?R(r.querySelector('select')):null,extra:[...r.children].map(c=>c.tagName+'.'+c.className).join(',')})),
   overflow:document.documentElement.scrollWidth-innerWidth}});
 console.log('width',w,'overflow',info.overflow,'panels',info.heads.join(' / '));for(const r of info.rows)console.log(JSON.stringify(r));await page.close()}
await b.close();
