import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {composeWorld} from './compose-world.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),base=path.join(root,'templates/composable'),require=createRequire(import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const {createKernel}=require(path.join(base,'bootstrap/temple-seed.cjs')),{lower}=require(path.join(base,'bootstrap/ports/algebra-lower.cjs')),{valuePorts}=require(path.join(base,'bootstrap/ports/value.cjs')),{invoke}=require(path.join(base,'bootstrap/ports/programme.cjs')),{parseRel}=require(path.join(base,'bootstrap/ports/rel-codec.cjs'));
const queries=read(path.join(root,'packs/curvature/algebra/curvature.process.json')).queries;
delete queries['curvature.build'];delete queries['curvature.view'];
const model=await lower({compiler:read(path.join(base,'algebra/lowering.process.json')),definitions:read(path.join(base,'algebra/operators.expression.json')),primitives:createKernel.operators,input:{entry:'curvature.boot',queries},mode:'model',ports:valuePorts(),limit:20000000});
const data=()=>JSON.parse(parseRel(fs.readFileSync(path.join(root,'examples/tidepool/source/curvature.rel'),'utf8'),'curvature').find(r=>r.p==='configuration').o);
function browser({reduced=false,hidden=false,stored=null,mounted=true,storage=true}={}){
 const state=new Map(),effects=[],environment={reduced,hidden};
 const ports={...valuePorts(),'dom.exists':()=>mounted,'browser.environment':()=>environment,'state.get':({key})=>state.get(key)??null,'state.set':({key,value})=>{state.set(key,value);return true},'storage.read':()=>({ok:storage,value:stored}),'storage.write':x=>{effects.push({port:'storage.write',...x});return {ok:storage}},...Object.fromEntries(['attribute','write','style','on'].map(name=>['browser.'+name,x=>{effects.push({port:'browser.'+name,...x});return true}]))};
 const run=async(entry,eventInput={},config=data(),extra={})=>(await invoke({model,entry,input:{data:config,eventInput,...extra},ports,nested:['kernel.invoke','kernel.execute','kernel.evaluate'],limit:20000000})).value;
 return {run,state,effects,environment};
}
test('presets compose all seven layers, and a single change preserves every other choice',async()=>{
 const b=browser();await b.run('curvature.boot');
 assert.equal(b.state.get('curvature.selections').length,7);
 assert.ok(b.effects.some(x=>x.ref==='#curvature-preset'&&x.name==='value'&&x.value==='field'));
 await b.run('curvature.preset',{event:{target:{value:'quiet'}}});
 assert.ok(b.effects.some(x=>x.ref==='#curvature-preset'&&x.name==='value'&&x.value==='quiet'));
 assert.ok(b.effects.some(x=>x.ref==='#curvature-image'&&x.name==='src'&&x.value.endsWith('night-v1.webp')));
 assert.ok(b.effects.some(x=>x.ref==='#curvature-action'&&x.name==='href'&&x.value==='places/hypotheses.html'));
 const before=structuredClone(b.state.get('curvature.selections'));
 await b.run('curvature.change',{matched:{attributes:{'data-dimension':'shapes'},value:'chart'}});
 assert.deepEqual(b.state.get('curvature.selections'),before.map(x=>x.dimension==='shapes'?{...x,option:'chart'}:x));
 assert.ok(b.effects.some(x=>x.port==='storage.write'&&JSON.parse(x.value).find(v=>v.dimension==='shapes').option==='chart'));
});
test('forged selections refuse before effects or accepted state change; corrupted saved choices fall back',async()=>{
 const b=browser();await b.run('curvature.boot');const accepted=structuredClone(b.state.get('curvature.selections')),n=b.effects.length;
 await assert.rejects(b.run('curvature.change',{matched:{attributes:{'data-dimension':'images'},value:'undeclared'}}),/CURVATURE-OPTION/);
 assert.equal(b.effects.length,n);assert.deepEqual(b.state.get('curvature.selections'),accepted);
 const broken=browser({stored:'[{"dimension":"images","option":"undeclared"}]'});await broken.run('curvature.boot');assert.deepEqual(broken.state.get('curvature.selections'),data().presets[0].selections);
 const invalid=browser({stored:'{not-json'});await invalid.run('curvature.boot');assert.deepEqual(invalid.state.get('curvature.selections'),data().presets[0].selections);
});
test('omitting image, mood, chrome, action and motion requires no specialist effects or dependency',async()=>{
 const config=data();config.dimensions=config.dimensions.filter(d=>['colours','shapes'].includes(d.id));for(const p of config.presets)p.selections=p.selections.filter(s=>['colours','shapes'].includes(s.dimension));
 const b=browser({mounted:false,storage:false});await b.run('curvature.boot',{},config);
 assert.equal(b.state.get('curvature.selections').length,2);assert.ok(!b.effects.some(x=>x.ref?.startsWith?.('#curvature-')));
 assert.ok(b.effects.some(x=>x.name==='--ww-paper'));assert.ok(!b.effects.some(x=>x.name==='src'||x.name==='href'));
});
test('token collisions and stale token sets refuse independently of preset selection',async()=>{
 const b=browser(),config=data();config.dimensions[1].options[0].tokens.push({name:'--ww-paper',value:'red'});
 await assert.rejects(b.run('curvature.check',{},config),/CURVATURE-OWNERSHIP/);
 const uneven=data();uneven.dimensions[0].options[1].tokens.pop();await assert.rejects(b.run('curvature.check',{},uneven),/CURVATURE-TOKEN/);
 const duplicate=data();duplicate.dimensions[1].id='colours';await assert.rejects(b.run('curvature.check',{},duplicate),/CURVATURE-DUPLICATE/);
});
test('reduced motion wins over presets; visibility and an explicit pause update the live scene',async()=>{
 const b=browser({reduced:true});await b.run('curvature.boot');
 assert.ok(b.effects.some(x=>x.ref==='body'&&x.name==='data-ww-reduced'&&x.value==='true'));
 assert.ok(b.effects.some(x=>x.ref==='#curvature-motion-toggle'&&x.name==='disabled'&&x.value===true));
 b.environment.reduced=false;b.environment.hidden=true;await b.run('curvature.environment');
 assert.ok(b.effects.some(x=>x.name==='data-ww-hidden'&&x.value==='true'));
 await b.run('curvature.pause');assert.equal(b.state.get('curvature.paused'),true);
 assert.ok(b.effects.some(x=>x.ref==='body'&&x.name==='data-ww-reduced'&&x.value==='true'));
 assert.ok(!b.effects.some(x=>/frame|timer/.test(x.port)));
});
test('a source-only small consumer builds without Tidepool, and pack removal drops its effects',async()=>{
 const parent=fs.mkdtempSync(path.join(root,'.build/curvature-consumer-')),world=path.join(parent,'world');
 const receipt=await composeWorld(world,{features:['curvature']});assert.deepEqual(receipt.selected,['core','curvature']);
 // Prove a source author can omit five dimensions and still build a functioning small world.
 const source=path.join(world,'source/curvature.rel');const config=JSON.parse(parseRel(fs.readFileSync(source,'utf8'),'curvature').find(r=>r.p==='configuration').o);
 const build=()=>spawnSync(process.execPath,['build.mjs'],{cwd:world,encoding:'utf8',timeout:120000,maxBuffer:4000000});
 const initial=build();assert.equal(initial.status,0,initial.stdout+initial.stderr);
 const accepted=fs.readFileSync(path.join(world,'dist/curvature.html'),'utf8');
 for(const kind of ['image','action']){
  const invalid=structuredClone(config),option=invalid.dimensions.find(d=>d.kind===kind).options[0];
  if(kind==='image'){option.src='assets/undeclared.webp';option.alt='An unowned illustration';}else option.href='places/undeclared.html';
  fs.writeFileSync(source,'("curvature","configuration",'+JSON.stringify(JSON.stringify(invalid))+')\n');const refused=build();assert.notEqual(refused.status,0);assert.match(refused.stderr,kind==='image'?/CURVATURE-IMAGE/:/CURVATURE-ACTION/);
  assert.equal(fs.readFileSync(path.join(world,'dist/curvature.html'),'utf8'),accepted,'Refused configuration must preserve the accepted publication.');
 }
 config.dimensions=config.dimensions.filter(d=>['colours','shapes'].includes(d.id));for(const p of config.presets)p.selections=p.selections.filter(s=>['colours','shapes'].includes(s.dimension));
 fs.writeFileSync(source,'("curvature","configuration",'+JSON.stringify(JSON.stringify(config))+')\n');
 const result=build();assert.equal(result.status,0,result.stdout+result.stderr);
 const html=fs.readFileSync(path.join(world,'dist/curvature.html'),'utf8');assert.ok(html.includes('data-dimension="shapes"'));assert.ok(!html.includes('data-dimension="images"'));assert.ok(!html.includes('tidepool-dawn'));
 assert.ok(!fs.existsSync(path.join(world,'assets/tidepool-dawn-v1.webp')));assert.equal(fs.readFileSync(path.join(world,'bootstrap/temple-seed.cjs'),'utf8'),fs.readFileSync(path.join(base,'bootstrap/temple-seed.cjs'),'utf8'));
 await composeWorld(world,{features:[],replace:true});const after=read(path.join(world,'composition-receipt.json'));assert.ok(!after.selected.includes('curvature'));assert.ok(!Object.hasOwn(after.profiles,'curvatureBrowser'));assert.ok(!fs.existsSync(source));
});
