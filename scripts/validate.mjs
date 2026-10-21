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
// Validate structured release totals rather than parsing prose that can change independently.
const snapshot=JSON.parse(readFileSync('coverage.json','utf8'));
assert(/^\d{4}-\d{2}-\d{2}$/.test(snapshot.asOf),'Missing snapshot date');
assert.equal(snapshot.activePlatforms+snapshot.unavailablePlatforms.length+snapshot.retiredPlatforms.length,snapshot.catalogPlatforms);
assert.equal(snapshot.activeBindings+snapshot.documentedBetaBindings,snapshot.callableBindings);
const nonCallable=[...snapshot.unavailablePlatforms,...snapshot.retiredPlatforms];
assert.equal(new Set(nonCallable).size,nonCallable.length,'Overlapping unavailable/retired sources');
assert.equal(snapshot.freshSourceVerification,false,'A dated snapshot is not fresh source verification');
assert.equal(snapshot.authority,'https://realtycrawl.dev/v1/meta/capabilities');
const ops=Object.values(spec.paths).flatMap(methods=>Object.entries(methods).filter(([method])=>['get','post','put','patch','delete'].includes(method)).map(([,op])=>op));
assert.equal(snapshot.operationDefinitions,ops.length);
assert.equal(new Set(ops.map(op=>op.operationId)).size,ops.length,'Duplicate operation IDs');
for(const key of ['activePlatforms','activeBindings','documentedBetaBindings','callableBindings'])assert(Number.isSafeInteger(snapshot[key])&&snapshot[key]>=0,`Invalid ${key}`);

if(process.argv.includes('--live')){
 const r=await fetch('https://realtycrawl.dev/v1/openapi.json',{signal:AbortSignal.timeout(30000)});
 assert.equal(r.status,200);const live=await r.json();
 const drift=Object.keys(spec.paths).filter(path=>!isDeepStrictEqual(live.paths[path],spec.paths[path]));
 assert.equal(drift.length,0,`Live contract differs for: ${drift.join(', ')}. Coordinate the app release before docs cutover.`);
 assert(isDeepStrictEqual(live.components,spec.components),'Live schemas changed; refresh the contract');
}
console.log(`Validated ${pages} navigation pages, API bindings and local links.`);
