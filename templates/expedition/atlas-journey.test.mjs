import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{browserEffects}=require('./bootstrap/ports/browser-effects.cjs'),{valuePorts}=require('./bootstrap/ports/value.cjs');
const code=fs.readFileSync('dist/atlas-runtime.js','utf8').replace(/startBrowser\(model,factIndex,grants\)\.catch[^\n]+/,'')+'\nglobalThis.capture={model,createKernel};';
const context=vm.createContext({console});vm.runInContext(code,context);const {model,createKernel}=context.capture;
const key=model.data.storageKey,count=model.data.ids.length,[first,second=first,third=second]=model.data.ids;
const progress=n=>`${n} of ${count} places seen`;
function memory(){const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
async function session(storage,{current=null,atlas=true,small=false}={}){
 const state=new Map(),text={},hidden={},attributes=[],classes=[],bindings=[];const effects=browserEffects({document:{},window:{},storage},()=>{});
 const links=model.data.ids.flatMap(id=>[0,1].map(index=>({ref:{id,index},attributes:{'data-atlas-id':id}})));
 const ports={...valuePorts(),...effects,'state.get':({key})=>state.get(key),'state.set':({key,value})=>state.set(key,value),'dom.exists':({selector})=>selector==='#atlas-memory'?atlas:current!==null,'dom.attribute':()=>current,'dom.hidden':({selector,value})=>hidden[selector]=value,'dom.text':({selector,text:value})=>text[selector]=value,'dom.on':()=>true,'browser.on':args=>{bindings.push(args);return bindings.length;},'browser.mediaQuery':()=>small,'browser.cancel':()=>true,'browser.select':()=>links,'browser.attribute':args=>attributes.push(args),'browser.class':args=>classes.push(args)};
 const run=async(query,eventInput={})=>createKernel(ports,2_000_000).run(model.queries[query],{model,data:model.data,eventInput});
 await run('atlas.journey.boot');return {run,state,text,hidden,attributes,classes,bindings};
}
test('algebra remembers actual destination visits, deduplicates them and restores the map',async()=>{
 const storage=memory();let s=await session(storage);assert.equal(s.text['#atlas-progress'],progress(0));assert.equal(storage.getItem(key),null);
 await session(storage,{current:first,atlas:false});assert.equal(storage.getItem(key),first);
 await session(storage,{current:first,atlas:false});assert.equal(storage.getItem(key),first);
 await session(storage,{current:second,atlas:false});s=await session(storage);const seen=[...new Set([first,second])];assert.equal(s.text['#atlas-progress'],progress(seen.length));assert.equal(s.attributes.filter(x=>x.name==='data-seen'&&x.value==='true').length,seen.length*2);
 await session(storage,{current:'not-a-place',atlas:false});assert.equal(storage.getItem(key),seen.join('\n'));
 storage.setItem(key,third);await s.run('atlas.seen.refresh');assert.equal(s.text['#atlas-progress'],progress(1));assert.equal(s.state.get('seen')[0],third);
});
test('reset clears only the atlas key and all seen labels',async()=>{
 const storage=memory();storage.setItem('unrelated.preference','keep');storage.setItem(key,[first,second].join('\n'));const s=await session(storage);await s.run('atlas.seen.reset');assert.equal(storage.getItem(key),null);assert.equal(storage.getItem('unrelated.preference'),'keep');assert.equal(s.state.get('seen').length,0);assert.ok(s.text['#atlas-progress'].includes(progress(0)));assert.equal(s.attributes.slice(-count*4).filter(x=>x.name==='data-seen'&&x.value==='true').length,0);
});
test('untrusted saved text is bounded and restricted to known places',async()=>{
 const storage=memory();storage.setItem(key,[first,'<script>',first,second,'constructor',''].join('\n'));const s=await session(storage);assert.deepEqual([...s.state.get('seen')],[...new Set([first,second])]);storage.setItem(key,'x'.repeat(4097));const fresh=await session(storage);assert.equal(fresh.state.get('seen').length,0);assert.match(fresh.text['#atlas-storage-note'],/unavailable/);
});
test('blocked storage stays nonfatal and reports the limit honestly',async()=>{
 const denied={getItem(){throw Error('SecurityError');},setItem(){throw Error('QuotaExceededError');},removeItem(){throw Error('SecurityError');}};
 const s=await session(denied,{current:first,atlas:false});assert.deepEqual([...s.state.get('seen')],[first]);assert.match(s.text['#atlas-visit-note'],/couldn’t save/);const a=await session(denied);assert.match(a.text['#atlas-storage-note'],/unavailable/);await a.run('atlas.seen.reset');assert.equal(a.state.get('seen').length,0);
});
test('previews are dismissible and every pin has an ordinary link and readable label',async()=>{
 const s=await session(memory());await s.run('atlas.pin.dismiss',{event:{key:'Escape'},matched:{ref:{id:first},attributes:{'data-atlas-id':first}}});assert.equal(s.classes.at(-1).value,true);await s.run('atlas.pin.reveal',{matched:{ref:{id:first},attributes:{'data-atlas-id':first}}});assert.equal(s.classes.at(-1).value,false);
 const html=fs.readFileSync('dist/atlas.html','utf8');assert.equal((html.match(/class="atlas-pin"/g)||[]).length,count);assert.equal((html.match(/class="atlas-pin-tip"/g)||[]).length,count);assert.ok(html.includes('Reset seen places'));assert.ok(!html.match(/\son[a-z]+=/));
});
test('mobile taps preview a place before exploration, with no false seen mark',async()=>{
 const storage=memory(),s=await session(storage,{small:true});assert.ok(s.bindings.some(b=>b.event==='click'&&b.preventDefault&&b.delegate==='.atlas-pin'));await s.run('atlas.pin.preview',{matched:{ref:{id:first},attributes:{'data-atlas-id':first}}});const place=model.data.places.find(p=>p.id===first);assert.equal(s.text['#atlas-preview-title'],place.name);assert.equal(s.text['#atlas-preview-question'],place.question);assert.ok(s.attributes.some(a=>a.name==='href'&&a.value==='places/'+first+'.html'));assert.equal(storage.getItem(key),null);assert.equal(s.hidden['#atlas-preview-link'],false);
});
test('a destination restored from browser history marks itself again after a reset',async()=>{const storage=memory(),s=await session(storage,{current:first,atlas:false});storage.removeItem(key);await s.run('atlas.journey.resume');assert.equal(storage.getItem(key),first);});
