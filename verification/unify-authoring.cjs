// One-time backend authoring. Never imported by a build; no generated output input.
const fs=require('node:fs'),path=require('node:path');
const {projector}=require('../bootstrap/projection.cjs');
const {program}=require('./program-authoring.cjs');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const grammar=read('algebra/program-grammar.json');
async function change(file,fn){const doc=read(file),p=projector(root),{text}=await p.project(doc,grammar);save(file,program(fn(text),doc.identity));}
async function main(){
 await change('source/programs/app.program.json',text=>{
  text='import {application} from "./application-runtime.js";\nlet routeEpoch=0;\n'+text;
  text=text.replace('function scenePage(id)', 'function scenePage(id,selection)');
  text=text.replace('(s.experience ?', '((!selection.view && s.experience) ?');
  text=text.replace('+ beyond(id)', '+ (selection.view?`<section class="encounter-workspace" data-application-view aria-label="Encounter workspace"></section>`:"") + beyond(id)');
  text=text.replace('function route()', 'async function route()');
  text=text.replace('(inspection?.invalidate());','const ticket=++routeEpoch;\ninspection?.invalidate();');
  text=text.replace(/const next = .*?;\n/, 'const selection=await application.resolve(requested);\nif(ticket!==routeEpoch)return;\nconst next=selection.scene;\n');
  text=text.replace('scenePage(current)', 'scenePage(current,selection)');
  text=text.replace('(inspection?.refresh());\nwindow.scrollTo', `try { if(selection.view)await application.mount(main.querySelector('[data-application-view]'),selection.view);else await application.leave(); } catch(error){if(ticket!==routeEpoch)return;const host=main.querySelector('[data-application-view]');if(host)host.textContent='Encounter could not open: '+error.message;else console.error(error);}\nif(ticket!==routeEpoch)return;\ninspection?.refresh();\nwindow.scrollTo`);
  text=text.replace('syncMotion();\nroute();', 'application.registerInspector(root=>inspection.registerRoot(root));\nsyncMotion();\nroute();');
  if(!text.includes('selection=await application.resolve')||!text.includes('await application.mount'))throw Error('Root authoring seam not found');
  return text;
 });
 await change('source/programs/inspection/client.program.json',text=>{
  text=text.replace('const parts = (() => (document.querySelectorAll("[data-inspect-key]")));', 'const roots=new Set([document]);\nconst parts=()=>[...roots].flatMap(root=>[...root.querySelectorAll("[data-inspect-key]")]);');
  text=text.replaceAll('event.target.closest(', 'event.composedPath().find(n=>n?.matches?.(');
  // The composed-path predicate needs one additional closing parenthesis.
  text=text.replaceAll('"[data-inspection-key]");','"[data-inspection-key]"));').replaceAll('"[data-inspection],[data-inspection-target]");','"[data-inspection],[data-inspection-target]"));').replaceAll('"[data-inspect-key]");','"[data-inspect-key]"));');
  text=text.replace('return ({refresh:refresh,', 'return ({registerRoot(root){roots.add(root);refresh();return ()=>roots.delete(root);},refresh:refresh,');
  if(!text.includes('roots=new Set')||!text.includes('registerRoot(root)'))throw Error('Inspector authoring seam not found');
  return text;
 });
 const highlight=`import {loadPresenter,textHash,mountProjection} from '../presentation/host.js';
const tickets=new WeakMap();
export function paint(element,text,language='process',options={}){
 text=String(text);element.textContent=text;const ticket={};tickets.set(element,ticket);
 Promise.all([loadPresenter(),textHash(text)]).then(async ([presenter,hash])=>{
  const result=await presenter.present({text,file:'live/'+language,language,expectedHash:hash,theme:'light',lineNumbers:options.lineNumbers??false,selectedLine:options.selectedLine??null,origin:{kind:'live-session-projection'}});
  if(tickets.get(element)===ticket)mountProjection(element,result.value.tree);
 }).catch(error=>{if(tickets.get(element)===ticket)element.setAttribute('aria-description','Source decoration unavailable: '+error.message);});
 return element;
}`;
 save('source/programs/workshop/highlight.program.json',program(highlight,'workshop/highlight.js'));
 await change('source/programs/workshop/debugger-native.program.json',text=>{
  text=text.replace('import {listing as listing} from "./listing.js";', 'import {createPresenter} from "../presentation/host.js";');
  text=text.replace('const instructions = transformed.instructions.map(((s) => (({...s,text:listing([s.step])}))));','const presenter=createPresenter(plan.presentation);\nconst instructions=await Promise.all(transformed.instructions.map(async s=>({...s,text:(await presenter.listing({programme:[s.step],origin:{kind:"debug-instruction"}})).value.text})));');
  return text;
 });
 const runtime=`import {createApplicationRuntime} from './application-native.js';
import {mountProjection} from './presentation/host.js';
const response=await fetch(new URL('./application.json',import.meta.url));
if(!response.ok)throw Error('APP-LOAD: Shared application definition is unavailable.');
export const application=await createApplicationRuntime(await response.json(),{base:new URL('./',import.meta.url),mountTree:mountProjection});`;
 save('source/programs/application-runtime.program.json',program(runtime,'application-runtime.js'));
 const manifest=read('source/build.json');manifest.programs.push({owner:'source/programs/application-runtime.program.json',output:'application-runtime.js'});save('source/build.json',manifest);
 // Replace root navigation with one named algebra projection slot.
 const page=read('source/pages/index.page.json'),nav=page.nodes.find(n=>n.op==='Navigation');
 if(!nav)throw Error('Missing root Navigation');
 const slot=page.nodes.length;page.nodes.push({id:slot,op:'Slot',data:{name:'application.navigation'},links:{}});nav.links.children=[slot];
 // Reorder/prune to retain dependency-first typing after adding the slot.
 const {author}=require('./ir-authoring.cjs');author(page).finish('source/pages/index.page.json');
 for(const file of ['source/styles/workshop/style.style.json','source/styles/workshop/infographics.style.json','source/styles/workshop/lightning.style.json'])if(fs.existsSync(file)){const d=read(file);for(const n of d.nodes)if(n.op==='Rule'&&n.data.selector)n.data.selector=n.data.selector.replace(/:root/g,':host').replace(/\bbody\b/g,':host');save(file,d);}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
