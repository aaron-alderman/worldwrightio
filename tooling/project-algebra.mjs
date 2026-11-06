// Generic, admitted algebra invocation. No footer markup or selection policy lives here.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(new URL('../templates/world/package.json',import.meta.url));
const {createKernel}=require('./bootstrap/temple-seed.cjs');
const {valuePorts}=require('./bootstrap/ports/value.cjs');
const {lower}=require('./bootstrap/ports/algebra-lower.cjs');
const {invoke}=require('./bootstrap/ports/programme.cjs');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const cache=new Map();
async function load(file,entry){
 const source=read(file),queries={...source.queries};
 for(const dependency of source.imports??[])for(const query of dependency.queries){if(Object.hasOwn(queries,query))throw Error('Duplicate algebra query '+query);const imported=read(dependency.file).queries[query];if(!imported)throw Error('Missing algebra query '+query);queries[query]=imported;}
 const ports=valuePorts(),limit=20_000_000;
 const compile=input=>lower({compiler:read('templates/world/algebra/lowering.process.json'),definitions:read('templates/world/algebra/operators.expression.json'),primitives:createKernel.operators,input,mode:'model',ports,limit});
 const model=await compile({queries,entry}),admission=await compile(read('templates/world/algebra/admission.process.json'));
 const profile=read('templates/world/bootstrap/kernel-profile.json');
 await invoke({model:admission,entry:'admit.model',input:{profile,target:model},ports,limit});
 await invoke({model:admission,entry:'admit.effects',input:{profile,target:model,grants:Object.keys(ports)},ports,limit});
 return {model,ports,limit};
}
export async function projectAlgebra(file,entry,input){
 const key=file+'#'+entry;if(!cache.has(key))cache.set(key,load(file,entry));
 const {model,ports,limit}=await cache.get(key);
 return (await invoke({model,entry,input:{input},ports,limit})).value;
}
