import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
test('real filesystem authoring previews, applies and rejects stale/invalid changes with executed checks',async()=>{
 const base=path.join(root,'.build');fs.mkdirSync(base,{recursive:true});const copy=fs.mkdtempSync(path.join(base,'native-authoring-'));
 try{
  for(const entry of fs.readdirSync(root))if(!['dist','.build','.git','node_modules'].includes(entry))fs.cpSync(path.join(root,entry),path.join(copy,entry),{recursive:true});
  const {author}=await import(pathToFileURL(path.join(copy,'tooling/author.mjs')).href);
  const file='source/world.rel',target=path.join(copy,file),before=fs.readFileSync(target,'utf8');
  const name=/\("site", "name", ("(?:\\.|[^"\\])*")\)/.exec(before);assert.ok(name);
  const changed=before.replace(name[0],'("site", "name", '+JSON.stringify(JSON.parse(name[1])+' · authoring check')+')');
  const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
  const proposal={protocol:'worldwright/authoring-proposal/1',apply:false,changes:[{file,beforeSha256:hash(before),text:changed}]};
  const preview=await author(proposal);assert.equal(preview.applied,false);assert.equal(fs.readFileSync(target,'utf8'),before);
  const previewLog=JSON.parse(fs.readFileSync(path.join(copy,preview.validation.log),'utf8'));assert.ok(previewLog.every(run=>run.status===0));
  const summary=/(?:#|ℹ)\s*tests\s+(\d+)/.exec(previewLog[1].stdout);assert.ok(summary,'The staged suite must report an executed test count.');
  const executedChecks=Number(summary[1]),checks=JSON.parse(fs.readFileSync(path.join(copy,'source/authoring-contract.json'),'utf8')).checks;
  assert.ok(executedChecks>=checks.length,'The staged suite must actually execute.');
  for(const check of checks){const text=fs.readFileSync(path.join(copy,check),'utf8'),title=/test\('([^']+)'/.exec(text)?.[1];assert.ok(title,check+' declares tests');assert.ok(previewLog[1].stdout.includes(title),check+' was executed');}
  assert.ok(fs.readFileSync(path.join(copy,preview.candidate,'dist/index.html'),'utf8').includes('authoring check'));
  const applied=await author({...proposal,apply:true});assert.equal(applied.applied,true);assert.equal(fs.readFileSync(target,'utf8'),changed);
  await assert.rejects(author({...proposal,apply:true}),/AUTHOR-009/);assert.equal(fs.readFileSync(target,'utf8'),changed);
  const invalid={...proposal,apply:true,changes:[{file,beforeSha256:hash(changed),text:changed.replace(/\("site", "origin", "[^"]*"\)/,'("site", "origin", "not-a-url")')}]};
  await assert.rejects(author(invalid),/AUTHOR-011/);assert.equal(fs.readFileSync(target,'utf8'),changed);
  fs.writeFileSync(path.join(base,'native-authoring-report.json'),JSON.stringify({protocol:'worldwright/native-authoring-check/1',preview:true,applied:true,staleRefused:true,invalidCandidateRefused:true,executedChecks,checks,mechanismSha256:hash(fs.readFileSync(path.join(copy,'tooling/author.mjs'))),evidenceFamily:'worldwright-template-extraction-2026-11-06',boundary:'One local native-filesystem test; not independent verification.'},null,2)+'\n');
 }finally{if(!path.resolve(copy).startsWith(base+path.sep))throw Error('Unexpected native test cleanup target');fs.rmSync(copy,{recursive:true,force:true});}
});
