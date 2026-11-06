// Instantiate a recorded example from the same template and checked source overlay.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createWorld} from './create-world.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function inside(base,relative){if(typeof relative!=='string'||relative.includes('\\'))throw Error('Example paths must use repository-relative slashes.');const target=path.resolve(base,relative),rest=path.relative(base,target);if(!rest||rest.startsWith('..')||path.isAbsolute(rest))throw Error('Example path escapes its owner.');let cursor=base;for(const part of rest.split(path.sep)){cursor=path.join(cursor,part);if(fs.existsSync(cursor)&&fs.lstatSync(cursor).isSymbolicLink())throw Error('Example refuses symlinks.');}return target;}
export function createExample(name,destination){
 if(!/^[a-z][a-z0-9-]*$/.test(name??''))throw Error('Usage: node tooling/create-example.mjs EXAMPLE NEW_DIRECTORY');
 const example=path.join(root,'examples',name),recipe=JSON.parse(fs.readFileSync(path.join(example,'example.json'),'utf8'));
 if(recipe.protocol!=='worldwright/example-overlay/1')throw Error('Unknown example protocol.');
 const template=path.join(root,'templates',recipe.template);if(!['world','expedition'].includes(recipe.template))throw Error('Unknown example template.');
 const changes=[];
 for(const change of recipe.files){
  const input=inside(example,change.source),target=inside(template,change.file),bytes=fs.readFileSync(input);
  if(!/^(source\/|assets\/|algebra\/|[^/]+\.test\.mjs$)/.test(change.file))throw Error('Example may only supply canonical content, application algebra or its own tests.');
  const current=fs.existsSync(target)?sha(fs.readFileSync(target)):null;
  if(current!==change.beforeSha256||sha(bytes)!==change.sha256)throw Error('Example/template basis changed: '+change.file);
  changes.push({...change,bytes});
 }
 const target=createWorld(destination,{template:recipe.template});
 for(const change of changes){const file=inside(target,change.file);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,change.bytes);}
 console.log(`Applied ${name}: ${changes.length} checked source replacements.`);return target;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createExample(process.argv[2],process.argv[3]);
