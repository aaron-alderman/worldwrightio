import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSession} from './dist/workshop/engine.js';
import {createDebugger} from './dist/workshop/debugger-native.js';
import {invoke,valuePorts} from './dist/workshop/temple-native.js';
const bundle=()=>JSON.parse(fs.readFileSync(new URL('./dist/workshop/fixture.json',import.meta.url),'utf8'));
function observer(){let latest;const waiters=[];return {notify(s){latest=s;for(const w of [...waiters])if(w.check(s)){clearTimeout(w.timer);waiters.splice(waiters.indexOf(w),1);w.resolve(s);}},wait(check){if(latest&&check(latest))return Promise.resolve(latest);return new Promise((resolve,reject)=>{const w={check,resolve,timer:setTimeout(()=>reject(Error('Debugger state timed out: '+latest?.status)),12000)};waiters.push(w);});}};}
async function trial(plan){const o=observer(),d=await createDebugger(plan,o.notify);d.start();await o.wait(s=>s.status==='paused');return {d,o};}
const normal=p=>invoke({model:p.model,entry:p.entry,input:{...p.bindings,eventInput:p.eventInput},ports:valuePorts(),nested:['kernel.invoke','kernel.execute','kernel.evaluate']});

test('real NavigationItem: pause, step, breakpoint, bindings and unchanged result',async()=>{
 const session=await createSession(bundle()),p=await session.debugPlan({program:'navigation'}),expected=await normal(p),{d,o}=await trial(p);
 assert.equal(d.instructions.length,5);assert.equal(d.status,'paused');
 assert.throws(()=>d.inspect(['ecSourceCarrier']),/DEBUG-I003/);
 const first=d.pauseId;d.resume('step');await o.wait(s=>s.status==='paused'&&s.pause>first);
 assert.equal(d.inspect(['ecSourceCarrier','values','S.Title']).value,'What happened');
 assert.throws(()=>d.inspect([],0,first),/DEBUG-I002/);
 assert.throws(()=>d.inspect(['toString']),/DEBUG-I003/);
 const breakpoint=d.instructions[3].id;d.setBreakpoints([breakpoint]);d.resume('continue');
 await o.wait(s=>s.status==='paused'&&s.current===breakpoint);
 assert.equal(d.inspect(['ecViewValues','N.label']).value,'What happened');
 assert((d.inspect().entries).some(e=>e.key==='ecViewValues'&&e.changed));
 d.setBreakpoints([]);d.resume('continue');await d.finished;
 assert.equal(d.status,'done');assert.deepEqual(d.value,expected.value);
 assert(d.measuredUsage.steps>expected.usage.steps);assert.equal(d.measuredUsage.limit,20000000);
 assert.equal(session.state().revision,0);
});
for(const program of ['web','row'])test(program+' uses actual resolved invocation and produces the normal output',async()=>{
 const s=await createSession(bundle()),p=await s.debugPlan({program});assert(p.eventInput.navigation);
 const expected=await normal(p),{d}=await trial(p);d.resume('continue');await d.finished;
 assert.equal(d.status,'done');assert.deepEqual(d.value,expected.value);
 assert.equal(d.value.values[program==='web'?'W.text':'R.label'],program==='web'?'The story':'What happened');
});
test('source edit trial pauses at its owned span and never commits',async()=>{
 const s=await createSession(bundle()),before=s.state(),p=await s.debugPlan({program:'edit-title',value:'Trial only'}),{d,o}=await trial(p);
 const encode=d.instructions.find(i=>i.step===undefined&&i.text.startsWith('port json.stringify'));assert(encode);
 d.setBreakpoints([encode.id]);d.resume('continue');await o.wait(x=>x.status==='paused'&&x.current===encode.id);
 assert.equal(d.inspect(['ecNewText']).value,'Trial only');assert(d.inspect(['ecSpan','span','valueStart']).value>0);
 d.setBreakpoints([]);d.resume('continue');await d.finished;assert.equal(d.status,'done');
 assert(d.value.candidate.inputs.factText.includes('"Trial only"'));assert.equal(d.value.candidate.inputs.codeText,before.sources.encounter);
 assert.deepEqual(s.state(),before);
});
test('overlay edit trial follows its literal route without changing facts',async()=>{
 const s=await createSession(bundle()),p=await s.debugPlan({program:'edit-label',value:'A local trial'}),{d}=await trial(p);d.resume('continue');await d.finished;
 assert.equal(d.status,'done');assert.equal(d.value.destination.kind,'literal');assert.equal(d.value.candidate.inputs.factText,s.state().sources.facts);assert.equal(s.state().webLabel,'The story');
});
test('a failing typed edit retains the original error and the accepted basis',async()=>{
 const s=await createSession(bundle()),before=s.state(),{d}=await trial(await s.debugPlan({program:'edit-title',value:''}));d.resume('continue');await d.finished;
 assert.equal(d.status,'failed');assert.match(d.failure.message,/EC-T007/);assert.equal(d.value,undefined);assert.deepEqual(s.state(),before);assert(d.inspect(['ecPatchInputs','factText']).value.includes('"S.Title", ""'));
});
test('breakpoints in an inline fold observe the real lexical frames on each iteration',async()=>{
 const b=bundle(),p={model:{entry:'loop',queries:{loop:[{fold:['list',1,2],as:'item',accumulator:'sum',initial:0,steps:[{let:'next',value:['add','$sum','$item']}],yield:'$next',into:'total'},{let:'result',value:'$total'}]}},admissionModel:b.model,presentation:b.presentation,entry:'loop',eventInput:{},bindings:{},profile:b.original.inputs.profile,basis:0};
 const {d,o}=await trial(p),inner=d.instructions.find(i=>i.depth===1);d.setBreakpoints([inner.id]);d.resume('continue');
 const a=await o.wait(s=>s.status==='paused'&&s.current===inner.id);assert.equal(d.inspect(['item']).value,1);assert.equal(d.inspect(['sum']).value,0);
 d.resume('continue');await o.wait(s=>s.status==='paused'&&s.current===inner.id&&s.pause>a.pause);assert.equal(d.inspect(['item']).value,2);assert.equal(d.inspect(['sum']).value,1);
 d.setBreakpoints([]);d.resume('continue');await d.finished;assert.equal(d.value,3);assert.throws(()=>d.inspect(['item']),/DEBUG-I003/);
});
test('a plan identifies its exact revision; unknown targets refuse',async()=>{
 const s=await createSession(bundle());await assert.rejects(s.debugPlan({program:'arbitrary-host-command'}),/DEBUG-P001/);
 await s.edit({revision:0,kind:'title',value:'New basis'});const p=await s.debugPlan({program:'navigation',candidate:{model:'caller supplied'}});assert.equal(p.basis,1);assert.equal(p.bindings.factIndex.objects.TheStory['S.Title'][0],'New basis');
});
test('observation does not grant filesystem or other undeclared host effects',async()=>{
 const b=bundle(),p={model:{entry:'unsafe',queries:{unsafe:[{port:'filesystem.write',args:{path:'anything'},into:'result'}]}},admissionModel:b.model,presentation:b.presentation,entry:'unsafe',eventInput:{},bindings:{},profile:b.original.inputs.profile,basis:0};
 await assert.rejects(createDebugger(p),/TEMPLE-S017/);
});
