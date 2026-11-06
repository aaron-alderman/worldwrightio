// Prepare a source-only repository copy for an agent onboarding trial.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fs.realpathSync(fileURLToPath(new URL('../',import.meta.url)));
const allowed=['.gitattributes','.gitignore','.github','AGENTS.md','README.md','package.json','index.html','landing.css','hub.css','mark.svg','how-it-works.html','live-world.html','script.js','styles.css','CNAME','.nojekyll','context','docs','reference','templates','tooling','examples','evidence'];
const ignored=new Set(['.git','.build','dist','node_modules','worlds']);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export function snapshotRepository(destination){
 if(!destination)throw Error('Usage: node tooling/snapshot-repository.mjs NEW_DIRECTORY');
 const target=path.resolve(destination);if(fs.existsSync(target))throw Error('Snapshot destination already exists.');
 if(target===root||allowed.some(entry=>{const from=path.join(root,entry);return target===from||target.startsWith(from+path.sep);}))throw Error('Snapshot must be outside the source trees.');
 fs.mkdirSync(target,{recursive:true});const files={};
 function copy(relative){const source=path.join(root,relative),stat=fs.lstatSync(source);if(stat.isSymbolicLink())throw Error('Source snapshot refuses symlinks: '+relative);if(stat.isDirectory()){fs.mkdirSync(path.join(target,relative),{recursive:true});for(const name of fs.readdirSync(source).sort())if(!ignored.has(name))copy(path.posix.join(relative,name));}else{const bytes=fs.readFileSync(source);fs.mkdirSync(path.dirname(path.join(target,relative)),{recursive:true});fs.writeFileSync(path.join(target,relative),bytes);files[relative]=sha(bytes);}}
 for(const entry of allowed)if(fs.existsSync(path.join(root,entry)))copy(entry);
 const receipt={protocol:'worldwright/repository-snapshot/1',files,sha256:sha(JSON.stringify(files)),boundary:'Source-only copy for a separately assigned agent. No Git metadata, local build state or surrounding checkout is supplied.'};
 fs.writeFileSync(path.join(target,'snapshot.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({directory:target,files:Object.keys(files).length,sha256:receipt.sha256}));return receipt;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))snapshotRepository(process.argv[2]);
