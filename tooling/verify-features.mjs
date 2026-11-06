import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const repository=fileURLToPath(new URL('../',import.meta.url));
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const unique=values=>[...new Set(values)].sort();
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const plainReference=value=>typeof value==='string'&&!value.startsWith('$');
const suite=(file,kind,obligation)=>({file,kind,obligation});
const behavior={
  'atlas':[suite('expedition.test.mjs','native-publication','A variable place graph projects atlas links, per-place pages and complete local resources.')],
  'atlas-journey':[suite('atlas-journey.test.mjs','headless-effect-fixture','Execute the generated model against bounded storage and DOM fixtures: deduplicated actual visits, reset isolation, blocked storage, mobile preview and history return.')],
  'authoring':[suite('authoring.test.mjs','algebra-policy-fixture','Stale source, authority, duplicate edits, no-ops and failed validation refuse before commit; preview/apply sequence is explicit.'),suite('authoring-native.test.mjs','native-filesystem','Execute real isolated preview/apply, stale-source and failed-candidate refusal using actual filesystem snapshots and full candidate validation.')],
  'claimipedia-review':[suite('claimipedia-review.test.mjs','bounded-oracle-correspondence','All 48 recorded reviews preserve outcomes, support/challenge counts, independence and explicit refusal conditions.')],
  'claimipedia':[suite('claimipedia-review.test.mjs','bounded-oracle-correspondence','The compiled review semantics remain executable for distinct evidence selections.'),suite('expedition.test.mjs','native-publication','Project the review document, configured source data and admitted runtime.')],
  'encounter-code-compiler':[suite('encounter-microsite.test.mjs','algebra-execution','Prepare and compile the retained Encounter source; reject wrong types and undeclared inverse fields.')],
  'encounter-code-runtime':[suite('encounter-microsite.test.mjs','algebra-execution','Apply title edits through the declared patch route, preserve web overlays and the unchanged candidate on refusal.')],
  'encounter-code-types':[suite('encounter-microsite.test.mjs','algebra-execution','Use actual closed contracts and reject invalid values and fields without edit authority.')],
  'encounter-demo':[suite('encounter-microsite.test.mjs','headless-effect-fixture','Boot, edit, source selection and reset share a session; failed edits preserve its accepted candidate.')],
  'encounter-source':[suite('encounter-microsite.test.mjs','algebra-execution','Every inspector selection preserves exact source text and digest under the shared highlighted projection.')],
  'encounter':[suite('encounter-microsite.test.mjs','algebra-execution','Admit every declared event root with the explicit profile and inspect the live source-derived projections.'),suite('expedition.test.mjs','native-publication','Publish the Encounter entry, data, source snapshots and admitted runtime.')],
  'microsite-lamp':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Every preset, identity, stale basis, false root, amendment, replay and forgery follows the retained proposal/witness semantics.')],
  'microsite-media':[suite('microsite-fidelity.test.mjs','headless-effect-fixture','Seeking retains range endpoints and metadata/blob fallback sequencing; effect fixtures do not certify browser playback.')],
  'microsite-motion':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Flood scatter, waves and poses match sampled predecessor frames; reduced motion refuses animation scheduling.')],
  'microsite-temple-motion':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Sky and constellation geometry, parallax and drawing effects match sampled predecessor states; hidden/reduced states remain still.')],
  'microsite-temple-ui':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Merkle drawing and explanatory lessons preserve source geometry, order and verdict branches.')],
  'microsite-ui':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Sourcery proposal, witness, tamper and restoration semantics remain executable with the configured UI process.')],
  'microsite-sourcery':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Intent classification, proposal templates, sealing, witness verification and tamper detection match retained source cases.')],
  'microsite-values':[suite('microsite-fidelity.test.mjs','bounded-oracle-correspondence','Canonical Unicode/padding hashes, genesis identities, roots and Merkle levels preserve actual source semantics.')],
  'microsite-projection':[suite('expedition.test.mjs','native-publication','Project the configured microsite documents and CSS through the actual source markup/style algebra.')],
  'microsites':[suite('expedition.test.mjs','native-publication','Build all configured microsite documents, resources and admitted browser bundles; no original app script is a runtime input.')],
  'reader-models':[suite('reader-workshop-algebra.test.mjs','bounded-oracle-correspondence','All calibration slider settings, finite pair sets, eight bit patterns, weight settings, coarse blocks and both memory trajectories retain actual results.')],
  'reader-activities':[suite('reader-workshop-algebra.test.mjs','algebra-execution','The numerical models and real session projections preserve their input/output and refusal boundaries.'),suite('expedition.test.mjs','native-publication','Publish activity documents and the admitted interaction runtime from editable source owners.')],
  'reader-navigation':[suite('reader-navigation.test.mjs','headless-effect-fixture','Execute the actual compiled reader model: case-insensitive search/reset, escaped attributed notes, variable place counts and invalid-route fallback.'),suite('expedition.test.mjs','native-publication','Publish the reader, configured source model, local navigation runtime and its exact native grants.')],
  'workshop-lab':[suite('reader-workshop-algebra.test.mjs','bounded-oracle-correspondence','Execute source/overlay edits through actual compiled sessions; stale revisions, invalid values and unknown edits refuse unchanged.')],
  'front-doors':[suite('expedition.test.mjs','native-publication','Project configured project/capability front doors through declared source owners.')],
  'gateway':[suite('expedition.test.mjs','native-publication','A variable configured door set projects into a complete gateway without requiring seven personal doors.')],
  'publication':[suite('expedition.test.mjs','native-publication','Recompose a configured world, validate local resources and metadata, preserve input identity and bounded execution.'),suite('resource-paths.test.mjs','publication-resource-graph','Resolve every emitted application href/src/poster and CSS resource against the actual document base; reject absent resources, invalid fragments and hosted-subpath escapes.')]
};

function walk(value,visit){visit(value);if(value&&typeof value==='object')for(const child of Object.values(value))walk(child,visit);}
function scanModule(module){
 const calls=[],dynamicCalls=[],ports=[],reads=[],types=[],fields=[],writes=[],copies=[],bundles=[];
 walk(module,value=>{
  if(typeof value==='string'&&/^\$(?:eventInput|data)\./.test(value))fields.push(value);
  if(Array.isArray(value)){
   if(['one','optional','objects'].includes(value[0]))reads.push({operation:value[0],subject:value[1],predicate:value[2],object:value[3]??null});
   if(value[0]==='subjects')reads.push({operation:'subjects',subject:null,predicate:value[1],object:value[2]??null});
   if(value[0]==='subjects'&&value[1]==='isa'&&plainReference(value[2]))types.push(value[2]);
  }
  if(value&&!Array.isArray(value)&&typeof value==='object'){
   if(typeof value.call==='string'){if(value.call.startsWith('$'))dynamicCalls.push({kind:'call',expression:value.call});else calls.push(value.call);}
   if(typeof value.port==='string'){
    ports.push(value.port);
    if(value.port==='kernel.invoke')dynamicCalls.push({kind:'kernel.invoke',entry:value.args?.entry??null,query:value.args?.query??null});
    if(value.port==='runtime.bundle')bundles.push(value.args);
    if(value.port==='file.write')writes.push(value.args?.path);
    if(value.port==='file.copy')copies.push(value.args?.path);
   }
  }
 });
 return {calls:unique(calls),dynamicCalls,ports:unique(ports),factReads:[...new Map(reads.map(r=>[JSON.stringify(r),r])).values()],selectedTypes:unique(types),recordFields:unique(fields),outputExpressions:writes,copyExpressions:copies,runtimeSelections:bundles};
}
function runtimeModels(root){
 const outputs=[];
 const scan=directory=>{if(!fs.existsSync(directory))return;for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())scan(file);else if(entry.name.endsWith('.js')){
  const text=fs.readFileSync(file,'utf8'),match=/const model=hydrateSnapshot\(("(?:\\.|[^"\\])*")\)/.exec(text);
  if(!match)continue;
  const model=JSON.parse(JSON.parse(match[1])),grantMatch=/const grants=(\[[^\n]*\]);/.exec(text);
  outputs.push({path:path.relative(path.join(root,'dist'),file).replaceAll('\\','/'),sha256:digest(fs.readFileSync(file)),entry:model.entry,queries:Object.keys(model.queries),grants:grantMatch?JSON.parse(grantMatch[1]):[],budget:model.budget??20000000});
 }}};scan(path.join(root,'dist'));return outputs;
}
function sourceSchemas(root,manifest,parseRel){
 const facts=[],files=[];
 for(const file of manifest.sources){const bytes=fs.readFileSync(path.join(root,file));const parsed=parseRel(bytes.toString(),file);files.push({file,sha256:digest(bytes),factCount:parsed.length});for(const fact of parsed)facts.push({...fact,file});}
 const typeNames=unique(facts.filter(f=>f.p==='isa'&&f.pol==='is').map(f=>f.o));
 const schemas=typeNames.map(name=>{
  const subjects=unique(facts.filter(f=>f.p==='isa'&&f.o===name&&f.pol==='is').map(f=>f.s));
  const members=subjects.map(subject=>facts.filter(f=>f.s===subject&&f.pol==='is'));
  const predicates=unique(members.flat().map(f=>f.p));
  return {name,instanceCount:subjects.length,owners:unique(members.flat().map(f=>f.file)),predicates:predicates.map(predicate=>{
   const counts=members.map(m=>m.filter(f=>f.p===predicate).length);return {predicate,valueType:'string',presentOnEveryInstance:counts.every(n=>n>0),observedCardinality:{min:Math.min(...counts),max:Math.max(...counts)}};
  }),boundary:'These counts and cardinalities describe this captured instance only. They are not required counts or schema constraints for a new world. Semantic admission and explicit module assertions remain controlling.'};
 });
 return {facts,files,schemas};
}
function configurationFiles(id,template){
 const files=[];
 if(id.startsWith('microsite'))files.push('source/microsites/temple/config.json','source/microsites/sourcery/config.json','source/microsites/presentation.rel','source/microsites/release.rel');
 if(id.startsWith('encounter')||id==='workshop-lab'||id==='source')files.push('source/encounter/example.json','source/encounter/presentation.json');
 if(id.startsWith('reader')||id==='workshop-lab')files.push('source/reader/activities.json','source/reader/document.html','source/reader/activity.html','source/workshop/document.html','source/workshop/provenance.json');
 if(id.startsWith('claimipedia'))files.push('source/claimipedia-example.rel','source/claimipedia-example.json','source/claimipedia.rel');
 if(id.startsWith('atlas'))files.push('source/atlas.rel');
 if(id==='authoring')files.push('source/authoring-contract.json');
 return files.filter(file=>fs.existsSync(path.join(template,file))).map(file=>{
  const bytes=fs.readFileSync(path.join(template,file));return {file,sha256:digest(bytes),format:path.extname(file).slice(1),...(file.endsWith('.json')?{topLevelKeys:Object.keys(JSON.parse(bytes.toString()))}:{})};
 });
}

export function inspectFeatures({root=repository,template=path.join(root,'templates/expedition')}={}){
 const require=createRequire(path.join(template,'package.json'));
 const {parseRel}=require('./bootstrap/ports/rel-codec.cjs');
 const catalogue=json(path.join(root,'context/features.json')),manifest=json(path.join(template,'bootstrap/site.json'));
 const policy=json(path.join(template,'bootstrap/ports.json')),authoring=json(path.join(template,'source/authoring-contract.json'));
 const files=fs.readdirSync(path.join(template,'algebra')).filter(f=>f.endsWith('.json')).sort();
 const modules=new Map(files.map(file=>['algebra/'+file,json(path.join(template,'algebra',file))]));
 const queryOwners=new Map();for(const [file,module]of modules)for(const query of Object.keys(module.queries??{})){if(queryOwners.has(query))throw Error('Duplicate query '+query);queryOwners.set(query,file);}
 const active=new Set([...manifest.modules,manifest.operatorDefinitions,manifest.operatorCompiler,manifest.factIndexer,manifest.admission,manifest.languageCompiler,authoring.process]);
 const facts=sourceSchemas(template,manifest,parseRel),runtimes=runtimeModels(template);
 const errors=[],contracts=[],receiptFile=path.join(template,'dist/build-receipt.json');
 if(manifest.executionBudget!==20000000)errors.push('The reused 20,000,000-step execution budget changed.');
 const originalSeed=json(path.join(root,'templates/world/source/upstream.json')).files['bootstrap/temple-seed.cjs'];
 if(digest(fs.readFileSync(path.join(template,'bootstrap/temple-seed.cjs')))!==originalSeed)errors.push('The reused Temple seed differs from the pinned initial mechanism.');
 const buildReceipt=fs.existsSync(receiptFile)?json(receiptFile):null;
 if(!buildReceipt)errors.push('The full template must be built before qualification.');
 const inputClosure=[];
 for(const [file,sha256]of Object.entries(buildReceipt?.sources??{})){
  const input=path.join(template,file);if(!fs.existsSync(input)||digest(fs.readFileSync(input))!==sha256)errors.push('Build source drift: '+file);
  inputClosure.push({file,sha256});
 }
 for(const feature of catalogue.features){
  const file='algebra/'+path.basename(feature.source),source=path.join(template,file);
  if(digest(fs.readFileSync(path.join(root,feature.source)))!==feature.sha256)errors.push(feature.id+': immutable reference hash mismatch');
  if(!fs.existsSync(source)){errors.push(feature.id+': missing implementation '+file);continue;}
  if(!active.has(file))errors.push(feature.id+': module is not selected by build/compiler/authoring composition');
  const module=modules.get(file),scan=scanModule(module);
  const referenceModule=json(path.join(root,feature.source));
  for(const query of Object.keys(referenceModule.queries??{}))if(!Object.hasOwn(module.queries??{},query))errors.push(feature.id+': original query is absent '+query);
  for(const operator of Object.keys(referenceModule.operators??{}))if(!Object.hasOwn(module.operators??{},operator))errors.push(feature.id+': original derived operator is absent '+operator);
  const missingCalls=scan.calls.filter(query=>!queryOwners.has(query));for(const query of missingCalls)errors.push(feature.id+': missing named query '+query);
  const allGrants=new Set([...Object.values(policy.profiles).flat(),...authoring.grants]);
  for(const port of scan.ports)if(!allGrants.has(port))errors.push(feature.id+': port has no declared profile '+port);
  const queries=Object.keys(module.queries??{}),bundles=runtimes.filter(runtime=>runtime.queries.some(query=>queries.includes(query)));
  const selectedTypes=scan.selectedTypes.map(type=>facts.schemas.find(s=>s.name===type)).filter(Boolean);
  const predicates=unique(scan.factReads.filter(r=>plainReference(r.predicate)).map(r=>r.predicate));
  const factOwners=unique(facts.facts.filter(f=>predicates.includes(f.p)).map(f=>f.file));
  const cases=behavior[feature.id]??[suite('feature-core.test.mjs','real-core-algebra','Lower and admit the complete concrete composition; exercise actual language, serialization, facts and refusal semantics.')];
  const behavioral=cases.map(check=>{
   const testFile=path.resolve(template,check.file);if(!fs.existsSync(testFile)){errors.push(feature.id+': missing behavioral suite '+check.file);return check;}
   return {...check,sha256:digest(fs.readFileSync(testFile))};
  });
  const directOwners=unique(scan.calls.map(query=>queryOwners.get(query)).filter(owner=>owner!==file));
  const contract={
   protocol:'worldwright/reusable-feature/2',id:feature.id,status:'portable-in-expedition-composition',
   purpose:behavior[feature.id]?.[0].obligation??'Supply the reused '+feature.id+' semantic engine in the checked world composition.',
   scope:{composition:'templates/expedition',installation:'Create the complete expedition template; its modules share a declared fact/runtime closure.',independentModuleInstallation:false},
   reference:{file:feature.source,sha256:feature.sha256},
   implementation:{file:'templates/expedition/'+file,sha256:digest(fs.readFileSync(source)),queries,operators:Object.keys(module.operators??{}),selectedBy:manifest.modules.includes(file)?'bootstrap/site.json#modules':file===authoring.process?'source/authoring-contract.json#process':Object.entries(manifest).filter(([,value])=>value===file).map(([key])=>'bootstrap/site.json#'+key)},
   types:selectedTypes,inputs:{factSources:factOwners,queryFactReads:scan.factReads,recordFieldReads:scan.recordFields,configuration:configurationFiles(feature.id,template),sourceClosure:'context/extraction.json#/sourceComposition'},
   dependencies:directOwners.map(owner=>({file:'templates/expedition/'+owner,bridge:'calls',required:true})),
   dynamicDispatch:scan.dynamicCalls,
   effects:{ports:scan.ports,grantProfiles:Object.fromEntries(Object.entries(policy.profiles).filter(([,grants])=>scan.ports.some(port=>grants.includes(port))).map(([name,grants])=>[name,grants.filter(port=>scan.ports.includes(port))])),authoringGrants:scan.ports.filter(port=>authoring.grants.includes(port)),authority:'Profiles are selected at the declared build/browser/authoring boundary; catalogue membership grants no effects.'},
   projections:{writeExpressions:scan.outputExpressions,copyExpressions:scan.copyExpressions,bundledRuntimes:bundles.map(({queries,...runtime})=>({...runtime,includedQueries:queries.filter(query=>Object.hasOwn(module.queries??{},query))})),declaredRuntimeSelections:scan.runtimeSelections},
   correction:{owners:[file,...factOwners],route:'Edit canonical facts/process or use the checked authoring proposal path. Rebuild and verify the forward projection; no inferred universal inverse.',preserves:['20,000,000-step kernel budget','Explicit native-port admission','Source identity and attribution','Unrelated source owners']},
   verification:{structural:'node tooling/verify-features.mjs --check',behavioral,browserBoundary:'Headless effect fixtures test actual process decisions and captured effects; browser rendering/media interaction requires the separately recorded browser trial.'},
   missing:[],evidenceFamily:'worldwright-feature-extraction-2026-11-06'
  };
  contracts.push(contract);
 }
 const originalFiles=new Set(catalogue.features.map(f=>'algebra/'+path.basename(f.source)));
 const successorDependencies=[...active].filter(file=>!originalFiles.has(file)).map(file=>({file:'templates/expedition/'+file,sha256:digest(fs.readFileSync(path.join(template,file))),queries:Object.keys(modules.get(file)?.queries??{})}));
 const extraction={protocol:'worldwright/extraction-closure/2',scope:'All original 36 reference algebra modules reusable within the complete expedition composition; not independent package installation for every JSON file.',evidenceFamily:'worldwright-feature-extraction-2026-11-06',originalFeatureCount:catalogue.features.length,sourceComposition:{manifest:'templates/expedition/bootstrap/site.json',manifestSha256:digest(fs.readFileSync(path.join(template,'bootstrap/site.json'))),entry:manifest.entry,executionBudget:manifest.executionBudget,factSources:facts.files,types:facts.schemas,inputClosure,nativeClosure:json(path.join(template,manifest.nativeSource)),portProfiles:policy.profiles,authoringContract:'templates/expedition/source/authoring-contract.json',authoringMechanism:{file:'templates/expedition/tooling/author.mjs',sha256:digest(fs.readFileSync(path.join(template,'tooling/author.mjs')))}},features:contracts.map(contract=>({id:contract.id,status:contract.status,contract:'templates/features/'+contract.id+'.json',implementation:contract.implementation.file,implementationSha256:contract.implementation.sha256,behavioral:contract.verification.behavioral})),successorDependencies,runtimes,missingClosure:errors,assurance:{structural:'Exact source hashes, selected module closure, named calls, declared port profiles and compiled runtime membership.',behavioral:'Named concrete suites execute separately; see the test report for observed results.',agentTrial:'A separate agent in the same task/model family is a distinct authoring trial, not independent human validation or an independent evidence family.',universalClaim:false}};
 return {contracts,extraction,errors};
}

export function verifyFeatures(options={}){
 const root=options.root??repository,{contracts,extraction,errors}=inspectFeatures(options);
 if(errors.length)throw Error('Unclosed feature dependencies:\n'+errors.join('\n'));
 if(options.refresh){
  fs.mkdirSync(path.join(root,'templates/features'),{recursive:true});for(const contract of contracts)fs.writeFileSync(path.join(root,'templates/features',contract.id+'.json'),JSON.stringify(contract,null,2)+'\n');
  fs.writeFileSync(path.join(root,'context/extraction.json'),JSON.stringify(extraction,null,2)+'\n');
 }else{
  for(const contract of contracts){const expected=path.join(root,'templates/features',contract.id+'.json');if(!fs.existsSync(expected)||JSON.stringify(json(expected))!==JSON.stringify(contract))throw Error('Stale feature contract: '+contract.id);}
  if(JSON.stringify(json(path.join(root,'context/extraction.json')))!==JSON.stringify(extraction))throw Error('Stale extraction closure. Run --refresh after checked source changes.');
 }
 return {features:contracts.length,successorDependencies:extraction.successorDependencies.length,runtimes:extraction.runtimes.length,missingClosure:errors.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const instance=process.argv.indexOf('--instance');
 if(instance>=0){
  if(!process.argv[instance+1])throw Error('--instance requires a standalone world directory.');
  const template=path.resolve(process.argv[instance+1]),{contracts,extraction,errors}=inspectFeatures({template});
  if(errors.length)throw Error('Unclosed instance dependencies:\n'+errors.join('\n'));
  console.log(JSON.stringify({instance:template,features:contracts.length,runtimes:extraction.runtimes.length,missingClosure:0,boundary:'This checks the instance own source/build/behavioral-test closure; it does not require its facts or identity to equal the template baseline.'}));
 }else console.log(JSON.stringify(verifyFeatures({refresh:process.argv.includes('--refresh')})));
}
