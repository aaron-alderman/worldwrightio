import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createWorld} from './create-world.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
test('every initial algebra module has an exact catalogue entry and honest status',()=>{
 const catalogue=json('context/features.json'),files=fs.readdirSync(path.join(root,'reference/algebra')).sort();
 assert.deepEqual(catalogue.features.map(x=>path.basename(x.source)).sort(),files);
 for(const item of catalogue.features){const bytes=fs.readFileSync(path.join(root,item.source)),module=JSON.parse(bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.deepEqual(item.queries,Object.keys(module.queries??{}));assert.deepEqual(item.operators,Object.keys(module.operators??{}));assert.equal(item.status,'reusable-template');assert.deepEqual(item.missing,[]);const recipe=json(item.templateContract);assert.equal(recipe.id,item.id);assert.equal(recipe.reference.sha256,item.sha256);assert.equal(recipe.implementation.file,item.implementation.file);}
 assert.deepEqual(json('context/extraction.json').missingClosure,[]);
 assert.equal(json('context/lightning.json').humanUsability,'not-yet-observed');
});
test('the documented command creates a standalone world and refuses overwrites',()=>{
 const base=path.join(root,'.build');fs.mkdirSync(base,{recursive:true});const parent=fs.mkdtempSync(path.join(base,'standalone-')),target=path.join(parent,'my-world');
 try{createWorld(target);assert.throws(()=>createWorld(target),/already exists/);for(const file of ['CNAME','.git','.openai','dist'])assert.ok(!fs.existsSync(path.join(target,file)),file);
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const result=spawnSync(process.execPath,['--test','world.test.mjs'],{cwd:target,encoding:'utf8',env});assert.equal(result.status,0,result.stdout+'\n'+result.stderr);assert.match(result.stdout,/(?:tests 10|1\.\.10)/,'The child must actually execute the starter suite.');
 }finally{if(!parent.startsWith(base+path.sep))throw Error('Unexpected cleanup target');fs.rmSync(parent,{recursive:true,force:true});}
});
test('built hub has valid local links and preserves the introduction and legacy URLs',()=>{
 assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'dist/index.html'),'utf8'));
 for(const file of ['how-it-works.html','live-world.html','styles.css','script.js'])assert.equal(fs.readFileSync(path.join(root,file),'utf8'),fs.readFileSync(path.join(root,'dist',file),'utf8'));
 const files=['index.html',...['index','start','architecture','lightning','features','templates','trial','context'].map(x=>'docs/'+x+'.html')];
 for(const file of files){const text=fs.readFileSync(path.join(root,'dist',file),'utf8');for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g)){
   const href=match[1];if(!href||href.startsWith('#')||/^[a-z]+:/i.test(href))continue;
   const target=path.resolve(root,'dist',path.dirname(file),href.split('#')[0]);assert.ok(fs.existsSync(target),file+' → '+href);
 }}
 assert.ok(fs.readFileSync(path.join(root,'dist/docs/features.html'),'utf8').includes('reference/algebra/authoring.process.json'));
});
