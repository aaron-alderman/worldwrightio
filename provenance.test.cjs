const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {provenance}=require('./bootstrap/provenance.cjs'),{projector}=require('./bootstrap/projection.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),root=__dirname;
test('equal generated literals retain different source occurrences and exact grammar rules',async()=>{
 const grammar=read('algebra/program-grammar.json'),document={protocol:grammar.sourceProtocol,identity:'test.js',nodes:[{id:0,op:'LiteralValue',data:{value:'same'},links:{}},{id:1,op:'LiteralValue',data:{value:'same'},links:{}},{id:2,op:'List',data:{},links:{elements:[0,1]}}],entry:2};
 const p=provenance(root),trace=(await p.trace(document,grammar,'example.program.json','algebra/program-grammar.json')).value,text=(await projector(root).project(document,grammar)).text;
 assert.equal(trace.length,text.length);
 const first=(await p.locate(trace,text.indexOf('same'),text)).value,last=(await p.locate(trace,text.lastIndexOf('same'),text)).value;
 assert.deepEqual(first.origin.pointer,['nodes',0,'data','value']);assert.deepEqual(last.origin.pointer,['nodes',1,'data','value']);assert.deepEqual(first.path.at(-1).rule.pointer,['rules','LiteralValue']);
 await assert.rejects(p.locate(trace,-1,text),/PROV-OFFSET/);await assert.rejects(p.locate(trace,text.length,text),/PROV-OFFSET/);
});
test('every output has one declared producer; unknown outputs and missing owners refuse',async()=>{
 const p=provenance(root),producer={artifact:'x',sources:['owner'],kind:'byte-copy'},observed=[{path:'x',sha256:'same'}],inputs=[{path:'owner',sha256:'same'}];
 assert.equal((await p.run('provenance.accept',{producers:[producer],observed,inputs})).value,true);
 await assert.rejects(p.run('provenance.accept',{producers:[producer,producer],observed,inputs}),/PROV-PRODUCER/);
 await assert.rejects(p.run('provenance.accept',{producers:[producer],observed:[...observed,{path:'surprise.js'}],inputs}),/PROV-UNDECLARED/);
 await assert.rejects(p.run('provenance.accept',{producers:[producer],observed,inputs:[]}),/PROV-SOURCE/);
 await assert.rejects(p.run('provenance.accept',{producers:[producer],observed:[{path:'x',sha256:'changed'}],inputs}),/PROV-COPY/);
});
test('presentation CSS has one semantic producer, and colour bytes map to policy',async()=>{
 const index=read('dist/ownership/index.json'),manifest=read('source/build.json');
 const records=index.producers.filter(p=>p.artifact==='presentation/style.css');assert.equal(records.length,1);assert.equal(records[0].kind,'semantic-style');assert.equal(manifest.styles.some(s=>s.output==='presentation/style.css'),false);assert.equal(fs.existsSync('source/styles/presentation/style.style.json'),false);
 const graph=read('dist/ownership/maps/presentation/style.css.map.json'),text=fs.readFileSync('dist/presentation/style.css','utf8'),policy=read('source/inspection/source/presentation/source-presentation.json'),colour=policy.themes[0].roles.plain,offset=text.indexOf(colour);assert.ok(offset>=0);
 const found=(await provenance(root).run('provenance.resolve',{maps:{'presentation/style.css':graph},texts:{'presentation/style.css':text},eventInput:{artifact:'presentation/style.css',offset}})).value;
 assert.equal(found.origin.owner,'source/inspection/source/presentation/source-presentation.json');assert.deepEqual(found.origin.pointer,['themes',0,'roles','plain']);
 const {createPresenter}=await import('./dist/presentation/host.js');assert.equal((await createPresenter(read('dist/inspection/model.json')).style()).value,text);
});
test('inspector links generated reading literals to their exact canonical source value',async()=>{
 const cat=read('dist/inspection/catalogue.json'),record=cat.nodes[cat.bindings.readings.care.title];
 const owner='ownership/sources/source/programs/'+record.source.file.replace('.js','.program');
 const links=record.links.filter(l=>l.relation==='derivation'),source=links.map(l=>cat.nodes[l.target]).find(n=>n.source.file.startsWith(owner)&&n.source.file.endsWith('.encounter')&&n.label.includes('"data","value"'));
 assert.ok(source,'No exact source-value link from generated reading title');
 const file=cat.files[source.source.file],literal=file.text.slice(source.source.startUtf16,source.source.endUtf16Exclusive);assert.equal(JSON.parse(literal),'Remember\nto care.');
 assert.ok(links.some(l=>cat.nodes[l.target].source.file==='ownership/sources/algebra/program-grammar.json'));
});
test('navigation slots retain their source through composition, including repeated labels',async()=>{
 const index=read('dist/ownership/index.json'),maps={},texts={};for(const file of ['index.html','application/navigation.html']){maps[file]=read('dist/ownership/maps/'+file+'.map.json');texts[file]=fs.readFileSync('dist/'+file,'utf8');}
 const text=texts['index.html'],offset=text.indexOf('>Encounter</a>')+1;assert.ok(offset>0);
 const result=(await provenance(root).run('provenance.resolve',{maps,texts,eventInput:{artifact:'index.html',offset}})).value;
 assert.equal(result.origin.owner,'source/application.encounter');assert.deepEqual(result.origin.pointer,['navigation',2,'label']);
 const href=text.indexOf('href="#workshop"')+'href="'.length;
 const destination=(await provenance(root).run('provenance.resolve',{maps,texts,eventInput:{artifact:'index.html',offset:href}})).value;
 assert.equal(destination.origin.owner,'source/application.encounter');assert.deepEqual(destination.origin.pointer,['navigation',2,'href']);
 const catalogue=read('dist/inspection/catalogue.json'),binding=catalogue.bindings.application;
 const lexeme=id=>{
  const {source}=catalogue.nodes[id],snapshot=catalogue.files[source.file];
  assert.equal(source.file,'ownership/sources/source/application.encounter');
  assert.equal(source.fileSha256,snapshot.sha256);
  return snapshot.text.slice(source.startUtf16,source.endUtf16Exclusive);
 };
 assert.equal(lexeme(binding.navigation[2]),'{ kind = "route"; label = "Encounter"; href = "#workshop" }');
 assert.match(lexeme(binding.routes[0]),/hash = "workshop"/);
 assert.match(lexeme(binding.views.example),/fragment = "views\/example.html"/);
 assert.ok(catalogue.nodes[binding.root].links.some(link=>link.target===binding.views.example));
 assert.ok(index.producers.some(p=>p.artifact==='application/navigation.html'));
});
test('changing the canonical palette regenerates CSS; absent source pointers refuse',async()=>{
 const bundle=read('dist/inspection/model.json'),policy=structuredClone(bundle.presentationPolicy);policy.themes[0].roles.plain='#123456';
 const {invoke,valuePorts}=await import('./dist/workshop/temple-native.js');
 const plan=(await invoke({model:bundle.model,entry:'sp.stylePlan',input:{spPolicy:policy,eventInput:{}},ports:valuePorts(),nested:['kernel.invoke']})).value;
 const p=provenance(root),document=(await p.run('provenance.cssDocument',{plan,policy})).value;
 const rendered=(await projector(root).project(document,read('algebra/style-grammar.json'))).text;assert.match(rendered,/--sp-light-plain:#123456;/);
 await assert.rejects(p.run('provenance.pointer',{sourceValues:{owner:{present:1}},eventInput:{owner:'owner',pointer:['absent']}}),/PROV-POINTER/);
});

test('rendered pages and selected view fragments link to exact Encounter text and attribute spans',async()=>{
 const catalogue=read('dist/inspection/catalogue.json'),manifest=read('source/build.json'),definition=read('dist/application/definition.json');
 const p=provenance(root);
 for(const page of manifest.pages){
  const artifact=page.output??Object.values(definition.views).find(view=>view.composition===page.owner).fragment;
  const rendered=catalogue.files[artifact],authoredFile='ownership/sources/'+page.owner,authored=catalogue.files[authoredFile];
  const fileNode=catalogue.nodes['source:'+artifact+':0:'+rendered.text.length];
  const graph=read('dist/ownership/maps/'+artifact+'.map.json'),ir=read('dist/'+page.graph);
  assert.equal(graph.sourceOwner,page.owner);
  assert.ok(ir.nodes.length>0);
  const records=fileNode.links.map(link=>catalogue.nodes[link.target]).filter(node=>node.kind==='Rendered page value');
  assert.ok(records.length>0,artifact);
  let text=false,attribute=false;
  for(const record of records){
   const source=catalogue.nodes[record.links[0].target].source;
   assert.equal(source.file,authoredFile);assert.equal(source.fileSha256,authored.sha256);
   const literal=authored.text.slice(source.startUtf16,source.endUtf16Exclusive);
   const shown=rendered.text.slice(record.source.startUtf16,record.source.endUtf16Exclusive);
   if(literal===JSON.stringify(shown))text=true;
   if(literal===shown&&/^[a-z][a-z-]*$/.test(shown))attribute=true;
  }
  assert.ok(text&&attribute,artifact+' has both exact text and attribute-key links');
  const record=records.find(record=>record.label.length>20);
  const {value:location}=await p.run('provenance.resolve',{maps:{[artifact]:graph},texts:{[artifact]:rendered.text},eventInput:{artifact,offset:record.source.startUtf16}});
  assert.equal(location.origin.owner,page.owner);
 }
});

test('authored stylesheets retain ordered IR and exact selector and declaration spans',async()=>{
 const catalogue=read('dist/inspection/catalogue.json'),manifest=read('source/build.json'),p=provenance(root);
 for(const {owner,output,graph:irPath} of manifest.styles){
  const file=catalogue.files[output],graph=read('dist/ownership/maps/'+output+'.map.json'),ir=read('dist/'+irPath);
  assert.equal(graph.sourceOwner,owner);assert.equal(ir.nodes.at(-1).op,'StyleSheet');
  const records=catalogue.nodes['source:'+output+':0:'+file.text.length].links
   .map(link=>catalogue.nodes[link.target]).filter(node=>node.kind==='Rendered style value');
  for(const field of ['selector','value']){
   const record=records.find(node=>catalogue.nodes[node.links[0].target].label.endsWith('"'+field+'"]'));
   assert.ok(record,output+' · '+field);
   const {source}=catalogue.nodes[record.links[0].target],authored=catalogue.files[source.file];
   assert.equal(source.file,'ownership/sources/'+owner);assert.equal(source.fileSha256,authored.sha256);
   assert.equal(JSON.parse(authored.text.slice(source.startUtf16,source.endUtf16Exclusive)),
    file.text.slice(record.source.startUtf16,record.source.endUtf16Exclusive));
   const {value}=await p.run('provenance.resolve',{maps:{[output]:graph},texts:{[output]:file.text},
    eventInput:{artifact:output,offset:record.source.startUtf16}});
   assert.equal(value.origin.owner,owner);assert.equal(value.origin.pointer.at(-1),field);
  }
 }
});
