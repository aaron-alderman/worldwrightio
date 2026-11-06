import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export function createWorld(destination) {
  if(!destination)throw Error('Usage: npm run new -- path/to/my-world');
  const target=path.resolve(destination),template=path.join(root,'templates/world');
  if(fs.existsSync(target))throw Error('Destination already exists; choose a new directory.');
  const relative=path.relative(template,target);
  if(!relative||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw Error('Destination must be outside the template.');
  fs.cpSync(template,target,{recursive:true,filter:source=>!['dist','.build','node_modules','.git'].includes(path.basename(source))});
  console.log(`Created ${target}\nRun npm run build, npm test and npm run dev in that directory.`);
  return target;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createWorld(process.argv[2]);
