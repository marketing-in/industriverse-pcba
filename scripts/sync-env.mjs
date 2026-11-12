// Sends the variables in .env to the Vercel project, for production, preview and development.
// Only keys that are new or changed since the last sync are sent (a hash of each value is kept in
// .vercel/env-sync.json, which git ignores). Values never reach the terminal or a log.
// Runs from the git pre-push hook (.githooks/pre-push) and by hand: npm run env:sync [-- --all] [-- --dry]
// VERCEL_PROJECT overrides the project name; ENV_FILE overrides the file (default .env).
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const PROJECT=process.env.VERCEL_PROJECT||'industriversepcba';
const FILE=process.env.ENV_FILE||'.env';
const CACHE='.vercel/env-sync.json';
const TARGETS=['production','preview','development'];
const CLI=['-y','vercel@65.14.0'];
const args=new Set(process.argv.slice(2));
const all=args.has('--all'),dry=args.has('--dry'),quiet=args.has('--quiet');
const log=(...m)=>{if(!quiet||m[0]?.startsWith?.('env-sync:'))console.log(...m)};

// Parse KEY=value lines; ignores comments, blank values, and Vercel's own VERCEL_* variables.
export function parseEnv(text){
 const out={};
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim().replace(/^export\s+/,'');
  const m=line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);if(!m)continue;
  let v=m[2];
  if(/^(["']).*\1$/.test(v))v=v.slice(1,-1);else v=v.replace(/\s+#.*$/,'').trim();
  if(v&&!m[1].startsWith('VERCEL_'))out[m[1]]=v;
 }
 return out;
}

const hash=v=>createHash('sha256').update(v).digest('hex');

if(!existsSync(FILE)){log(`env-sync: no ${FILE}, nothing to send`);process.exit(0)}
const vars=parseEnv(readFileSync(FILE,'utf8'));
let cache={};try{cache=JSON.parse(readFileSync(CACHE,'utf8'))}catch{}
const todo=Object.keys(vars).filter(k=>all||cache[k]!==hash(vars[k]));
if(!todo.length){log(`env-sync: Vercel (${PROJECT}) already has every key in ${FILE}`);process.exit(0)}
log(`env-sync: sending ${todo.length} key(s) to Vercel (${PROJECT}): ${todo.join(', ')}`);
if(dry)process.exit(0);

let failed=0;
for(const k of todo){
 let ok=true;
 for(const t of TARGETS){
  const r=spawnSync('npx',[...CLI,'env','add',k,t,'--project',PROJECT,'--force'],{input:vars[k],encoding:'utf8'});
  const text=`${r.stdout}${r.stderr}`;
  if(r.status!==0||!/added|overrode|updated/i.test(text)){ok=false;log(`  FAIL ${k} [${t}]: ${(text.match(/Error[^\n]*/)||['exit '+r.status])[0]}`)}
 }
 if(ok){cache[k]=hash(vars[k]);log(`  ok   ${k}`)}else failed++;
}
mkdirSync('.vercel',{recursive:true});
writeFileSync(CACHE,JSON.stringify(cache,null,1));
log(failed?`env-sync: ${failed} key(s) failed; they will be retried next time`:'env-sync: done. A new deployment picks the values up.');
process.exit(failed?1:0);
