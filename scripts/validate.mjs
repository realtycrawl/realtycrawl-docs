import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const config=JSON.parse(readFileSync('docs.json'));
const spec=JSON.parse(readFileSync('openapi.json'));
let pages=0;
function visit(value){
 if(Array.isArray(value)){value.forEach(visit);return;}
 if(!value||typeof value!=='object')return;
 if(value.pages)for(const p of value.pages){assert(existsSync(p+'.mdx'),`Missing ${p}`);pages++;}
 for(const [k,v] of Object.entries(value))if(k!=='pages')visit(v);
}
visit(config.navigation);
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!e.name.startsWith('.')&&e.name!=='node_modules'?walk(dir+'/'+e.name):e.isFile()?[dir+'/'+e.name]:[]);}
for(const file of walk('.').filter(f=>f.endsWith('.mdx'))){
 const text=readFileSync(file,'utf8');
 const binding=text.match(/^openapi: "(GET|POST) (.+)"$/m);
 if(binding)assert(spec.paths[binding[2]]?.[binding[1].toLowerCase()],`Unknown endpoint in ${file}`);
 for(const m of text.matchAll(/(?:href="|\]\()\/(?!\/)([^"#)]+)(?:#[^" )]*)?["\)]/g))assert(existsSync(m[1])||existsSync(m[1]+'.mdx'),`Broken local link ${m[1]} in ${file}`);
}
assert.equal(spec.servers[0].url,'https://realtycrawl.dev');
// Keep the reader-facing totals consistent when a source is added or withheld.
const coverage=readFileSync('coverage.mdx','utf8');
const researched=Number(coverage.match(/inventory covers (\d+) researched platforms/)?.[1]);
const enabled=Number(coverage.match(/release includes (\d+) distinct source platforms/)?.[1]);
const unavailable=Number(coverage.match(/remaining (\d+) sources and (\d+) operation definitions?/)?.[1]);
assert(Number.isSafeInteger(researched)&&Number.isSafeInteger(enabled)&&Number.isSafeInteger(unavailable),'Missing coverage totals');
assert.equal(enabled+unavailable,researched,'Source coverage totals disagree');
const ops=Object.values(spec.paths).flatMap(methods=>Object.values(methods));
const activeOps=ops.filter(op=>['active','beta'].includes(op['x-runtime-status'])).length;
assert.equal(Number(coverage.match(/(\d+) defined API operations/)?.[1]),ops.length);
assert.equal(Number(coverage.match(/(\d+) enabled operation IDs/)?.[1]),activeOps);
assert.equal(Number(coverage.match(/remaining \d+ sources and (\d+) operation definitions?/)?.[1]),ops.length-activeOps);

if(process.argv.includes('--live')){
 const r=await fetch('https://realtycrawl.dev/v1/openapi.json',{signal:AbortSignal.timeout(30000)});
 assert.equal(r.status,200);const live=await r.json();
 const drift=Object.keys(spec.paths).filter(path=>!isDeepStrictEqual(live.paths[path],spec.paths[path]));
 assert.equal(drift.length,0,`Live contract differs for: ${drift.join(', ')}. Coordinate the app release before docs cutover.`);
 assert(isDeepStrictEqual(live.components,spec.components),'Live schemas changed; refresh the contract');
}
console.log(`Validated ${pages} navigation pages, API bindings and local links.`);
