'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'dist',p),'utf8'));
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
let ready;const setup=()=>ready??=(async()=>{const {createInspector}=await import('./dist/inspection/host.js'),catalogue=read('inspection/catalogue.json'),bundle=read('inspection/model.json'),manifest=read('inspection/manifest.json'),basis=Object.fromEntries(manifest.files.map(f=>[f.file,f.sha256]));return {catalogue,bundle,manifest,basis,inspector:await createInspector({catalogue,bundle,basis})};})();
const request=(f,target,display)=>({principal:'test.reader',context:'test.current-context',expectedBasis:f.basis,target,...(display?{display}:{})});
async function inspect(f,target,display){const r=await f.inspector.inspect(request(f,target,display));assert.equal(r.value.ok,true,JSON.stringify({target,display,result:r.value}));return r;}

test('X01 typed actual title inspection preserves its LF and exact generated source occurrence',async()=>{const f=await setup(),target=f.catalogue.bindings.scenes.observation.title,r=await inspect(f,target,{kind:'text',text:'What did the\nmeasurement miss?'});assert.equal(r.value.status,'inspection-only');assert.equal(r.value.displayCheck,'host-observed-literal-agreement');assert.deepEqual(r.value.typed.isa,['SourceFragment']);assert.equal(typeof r.value.typed.start,'number');assert.equal(r.value.text,JSON.stringify('What did the\nmeasurement miss?'));assert.ok(r.usage.steps<20000000);});

test('X02 all scene titles, paragraphs and authored passage destinations reproduce through the shared operation',async()=>{
 const f=await setup(),{scenes}=await import('./dist/world.js');assert.equal(Object.keys(scenes).length,40);
 for(const [id,scene]of Object.entries(scenes)){
  const bound=f.catalogue.bindings.scenes[id];assert.ok(bound,id);await inspect(f,bound.title,{kind:'text',text:scene.title});await inspect(f,bound.lead,{kind:'text',text:scene.lead});
  assert.equal(bound.body.length,scene.body.length,id+' body');for(const [i,text]of scene.body.entries())await inspect(f,bound.body[i],{kind:'text',text});
  assert.equal(bound.choices.length,scene.choices.length,id+' choices');for(const [i,choice]of scene.choices.entries()){await inspect(f,bound.choices[i].to,{kind:'href',href:'#'+choice.to});await inspect(f,bound.choices[i].label,{kind:'text',text:choice.label});await inspect(f,bound.choices[i].detail,{kind:'text',text:choice.detail});}
 }
});

test('X03 every source file and authored note retains an exact definition route',async()=>{
 const f=await setup(),{sources}=await import('./dist/world.js');assert.equal(Object.keys(sources).length,29);
 for(const [id,note]of Object.entries(sources)){const b=f.catalogue.bindings.sources[id];assert.ok(f.catalogue.nodes[b.root]);await inspect(f,b.title,{kind:'text',text:note.title});await inspect(f,b.note,{kind:'text',text:note.note});}
 for(const [file,item]of Object.entries(f.catalogue.files)){assert.equal(hash(fs.readFileSync(path.join(__dirname,'dist',file))),item.sha256,file);assert.equal(hash(item.text),item.sha256,file);}
 for(const node of Object.values(f.catalogue.nodes)){const text=f.catalogue.files[node.source.file].text.slice(node.source.startUtf16,node.source.endUtf16Exclusive);assert.equal(hash(text),node.source.lexemeSha256);for(const link of node.links)assert.ok(f.catalogue.nodes[link.target]);}
});

test('reader-facing explanations, alternate titles, shortened passage labels and plain source notes bind to their own source',async()=>{
 const f=await setup(),{scenes,sources}=await import('./dist/world.js'),{readingFor,choiceLabel,sourceGuideFor,sourceTitles}=await import('./dist/reading-guide.js');
 for(const [id,scene]of Object.entries(scenes)){
  const r=readingFor(id,scene),b=f.catalogue.bindings.readings[id];await inspect(f,b.title,{kind:'text',text:r.title});await inspect(f,b.lead,{kind:'text',text:r.lead});
  assert.equal(b.body.length,r.body.length,id);for(const [n,text]of r.body.entries())await inspect(f,b.body[n],{kind:'text',text});
  for(const [n,c]of scene.choices.entries()){await inspect(f,b.choices[n].label,{kind:'text',text:choiceLabel(c.label)});const destination=f.catalogue.bindings.readings[c.to];await inspect(f,destination.lead,{kind:'text',text:readingFor(c.to,scenes[c.to]).lead});}
 }
 for(const [id,s]of Object.entries(sources)){await inspect(f,f.catalogue.bindings.sourceTitles[id],{kind:'text',text:sourceTitles[id]});for(const [n,text]of sourceGuideFor(id,s).entries())await inspect(f,f.catalogue.bindings.sourceGuides[id][n],{kind:'text',text});}
});

test('X04 stale basis, unknown targets, changed spans and source bytes refuse',async()=>{
 const f=await setup(),target=f.catalogue.bindings.scenes.observation.title;
 const stale=await f.inspector.inspect({...request(f,target),expectedBasis:{old:true}});assert.equal(stale.value.failure.code,'ENC-DOC-BASIS');
 const unknown=await f.inspector.inspect(request(f,'missing'));assert.equal(unknown.value.failure.code,'ENC-DOC-TARGET');
 const {createInspector}=await import('./dist/inspection/host.js');
 for(const kind of ['span','text']){const catalogue=structuredClone(f.catalogue);if(kind==='span')catalogue.nodes[target].source.startUtf16++;else catalogue.files['world.js'].text+=' ';
  const i=await createInspector({...f,catalogue});if(kind==='span')assert.equal((await i.inspect(request(f,target))).value.failure.code,'ENC-DOC-SOURCE');else await assert.rejects(i.inspect(request(f,target)),/INTEGRITY/);
 }
});

test('X05 forged visible text, destination and authority inputs refuse',async()=>{
 const f=await setup(),target=f.catalogue.bindings.scenes.observation.title;
 for(const display of [{kind:'text',text:'What did the measurement miss?'},{kind:'href',href:'#other'},{kind:'text',text:'forged',grants:['write']}])assert.equal((await f.inspector.inspect(request(f,target,display))).value.failure.code,'ENC-DOC-DISPLAY');
 const forged=await f.inspector.inspect({...request(f,target),facts:[]});assert.equal(forged.value.failure.code,'ENC-DOC-INPUT');
});

test('X08 selected closure and inspection invocation have no mutation or discovery path',async()=>{
 const f=await setup(),before=JSON.stringify(f.catalogue),target=f.catalogue.bindings.scenes.observation.title;await inspect(f,target);assert.equal(JSON.stringify(f.catalogue),before);
 for(const name of ['s01.run','s01.observe','s01.authority','s01.discover','ec.patch','lab.edit'])assert.equal(Object.hasOwn(f.bundle.model.queries,name),false);
 const host=fs.readFileSync(path.join(__dirname,'dist/inspection/host.js'),'utf8');assert.doesNotMatch(host,/localStorage|sessionStorage|kernel\.execute|method:\s*['"]POST/);
});

test('X09 unrelated supplied source uses identical shared algebra',async()=>{
 const f=await setup(),{createInspector}=await import('./dist/inspection/host.js');const source="const book = 'Another world';",sha=hash(source),id='unrelated-book',start=source.indexOf("'"),end=source.lastIndexOf("'")+1;
 const record={id,label:'Book title',kind:'Literal',literalType:'string',links:[],source:{file:'book.js',revision:'fixture',fileSha256:sha,startUtf16:start,endUtf16Exclusive:end,lexemeSha256:hash(source.slice(start,end))}};
 const catalogue={files:{'book.js':{text:source,sha256:sha}},nodes:{[id]:record}};const i=await createInspector({...f,catalogue});const r=await i.inspect(request(f,id,{kind:'text',text:'Another world'}));assert.equal(r.value.ok,true,JSON.stringify(r.value));
 assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'dist/inspection/sources/algebra/inspection-document.process.json'),'utf8'),/ww\.scene|Worldwright|observation\.title/);
});

test('portable input refuses getters without calling them and requires explicit context',async()=>{
 const f=await setup(),target=f.catalogue.bindings.scenes.observation.title;let calls=0;
 const getter=request(f,target);Object.defineProperty(getter,'target',{get(){calls++;throw Error('Getter ran');},enumerable:true});
 assert.equal((await f.inspector.inspect(getter)).value.failure.code,'ENC-DOC-INPUT');assert.equal(calls,0);
 for(const key of ['principal','context']){const q=request(f,target);delete q[key];assert.equal((await f.inspector.inspect(q)).value.failure.code,'ENC-DOC-INPUT');}
});

test('X10 inspector source, schema, capture and host are reachable; process reflection is definition-only',async()=>{
 const f=await setup();for(const file of ['inspection/client.js','inspection/host.js','inspection/sources/algebra/inspection-document.process.json','inspection/sources/source/inspection/document-schema.json','inspection/sources/build-inspection.cjs','workshop/temple-native.js'])assert.ok(f.catalogue.roots.some(r=>r.label===file),file);
 const r=await f.inspector.reflect();assert.ok(r.value.nodes.length);assert.match(r.value.limitations.join(' '),/no branch is marked/);assert.ok(r.value.nodes.every(n=>!Object.hasOwn(n,'executed')));
});

test('X11 declared static runtime identities are exact and do not select an MJS policy or source parser',async()=>{
 const f=await setup();for(const entry of f.manifest.files){const bytes=fs.readFileSync(path.join(__dirname,'dist',entry.file));assert.equal(bytes.length,entry.bytes);assert.equal(hash(bytes),entry.sha256);assert.ok(!entry.file.endsWith('.mjs'));}
 const host=fs.readFileSync(path.join(__dirname,'dist/inspection/host.js'),'utf8');assert.doesNotMatch(host,/acorn|127\.0\.0\.1|localhost|sourcery.*\.mjs/);assert.equal(f.manifest.executionBudget,20000000);
});
