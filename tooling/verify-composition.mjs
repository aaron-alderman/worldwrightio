import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const repository=fileURLToPath(new URL('../',import.meta.url));
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function files(root,prefix=''){if(!fs.existsSync(path.join(root,prefix)))return [];return fs.readdirSync(path.join(root,prefix),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(root,prefix+e.name+'/'):[prefix+e.name]).sort();}
/** Structural/corpus audit, independently checks a concrete consumer; no browser claim. */
export function verifyComposition(directory,{checkCreationHashes=false}={}){
 const root=path.resolve(directory),receipt=read(path.join(root,'composition-receipt.json')),manifest=read(path.join(root,'bootstrap/site.json'));
 assert.equal(receipt.protocol,'worldwright/composition-receipt/1');assert.equal(manifest.executionBudget,20000000);
 const selected=new Set(receipt.selected),allFiles=files(root),errors=[];
 const expect=(condition,message)=>{if(!condition)errors.push(message);};
 for(const file of receipt.files){expect(selected.has(file.owner)||file.owner==='foundation','Unknown owner '+file.owner);expect(fs.existsSync(path.join(root,file.target)),'Missing source '+file.target);if(checkCreationHashes&&fs.existsSync(path.join(root,file.target)))expect(hash(fs.readFileSync(path.join(root,file.target)))===file.sha256,'Creation hash changed '+file.target);}
 expect(hash(fs.readFileSync(path.join(root,'bootstrap/temple-seed.cjs')))===hash(fs.readFileSync(path.join(repository,'templates/world/bootstrap/temple-seed.cjs'))),'Trusted seed drift');
 for(const directory of fs.readdirSync(path.join(repository,'packs'),{withFileTypes:true}).filter(x=>x.isDirectory())){
  const descriptorPath=path.join(repository,'packs',directory.name,'pack.json');if(!fs.existsSync(descriptorPath))continue;const descriptor=read(descriptorPath);
  if(selected.has(descriptor.id)){for(const dependency of descriptor.requires??[])expect(selected.has(dependency),'Missing dependency '+descriptor.id+' -> '+dependency);continue;}
  for(const target of [...descriptor.modules??[],...descriptor.sources??[],...descriptor.assets??[]].map(x=>typeof x==='string'?x:x.target??x.source))if(!receipt.files.some(f=>f.target===target))expect(!allFiles.includes(target),'Excluded pack payload '+descriptor.id+': '+target);
  for(const output of descriptor.outputs??[]){const target=typeof output==='string'?output:output.path;if(!target.includes('*'))expect(!allFiles.includes('dist/'+target),'Excluded route '+target);}
  if(descriptor.runtime?.profile)expect(!Object.hasOwn(receipt.profiles,descriptor.runtime.profile),'Excluded runtime grant profile '+descriptor.runtime.profile);
 }
 // Original corpus can remain in the historical template, never in a new composition.
 const authored=allFiles.filter(f=>f.startsWith('source/')&&/\.(rel|json|encounter|temple)$/.test(f)||f.startsWith('dist/')&&f.endsWith('.html'));
 const forbidden=/Inside the mind of Aaron Alderman|A personal expedition|Physics, faith, and the space between|Forty places\. More than one way|source\/experiment\/story\.rel|retained\/(?:aaron|claimipedia)|aaronalderman\.com/i;
 for(const file of authored)expect(!forbidden.test(fs.readFileSync(path.join(root,file),'utf8')),'Original corpus marker in '+file);
 const original=read(path.join(repository,'evidence/composition/original-corpus-fingerprints.json')),originalHashes=new Set(original.prose.map(x=>x.sha256));
 for(const file of authored){const text=fs.readFileSync(path.join(root,file),'utf8'),strings=[];const collect=value=>{if(typeof value==='string'){strings.push(value);if(/^[\[{]/.test(value)){try{collect(JSON.parse(value));}catch{}}}else if(value&&typeof value==='object')Object.values(value).forEach(collect);};for(const match of text.matchAll(/"((?:\\.|[^"\\])*)"/g)){try{collect(JSON.parse(match[0]));}catch{}}for(const match of text.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))strings.push(match[1].replace(/<[^>]+>/g,'').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&#39;',"'").replaceAll('&quot;','"'));for(const value of strings)expect(!originalHashes.has(hash(value)),'Original place prose copied into '+file);}
 const legacyAssets=files(path.join(repository,'templates/expedition')).filter(f=>/\.(svg|png|jpe?g|webp|mp4|webm|woff2?)$/.test(f));
 const oldHashes=new Set(legacyAssets.map(f=>hash(fs.readFileSync(path.join(repository,'templates/expedition',f)))));
 for(const file of allFiles.filter(f=>f.startsWith('assets/')&&/\.(svg|png|jpe?g|webp|mp4|webm|woff2?)$/.test(f)))expect(!oldHashes.has(hash(fs.readFileSync(path.join(root,file)))),'Original media copied: '+file);
 let localResourcesChecked=0;
 for(const file of allFiles.filter(f=>f.startsWith('dist/')&&f.endsWith('.html'))){const text=fs.readFileSync(path.join(root,file),'utf8'),documentURL='https://source-only.invalid/'+file.slice(5),base=new URL(/<base\s+href="([^"]*)"/.exec(text)?.[1]??'',documentURL);for(const match of text.replace(/<base\b[^>]*>/g,'').matchAll(/\b(?:href|src|poster)="([^"]+)"/g)){const target=match[1].replaceAll('&amp;','&');if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target))continue;const url=new URL(target,base),relative=decodeURIComponent(url.pathname).replace(/^\//,'');const resource=path.join(root,'dist',relative);expect(fs.existsSync(resource),'Missing local resource in '+file+': '+target);localResourcesChecked++;}}
 assert.deepEqual(errors,[],'Composition structural/corpus audit failed');
 return {protocol:'worldwright/composition-verification/1',selected:receipt.selected,sourceFiles:receipt.files.length,authoredFilesScanned:authored.length,localResourcesChecked,originalPlacesChecked:original.places,originalProsePassagesChecked:original.prose.length,seed:hash(fs.readFileSync(path.join(root,'bootstrap/temple-seed.cjs'))),executionBudget:manifest.executionBudget,scope:'structural-source-and-corpus; no browser visual or playback claim'};
}
export async function qualifyConsumers(){
 const {composeWorld}=await import('./compose-world.mjs');
 const parent=path.join(repository,'.build/composition-qa');fs.mkdirSync(parent,{recursive:true});const runRoot=fs.mkdtempSync(path.join(parent,'matrix-'));
 const cases=[['reader',{features:['reader']}],['atlas-subset',{features:['atlas','sources']}],['interactive',{features:['workshop','claims']}],['kitchen-sink',{profile:path.join(repository,'examples/tidepool/profile.json')}],['independent-agent',{profile:path.join(repository,'examples/seed-library/profile.json')}]];
 const checks=[];
 function build(directory){const result=spawnSync(process.execPath,['build.mjs'],{cwd:directory,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr+'\n'+result.stdout);return {command:['node','build.mjs'],stdoutSha256:hash(result.stdout),stderrSha256:hash(result.stderr)};}
 for(const [id,options]of cases){
  const directory=path.join(runRoot,id);await composeWorld(directory,options);const result=build(directory),audit=verifyComposition(directory,{checkCreationHashes:true});
  const runtimeActions=await exerciseEmittedRuntimes(directory);
  const artifacts=files(path.join(directory,'dist')).map(file=>({file,sha256:hash(fs.readFileSync(path.join(directory,'dist',file)))}));
  const compositionReceipt=read(path.join(directory,'composition-receipt.json'));
  checks.push({id,directory:path.relative(repository,directory).replaceAll('\\','/'),options:{features:options.features??null,profile:options.profile?path.relative(repository,options.profile).replaceAll('\\','/'):null},...audit,...result,runtimeActions,compositionReceiptSha256:hash(fs.readFileSync(path.join(directory,'composition-receipt.json'))),inputs:compositionReceipt.files.map(({owner,kind,target,sha256})=>({owner,kind,target,sha256})),artifacts});
  console.log('Verified native consumer '+id+': '+audit.selected.join(', '));
 }
 const removed=path.join(runRoot,'kitchen-sink');const prior=read(path.join(removed,'composition-receipt.json')),surviving=prior.files.filter(f=>['core','reader','sources'].includes(f.owner)&&['facts','asset'].includes(f.kind)).map(f=>({target:f.target,sha256:hash(fs.readFileSync(path.join(removed,f.target)))}));await composeWorld(removed,{features:['reader','sources'],replace:true});const result=build(removed);for(const file of surviving){assert.ok(fs.existsSync(path.join(removed,file.target)),'Removal lost surviving owned content '+file.target);assert.equal(hash(fs.readFileSync(path.join(removed,file.target))),file.sha256);}checks.push({id:'removal-preserves-owned-content',preservedFiles:surviving,...verifyComposition(removed),...result});console.log('Verified kitchen-sink -> reader,sources removal');
 const receipt={protocol:'worldwright/composition-consumer-qualification/1',evidenceFamily:'worldwright-composition-2026-11-06',checks,scope:'Actual source-only generated consumer native builds and structural/corpus checks; one local software evidence family, no independent human or browser playback claim.'};
 const evidence=path.join(repository,'evidence/composition');fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'consumers.json'),JSON.stringify(receipt,null,2)+'\n');writeCoverage();return receipt;
}
export function writeCoverage(){
 const owners={admission:'core','atlas-journey':'atlas',atlas:'atlas',authoring:'authoring','claimipedia-review':'claims',claimipedia:'claims',css:'core','encounter-code-compiler':'workshop','encounter-code-runtime':'workshop','encounter-code-types':'workshop','encounter-demo':'workshop','encounter-source':'inspector',encounter:'workshop','fact-index':'core','front-doors':'core',gateway:'core',html:'core',language:'core',lowering:'core','microsite-lamp':'programmes','microsite-media':'media','microsite-motion':'motion','microsite-projection':'microsites','microsite-sourcery':'programmes','microsite-temple-motion':'motion','microsite-temple-ui':'programmes','microsite-ui':'programmes','microsite-values':'programmes',microsites:'microsites',operators:'core',publication:'core','reader-activities':'activities','reader-models':'models','reader-navigation':'reader',source:'inspector','workshop-lab':'workshop'};
 const notes={
  'atlas-journey':'Actual reusable visit storage/reset, pin preview, history resume and reduced layout; new world supplies place identities.',
  'reader-navigation':'New reader search, per-place private notes, visit trail, clear trail and history focus. Native separate-page routes replace old hash reader routing.',
  'microsite-temple-ui':'New source-owned equipment-cell workflow and tree projection replace the original editorial sequence and screen. No exact prior screen/timing parity claim.',
  'microsite-ui':'New source-owned draft/proposal/witness/ledger controls replace the original authored project demonstration.',
  'front-doors':'Configured pack navigation and home/scene blocks replace original branded project front doors.',
  gateway:'Selected-feature shell and source navigation replace the seven-door editorial gateway.',
  publication:'New source-defined shell, scenes, metadata, styles and resource publication replace the old expedition layout.',
  'encounter-demo':'Own typed notebook workshop source/edit/reset/select and DOM event dispatch replace old story demonstration.',
  microsites:'Variable source-defined windows and actual markup/CSS/metadata projection libraries; original authored project sites are excluded.'
 };
 const foundation=path.join(repository,'templates/composable'),locations=files(foundation).filter(f=>/algebra\/.*\.json$/.test(f)).map(file=>({file:'templates/composable/'+file,owner:'core'}));
 for(const id of fs.readdirSync(path.join(repository,'packs'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name))for(const file of files(path.join(repository,'packs',id)).filter(f=>f.startsWith('algebra/')&&f.endsWith('.json')))locations.push({file:'packs/'+id+'/'+file,owner:id});
 const queries=new Set(),libraries=locations.map(x=>{const module=read(path.join(repository,x.file));for(const name of Object.keys(module.queries??{}))queries.add(name);return {...x,sha256:hash(fs.readFileSync(path.join(repository,x.file))),queries:Object.keys(module.queries??{})};});
 function mapped(q,id){if(id==='microsite-media')return q.replace(/^media\./,'media.stream.');if(id==='microsite-motion')return q.replace('motion.sourcery.','motion.scroll.');if(id==='microsite-temple-motion')return q.replace('motion.temple.','motion.chapter.').replace('motion.constellation.temple','motion.constellation.marker');if(id==='microsite-temple-ui')return q.replace('ui.temple.','ui.cells.');if(['microsite-values','microsite-lamp'].includes(id))return q.replace(/^lamp\./,'cells.').replace('cells.freshTemple','cells.freshHub');if(id==='microsite-sourcery')return q.replace(/^sourcery\./,'draft.');if(id==='encounter-demo')return q.replace('encounter.demo.','workshop.');if(id==='reader-activities'&&q==='activity.boot')return 'activities.boot';return q;}
 const features=read(path.join(repository,'context/features.json')).features.map(original=>{const present=[],replaced=[];for(const query of original.queries){const target=mapped(query,original.id);(queries.has(target)?present:replaced).push({original:query,target});}return {originalModule:original.id,originalSha256:original.sha256,pack:owners[original.id],preservedOrRenamedQueryCount:present.length,originalQueryCount:original.queries.length,presentQueries:present,replacedEntryPoints:replaced,note:notes[original.id]??'Source-owned reusable engine; literal query presence is recorded separately from executed behavior.',behaviorEvidence:['tooling/composition.test.mjs','tooling/interactive-packs.test.mjs','evidence/composition/consumers.json']};});
 assert.equal(features.length,36);assert.ok(features.every(x=>x.pack));
 fs.writeFileSync(path.join(repository,'context/composition-coverage.json'),JSON.stringify({protocol:'worldwright/composition-coverage/1',scope:'All 36 predecessor modules are explicitly mapped. Present queries are literal source/API inventory, not automatic proof of equivalent behavior; replaced entry points remain visible. New presentation is intentional and excludes prior authored demos.',evidenceFamily:'worldwright-composition-2026-11-06',features,libraries},null,2)+'\n');
}
export async function exerciseEmittedRuntimes(directory){
 const require=createRequire(path.join(directory,'package.json')),{invoke}=require('./bootstrap/ports/programme.cjs'),{valuePorts}=require('./bootstrap/ports/value.cjs'),{computationalPorts}=require('./bootstrap/ports/browser-effects.cjs');
 const actions=[];
 for(const file of files(path.join(directory,'dist')).filter(f=>f.endsWith('-runtime.js'))){
  const bundle=fs.readFileSync(path.join(directory,'dist',file),'utf8');
  const snapshot=name=>{const marker='const '+name+'=hydrateSnapshot(',offset=bundle.indexOf(marker);assert.ok(offset>=0,'Missing runtime snapshot '+name);const match=/^("(?:\\.|[^"\\])*")/.exec(bundle.slice(offset+marker.length));assert.ok(match);return JSON.parse(JSON.parse(match[1]));};
  const model=snapshot('model'),factIndex=snapshot('factIndex');
  const run=async(entry,eventInput={},ports={})=>(await invoke({model,entry,input:{eventInput,data:model.data,factIndex},ports:{...valuePorts(),...computationalPorts(),...ports},nested:['kernel.invoke','kernel.execute','kernel.evaluate'],limit:20000000})).value;
  if(file==='reader-runtime.js'){let term='nonexistent-zqxr-scene',html=null;const ports={'dom.value':()=>term,'dom.content':x=>{html=x.html;return true;}};await run('reader.search',{},ports);assert.equal(html,'');term='';await run('reader.search',{},ports);assert.ok(html.includes('class="card"'));actions.push({file,query:'reader.search',assertion:'own-world search filters absent input and restores its scene cards'});}
  if(file==='atlas-runtime.js'){const state=new Map(),id=model.data.ids[0];assert.ok(id);await run('atlas.seen.load',{}, {'storage.read':()=>({ok:true,value:id+'\n'+id+'\nnot-in-world'}),'state.get':({key})=>state.get(key),'state.set':({key,value})=>{state.set(key,value);return true;}});assert.deepEqual(state.get('seen'),[id]);actions.push({file,query:'atlas.seen.load',assertion:'actual world identities filter duplicate and foreign persisted visits'});}
  if(file==='claims-runtime.js'){const result=await run('claims.evaluate',{selected:[]});assert.ok(result.length>0&&result.every(r=>r.result==='Undecided'));actions.push({file,query:'claims.evaluate',assertion:'empty own evidence selection remains Undecided'});}
  if(file==='workshop-runtime.js'){const candidate=await run('ec.prepare',model.data.inputs);assert.ok((await run('ec.run',{candidate})).length>0);await assert.rejects(run('workshop.change',{candidate,value:42}),/EC-E010/);actions.push({file,query:'ec.prepare,ec.run,workshop.change',assertion:'own typed candidate compiles/renders; number title refuses'});}
  if(file==='media-runtime.js'){assert.equal(await run('media.stream.seek.contains',{ranges:[[1,2]],time:2}),true);assert.equal(await run('media.stream.seek.contains',{ranges:[[1,2]],time:3}),false);actions.push({file,query:'media.stream.seek.contains',assertion:'emitted advanced range root includes endpoint and rejects outside'});}
  if(file==='motion-runtime.js'){assert.match(await run('motion.flood.wave',{baseY:100,amp:4,len:250,phase:0,time:2}),/^M/);actions.push({file,query:'motion.flood.wave',assertion:'emitted advanced graphic root returns an SVG path'});}
  if(file==='inspector-runtime.js'){const source=await run('inspector.present',{text:'("own","title","An independent document")',file:'own.rel',language:'rel'});assert.equal(source.hash,hash('("own","title","An independent document")'));actions.push({file,query:'inspector.present',assertion:'exact own source digest'});}
  if(file==='models-runtime.js'){assert.equal(await run('models.evaluate',{id:'decode',input:{bits:[0,1,0]}}),0);actions.push({file,query:'models.evaluate',assertion:'new repetition-code input evaluates'});}
  if(file==='programmes-runtime.js'){const current=await run('programmes.initial');assert.ok(current.root);assert.equal((await run('programmes.witness',{current})).ok,true);actions.push({file,query:'programmes.initial,programmes.witness',assertion:'own world genesis and witness execute'});}
 }
 return actions;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){if(process.argv[2])console.log(JSON.stringify(verifyComposition(process.argv[2],{checkCreationHashes:process.argv.includes('--creation-hashes')}),null,2));else await qualifyConsumers();}
