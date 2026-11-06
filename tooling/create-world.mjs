import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export function createWorld(destination,{template:name='world'}={}) {
  if(!destination)throw Error('Usage: npm run new -- path/to/my-world [--template world|expedition]');
  if(!['world','expedition'].includes(name))throw Error('Unknown template. Choose world or expedition.');
  const target=path.resolve(destination),template=path.join(root,'templates',name);
  if(!fs.existsSync(path.join(template,'package.json')))throw Error('Selected template is not installed.');
  if(fs.existsSync(target))throw Error('Destination already exists; choose a new directory.');
  const relative=path.relative(template,target);
  if(!relative||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw Error('Destination must be outside the template.');
  fs.cpSync(template,target,{recursive:true,filter:source=>!['dist','.build','node_modules','.git'].includes(path.basename(source))});
  console.log(`Created ${target} from ${name}\nRead README.md, then run npm run build, npm test and npm run dev in that directory.`);
  return target;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);let destination,template='world';
 for(let i=0;i<args.length;i++){
  if(args[i]==='--template'){if(!args[i+1])throw Error('--template requires a name.');template=args[++i];}
  else if(args[i].startsWith('--')||destination)throw Error('Unexpected argument: '+args[i]);
  else destination=args[i];
 }
 createWorld(destination,{template});
}
