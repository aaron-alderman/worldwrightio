'use strict';
// Host boundary: read declared owners, run algebra, write projections and receipts.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {projector}=require('./projection.cjs'),{compileFixture}=require('./fixture.cjs');
const {verify}=require('./guard.cjs');
const {compileInspection}=require('./inspection.cjs'),{application}=require('./application.cjs');
const {provenance}=require('./provenance.cjs');
const {applicationSource,applicationFile,semanticSource}=require('./encounter-source.cjs');
const {pageSource}=require('./page-source.cjs');
const {styleSource}=require('./style-source.cjs');
const {programSource}=require('./program-source.cjs');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function rename(from,to){
 // Windows file scanners can hold a just-closed module briefly. This retries
 // only a bounded native rename, never a semantic action or an external effect.
 for(let attempt=0;;attempt++)try{fs.renameSync(from,to);return;}catch(error){
  if(attempt===7||!['EPERM','EBUSY','EACCES'].includes(error.code))throw error;
  await new Promise(resolve=>setTimeout(resolve,50*(attempt+1)));
 }
}
async function build(root=path.resolve(__dirname,'..'),output=path.join(root,'dist'),{repairOutput=false,relRelease=false}={}){
 root=path.resolve(root);output=path.resolve(output);
 if(output===root||output===path.parse(output).root||!output.startsWith(root+path.sep))throw Error('BUILD-PATH: Output must be an explicit child of this workspace.');
 const destination=output;
 if(relRelease&&destination===path.join(root,'dist'))throw Error('Choose a separate REL release directory.');
 if(destination===path.join(root,'dist')&&fs.existsSync(destination)&&!repairOutput)await verify(root,{inputs:false});
 // A failed projection leaves the accepted preview untouched. Publication of a
 // complete local output is a reversible rename inside the checked workspace.
 output=path.join(root,'.build-stage-'+crypto.randomUUID());
 const inputs=new Map(),artifacts=[],compiler=projector(root),derivation=provenance(root),maps={},texts={};
 const input=file=>{const full=path.resolve(root,file);if(!full.startsWith(root+path.sep)||full.startsWith(path.join(root,'dist')+path.sep)||full.startsWith(output+path.sep)||file.startsWith('verification/'))throw Error('BUILD-INPUT: Generated output and verification references are not source owners: '+file);const bytes=fs.readFileSync(full);inputs.set(file,hash(bytes));return bytes;};
 const {definition,spans}=applicationSource(root,input);
 const sourceSpans=new Map([[applicationFile,spans]]),sourceKeySpans=new Map(),authorityOwners={},renderedOwners=[],programInputs={};
 const loadDefinition=file=>{
  const owner=semanticSource(root,file,input);
  authorityOwners[file]=owner.file;
  sourceSpans.set(owner.file,owner.spans);
  sourceKeySpans.set(owner.file,owner.keySpans);
  return owner.definition;
 };
 const manifest=loadDefinition('source/build.json'),policy=loadDefinition('source/provenance.policy.json');
 const grammarByKind=Object.fromEntries(['program','style','composition'].map(name=>[name,loadDefinition('algebra/'+name+'-grammar.json')]));
 const documents=new Map();
 for(const item of manifest.programs){
  const programme=programSource(item.owner,input,grammarByKind.program);
  documents.set(item.owner,programme.document);
  sourceSpans.set(item.owner,programme.spans);
  programInputs[item.owner]=programme.inputs;
 }
 for(const [items,readSource,grammar] of [[manifest.pages,pageSource,grammarByKind.composition],[manifest.styles,styleSource,grammarByKind.style]]){
  for(const item of items){
   const {document,spans}=readSource(item.owner,input(item.owner).toString('utf8'),grammar);
   documents.set(item.owner,document);
   sourceSpans.set(item.owner,spans);
   renderedOwners.push(item.owner);
  }
 }
 const semantics=new Map();
 for(const item of manifest.semantics)if(item.owner.endsWith('.json'))semantics.set(item.owner,loadDefinition(item.owner));
 const loadSemantics=file=>semantics.get(file);
 const write=(file,bytes,owner)=>{if(artifacts.some(a=>a.path===file))throw Error('PROV-WRITE: A second writer tried to replace '+file);const dest=path.resolve(output,file);if(!dest.startsWith(output+path.sep))throw Error('BUILD-PATH: Output escaped its directory.');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);artifacts.push({path:file,owner,sha256:hash(bytes)});};
 for(const file of ['package.json','algebra/provenance.process.json','algebra/application.process.json','algebra/projection.process.json','algebra/ownership.process.json','algebra/application.encounter','algebra/projection.encounter','algebra/ownership.encounter','algebra/provenance.encounter','bootstrap/encounter-source.cjs','bootstrap/page-source.cjs','bootstrap/style-source.cjs','bootstrap/program-source.cjs','bootstrap/build.cjs','bootstrap/rel-release.cjs','bootstrap/application.cjs','bootstrap/inspection.cjs','bootstrap/provenance.cjs','bootstrap/projection.cjs','bootstrap/fixture.cjs','bootstrap/guard.cjs','bootstrap/check.cjs'])input(file);
 const emitProjection=async(item,document,grammar,grammarOwner,kind,slots={},slotSources={})=>{
  const result=await compiler.project(document,grammar,slots),traced=await derivation.trace(document,grammar,item.owner,grammarOwner,slots,slotSources);
  const {value:wrapped}=await derivation.run('provenance.envelope',{policy,kind,owner:item.owner,artifact:item.output,body:result.text,graph:traced.value});
  maps[item.output]=wrapped.map;texts[item.output]=wrapped.text;write(item.output,wrapped.text,item.owner);artifacts.at(-1).steps=result.steps;return {...result,graph:traced.value};
 };
 for(const item of manifest.native)input(item.owner);
 for(const [kind,name]of [['programs','program'],['styles','style']]){
  const grammarFile='algebra/'+name+'-grammar.json',grammar=grammarByKind[name];
  for(const item of manifest[kind]){
   const document=documents.get(item.owner);
   if(item.graph)write(item.graph,JSON.stringify(document,null,2)+'\n',item.owner);
   await emitProjection(item,document,grammar,grammarFile,kind);
  }
 }
 for(const item of [...manifest.assets,...manifest.semantics,...(manifest.data??[])])write(item.output,input(item.owner),item.owner);
 const nativeFiles=['bootstrap/temple-seed.cjs','bootstrap/ports/value.cjs','bootstrap/ports/kernel.cjs','bootstrap/ports/programme.cjs'];
 const modules=nativeFiles.map(file=>require(path.join(root,'source/semantics',file)));
 const nativeNames=['createKernel','valuePorts','kernelPorts','invoke'];
 const {invoke,valuePorts}=Object.fromEntries(modules.map((module,i)=>[nativeNames[i],module[nativeNames[i]]]));
 const nativeText=modules.map((module,i)=>module[nativeNames[i]].toString()).join('\n\n')+'\nexport {'+nativeNames.join(',')+'};\n';
 write('workshop/temple-native.js',nativeText,'supplied native mechanism closure: '+nativeFiles.join(', '));
 write('workshop/package.json',JSON.stringify({private:true,type:'module'})+'\n','bootstrap/build.cjs: module transport configuration');
 write('package.json',JSON.stringify({private:true,type:'module'})+'\n','bootstrap/build.cjs: module transport configuration');
 const {createApplicationRuntime}=require(path.join(root,'source/native/application-host.cjs'));
 write('application-native.js',modules[0].createKernel.toString()+'\n'+modules[1].valuePorts.toString()+'\nexport '+createApplicationRuntime.toString()+'\n','source/native/application-host.cjs + unchanged Temple seed/value ports');
 const presentation=await compileInspection(root,output,{modelOnly:true,load:loadSemantics,definition});
 const plan=(await invoke({model:presentation.model,entry:'sp.stylePlan',input:{eventInput:{},spPolicy:presentation.presentationPolicy,spGrammar:presentation.grammarSource},ports:valuePorts(),nested:['kernel.invoke']})).value;
 const styleDocument=(await derivation.run('provenance.cssDocument',{plan,policy:presentation.presentationPolicy})).value;
 write('ownership/intermediates/presentation.style.json',JSON.stringify(styleDocument),'algebra/provenance.process.json: provenance.cssDocument');
 await emitProjection({owner:'ownership/intermediates/presentation.style.json',output:'presentation/style.css'},styleDocument,grammarByKind.style,'algebra/style-grammar.json','semanticStyle');
 const presenter=await import(pathToFileURL(path.join(output,'presentation/host.js')).href);
 const shared=presenter.createPresenter(presentation);
 if((await shared.style()).value!==texts['presentation/style.css'])throw Error('PROV-STYLE: Semantic stylesheet projection differs from css.renderPlan.');
 const compiled=await compileFixture(root,async programme=>(await shared.listing({programme,origin:{kind:'build-time-process-projection'}})).value.text,manifest,loadSemantics);
 compiled.fixture.presentation=presentation;
 write('workshop/fixture.json',JSON.stringify(compiled.fixture),'source/semantics/algebra and source/semantics/source');
 write('workshop/encounter-story.html',compiled.html,'source/semantics/source/experiment/story.encounter → ec.run → html.serialize');
 write('workshop/source-manifest.txt','THE WORKSHOP — OWNED SOURCE SNAPSHOT\nGenerated files are disposable. Edit source/ and algebra/, then run node bootstrap/build.cjs.\nThe seed and native function bodies are unchanged; the budget remains 20 million.\n\n'+compiled.fixture.hashes.map(h=>h.hash+'  '+h.file).join('\n')+'\n','bootstrap/build.cjs: source receipt');
 write('workshop/README.txt','Generated output: edit the repository’s source/ and algebra/ owners, then run node bootstrap/build.cjs.\nDo not edit this directory or use it as an input.\n','bootstrap/build.cjs: correction signpost');
 const world=await import(pathToFileURL(path.join(output,'world.js')).href);
 const app=await application(root,Object.keys(world.scenes),definition);
 write('application.json',JSON.stringify(app.data),'source/application.encounter + algebra/application.process.json');
 const serialize=async tree=>(await invoke({model:compiled.fixture.model,entry:'html.serialize',input:{input:tree},ports:valuePorts(),nested:['kernel.invoke','kernel.execute','kernel.evaluate']})).value;
 const grammar=grammarByKind.composition;
 const navigation=(await derivation.run('provenance.navigationDocument',{definition:app.data.definition})).value;
 write('ownership/intermediates/navigation.page.json',JSON.stringify(navigation),'algebra/provenance.process.json: provenance.navigationDocument');
 await emitProjection({owner:'ownership/intermediates/navigation.page.json',output:'application/navigation.html'},navigation,grammar,'algebra/composition-grammar.json','fragment');
 const slots={'application.navigation':texts['application/navigation.html']},slotSources={'application.navigation':{artifact:'application/navigation.html'}};
 for(const item of manifest.pages){
  const document=documents.get(item.owner);
  write(item.graph,JSON.stringify(document,null,2)+'\n',item.owner);
  const result=item.output?await emitProjection(item,document,grammar,'algebra/composition-grammar.json','pages',slots,slotSources):{...await compiler.project(document,grammar,slots),graph:(await derivation.trace(document,grammar,item.owner,'algebra/composition-grammar.json',slots,slotSources)).value};
  for(const [name,view]of Object.entries(app.data.definition.views))if(view.composition===item.owner){
   const refs=await app.selection(document,view.parts),fragment=(await derivation.run('provenance.fragment',{graph:result.graph,refs,compiled:result.compiled,partsPointer:['views',name,'parts']})).value;
   const {value:wrapped}=await derivation.run('provenance.envelope',{policy,kind:'fragment',owner:item.owner,artifact:view.fragment,body:fragment.text,graph:fragment.graph});
   maps[view.fragment]=wrapped.map;texts[view.fragment]=wrapped.text;write(view.fragment,wrapped.text,item.owner);
  }
 }
 // Compatibility destinations are derived from the same route owner. They have
 // no independent application startup or private editing state.
 for(const alias of app.data.definition.compatibility){const file=alias.path.endsWith('/')?alias.path+'index.html':alias.path;const depth=file.split('/').length-1,target='../'.repeat(depth)+alias.target;
  const tree={tag:'html',attrs:{lang:'en'},children:[{tag:'head',attrs:{},children:[{tag:'meta',attrs:{'http-equiv':'refresh',content:'0;url='+target},children:[]},{tag:'title',attrs:{},children:['Worldwright — Encounter']}]},{tag:'body',attrs:{},children:[{tag:'a',attrs:{href:target},children:['Continue in Worldwright']}]}]};
  const bytes='<!doctype html>\n'+await serialize(tree);const existing=artifacts.find(a=>a.path===file);if(existing){if(existing.sha256!==hash(bytes))throw Error('PROV-ALIAS: Conflicting compatibility destinations.');}else write(file,bytes,'source/application.encounter');
 }
 const inputRecords=[...inputs].map(([path,sha256])=>({path,sha256}));
 const producers=(await derivation.run('provenance.plan',{manifest,definition:app.data.definition,policy,inputs:inputRecords,programInputs})).value;
 const sourceValues=Object.fromEntries([[applicationFile,definition],...documents]);for(const record of inputRecords)if(record.path.endsWith('.json'))sourceValues[record.path]=JSON.parse(fs.readFileSync(path.join(root,record.path),'utf8'));
 for(const file of ['ownership/intermediates/presentation.style.json','ownership/intermediates/navigation.page.json'])sourceValues[file]=JSON.parse(fs.readFileSync(path.join(output,file),'utf8'));
 for(const graph of Object.values(maps))await derivation.run('provenance.checkMap',{graph,sourceValues});
 for(const [file,map]of Object.entries(maps))write('ownership/maps/'+file+'.map.json',JSON.stringify(map),'algebra/provenance.process.json: provenance.document');
 for(const record of inputRecords)write('ownership/sources/'+record.path,fs.readFileSync(path.join(root,record.path)),record.path);
 const index=(await derivation.run('provenance.index',{inputs:inputRecords,producers,policy})).value;
 write('ownership/index.json',JSON.stringify(index),'algebra/provenance.process.json: provenance.index');
 await compileInspection(root,output,{load:loadSemantics,definition,provenance:{enrich:catalogue=>derivation.enrich(catalogue,maps,producers,{definition,sourceSpans,sourceKeySpans,authorityOwners,renderedOwners}),selectPaths:derivation.selectPaths,producers}});
 // Observe output closure; inputs must be explicitly declared above or through
 // the typed manifest. An unexpected source file remains an ownership error.
 function inventory(dir,visit){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())inventory(full,visit);else visit(full);}}
 const observed=[];inventory(output,full=>observed.push({path:path.relative(output,full).replaceAll('\\','/'),sha256:hash(fs.readFileSync(full))}));
 const accepted=(await derivation.run('provenance.receipt',{producers,observed,inputs:inputRecords})).value;
 artifacts.splice(0,artifacts.length,...accepted);
 const receipt={protocol:'encounter/build-receipt/1',reason:manifest.reason,target:manifest.target,goal:manifest.goal,inputs:inputRecords,artifacts,projectionUsage:compiler.usage,distReadAsSource:false};
 await verify(root,{output,receipt});
 if(relRelease){
  try{await require('./rel-release.cjs').relRelease(output,destination,receipt);}
  finally{fs.rmSync(output,{recursive:true,force:true});}
  return {...receipt,outputDirectory:destination};
 }
 let previous;
 if(fs.existsSync(destination)){
  previous=path.join(root,'.build-history',path.basename(destination)+'-'+crypto.randomUUID());
  if(!previous.startsWith(root+path.sep)||!destination.startsWith(root+path.sep))throw Error('BUILD-PATH: Refused an unchecked output rename.');
  fs.mkdirSync(path.dirname(previous),{recursive:true});await rename(destination,previous);
 }
 try{fs.mkdirSync(path.dirname(destination),{recursive:true});await rename(output,destination);}catch(error){if(previous)await rename(previous,destination);throw error;}
 fs.mkdirSync(path.join(root,'generated'),{recursive:true});fs.writeFileSync(path.join(root,'generated/build-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 return {...receipt,outputDirectory:destination};
}
module.exports={build};
if(require.main===module){const args=process.argv.slice(2),repairOutput=args.includes('--repair-output'),destination=args.find(a=>!a.startsWith('--')),relRelease=args.includes('--rel-release');build(path.resolve(__dirname,'..'),destination||path.resolve(__dirname,'../dist'),{repairOutput,relRelease}).then(r=>console.log(`Built ${r.artifacts.length} artifacts from declared owners; ${r.projectionUsage.steps.toLocaleString()} / ${r.projectionUsage.limit.toLocaleString()} projection ticks. No dist inputs.`)).catch(error=>{console.error(error);process.exitCode=1;});}
