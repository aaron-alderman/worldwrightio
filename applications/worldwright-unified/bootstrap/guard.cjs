'use strict';
// Native observations only. Ownership, freshness and closure decisions are algebra.
const {processSource,definitionSource}=require('./encounter-source.cjs');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function files(directory,prefix=''){
 if(!fs.existsSync(directory))return [];
 return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  const relative=prefix+entry.name,full=path.join(directory,entry.name);
  if(entry.isSymbolicLink())throw Error('GUARD-PATH: Source/output symlinks require an explicit boundary review: '+relative);
  return entry.isDirectory()?files(full,relative+'/'):[{path:relative,sha256:hash(fs.readFileSync(full))}];
 });
}
async function verify(root,{output=path.join(root,'dist'),receipt,inputs=true}={}){
 root=path.resolve(root);output=path.resolve(output);
 if(!output.startsWith(root+path.sep))throw Error('GUARD-PATH: Output must stay within this workspace.');
 receipt??=JSON.parse(fs.readFileSync(path.join(root,'generated/build-receipt.json'),'utf8'));
 const {createKernel}=require(path.join(root,'source/semantics/bootstrap/temple-seed.cjs'));
 const {valuePorts}=require(path.join(root,'source/semantics/bootstrap/ports/value.cjs'));
 const model=processSource(root,'ownership');
 const sourceFiles=inputs?[...['source','algebra','bootstrap'].flatMap(dir=>files(path.join(root,dir),dir+'/')),{path:'package.json',sha256:hash(fs.readFileSync(path.join(root,'package.json')))}]:[];
 const env={model,receipt,actualOutputs:files(output),actualInputs:sourceFiles,checkInputs:inputs,
  manifest:definitionSource(root,'source/build.json').definition};
 const kernel=createKernel(valuePorts(),20000000);await kernel.run(model.queries['ownership.check'],env);
 return {artifacts:receipt.artifacts,usage:kernel.usage};
}
module.exports={verify};
