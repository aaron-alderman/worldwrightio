import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
export const library=process.env.WORLDWRIGHT_ENCOUNTER_LIBRARY ??
  fileURLToPath(new URL('../../encounter-libraries/worldwright-source.cjs',import.meta.url));
export const {compileEncounter, encodeConfiguration, decodeConfiguration, encodeValue, decodeValue}=require(library);

export function readModule(root,spec){
 const file=path.join(root,typeof spec==='string'?spec:spec.source);
 const text=fs.readFileSync(file,'utf8');
 return file.endsWith('.encounter')?compileEncounter(file,text):JSON.parse(text);
}

const codec=require('../templates/composable/bootstrap/ports/rel-values.cjs');
const {projectSource:project}=require('./source-projection.cjs');
export const projectSource=(file,text,target)=>project(file,text,target,compileEncounter,codec);
export const readFacts=(root,file)=>{
 const source=file.replace(/\.rel$/,'.encounter');
 return projectSource(source,fs.readFileSync(path.join(root,source),'utf8'),file);
};
