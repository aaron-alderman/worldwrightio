import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function candidate(){const workspace=path.join(root,'.build');fs.mkdirSync(workspace,{recursive:true});const target=fs.mkdtempSync(path.join(workspace,'test-'));for(const entry of fs.readdirSync(root)){if(['dist','.build','.git','node_modules'].includes(entry))continue;fs.cpSync(path.join(root,entry),path.join(target,entry),{recursive:true});}return target;}
function build(dir){const env={...process.env};delete env.NODE_TEST_CONTEXT;return spawnSync(process.execPath,['build.mjs'],{cwd:dir,encoding:'utf8',env});}
const read=(dir,file)=>fs.readFileSync(path.join(dir,file),'utf8');
function mutate(dir,from,to){const file=path.join(dir,'source/world.rel');fs.writeFileSync(file,read(dir,'source/world.rel').replaceAll(from,to));}
function cleanup(dir){const base=path.join(root,'.build')+path.sep;if(!path.resolve(dir).startsWith(base))throw Error('Unexpected cleanup target');fs.rmSync(dir,{recursive:true,force:true});}
test('standalone build emits navigable pages, exact sources and a bounded receipt',()=>{
 const dir=candidate();try{const result=build(dir);assert.equal(result.status,0,result.stderr);
 for(const file of ['index.html','garden.html','lens.html','sources.html','styles.css'])assert.ok(fs.existsSync(path.join(dir,'dist',file)),file);
 for(const file of ['source/world.rel','source/presentation.rel','algebra/world.process.json','source/upstream.json'])assert.equal(read(dir,file),read(dir,'dist/'+file));
 for(const file of ['index.html','garden.html','lens.html','sources.html'])for(const match of read(dir,'dist/'+file).matchAll(/(?:href|src)="([^"]+)"/g)){
  const target=match[1].split('#')[0];if(!target||/^[a-z]+:/.test(target))continue;assert.ok(fs.existsSync(path.join(dir,'dist',target)),target);
 }
 const receipt=JSON.parse(read(dir,'dist/build-receipt.json'));assert.equal(receipt.execution.limit,20000000);assert.ok(receipt.execution.totalSteps>0&&receipt.execution.totalSteps<receipt.execution.limit);assert.ok(receipt.admission.passes>=3);
 for(const [file,digest]of Object.entries(receipt.artifacts))assert.equal(hash(fs.readFileSync(path.join(dir,'dist',file))),digest,file);
 const before=read(dir,'dist/build-receipt.json');assert.equal(build(dir).status,0);assert.equal(read(dir,'dist/build-receipt.json'),before);
 }finally{cleanup(dir);}
});
test('source correction reprojects escaped content while the kernel stays unchanged',()=>{
 const dir=candidate();try{const seed=hash(fs.readFileSync(path.join(dir,'bootstrap/temple-seed.cjs')));
 mutate(dir,'Where a question begins','My <new> question & its source');const result=build(dir);assert.equal(result.status,0,result.stderr);
 const html=read(dir,'dist/garden.html');assert.ok(html.includes('My &lt;new&gt; question &amp; its source'));assert.ok(!html.includes('<new>'));
 assert.equal(hash(fs.readFileSync(path.join(dir,'bootstrap/temple-seed.cjs'))),seed);
 }finally{cleanup(dir);}
});
for(const [label,from,to,message]of [
 ['unknown choice target','("garden-to-lens", "target", "lens")','("garden-to-lens", "target", "missing")','WORLD-TARGET'],
 ['unknown source','("garden", "source", "notebook")','("garden", "source", "missing")','WORLD-SOURCE'],
 ['empty required title','("garden", "title", "Where a question begins")','("garden", "title", "")','WORLD-EMPTY'],
 ['reserved route identity','"garden"','"index"','WORLD-ID'],
 ['unknown entry','("world", "entry", "garden")','("world", "entry", "missing")','WORLD-ENTRY']
])test(`${label} refuses before page projection`,()=>{const dir=candidate();try{mutate(dir,from,to);const bytes=read(dir,'source/world.rel'),result=build(dir);assert.notEqual(result.status,0);assert.ok(result.stderr.includes(message),result.stderr);assert.equal(read(dir,'source/world.rel'),bytes);assert.ok(!fs.existsSync(path.join(dir,'dist/index.html')));}finally{cleanup(dir);}});
test('copied mechanisms retain their attributed exact hashes',()=>{
 const upstream=JSON.parse(read(root,'source/upstream.json'));
 for(const [file,digest]of Object.entries(upstream.files))assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,file);
});
test('failed rebuild preserves the last accepted world',()=>{
 const dir=candidate();try{assert.equal(build(dir).status,0);const before=read(dir,'dist/build-receipt.json'),page=read(dir,'dist/garden.html');
 mutate(dir,'("garden-to-lens", "target", "lens")','("garden-to-lens", "target", "missing")');assert.notEqual(build(dir).status,0);
 assert.equal(read(dir,'dist/build-receipt.json'),before);assert.equal(read(dir,'dist/garden.html'),page);
 }finally{cleanup(dir);}
});
test('recomposition removes pages for retired places',()=>{
 const dir=candidate();try{assert.equal(build(dir).status,0);let facts=read(dir,'source/world.rel');
 facts=facts.split(/\r?\n/).filter(line=>!line.startsWith('("lens",')&&!line.startsWith('("garden-to-lens",')&&!line.startsWith('("lens-to-garden",')&&!line.startsWith('("garden", "choice",')).join('\n');
 fs.writeFileSync(path.join(dir,'source/world.rel'),facts);const result=build(dir);assert.equal(result.status,0,result.stderr);assert.ok(!fs.existsSync(path.join(dir,'dist/lens.html')));assert.ok(!read(dir,'dist/index.html').includes('lens.html'));
 }finally{cleanup(dir);}
});
