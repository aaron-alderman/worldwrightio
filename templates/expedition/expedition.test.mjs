import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=file=>fs.readFileSync(new URL(file,import.meta.url),'utf8');
const json=file=>JSON.parse(read(file));
const {parseRel}=require('./bootstrap/ports/rel-codec.cjs');
const manifest=json('bootstrap/site.json');
const facts=manifest.sources.flatMap(file=>parseRel(read(file),file));
const one=(subject,predicate)=>{const values=facts.filter(f=>f.s===subject&&f.p===predicate&&f.pol==='is').map(f=>f.o);assert.equal(values.length,1,subject+'.'+predicate);return values[0];};
const subjects=type=>facts.filter(f=>f.p==='isa'&&f.o===type&&f.pol==='is').map(f=>f.s);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
test('the full template projects the selected world identity, every place and its atlas',()=>{
 const home=read('dist/index.html'),atlas=read('dist/atlas.html'),origin=one('site','origin');
 assert.ok(home.includes(one('site','name')));assert.ok(home.includes(one('site','headline')));assert.ok(home.includes(origin));
 assert.equal((atlas.match(/class="atlas-place"/g)||[]).length,subjects('Place').length);
 for(const place of subjects('Place')){
  const route=one(place,'route'),html=read('dist/'+route);assert.ok(html.includes(one(place,'title')),route);assert.ok(atlas.includes('href="'+route+'"'),route);assert.ok(html.includes('href="../atlas.html"'));
 }
 assert.ok(!fs.existsSync(new URL('dist/CNAME',import.meta.url)));
 assert.ok(!fs.existsSync(new URL('dist/retained/CNAME',import.meta.url)));
 for(const file of ['index.html','atlas.html','gate.html','worldwright/index.html','claimipedia/index.html','encounter/index.html']){
  const text=read('dist/'+file),canonical=/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/.exec(text)?.[1],openGraph=/<meta\b[^>]*property="og:url"[^>]*content="([^"]+)"/.exec(text)?.[1];
  assert.ok(canonical?.startsWith(origin),file+' canonical uses selected origin');assert.ok(openGraph?.startsWith(origin),file+' Open Graph URL uses selected origin');
  // Explicit original-author credit links have a different role from the
  // selected world's canonical identity and must not be mistaken for it.
 }
});
test('every loaded process and fact source is disclosed byte-identically with its receipt',()=>{
 const receipt=json('dist/build-receipt.json');assert.equal(receipt.execution.limit,20000000);assert.ok(receipt.execution.totalSteps<receipt.execution.limit);assert.ok(receipt.admission.passes>10);
 for(const file of [...manifest.sources,...manifest.modules,'algebra/authoring.process.json','source/authoring-contract.json']){
  assert.equal(read('dist/'+file),read(file),file);assert.equal(receipt.sources[file],sha(fs.readFileSync(new URL(file,import.meta.url))),file);
 }
 for(const [file,hash]of Object.entries(receipt.artifacts))assert.equal(sha(fs.readFileSync(new URL('dist/'+file,import.meta.url))),hash,file);
});
test('browser runtime, media, models, inspection and checked edits are materialized',()=>{
 for(const file of ['reader/runtime.js','reader/activity-runtime.js','atlas-runtime.js','workshop/runtime.js','encounter/runtime.js','claimipedia/runtime.js','temple/runtime.js','sourcery/runtime.js'])assert.ok(read('dist/'+file).length>1000,file);
 assert.ok(read('dist/temple/runtime.js').includes('motion.sky.frame'));
 assert.ok(read('dist/sourcery/runtime.js').includes('media.sound.toggle'));
 assert.ok(read('dist/encounter/runtime.js').includes('ec.patch'));
 assert.ok(read('dist/encounter/runtime.js').includes('sp.present'));
 assert.ok(read('dist/reader/activity-runtime.js').includes('reader.model.memory'));
 assert.ok(read('dist/reader/runtime.js').includes('reader.search'));
 assert.ok(read('dist/atlas-runtime.js').includes('storage.write'));
});
