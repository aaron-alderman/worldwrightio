const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {application}=require('./bootstrap/application.cjs'),{createKernel}=require('./source/semantics/bootstrap/temple-seed.cjs'),{valuePorts}=require('./source/semantics/bootstrap/ports/value.cjs');
const read=p=>JSON.parse(fs.readFileSync(p));
async function setup(){const {scenes}=await import('./dist/world.js');return application(__dirname,Object.keys(scenes));}
async function run(data,entry,eventInput,ports={}){const env={model:data.model,data,eventInput};await createKernel({...valuePorts(),...ports},20000000).run(data.model.queries[entry],env);return env.result;}
test('reader and all Encounter views resolve inside one existing scene identity',async()=>{
 const {data}=await setup();assert.equal(data.sceneIds.length,40);
 for(const hash of ['workshop','encounter','reason','lightning','diagrams']){const selected=await run(data,'application.resolve',{hash});assert.equal(selected.scene,'workshop');assert.ok(data.definition.views[selected.view]);}
 assert.deepEqual(await run(data,'application.resolve',{hash:'care'}),{scene:'care',view:null});
 assert.deepEqual(await run(data,'application.resolve',{hash:'missing'}),{scene:'home',view:null});
 assert.equal((await run(data,'application.resolve',{hash:'edit-title'})).focus,'story-title');
});
test('same algebra orders service, view, modules, shared journey and edit focus',async()=>{
 const {data}=await setup(),events=[];const observe=name=>args=>{events.push({name,args});return name==='programme.service'?'same-session':name==='view.open'?'view.1':true;};
 await run(data,'application.activate',{host:'host.1',view:'example',focus:'story-title'},Object.fromEntries(['view.close','programme.service','view.open','programme.mount','view.focus'].map(n=>[n,observe(n)])));
 assert.deepEqual(events.map(e=>e.name),['view.close','programme.service','view.open','programme.mount','programme.mount','view.focus']);
 const open=events.find(e=>e.name==='view.open').args;assert.equal(open.service,'same-session');assert.equal(open.chrome.tag,'nav');assert.deepEqual(open.chrome.children.map(n=>n.children[0]),data.definition.journey.map(s=>s.label));
 assert.deepEqual(events.at(-1).args,{scope:'view.1',identity:'story-title'});
 assert.equal(data.definition.session.module,'workshop/browser-transport.js');
});
test('missing views refuse before opening or importing any application module',async()=>{
 const {data}=await setup();let opened=false;
 await assert.rejects(run(data,'application.activate',{host:'host.1',view:'missing',focus:null},{'view.close':()=>true,'view.open':()=>{opened=true}}),/APP-V001/);assert.equal(opened,false);
});
test('generated root navigation and source catalogue share the application owner',async()=>{
 const {data}=await setup(),html=fs.readFileSync('dist/index.html','utf8'),catalogue=read('dist/inspection/catalogue.json');
 assert.equal(data.definition.id,'worldwright');assert.match(html,/href="#workshop"/);assert.match(html,/data-inspect-key="application\/navigation\/2"/);
 const binding=catalogue.bindings.application;assert.ok(catalogue.nodes[binding.root]);assert.ok(catalogue.nodes[binding.features.encounter.source]);
 assert.ok(catalogue.nodes[catalogue.bindings.scenes.workshop.root].links.some(l=>l.target===binding.root));
 for(const target of ['example','reason','diagrams'])assert.ok(fs.readFileSync('dist/'+data.definition.views[target].fragment,'utf8').trim().length>500);
});
test('legacy URLs enter the root app and have no independent startup',()=>{
 const app=read('dist/application/definition.json');for(const alias of app.compatibility){const file=alias.path.endsWith('/')?alias.path+'index.html':alias.path,html=fs.readFileSync('dist/'+file,'utf8');assert.match(html,/http-equiv="refresh"/);assert.doesNotMatch(html,/<script|session-worker|browser-host/);}
 assert.equal(fs.existsSync('dist/workshop/browser-host.js'),false);assert.equal(fs.existsSync('dist/encounter/app.js'),false);
 for(const file of ['app.js','inspection/client.js','workshop/app.js','workshop/debugger-native.js'])assert.match(fs.readFileSync('dist/'+file,'utf8'),/Generated from source/);
});

test('Encounter owns execution and inspection projections cannot act as a fallback',t=>{
 const os=require('node:os'),{processSource}=require('./bootstrap/encounter-source.cjs');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'worldwright-source-refusal-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'algebra'));
 const source=path.join(root,'algebra/application.encounter');
 const projection=path.join(root,'algebra/application.process.json');
 const text=fs.readFileSync(path.join(__dirname,'algebra/application.encounter'),'utf8');
 fs.copyFileSync(path.join(__dirname,'algebra/application.process.json'),projection);
 fs.writeFileSync(source,text);
 assert.ok(processSource(root,'application').queries['application.compose']);
 fs.writeFileSync(source,'invalid process source\n');
 assert.throws(()=>processSource(root,'application'),/application.encounter/);
 fs.writeFileSync(source,text);
 const changed=read(projection);
 changed.queries['application.compose']=[];
 fs.writeFileSync(projection,JSON.stringify(changed));
 assert.throws(()=>processSource(root,'application'),/differs from its inspection projection/);
});
