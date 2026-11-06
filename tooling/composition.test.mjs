// Independent acceptance checks. Headless effects do not certify browser layout/playback.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {planWorld,composeWorld} from './compose-world.mjs';
import {verifyComposition} from './verify-composition.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const baseline=path.join(root,'templates/expedition');
const require=createRequire(path.join(baseline,'package.json'));
const {lower}=require('./bootstrap/ports/algebra-lower.cjs');
const {createKernel}=require('./bootstrap/temple-seed.cjs');
const {valuePorts}=require('./bootstrap/ports/value.cjs');
const {computationalPorts}=require('./bootstrap/ports/browser-effects.cjs');
const {invoke}=require('./bootstrap/ports/programme.cjs');
function configuration(id){const line=fs.readFileSync(path.join(root,'packs',id,'source',id+'.rel'),'utf8').trim();return JSON.parse(JSON.parse('['+line.slice(1,-1)+']')[2]);}
async function engine(ids,entry){
 const queries={};
 for(const name of ['html','fact-index','language','admission','lowering','css'])Object.assign(queries,read(path.join(baseline,'algebra',name+'.process.json')).queries);
 for(const id of ids){const descriptor=read(path.join(root,'packs',id,'pack.json'));for(const file of descriptor.modules)Object.assign(queries,read(path.join(root,'packs',id,file)).queries);}
 const model=await lower({compiler:read(path.join(baseline,'algebra/lowering.process.json')),definitions:read(path.join(baseline,'algebra/operators.expression.json')),primitives:createKernel.operators,input:{queries,entry},mode:'model',ports:valuePorts()});
 const state=new Map(),effects=[];
 const ports={...valuePorts(),...computationalPorts(),'state.get':({key})=>state.get(key),'state.set':({key,value})=>{state.set(key,value);return true;},'browser.write':x=>{effects.push(x);return true;},'browser.content':x=>{effects.push(x);return true;},'browser.attribute':x=>{effects.push(x);return true;},'browser.on':()=>true,'dom.exists':()=>true,'browser.property':()=>''};
 return {model,state,effects,ports,run:async(query,input={})=>(await invoke({model,entry:query,input,ports,nested:['kernel.invoke','kernel.execute','kernel.evaluate'],limit:20000000})).value};
}
test('selectable evidence pack executes independent selections against its own fictional records',async()=>{
 const data=configuration('claims'),s=await engine(['claims'],'claims.boot');
 const selected=data.evidence.map(x=>x.id);
 const all=await s.run('claim.review.compare',{eventInput:{configuration:data,selected}});
 const empty=await s.run('claim.review.compare',{eventInput:{configuration:data,selected:[]}});
 assert.equal(all.length,data.methods.length);assert.ok(empty.every(x=>x.result==='Undecided'));
 assert.ok(all.some(x=>x.support>0&&x.challenge>0));
 await s.run('claims.boot',{data});assert.deepEqual(s.state.get('claims.selected'),selected);assert.ok(s.effects.some(x=>typeof x.value==='string'&&x.value.includes('Conflicted')));
 await s.run('claims.change',{data,eventInput:{event:{target:{ref:'#evidence-first',attributes:{'data-evidence':selected[0]}}}}});
 assert.equal(s.state.get('claims.selected').includes(selected[0]),false);
});
test('workshop preserves typed compiler/edit refusals and inspector hashes exact caller content',async()=>{
 const s=await engine(['inspector','workshop'],'workshop.boot'),data=configuration('workshop');
 const candidate=await s.run('ec.prepare',{eventInput:data.inputs});
 const rendered=await s.run('ec.run',{eventInput:{candidate}});assert.ok(rendered.length>0);
 const changed=await s.run('workshop.change',{data,eventInput:{candidate,value:'A completely different afternoon'}});
 assert.match(changed.candidate.inputs.factText,/A completely different afternoon/);
 await assert.rejects(s.run('workshop.change',{data,eventInput:{candidate,value:42}}),/EC-E010/);
 assert.notEqual(candidate.inputs.factText,changed.candidate.inputs.factText);
 const text='("Independent","title","A new world")';
 const inspected=await s.run('inspector.present',{data:configuration('inspector'),eventInput:{text,file:'own.rel',language:'rel'}});
 const {createHash}=await import('node:crypto');assert.equal(inspected.hash,createHash('sha256').update(text).digest('hex'));
});
test('programme proposals enforce authority, current basis, witness integrity and replay',async()=>{
 const s=await engine(['programmes'],'programmes.initial'),data=configuration('programmes');
 const run=(query,eventInput)=>s.run(query,{data,eventInput});
 const current=await run('programmes.initial',{});
 const proposal={actor:'station-member',basis:current.root,action:'lend',requestId:'qa-independent'};
 const accepted=await run('programmes.propose',{current,proposal});assert.equal(accepted.state.available,current.state.available-1);
 assert.equal((await run('programmes.witness',{current:accepted})).ok,true);
 await assert.rejects(run('programmes.propose',{current,proposal:{...proposal,actor:'visitor'}}),/AUTHORITY/);
 await assert.rejects(run('programmes.propose',{current:accepted,proposal}),/BASIS|STALE/);
 await assert.rejects(run('programmes.witness',{current:{...accepted,root:'tampered'}}),/HEAD/);
});
async function withConfiguration(s,id){return s.run('facts.index',{input:[{s:id,p:'configuration',o:JSON.stringify(configuration(id)),pol:'is'}]});}
test('media seek clamps configured endpoints, refuses nonnumeric input and reports playback refusal',async()=>{
 const s=await engine(['media'],'media.seek'),factIndex=await withConfiguration(s,'media'),configurationValue=configuration('media');
 let value='9999',status={currentTime:0,paused:true,muted:false,seekable:[[0,100]],currentSrc:'https://example.test/own.mp4'},writes=[],waited=0;
 Object.assign(s.ports,{'browser.property':()=>value,'media.read':()=>status,'media.write':x=>{writes.push(x);status={...status,[x.name]:x.value};return true;},'media.play':()=>({ok:false}),'media.pause':()=>true,'asset.blobURL':()=> 'blob:new-world','browser.once':()=>{waited++;return true;}});
 await s.run('media.seek',{factIndex});assert.equal(writes.at(-1).value,configurationValue.duration);
 value='-100';await s.run('media.seek',{factIndex});assert.equal(writes.at(-1).value,0);
 value='not a time';const before=writes.length;await assert.rejects(s.run('media.seek',{factIndex}),/MEDIA_SEEK/);assert.equal(writes.length,before);
 value='3';status.seekable=[];await s.run('media.seek',{factIndex});assert.equal(waited,1);assert.equal(status.src,'blob:new-world');assert.equal(status.currentTime,3);assert.equal(status.paused,true);
 await s.run('media.action',{factIndex,eventInput:{action:'play'}});assert.ok(s.effects.some(x=>String(x.value).includes('refused')));
});
test('motion starts still for reduced motion, schedules visible frames and cancels on pause/hide',async()=>{
 const s=await engine(['motion'],'motion.boot'),factIndex=await withConfiguration(s,'motion');
 let environment={reduced:true,hidden:false},frames=[],cancelled=[],draws=[];
 Object.assign(s.ports,{'browser.environment':()=>environment,'browser.frame':x=>{frames.push(x);return frames.length;},'browser.cancel':({id})=>{cancelled.push(id);return true;},'canvas.draw':x=>{draws.push(x);return true;}});
 await s.run('motion.boot',{factIndex});assert.equal(s.state.get('motion.active'),false);assert.equal(frames.length,0);assert.equal(draws.length,1);
 await s.run('motion.toggle',{factIndex});assert.equal(frames.length,1);
 await s.run('motion.tick',{factIndex,eventInput:{time:1200}});assert.equal(s.state.get('motion.time'),1200);assert.equal(frames.length,2);
 assert.ok(draws.at(-1).commands.length>80);
 environment={reduced:false,hidden:true};await s.run('motion.visibility',{factIndex});assert.ok(cancelled.includes(2));assert.equal(frames.length,2);
 await s.run('motion.toggle',{factIndex});assert.equal(s.state.get('motion.active'),false);assert.equal(frames.length,2);
});
test('all eight selectable mathematical engines retain numerical behavior on new inputs',async()=>{
 const s=await engine(['models'],'models.evaluate'),data=configuration('models');
 const run=(id,input)=>s.run('models.evaluate',{data,eventInput:{id,input}});
 assert.equal(await run('calibration',{angle:30}),0.5);
 assert.equal(await run('calibration',{angle:0}),0);
 assert.deepEqual(await run('inflate',{step:4}),[55,34]);
 assert.equal(await run('decode',{bits:[1,0,1]}),1);assert.equal(await run('decode',{bits:[0,1,0]}),0);
 const weights=await run('weights',{percent:35});assert.ok(Math.abs(weights.a+weights.b-10)<1e-10);
 const pairs=await run('pairs',{value:4,mode:'budget'});assert.equal(pairs.length,15);assert.ok(pairs.every(([a,b])=>a+b<=4));
 const memory=await run('memory',{coupled:true});assert.ok(memory.length>10);assert.deepEqual(memory[0],{t:0,x:1,h:1.2});assert.notEqual(memory[1].x,memory[0].x);
 const line=await run('line',{samples:[{t:0,x:0.4},{t:1,x:0.7}],coordinate:'x'});assert.match(line,/^M[0-9.,]+ L[0-9.,]+$/);
 const coarse=await run('coarse',{block:2});assert.equal(coarse.length,4);assert.ok(coarse.every(x=>x.mean===x.total/4));
});
test('advanced media template retains range boundaries and metadata/blob seek sequence',async()=>{
 const s=await engine(['media'],'media.stream.seek.contains');
 for(const [time,expected] of [[-1,false],[0,true],[2,true],[2.01,false],[8,true],[10,true],[11,false]])assert.equal(await s.run('media.stream.seek.contains',{eventInput:{ranges:[[0,2],[8,10]],time}}),expected);
 const video={readyState:0,muted:true,volume:0,currentSrc:'https://example.test/new-clip.mp4',seekable:[]},effects=[];
 Object.assign(s.ports,{'media.read':()=>video,'media.write':x=>{effects.push(x);video[x.name]=x.value;return true;},'media.load':()=>{effects.push('load');return true;},'media.play':()=>{effects.push('play');return true;},'browser.focus':()=>true,'asset.blobURL':()=> 'blob:independent-new-clip'});
 const ref={handle:17};await s.run('media.stream.seek.click',{eventInput:{video:ref,matched:{attributes:{'data-seek':'18.8'}}}});
 assert.equal(s.state.get('seek.17').phase,'metadata');assert.ok(effects.includes('load'));assert.ok(!effects.includes('play'));
 video.readyState=1;await s.run('media.stream.seek.loaded',{eventInput:{video:ref}});assert.equal(s.state.get('seek.17').phase,'blob');assert.equal(video.src,'blob:independent-new-clip');
 video.currentSrc=video.src;await s.run('media.stream.seek.loaded',{eventInput:{video:ref}});assert.equal(video.currentTime,18.8);assert.equal(s.state.get('seek.17'),null);assert.ok(effects.includes('play'));
});
test('advanced procedural graphics retain configurable wave and reduced-motion sky/constellation plans',async()=>{
 const s=await engine(['motion'],'motion.flood.wave');
 const args={baseY:140,amp:7.5,len:260,phase:0,time:0};const first=await s.run('motion.flood.wave',{eventInput:args});assert.match(first,/^M/);assert.equal(first,await s.run('motion.flood.wave',{eventInput:args}));assert.notEqual(first,await s.run('motion.flood.wave',{eventInput:{...args,time:2}}));
 const draws=[],environment={reduced:true,hidden:false,width:800,height:600,dpr:1,scrollY:0};
 for(const [key,value] of Object.entries({skyFrame:10,skySize:{width:800,height:600},skyStars:[],skyMotes:[],constellationFrame:11,constellationVisible:true,constellationSize:{width:800,height:400},constellationSparks:[],constellationRings:[],constellationNext:0}))s.state.set(key,value);
 Object.assign(s.ports,{'browser.environment':()=>environment,'browser.cancel':()=>true,'canvas.draw':x=>{draws.push(x);return true;},'browser.frame':()=>{throw Error('Reduced motion scheduled a frame');},'browser.timer':()=>{throw Error('Reduced motion scheduled a timer');}});
 await s.run('motion.sky.start',{eventInput:{}});await s.run('motion.constellation.start',{eventInput:{}});assert.equal(draws.length,2);assert.equal(draws[0].ref,'#sky');assert.equal(draws[1].ref,'#constellation');
});
const ownWorld='("world","title","The Clockwork Orchard")\n("world","description","An independent agent-built mechanical garden")\n("world","purpose","Test a different source world")\n("world","entry","gear")\n("gear","isa","Place")\n("gear","title","Gears among the pears")\n("gear","question","Which wheel turns first?")\n("gear","reading","A brass pear turns once every seventh chime.")\n("bell","isa","Place")\n("bell","title","The bell canopy")\n("bell","question","Who hears the branches?")\n("bell","reading","The canopy rings in prime numbers.")\n';
function nativeBuild(dir){const result=spawnSync(process.execPath,['build.mjs'],{cwd:dir,encoding:'utf8',timeout:120000,maxBuffer:4000000});assert.equal(result.status,0,result.stderr+'\n'+result.stdout);return result.stdout;}
test('source-only reader consumer has own content, deterministic build, scoped grants and no excluded features',async()=>{
 const parent=path.join(root,'.build/composition-qa');fs.mkdirSync(parent,{recursive:true});const assetRoot=fs.mkdtempSync(path.join(parent,'reader-')),dir=path.join(assetRoot,'world');
 fs.writeFileSync(path.join(assetRoot,'drawing.svg'),'<svg xmlns="http://www.w3.org/2000/svg"><circle r="11"/></svg>');
 const receipt=await composeWorld(dir,{features:['reader'],worldSource:ownWorld,extraAssets:[{root:assetRoot,owner:'core',source:'drawing.svg',target:'assets/own.svg'}]});
 assert.deepEqual(receipt.selected,['core','reader']);nativeBuild(dir);
 const audit=verifyComposition(dir,{checkCreationHashes:true});assert.equal(audit.executionBudget,20000000);
 assert.match(fs.readFileSync(path.join(dir,'dist/index.html'),'utf8'),/The Clockwork Orchard/);
 assert.match(fs.readFileSync(path.join(dir,'dist/places/gear.html'),'utf8'),/brass pear/);
 assert.ok(!Object.hasOwn(receipt.profiles,'workshopBrowser'));
 const {createHash}=await import('node:crypto');const hash=x=>createHash('sha256').update(x).digest('hex');
 const artifactHashes=(directory,prefix='')=>Object.fromEntries(fs.readdirSync(path.join(directory,prefix),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>entry.isDirectory()?Object.entries(artifactHashes(directory,prefix+entry.name+'/')):[[prefix+entry.name,hash(fs.readFileSync(path.join(directory,prefix,entry.name)))]]));
 const before=artifactHashes(path.join(dir,'dist'));nativeBuild(dir);assert.deepEqual(artifactHashes(path.join(dir,'dist')),before);
 fs.writeFileSync(path.join(dir,'source/world.rel'),ownWorld.replace('brass pear','silver apple'));
 await composeWorld(dir,{features:['reader'],replace:true});nativeBuild(dir);assert.match(fs.readFileSync(path.join(dir,'dist/places/gear.html'),'utf8'),/silver apple/);
 assert.equal(fs.readFileSync(path.join(dir,'assets/own.svg'),'utf8'),fs.readFileSync(path.join(assetRoot,'drawing.svg'),'utf8'));
});
test('dependency selection rejects unknown features, cycles, conflicts and output collisions before copying',async()=>{
 const parent=path.join(root,'.build/composition-qa');fs.mkdirSync(parent,{recursive:true});const registryRoot=fs.mkdtempSync(path.join(parent,'registry-'));fs.cpSync(path.join(root,'packs/core'),path.join(registryRoot,'core'),{recursive:true});
 const pack=(id,extra={})=>{fs.mkdirSync(path.join(registryRoot,id),{recursive:true});fs.writeFileSync(path.join(registryRoot,id,'pack.json'),JSON.stringify({protocol:'worldwright/pack/1',id,requires:['core'],conflicts:[],modules:[],sources:[],assets:[],...extra}));};
 await assert.rejects(planWorld({registryRoot,features:['missing']}),/PACK-UNKNOWN/);
 pack('a',{requires:['b']});pack('b',{requires:['a']});await assert.rejects(planWorld({registryRoot,features:['a']}),/PACK-CYCLE/);
 pack('a',{conflicts:['b']});pack('b');await assert.rejects(planWorld({registryRoot,features:['a','b']}),/PACK-CONFLICT/);
 pack('a',{outputs:['same.html']});pack('b',{outputs:['same.html']});await assert.rejects(planWorld({registryRoot,features:['a','b']}),/PACK-OUTPUT-COLLISION/);
 for(const id of ['a','b'])fs.writeFileSync(path.join(registryRoot,id,'own.json'),'{}');
 pack('a',{modules:[{source:'own.json',target:'algebra/collision.process.json'}]});pack('b',{modules:[{source:'own.json',target:'algebra/collision.process.json'}]});await assert.rejects(planWorld({registryRoot,features:['a','b']}),/PACK-FILE-COLLISION/);
 pack('a',{requires:['b']});pack('b');const plan=await planWorld({registryRoot,features:['a']});assert.deepEqual(new Set(plan.selected),new Set(['core','a','b']));
});
test('profiles cannot override compiler/seed/another owner and skip excluded feature data',async()=>{
 const parent=path.join(root,'.build/composition-qa');fs.mkdirSync(parent,{recursive:true});const dir=fs.mkdtempSync(path.join(parent,'profile-'));
 fs.writeFileSync(path.join(dir,'payload.rel'),ownWorld);fs.writeFileSync(path.join(dir,'payload.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
 const profile=path.join(dir,'profile.json');
 const put=entry=>fs.writeFileSync(profile,JSON.stringify({protocol:'worldwright/profile/1',features:['reader'],files:[entry]}));
 put({owner:'unknown',source:'payload.rel',target:'source/world.rel',kind:'facts'});await assert.rejects(planWorld({profile}),/PROFILE-OWNER/);
 for(const target of ['bootstrap/temple-seed.cjs','algebra/admission.process.json','../outside.svg']){
  put({owner:'core',source:'payload.svg',target,kind:'asset'});await assert.rejects(planWorld({profile}),/PROFILE-|Unsafe composition path/);
 }
 put({owner:'reader',source:'payload.rel',target:'source/world.rel',kind:'facts'});await assert.rejects(planWorld({profile}),/PROFILE-AUTHORITY/);
 put({owner:'claims',source:'payload.rel',target:'source/claims.rel',kind:'facts'});const selected=await planWorld({profile});assert.ok(selected.skippedProfileOwners.includes('claims'));assert.ok(!selected.files.some(x=>x.target==='source/claims.rel'));
});
test('profile-defined microsite routes refuse static and sibling output collisions before copying',async()=>{
 const parent=path.join(root,'.build/composition-qa');fs.mkdirSync(parent,{recursive:true});const dir=fs.mkdtempSync(path.join(parent,'dynamic-routes-'));
 const rows=(id,route)=>[[id,'isa','Microsite'],[id,'title','An independent window'],[id,'description','A collision control'],[id,'reading','Original content for checking output authority.'],[id,'route',route]].map(row=>'('+row.map(JSON.stringify).join(', ')+')').join('\n')+'\n';
 const styleCollision=rows('window-one','styled-window.html')+'("window-one","stylesheet","body { color: #fff; }")\n("window-one","stylesheetRoute","styles.css")\n';
 const profile=path.join(dir,'profile.json');fs.writeFileSync(profile,JSON.stringify({protocol:'worldwright/profile/1',features:['reader','microsites'],files:[{owner:'core',kind:'facts',source:'world.rel',target:'source/world.rel'}]}));
 for(const [id,content]of [['selected-route',rows('window-one','reader.html')],['sibling-route',rows('window-one','shared.html')+rows('window-two','shared.html')],['stylesheet-route',styleCollision]]){
  fs.writeFileSync(path.join(dir,'world.rel'),ownWorld+content);const destination=path.join(dir,id);
  await assert.rejects(composeWorld(destination,{profile}),/PACK-OUTPUT-COLLISION|MICROSITE.*COLLISION/);assert.equal(fs.existsSync(destination),false,'A refused collision must not create a partial consumer');
 }
 // Users also edit facts after creation; runtime publication must enforce the
 // same ownership boundary without requiring them to re-run the composer.
 fs.writeFileSync(path.join(dir,'world.rel'),ownWorld+rows('window-one','first-window.html')+rows('window-two','second-window.html'));
 const edited=path.join(dir,'edited-after-creation');await composeWorld(edited,{profile});nativeBuild(edited);
 const readerBefore=fs.readFileSync(path.join(edited,'dist/reader.html'),'utf8');
 for(const content of [rows('window-one','reader.html'),rows('window-one','shared.html')+rows('window-two','shared.html'),styleCollision]){
  fs.writeFileSync(path.join(edited,'source/world.rel'),ownWorld+content);const built=spawnSync(process.execPath,['build.mjs'],{cwd:edited,encoding:'utf8',timeout:120000,maxBuffer:4000000});
  assert.notEqual(built.status,0,'Edited route collision must refuse publication');assert.match(built.stderr,/MICROSITE|OUTPUT.*COLLISION/i);assert.equal(fs.readFileSync(path.join(edited,'dist/reader.html'),'utf8'),readerBefore,'Failed build must preserve the previously accepted reader');
 }
});
