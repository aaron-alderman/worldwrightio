import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),base=path.join(root,'templates/composable'),require=createRequire(import.meta.url),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const {createKernel}=require(path.join(base,'bootstrap/temple-seed.cjs')),{lower}=require(path.join(base,'bootstrap/ports/algebra-lower.cjs')),{valuePorts}=require(path.join(base,'bootstrap/ports/value.cjs')),{computationalPorts}=require(path.join(base,'bootstrap/ports/browser-effects.cjs')),{invoke}=require(path.join(base,'bootstrap/ports/programme.cjs')),{parseRel}=require(path.join(base,'bootstrap/ports/rel-codec.cjs'));
const ids=['inspector','workshop','claims','programmes','models','activities'],queries={};
for(const f of ['html','css','language','fact-index','lowering','admission'])Object.assign(queries,read(path.join(base,'algebra',f+'.process.json')).queries);
for(const id of ids)for(const f of read(path.join(root,'packs',id,'pack.json')).modules)Object.assign(queries,read(path.join(root,'packs',id,f)).queries);
for(const id of ids){delete queries[id+'.build'];delete queries[id+'.view'];}
const model=await lower({compiler:read(path.join(base,'algebra/lowering.process.json')),definitions:read(path.join(base,'algebra/operators.expression.json')),primitives:createKernel.operators,input:{entry:'claims.evaluate',queries},mode:'model',ports:valuePorts(),limit:20000000});
const data=id=>JSON.parse(parseRel(fs.readFileSync(path.join(root,'packs',id,'source',id+'.rel'),'utf8'),'configuration').find(r=>r.s===id&&r.p==='configuration').o);
const run=async(id,entry,eventInput={},ports={},extra={})=>(await invoke({model,entry,input:{data:data(id),eventInput,...extra},ports:{...valuePorts(),...computationalPorts(),...ports},nested:['kernel.invoke','kernel.execute','kernel.evaluate'],limit:20000000})).value;
function browser(values={}){const state=new Map(),effects=[];return {state,effects,ports:{'dom.exists':()=>true,'state.get':({key})=>state.has(key)?state.get(key):null,'state.set':({key,value})=>{state.set(key,value);return true},'browser.on':x=>{effects.push(x);return true},'browser.property':({ref,name})=>values[ref]?.[name]??values[ref]??'',...Object.fromEntries(['write','attribute','content','style','class','replace','dialog'].map(p=>['browser.'+p,x=>{effects.push(x);if(p==='write'&&x.name==='value')values[x.ref]=x.value;return true}])),'browser.select':()=>[],'browser.environment':()=>({reduced:false,hidden:false}),'browser.frame':x=>{effects.push(x);return 1},'clock.read':()=>({monotonic:0}),'storage.write':()=>({ok:true})}}}

test('review methods preserve independent-source minima and report conflicting evidence',async()=>{
 const all=data('claims').evidence.map(e=>e.id),review=await run('claims','claims.evaluate',{selected:all});assert.equal(review[0].result,'Conflicted');assert.equal(review[1].result,'Accepted');
 const sparse=await run('claims','claims.evaluate',{selected:[all[0]]});assert.equal(sparse[0].result,'Undecided');assert.equal(sparse[0].independentSources,1);
 const b=browser();await run('claims','claims.boot',{},b.ports);assert.ok(b.effects.some(x=>x.ref==='#claims-results'&&x.html.includes('Conflicted')));assert.ok(b.effects.some(x=>x.ref==='#claims-receipt'));
});
test('exact source highlighting survives the real inspector boot/change path',async()=>{
 const values={},b=browser(values);await run('inspector','inspector.boot',{},b.ports);values['#inspector-input']='("Marker","title","A < B")';await run('inspector','inspector.change',{},b.ports);
 assert.ok(b.effects.some(x=>x.ref==='#inspector-output'&&x.html.includes('A &lt; B')));assert.ok(b.effects.some(x=>x.ref==='#inspector-hash'&&/^SHA-256 [a-f0-9]{64}$/.test(x.value)));
 const text='("Marker","title","Exact source")\n',view=await run('inspector','inspector.present',{text,file:'source/notebook.rel',language:'rel'});const flatten=x=>typeof x==='string'?x:(x.children??[]).map(flatten).join('');assert.equal(flatten(view.tree),text);assert.equal(view.hash,await computationalPorts()['digest.sha256']({text}));
});
test('typed source and overlay edits have separate owners and stale requests preserve the accepted candidate',async()=>{
 const candidate=await run('workshop','ec.prepare',data('workshop').inputs),initial=await run('workshop','session.snapshot',{candidate,revision:0,receipt:null});
 const shared=await run('workshop','session.change',{snapshot:initial,request:{kind:'title',revision:0,value:'An evening marker check'}});assert.match(shared.sources.facts,/An evening marker check/);assert.equal(shared.sources.encounter,initial.sources.encounter);
 const overlay=await run('workshop','session.change',{snapshot:shared,request:{kind:'web-label',revision:1,value:'Open inlet log'}});assert.equal(overlay.sources.facts,shared.sources.facts);assert.match(overlay.sources.encounter,/Open inlet log/);assert.equal(overlay.title,shared.title);
 const saved=JSON.stringify(overlay);await assert.rejects(run('workshop','session.change',{snapshot:overlay,request:{kind:'title',revision:0,value:'stale'}}),/LAB-STALE/);await assert.rejects(run('workshop','session.change',{snapshot:overlay,request:{kind:'title',revision:2,value:42}}),/EC-E010/);assert.equal(JSON.stringify(overlay),saved);
 const row=overlay.panels.find(p=>p.projection.output.type==='NotebookRow').projection,opened=await run('workshop','workshop.dispatch',{candidate:overlay.candidate,event:row.output.events[0]});assert.equal(opened.type,'NotebookPanel');
});
test('all eight independent mathematical mechanisms execute their own source recipes',async()=>{
 for(const scenario of data('models').scenarios)assert.notEqual(await run('models','models.evaluate',{id:scenario.id,input:scenario.input}),undefined);
 assert.equal(await run('models','models.evaluate',{id:'calibration',input:{angle:30}}),0.5);assert.equal(await run('models','models.evaluate',{id:'decode',input:{bits:[1,0,1]}}),1);await assert.rejects(run('models','models.evaluate',{id:'undeclared',input:{}}),/MODEL_UNKNOWN/);
});
test('lending proposals, receipt replay and Merkle witnesses refuse authority, stale roots and tampering',async()=>{
 const initial=await run('programmes','programmes.initial'),proposal={actor:'station-member',basis:initial.root,action:'lend',requestId:'request-a'},accepted=await run('programmes','programmes.propose',{current:initial,proposal});assert.equal(accepted.state.available,2);
 assert.equal((await run('programmes','programmes.witness',{current:accepted})).ok,true);await assert.rejects(run('programmes','programmes.propose',{current:initial,proposal:{...proposal,actor:'visitor'}}),/AUTHORITY/);await assert.rejects(run('programmes','programmes.propose',{current:accepted,proposal}),/STALE/);
 await assert.rejects(run('programmes','programmes.witness',{current:{...accepted,state:{available:3,revision:1}}}),/WITNESS_STATE/);await assert.rejects(run('programmes','programmes.witness',{current:{...accepted,root:'tampered'}}),/WITNESS_HEAD/);assert.equal(initial.state.available,3);
 const roots=await run('programmes','programmes.merkle',{digests:['a','b','c']});assert.equal(roots,await run('programmes','programmes.merkle',{digests:['a','b','c']}));assert.notEqual(roots,await run('programmes','programmes.merkle',{digests:['a','c','b']}));
});
test('extracted cell-world proposals reproduce genesis, preserve refusal state, and detect forged witness history',async()=>{
 const world=await run('programmes','programmes.cellInitial'),recipe={preset:'inspect',identity:'member',stale:false,falseClaim:false,note:'Instrument checked'},before=JSON.stringify(world),preview=await run('programmes','programmes.cellPreview',{world,recipe}),accepted=await run('programmes','programmes.cellPropose',{world,recipe});assert.equal(preview.judgment.accepted,true);assert.equal(JSON.stringify(world),before);assert.equal(preview.judgment.S1root,accepted.result.S1root);assert.equal(accepted.result.accepted,true);assert.notEqual(accepted.world.hub.root,world.hub.root);
 const refused=await run('programmes','programmes.cellPropose',{world,recipe:{...recipe,identity:'visitor'}});assert.equal(refused.result.accepted,false);assert.equal(refused.world.hub.root,world.hub.root);assert.equal((await run('programmes','programmes.cellReplay',{world:accepted.world})).ok,true);
 const forged=await run('programmes','programmes.cellForge',{world:accepted.world,mode:'edit'});assert.equal(forged.verification.ok,false);
});
test('draft witnesses verify and tamper exercises preserve the accepted history',async()=>{
 const current=await run('programmes','programmes.draft',{text:'Track the inlet sensor without publishing',previous:'genesis'}),decision=await run('programmes','draft.decide',{ledger:[],current,verdict:'accept',note:'Fictional desk review',at:'local-session'});const verified=await run('programmes','draft.verify',{ledger:decision.ledger});assert.equal(verified.ok,true);const before=JSON.stringify(decision.ledger);const tampered=await run('programmes','draft.tamper',{ledger:decision.ledger,originalRecord:decision.record});assert.equal(JSON.stringify(decision.ledger),before);assert.ok(tampered);
});
test('activity controls share session policy and reduced motion resolves a closed-route frame directly',async()=>{
 const b=browser();await run('activities','activities.boot',{},b.ports);const action=async(name,value='toggle')=>run('activities','activity.click',{matched:{ref:{handle:'button-'+name},attributes:{'data-world':name,'data-value':value}}},b.ports);
 await action('gate');assert.equal(b.state.get('gate'),true);await action('revision');assert.equal(b.state.get('revisionOpen'),true);await action('original-bit','1');await action('flip-bit','0');assert.deepEqual(b.state.get('bits'),[0,1,1]);await action('enrich');assert.equal(b.state.get('enriched'),true);await action('deck','1');assert.ok(b.effects.some(e=>e.ref==='#activities-mount .world-result'&&e.value?.includes('dusk')));
 await action('loop');await run('activities','activity.loop.frame',{time:0},{...b.ports,'browser.environment':()=>({reduced:true,hidden:false})});assert.equal(b.state.get('loopRunning'),false);await assert.rejects(action('undeclared'),/READER-ACTION/);
});
