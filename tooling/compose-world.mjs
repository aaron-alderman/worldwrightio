// Filesystem observation and application of an admitted, source-owned composition plan.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.dirname(here),base=path.join(project,'templates/composable');
const require=createRequire(import.meta.url);
const {createKernel}=require(path.join(base,'bootstrap/temple-seed.cjs'));
const {lower}=require(path.join(base,'bootstrap/ports/algebra-lower.cjs'));
const {invoke}=require(path.join(base,'bootstrap/ports/programme.cjs'));
const {valuePorts}=require(path.join(base,'bootstrap/ports/value.cjs'));
const {parseRel}=require(path.join(base,'bootstrap/ports/rel-codec.cjs'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
async function rename(from,to){for(let attempt=0;;attempt++){try{fs.renameSync(from,to);return;}catch(e){if(attempt===12||!['EPERM','EACCES','EBUSY'].includes(e.code))throw e;await new Promise(r=>setTimeout(r,50*(attempt+1)));}}}
function safe(root,relative){
 if(typeof relative!=='string'||!relative||relative.includes('\\')||path.posix.isAbsolute(relative)||relative.split('/').some(x=>!x||x==='.'||x==='..')||/[:\0]/.test(relative))throw Error('Unsafe composition path: '+relative);
 const resolved=path.resolve(root,relative);if(!resolved.startsWith(path.resolve(root)+path.sep))throw Error('Composition path escaped its owner');
 let cursor=root;for(const part of relative.split('/')){cursor=path.join(cursor,part);if(fs.existsSync(cursor)&&fs.lstatSync(cursor).isSymbolicLink())throw Error('Composition refuses symlink: '+relative);}
 return resolved;
}
function walk(root,prefix=''){return fs.readdirSync(path.join(root,prefix),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{const name=prefix?prefix+'/'+e.name:e.name;return e.isDirectory()?walk(root,name):[name]});}
function observe(root,entry,owner,kind){
 const spec=typeof entry==='string'?{source:entry,target:entry}:entry;
 const filename=safe(root,spec.source),target=spec.target??spec.source;safe(base,target);
 const bytes=fs.readFileSync(filename);return {owner,kind,source:filename,target,sha256:hash(bytes),factRows:kind==='facts'?parseRel(bytes.toString('utf8'),filename):[]};
}
function normalise(root,id,withFiles=false){
 const descriptor=json(path.join(root,id,'pack.json'));
 const p={title:id,requires:[],conflicts:[],modules:[],sharedModules:[],sources:[],assets:[],files:[],build:null,navigation:null,runtime:null,render:null,stylesheets:[],outputs:[],grants:{build:[],browser:[]},...descriptor};
 p.grants={build:[],browser:[],...p.grants};
 p.descriptorSha256=hash(fs.readFileSync(path.join(root,id,'pack.json')));
 p.observedFiles=withFiles?[...p.modules.map(f=>observe(path.join(root,id),f,id,'module')),...p.sources.map(f=>observe(path.join(root,id),f,id,'facts')),...p.assets.map(f=>observe(path.join(root,id),f,id,'asset')),...p.files.map(f=>observe(path.join(root,id),f,id,'file'))]:[];
 p.moduleTargets=[...p.observedFiles.filter(f=>f.kind==='module').map(f=>f.target),...p.sharedModules];p.sourceTargets=p.observedFiles.filter(f=>f.kind==='facts').map(f=>f.target);
 p.outputRecords=p.outputs.map(output=>({path:typeof output==='string'?output:output.path,owner:id}));for(const o of p.outputRecords)safe(base,o.path.replaceAll('*','wildcard'));
 if(p.runtime){p.runtime={output:id+'-runtime.js',allPages:false,...p.runtime};p.grants.build=[...p.grants.build,'runtime.bundle'];}
 return p;
}
async function evaluate(entry,input){
 const compiler=json(path.join(base,'algebra/lowering.process.json')),definitions=json(path.join(base,'algebra/operators.expression.json'));
 const surface={queries:{...json(path.join(base,'algebra/fact-index.process.json')).queries,...json(path.join(project,'packs/composition.process.json')).queries}};
 const model=await lower({compiler,definitions,primitives:createKernel.operators,input:surface,mode:'model',ports:valuePorts(),limit:20000000});
 return (await invoke({model,entry,input,ports:valuePorts(),nested:['kernel.invoke'],limit:20000000})).value;
}
export async function planWorld(options={}){
 const registryRoot=path.resolve(options.registryRoot??path.join(project,'packs'));
 const catalogue=Object.create(null);for(const dir of fs.readdirSync(registryRoot,{withFileTypes:true}).filter(d=>d.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name)))if(fs.existsSync(path.join(registryRoot,dir.name,'pack.json')))catalogue[dir.name]=normalise(registryRoot,dir.name);
 const foundationFiles=walk(base).map(f=>observe(base,f,'foundation','file'));
 const pure=Object.keys(valuePorts());
 const foundation={files:foundationFiles,queryModules:foundationFiles.map(f=>f.target).filter(f=>f.startsWith('algebra/')&&f.endsWith('.process.json')),modules:['algebra/html.process.json','algebra/css.process.json'],buildGrants:[...pure,'file.write','file.copy'],valueGrants:pure,compilationGrants:pure};
 let profile=null,profileFiles=[],profileRoot=null;if(options.profile){const filename=path.resolve(options.profile);profile=json(filename);profileRoot=path.dirname(filename);if(profile.protocol!=='worldwright/profile/1')throw Error('Unknown composition profile');}
 const requested=options.features??profile?.features??['reader','sources'];
 const selected=await evaluate('compose.resolve',{catalogue,requested});
 const requests=await evaluate('compose.profileRequests',{catalogue,selected,profileRequests:profile?.files??[]});
 profileFiles=requests.map(f=>f.observe?observe(profileRoot,f,f.owner,f.kind):{...f,source:null,sha256:null,factRows:[]});
 for(const [key,target] of [['worldSource','source/world.rel'],['presentationSource','source/presentation.rel']])if(options[key]!==undefined){const text=options[key];profileFiles.push({owner:'core',kind:'facts',source:null,target,sha256:hash(text),factRows:parseRel(text,target),inline:text});}
 for(const asset of options.extraAssets??[])profileFiles.push(observe(path.resolve(asset.root??'.'),asset,asset.owner??'core','asset'));
 for(const id of selected)catalogue[id]=normalise(registryRoot,id,true);
 const plan=await evaluate('compose.plan',{catalogue,foundation,requested,profileFiles});
 Object.defineProperties(plan,{catalogue:{value:catalogue},foundation:{value:foundation},overrides:{value:profileFiles}});return plan;
}
export async function composeWorld(destination,options={}){
 const dest=path.resolve(destination);if(dest===project||dest===base||!path.basename(dest))throw Error('Invalid destination');
 if(fs.existsSync(dest)&&!options.replace)throw Error('Destination exists; pass --replace to recompose an owned world.');
 let plan=await planWorld(options);
 if(fs.existsSync(dest)){
  const receiptFile=path.join(dest,'composition-receipt.json');if(!fs.existsSync(receiptFile))throw Error('Replacement requires an owned composition receipt.');
  const prior=json(receiptFile);
  const previous={...prior,files:(prior.files??[]).map(f=>({...f,exists:fs.existsSync(safe(dest,f.target))}))};
  const retainedPaths=await evaluate('compose.retain',{eventInput:{prior:previous,plan}});
  const retained=retainedPaths.map(f=>observe(dest,{source:f.target,target:f.target},f.owner,f.kind));
  // Retention is the same source-defined profile authority check as explicit overrides.
  if(retained.length)plan=await evaluate('compose.plan',{catalogue:plan.catalogue,foundation:plan.foundation,requested:plan.requested,profileFiles:[...retained,...plan.overrides]});
 }
 fs.mkdirSync(path.dirname(dest),{recursive:true});const stage=fs.mkdtempSync(path.join(path.dirname(dest),'.compose-'));
 try{
  for(const f of plan.files){const target=safe(stage,f.target);fs.mkdirSync(path.dirname(target),{recursive:true});if(f.inline!==undefined)fs.writeFileSync(target,f.inline);else fs.copyFileSync(f.source,target);}
  const programme=await evaluate('compose.programme',{eventInput:plan});
  const facts=await evaluate('compose.facts',{eventInput:plan});
  fs.writeFileSync(path.join(stage,'algebra/composition.process.json'),JSON.stringify(programme,null,2)+'\n');
  fs.writeFileSync(path.join(stage,'source/composition.rel'),facts.map(f=>'('+[f.s,f.p,f.o].map(JSON.stringify).join(', ')+')').join('\n')+'\n');
  const manifest={protocol:'temple/bootstrap-site/1',entry:'composition.build',operatorDefinitions:'algebra/operators.expression.json',operatorCompiler:'algebra/lowering.process.json',factIndexer:'algebra/fact-index.process.json',nativeSource:'bootstrap/native.json',hostPorts:'bootstrap/ports.json',executionBudget:20000000,modules:[...plan.modules,'algebra/composition.process.json'],sources:[...plan.sources,'source/composition.rel'],kernelProfile:'bootstrap/kernel-profile.json',admission:'algebra/admission.process.json',languageCompiler:'algebra/language.process.json',languageSources:[]};
  fs.writeFileSync(path.join(stage,'bootstrap/site.json'),JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(stage,'bootstrap/ports.json'),JSON.stringify({protocol:'temple/native-port-grants/1',profiles:plan.profiles},null,2)+'\n');
  const artifacts=await evaluate('compose.artifacts',{eventInput:plan});for(const artifact of artifacts){const filename=safe(stage,artifact.path);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,JSON.stringify(artifact.value,null,2)+'\n');}
  const receipt={protocol:'worldwright/composition-receipt/1',requested:plan.requested,selected:plan.selected,modules:plan.modules,sources:plan.sources,assets:plan.assets,profiles:plan.profiles,outputOwners:plan.outputOwners,skippedProfileOwners:plan.skippedProfileOwners,files:plan.files.map(({factRows,inline,source,...f})=>({...f,sourceSha256:f.sha256,sha256:hash(fs.readFileSync(safe(stage,f.target))),source:source?path.relative(project,source).replaceAll('\\','/'):null})),packs:plan.packs};
  fs.writeFileSync(path.join(stage,'composition-receipt.json'),JSON.stringify(receipt,null,2)+'\n');fs.writeFileSync(path.join(stage,'source/composition.json'),JSON.stringify(receipt,null,2)+'\n');
  if(fs.existsSync(dest)){const previous=dest+'.previous-'+crypto.randomBytes(4).toString('hex');await rename(dest,previous);try{await rename(stage,dest)}catch(e){await rename(previous,dest);throw e;}if(!previous.startsWith(path.dirname(dest)+path.sep))throw Error('Invalid replacement cleanup');fs.rmSync(previous,{recursive:true,force:true,maxRetries:7,retryDelay:50});}else await rename(stage,dest);
  return {...receipt,destination:dest};
 }catch(error){if(fs.existsSync(stage))fs.rmSync(stage,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2),destination=args.shift();if(!destination)throw Error('Usage: node tooling/compose-world.mjs DEST [--features reader,sources] [--profile PATH] [--replace]');const opts={};for(let i=0;i<args.length;i++){const arg=args[i];if(arg==='--replace')opts.replace=true;else if(arg==='--features')opts.features=args[++i].split(',').filter(Boolean);else if(arg==='--profile')opts.profile=args[++i];else if(arg==='--registry')opts.registryRoot=args[++i];else throw Error('Unknown option '+arg);}const result=await composeWorld(destination,opts);console.log('Composed '+result.selected.join(', ')+' into '+result.destination);
}
