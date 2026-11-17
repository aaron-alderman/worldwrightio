// Generic, admitted algebra invocation. No footer markup or selection policy lives here.
import fs from 'node:fs';
import {decodeValue,readFacts,readModule} from './module-source.mjs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(new URL('../templates/composable/package.json',import.meta.url));
const {createKernel}=require('./bootstrap/temple-seed.cjs');
const {valuePorts}=require('./bootstrap/ports/value.cjs');
const {lower}=require('./bootstrap/ports/algebra-lower.cjs');
const {invoke}=require('./bootstrap/ports/programme.cjs');
const rel=file=>decodeValue(fs.readFileSync(path.join(root,file),'utf8'));
const foundation='templates/composable/';
const cache=new Map();
async function load(file,entry){
 const source=readModule(root,file),queries={...source.queries};
 const imports=file.replace(/\.encounter$/,'.imports.rel');
 const projection=fs.readFileSync(path.join(root,imports),'utf8');
 if(projection!==readFacts(root,imports))throw Error('WORLD-IMPORTS: Generated REL differs from Encounter: '+imports);
 for(const dependency of decodeValue(projection))for(const query of dependency.queries){if(Object.hasOwn(queries,query))throw Error('Duplicate algebra query '+query);const imported=readModule(root,dependency.file).queries[query];if(!imported)throw Error('Missing algebra query '+query);queries[query]=imported;}
 const ports=valuePorts(),limit=20_000_000;
 const compile=input=>lower({compiler:readModule(root,foundation+'algebra/lowering.encounter'),definitions:rel(foundation+'algebra/operators.expression.rel'),primitives:createKernel.operators,input,mode:'model',ports,limit});
 const model=await compile({queries,entry}),admission=await compile(readModule(root,foundation+'algebra/admission.encounter'));
 const profile=rel(foundation+'bootstrap/kernel-profile.rel');
 await invoke({model:admission,entry:'admit.model',input:{profile,target:model},ports,limit});
 await invoke({model:admission,entry:'admit.effects',input:{profile,target:model,grants:Object.keys(ports)},ports,limit});
 return {model,ports,limit};
}
export async function projectAlgebra(file,entry,input){
 const key=file+'#'+entry;if(!cache.has(key))cache.set(key,load(file,entry));
 const {model,ports,limit}=await cache.get(key);
 return (await invoke({model,entry,input:{input},ports,limit})).value;
}
