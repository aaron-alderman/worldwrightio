// Standalone semantic behavior checks. No repository-parent imports.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const {lower}=require('./bootstrap/ports/algebra-lower.cjs');
const {createKernel}=require('./bootstrap/temple-seed.cjs');
const {valuePorts}=require('./bootstrap/ports/value.cjs');
const {invoke}=require('./bootstrap/ports/programme.cjs');
const manifest=read('bootstrap/site.json');
const compiler=read(manifest.operatorCompiler),definitions=read(manifest.operatorDefinitions);
const compile=input=>lower({compiler,definitions,primitives:createKernel.operators,input,mode:'model',ports:valuePorts(),limit:20000000});
const queries=Object.assign({},...manifest.modules.map(file=>read(file).queries),read('algebra/authoring.process.json').queries);
const model=await compile({queries,entry:manifest.entry});
const admission=await compile(read(manifest.admission));
const run=(entry,input={},target=model)=>invoke({model:target,entry,input,ports:valuePorts(),nested:['kernel.invoke','kernel.execute','kernel.evaluate'],limit:20000000});

test('the complete reused query composition admits every named root under its explicit union of effect profiles',async()=>{
 const policy=read(manifest.hostPorts),author=read('source/authoring-contract.json');
 const entry='feature.audit.roots',target={...model,entry,queries:{...model.queries,[entry]:Object.keys(model.queries).map(call=>({call}))}};
 const grants=[...new Set([...Object.values(policy.profiles).flat(),...author.grants])];
 for(const query of ['admit.model','admit.effects']){
  const result=await run(query,{target,profile:read(manifest.kernelProfile),grants},admission);assert.equal(result.value.ok,true);
 }
 const forbidden=await compile({entry:'forbidden',queries:{forbidden:[{port:'file.write',args:{path:'unadmitted.txt',text:'no'},into:'result'}]}});
 await assert.rejects(run('admit.effects',{target:forbidden,profile:read(manifest.kernelProfile),grants:[]},admission));
});

test('language and REL compile owned data, preserve source coordinates and reject malformed input',async()=>{
 const text='module "field-guide"\nentity "tree" {\nisa "Place"\ntitle "A different canopy"\n}\n';
 const compiled=(await run('language.compile',{file:'field.temple',text})).value;
 assert.equal(compiled.ok,true);assert.ok(compiled.facts.some(f=>f.s==='tree'&&f.p==='title'&&f.o==='A different canopy'));assert.ok(compiled.origins.length>=2);
 const bad=(await run('language.compile',{file:'broken.temple',text:'module "field-guide"\nentity "tree" {\ntitle "Never closed"'})).value;
 assert.equal(bad.ok,false);assert.ok(bad.diagnostic.code);assert.deepEqual(bad.facts,[]);
 const rel='("tree", "title", "A <canopy> & its source")\n';
 const source=(await run('source.compile',{file:'field.rel',text:rel,format:'rel'})).value;
 assert.ok(source);assert.ok(JSON.stringify(source).includes('A <canopy> & its source'));
 const refused=(await run('source.compile',{file:'broken.rel',text:'this is not a REL tuple',format:'rel'})).value;
 assert.equal(refused.ok,false);assert.ok(refused.diagnostic);
});

test('fact ownership and typed indexes refuse competing owners and preserve admitted string-valued data',async()=>{
 const fact={s:'tree',p:'title',o:'A canopy',pol:'is'};
 const index=(await run('facts.index',{input:[fact]})).value;assert.equal(index.protocol,'temple/fact-index/1');assert.equal(index.factCount,1);
 await assert.rejects(run('facts.index',{input:[{...fact,o:42}]}));
 const sources=[{file:'one.rel',text:'one',format:'rel',facts:[fact],origins:[]},{file:'two.rel',text:'two',format:'rel',facts:[{...fact,o:'A second owner'}],origins:[]}];
 await assert.rejects(run('admit.ownership',{sources},admission));
});

test('HTML projection escapes authored text and rejects malformed element names',async()=>{
 const input={tag:'p',attrs:{title:'A "quoted" source'},children:['<script> & a canopy']};
 const value=(await run('html.serialize',{input})).value;
 assert.ok(value.includes('&lt;script&gt; &amp; a canopy'));assert.ok(value.includes('&quot;quoted&quot;'));assert.ok(!value.includes('<script>'));
 await assert.rejects(run('html.serialize',{input:{tag:'p onclick="run"',attrs:{},children:[]}}));
});
