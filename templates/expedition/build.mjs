// Native staging and filesystem lifecycle only. World policy stays in algebra.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {build}=require('./bootstrap/run.cjs');
const root=fs.realpathSync(fileURLToPath(new URL('./',import.meta.url)));
const workspace=path.join(root,'.build'),output=path.join(root,'dist');
for(const dir of [workspace,output])if(fs.existsSync(dir)&&fs.lstatSync(dir).isSymbolicLink())throw Error('Build refuses output symlinks.');
fs.mkdirSync(workspace,{recursive:true});
const lock=path.join(workspace,'build.lock'),fd=fs.openSync(lock,'wx');
const candidate=fs.mkdtempSync(path.join(workspace,'build-')),previous=candidate+'-previous';
function discard(dir){if(!path.resolve(dir).startsWith(workspace+path.sep))throw Error('Unexpected generated cleanup target');fs.rmSync(dir,{recursive:true,force:true,maxRetries:7,retryDelay:50});}
async function rename(from,to){
 for(let attempt=0;;attempt++)try{fs.renameSync(from,to);return;}catch(error){
  if(attempt===11||!['EPERM','EBUSY','EACCES'].includes(error.code))throw error;
  await new Promise(resolve=>setTimeout(resolve,50*(attempt+1)));
 }
}
try{
 await build({root,output:candidate,manifestFile:'bootstrap/site.json'});
 if(fs.existsSync(output))await rename(output,previous);
 try{await rename(candidate,output);}catch(error){if(fs.existsSync(previous))await rename(previous,output);throw error;}
 discard(previous);
 console.log('Built the world in dist.');
}finally{discard(candidate);fs.closeSync(fd);fs.unlinkSync(lock);}
