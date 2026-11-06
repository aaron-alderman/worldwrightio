// Execute the supported checks and retain their actual process results.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const env={...process.env};delete env.NODE_TEST_CONTEXT;
const groups=[
 ['hub-and-extraction',['--test','--test-reporter=tap','tooling/worldwright.test.mjs','tooling/feature-extraction.test.mjs']],
 ['full-expedition',['--test','--test-reporter=tap','template.test.mjs','authoring-native.test.mjs'],'templates/expedition'],
 ['feature-closure',['tooling/verify-features.mjs','--check']],
 ['composition-behavior',['--test','--test-reporter=tap','tooling/composition.test.mjs','tooling/interactive-packs.test.mjs']],
 ['composition-consumers',['tooling/verify-composition.mjs']]
];
const checks=[];let failed=false;
for(const [name,args,directory='.']of groups){
 const result=spawnSync(process.execPath,args,{cwd:path.join(root,directory),env,encoding:'utf8',maxBuffer:8*1024*1024});
 const stdout=result.stdout??'',stderr=result.stderr??'';
 process.stdout.write(stdout);process.stderr.write(stderr);
 const tests=Number([...stdout.matchAll(/^# tests (\d+)$/gm)].at(-1)?.[1]??0);
 const ok=result.status===0&&(!args.includes('--test')||tests>0);
 checks.push({name,cwd:directory,command:['node',...args],status:result.status,ok,tests,stdoutSha256:crypto.createHash('sha256').update(stdout).digest('hex'),error:result.error?.message??null});
 if(!ok){failed=true;break;}
}
const receipt={protocol:'worldwright/qualification/1',checks,ok:!failed,evidenceFamily:'worldwright-feature-extraction-2026-11-06',boundary:'Observed local/CI software checks. Same-run and same-lineage evidence; not independent human or scientific validation.'};
const output=path.join(root,'dist/qualification.json');if(!fs.existsSync(path.dirname(output)))throw Error('Build the hub before qualification.');fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');
if(failed)process.exitCode=1;
