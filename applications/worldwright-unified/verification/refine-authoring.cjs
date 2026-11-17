const fs=require('node:fs'),path=require('node:path'),{program}=require('./program-authoring.cjs'),{projector}=require('../bootstrap/projection.cjs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
async function main(){
 const grammar=read('algebra/program-grammar.json');
 async function change(p,fn){const d=read(p),r=await projector(process.cwd()).project(d,grammar);save(p,program(fn(r.text),d.identity));}
 await change('source/programs/inspection/client.program.json',s=>s.replace('"data-inspect-key"','"data-inspect-key"'));
 // Attribute bundles must carry their own separating whitespace. This fixes the
 // existing title and article bindings as well as the newly embedded workspace.
 const client='source/programs/inspection/client.program.json',d=read(client);
 for(const n of d.nodes)if(n.op==='LiteralValue'&&typeof n.data.value==='string'&&n.data.value.startsWith('data-inspect-key='))n.data.value=' '+n.data.value;
 save(client,d);
 await change('source/programs/app.program.json',s=>s.replace('function scenePage(id,selection) {',`function scenePage(id,selection) {
 if(selection.view){
  const view=application.definition.views[selection.view],reading=readingFor(id,scenes[id]);
  return \`<article class="scene application-scene" \${inspectAttrs('application')}><a class="back" href="#sourcery">← Back to the questions</a><header class="application-intro"><p class="eyebrow">Worldwright / Encounter</p><h1>\${escape(view.title)}</h1><p>\${escape(view.description)}</p><details><summary>Why this belongs here</summary>\${reading.body.map(p=>\`<p>\${escape(p)}</p>\`).join('')}<button class="source-button" data-inspection-key="scenes/workshop">Follow the source ↗</button></details></header><section class="encounter-workspace" data-application-view aria-label="Encounter workspace"></section></article>\`;
 }
`));
 await change('source/programs/workshop/lightning.program.json',s=>s.replace('const challenges = new (Map)();','const challenges = window.services.notes;').replaceAll('("./" + s.source)','(new URL(s.source,new URL("./",import.meta.url)).href)').replaceAll('"./index.html#story-title"','new URL("./index.html#story-title",import.meta.url).href').replaceAll('"./index.html#web-label"','new URL("./index.html#web-label",import.meta.url).href'));
 const app=read('source/application.json');
 app.views.example.description='Change one thing. Follow its meaning, the checked process, and the route back to source.';
 app.views.reason.description='Begin with a human purpose. Follow the necessary links and keep every assumption open to correction.';
 app.views.diagrams.description='Read the architecture as a whole. Explore the diagrams here, or print them to share.';
 save('source/application.json',app);
 const profile=read('source/inspection/profile.json');profile.basisCommit='6f538173ecc3832550f80e5eb91a462d1c115db1';save('source/inspection/profile.json',profile);
 let recipe=fs.readFileSync('bootstrap/inspection.cjs','utf8');recipe=recipe.replace(/baselineCommit:cp\.execFileSync\('git'.*?\.trim\(\)/,"baselineCommit:profile.basisCommit");fs.writeFileSync('bootstrap/inspection.cjs',recipe);
 const {author}=require('./ir-authoring.cjs'),style='source/styles/style.style.json',sheet=read(style),a=author(sheet);
 const rule=(selector,values)=>a.add('StyleRule',{selector},{declarations:Object.entries(values).map(([property,value])=>a.add('Declaration',{property,value},{}))});
 const op=sheet.nodes.find(n=>n.data.selector)?.op;
 const extra=[];for(const[selector,values]of Object.entries({'.application-scene':{'padding-top':'36px'},'.application-intro':{'max-width':'780px','margin':'36px 0'},'.application-intro h1':{'font':'400 clamp(40px,6vw,74px)/1.08 var(--serif)','letter-spacing':'-2px','margin':'20px 0'},'.application-intro p':{'line-height':'1.8','color':'#ddd1dc'},'.application-intro details':{'margin':'20px 0','padding':'16px 0','border-top':'1px solid var(--line)'},'.application-intro summary':{'cursor':'pointer','padding':'8px 0'},'.encounter-workspace':{'display':'block','border-radius':'16px','overflow':'hidden','margin-bottom':'50px'}})){
  const id=rule(selector,values);sheet.nodes[id].op=op;extra.push(id);
 }
 const entry=sheet.nodes[sheet.entry],key=Object.keys(entry.links)[0];entry.links[key].push(...extra);a.finish(style);
 // Shared chrome is ordinary styled navigation within each view's scope.
 const workshop='source/styles/workshop/style.style.json',ws=read(workshop),b=author(ws),wop=ws.nodes.find(n=>n.data.selector)?.op;
 for(const[selector,values]of Object.entries({':host':{'display':'block','padding':'clamp(18px,3vw,38px)'},'.encounter-journey':{'display':'flex','flex-wrap':'wrap','gap':'10px','padding-bottom':'22px','margin-bottom':'20px','border-bottom':'1px solid #c4cbc8'},'.encounter-journey a':{'display':'block','padding':'10px 14px','border':'1px solid #b5c1bf','border-radius':'24px','color':'#173d43','text-decoration':'none','font-size':'14px'},'.encounter-journey a[aria-current=page]':{'background':'#173d43','color':'#fff'},'.encounter-journey a:focus-visible':{'outline':'3px solid #ab5732','outline-offset':'3px'}})){
  const id=b.add(wop,{selector},{declarations:Object.entries(values).map(([property,value])=>b.add('Declaration',{property,value},{}))});ws.nodes[ws.entry].links[Object.keys(ws.nodes[ws.entry].links)[0]].push(id);
 }
 b.finish(workshop);
}
main().catch(e=>{console.error(e);process.exitCode=1});
