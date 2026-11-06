// Read-only publication audit. No network requests and no parent dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const decode=text=>text.replaceAll('&amp;','&').replaceAll('&#38;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
export function auditResources(publication){
 const root=fs.realpathSync(publication),files=[],errors=[],external=[],cache=new Map(),dynamicRoutes=new Map(),hashInterception=new Map(),bases=new Map();let references=0,local=0;
 const scan=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name),relative=path.relative(root,file).replaceAll('\\','/');if(entry.isSymbolicLink())throw Error('Publication audit refuses symlinks: '+relative);if(relative==='source'||relative.startsWith('source/'))continue;if(entry.isDirectory())scan(file);else if(/\.(html|css)$/.test(entry.name))files.push(file);}};
 scan(root);
 const text=file=>{if(!cache.has(file))cache.set(file,fs.readFileSync(file,'utf8'));return cache.get(file);};
 function base(file){
  if(bases.has(file))return bases.get(file);
  let url=pathToFileURL(file);
  if(file.endsWith('.html')){
   const tag=/<base\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(text(file));
   if(tag){const href=decode(tag[1]??tag[2]).trim();
    if(/^(?:[a-z][a-z0-9+.-]*:|[\/\\])/i.test(href))errors.push(path.relative(root,file)+' has a nonportable document base '+href);
    else {url=new URL(href,url);const relative=path.relative(root,fileURLToPath(url));if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))errors.push(path.relative(root,file)+' document base leaves the publication');}
   }
  }
  bases.set(file,url);return url;
 }
 function routes(document){
  if(dynamicRoutes.has(document))return dynamicRoutes.get(document);
  const ids=new Set();
  for(const script of text(document).matchAll(/<script\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)){
   const src=decode(script[1]??script[2]).split(/[?#]/)[0];if(!src||/^(?:[a-z]+:|\/)/i.test(src))continue;
   const file=fileURLToPath(new URL(src,base(document))),relative=path.relative(root,file);if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file))continue;
   const match=/const model=hydrateSnapshot\(("(?:\\.|[^"\\])*")\)/.exec(text(file));if(!match)continue;
   const model=JSON.parse(JSON.parse(match[1]));
   // Only actual configured routes for the known admitted routers count;
   // arbitrary strings in a JavaScript bundle never manufacture an anchor.
   if(model.entry==='reader.boot'&&Object.hasOwn(model.queries,'reader.route')){
    for(const id of ['home',...(model.data?.ids??[])])ids.add(id);
    const binding=(model.queries['reader.boot']??[]).some(step=>step.port==='browser.on'&&step.args?.event==='click'&&step.args?.delegate==='a[href^="#"]'&&step.args?.preventDefault===true&&step.args?.query==='reader.follow');
    if(binding&&Object.hasOwn(model.queries,'reader.follow'))hashInterception.set(document,true);
   }
   if(model.entry==='activity.boot')for(const id of Object.keys(model.data?.activities??{}))ids.add(id);
  }
  dynamicRoutes.set(document,ids);return ids;
 }
 function check(file,href,kind){
  references++;href=decode(href).trim();if(!href)return;
  const context=path.relative(root,file).replaceAll('\\','/')+' ['+kind+'] '+href;
  if(/^javascript:/i.test(href)){errors.push(context+' uses executable navigation');return;}
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)){external.push(context);return;}
  if(href.startsWith('/')||href.startsWith('\\')){errors.push(context+' escapes a hosted subpath');return;}
  if(kind==='css'&&href.startsWith('#'))return;
  local++;
  if(kind==='href'&&href.startsWith('#')){
   let id;try{id=decodeURIComponent(href.slice(1));}catch{}
   const configured=routes(file),staticIds=[...text(file).matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match=>decode(match[1]??match[2]));
   // Honor only the actual generated, explicitly prevented reader handler.
   // Merely having a hash router does not intercept base-resolved link clicks.
   if(hashInterception.get(file)&&(configured.has(id)||staticIds.includes(id)))return;
  }
  const hashAt=href.indexOf('#'),fragment=hashAt<0?'':href.slice(hashAt+1),route=(hashAt<0?href:href.slice(0,hashAt)).split('?')[0];
  let target;
  try{target=fileURLToPath(new URL(route||'#',base(file)));}catch{errors.push(context+' has invalid URI encoding');return;}
  const relative=path.relative(root,target);if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){errors.push(context+' leaves the publication');return;}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){errors.push(context+' has no local target');return;}
  if(fragment&&path.extname(target)==='.html'){
   let id;try{id=decodeURIComponent(fragment);}catch{errors.push(context+' has invalid fragment encoding');return;}
   const ids=[...text(target).matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match=>decode(match[1]??match[2]));
   if(!ids.includes(id)&&!routes(target).has(id))errors.push(context+' has no static or declared routed #'+id+' fragment');
  }
 }
 for(const file of files){
  const source=text(file);
  if(file.endsWith('.html')){base(file);for(const match of source.replace(/<base\b[^>]*>/gi,'').matchAll(/\b(href|src|poster)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi))check(file,match[2]??match[3],match[1]);}
  // CSS is audited relative to its own stylesheet. Inline <style> and style=
  // URLs resolve relative to the containing HTML document, which is also here.
  for(const match of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi))check(file,match[1]??match[2]??match[3],'css');
 }
 return {protocol:'worldwright/resource-audit/1',documents:files.filter(file=>file.endsWith('.html')).length,stylesheets:files.filter(file=>file.endsWith('.css')).length,references,localReferences:local,externalReferences:external.length,errors,boundary:'Every emitted application HTML href/src/poster and HTML/CSS url is resolved using its actual document base. Fragment targets must exist as document IDs or actual configured IDs of an admitted reader/activity router. Canonical source/ inspection snapshots are not application documents. External links are inventoried, not network-verified.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=auditResources(fileURLToPath(new URL('./dist/',import.meta.url)));console.log(JSON.stringify(report,null,2));if(report.errors.length)process.exitCode=1;
}
