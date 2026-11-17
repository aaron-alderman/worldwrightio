'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const {semanticSource,applicationSource,applicationFile}=require('./encounter-source.cjs');
async function compileInspection(root,dist,{modelOnly=false,provenance=null,load=file=>semanticSource(root,file).definition,definition=applicationSource(root).definition}={}){
const inspectDefinition=file=>load('source/inspection/'+file);
const encounter=path.join(root,'source/inspection');
const acorn=require(path.join(encounter,'native/acorn.cjs'));
const profile=inspectDefinition('profile.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(path.join(dist,p),'utf8');
const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(dist,p)),{recursive:true});fs.writeFileSync(path.join(dist,p),typeof v==='string'?v:JSON.stringify(v));};
const owners=['algebra/source-presentation.process.json','source/presentation/source-presentation.json','algebra/source.process.json','algebra/css.process.json','algebra/inspection-document.process.json','algebra/inspection.process.json','algebra/slice-01.process.json','algebra/reflection.process.json','algebra/admission.process.json','algebra/lowering.process.json','algebra/operators.expression.json','bootstrap/kernel-profile.json','source/inspection/document-schema.json','bootstrap/temple-seed.cjs','bootstrap/ports/value.cjs','bootstrap/ports/kernel.cjs','bootstrap/ports/programme.cjs'];
for(const file of owners)write('inspection/sources/'+file,fs.readFileSync(path.join(encounter,file),'utf8'));
write('inspection/sources/inspection-profile.json',fs.readFileSync(path.join(encounter,'profile.json'),'utf8'));
write('inspection/sources/build-inspection.cjs',fs.readFileSync(__filename,'utf8'));
write('application/definition.json',JSON.stringify(definition,null,2)+'\n');
write('application/compose.process.json',fs.readFileSync(path.join(root,'algebra/application.process.json'),'utf8'));
const modules=['algebra/source-presentation.process.json','algebra/source.process.json','algebra/css.process.json','algebra/inspection-document.process.json','algebra/inspection.process.json','algebra/slice-01.process.json','algebra/reflection.process.json','algebra/admission.process.json'];
const queries={},origins={};for(const file of modules){const raw=fs.readFileSync(path.join(encounter,file));for(const [name,body]of Object.entries(inspectDefinition(file).queries)){queries[name]=body;origins[name]={file:'inspection/sources/'+file,sha256:hash(raw)};}}
const used=new Set(),nativePorts=new Set(),pending=['sp.present','sp.metadata','sp.listing','sp.expression','sp.style','sp.outline','inspection.document','reflection.project','admit.model'];
function calls(n){if(!n||typeof n!=='object')return;if(n.port&&n.port!=='kernel.invoke'){if(typeof n.port!=='string')throw Error('Dynamic ports are outside this closure');nativePorts.add(n.port);}if(n.port==='kernel.invoke'){if(typeof n.args.query!=='string')throw Error('Dynamic invocation is outside the read-only closure');pending.push(n.args.query);}if(typeof n.call==='string')pending.push(n.call);Object.values(n).forEach(calls);}
while(pending.length){const name=pending.pop();if(used.has(name))continue;if(!queries[name])throw Error('Unresolved query '+name);used.add(name);calls(queries[name]);}
for(const name of used)if(['s01.run','s01.observe','s01.discover','s01.authority'].includes(name))throw Error('Inspection reached a change/discovery query');
const selected=Object.fromEntries([...used].map(n=>[n,queries[n]]));
async function main(){
 const {lower}=require(path.join(root,'source/semantics/bootstrap/ports/algebra-lower.cjs')),{valuePorts}=require(path.join(encounter,'bootstrap/ports/value.cjs')),{createKernel}=require(path.join(encounter,'bootstrap/temple-seed.cjs'));
 const model=await lower({compiler:inspectDefinition('algebra/lowering.process.json'),definitions:inspectDefinition('algebra/operators.expression.json'),primitives:createKernel.operators,input:{entry:'inspection.document',queries:selected},mode:'model',ports:valuePorts()});
 calls(model.queries);
 const presentationPolicy=inspectDefinition('source/presentation/source-presentation.json'),grammarSource=inspectDefinition('algebra/source.process.json');
 const bundle={model,presentationPolicy,grammarSource,portNames:[...nativePorts].sort(),target:{queries:selected},origins:Object.fromEntries([...used].map(n=>[n,origins[n]])),profile:inspectDefinition('bootstrap/kernel-profile.json'),definitions:inspectDefinition('algebra/operators.expression.json'),primitives:createKernel.operators,schema:inspectDefinition('source/inspection/document-schema.json')};
 write('inspection/model.json',bundle);
 const {invoke}=require(path.join(encounter,'bootstrap/ports/programme.cjs'));
 if(modelOnly)return bundle;
 const workshop=JSON.parse(read('workshop/fixture.json'));workshop.presentation=bundle;write('workshop/fixture.json',workshop);
 const files={},nodes={},asts={},nodeIds=new WeakMap(),literalValues=new Map(),lexicalObservations={};
 let paths=[];function inventory(dir=''){for(const e of fs.readdirSync(path.join(dist,dir),{withFileTypes:true})){const p=(dir?dir+'/':'')+e.name;if(e.isDirectory())inventory(p);else if(/\.(?:js|json|cjs|css|svg|html|txt|rel|encounter)$/.test(p)&&!['inspection/catalogue.json','inspection/manifest.json','inspection/model.json'].includes(p))paths.push(p);}}inventory();
 if(provenance)paths=await provenance.selectPaths(paths,provenance.producers);
 function span(file,start,end){const f=files[file],line=offset=>{const a=f.text.slice(0,offset).split('\n');return {line:a.length,columnUtf16:a.at(-1).length+1};};return {file,revision:'sha256:'+f.sha256,fileSha256:f.sha256,startUtf16:start,endUtf16Exclusive:end,start:line(start),end:{line:line(end).line,columnUtf16Exclusive:line(end).columnUtf16},lexemeSha256:hash(Buffer.from(f.text.slice(start,end)))};}
 function add(file,start,end,label,kind,parent,literalType=null){const id='source:'+file+':'+start+':'+end;if(nodes[id])return id;nodes[id]={id,label,kind,literalType,source:span(file,start,end),links:[]};if(parent&&nodes[parent]){nodes[parent].links.push({label, target:id,relation:'contains'});nodes[id].links.push({label:'Containing definition',target:parent,relation:'parent'});}return id;}
 const expandedKinds=new Set(['ObjectExpression','ArrayExpression','Literal','Property','FunctionDeclaration','ArrowFunctionExpression','VariableDeclarator','CallExpression','ExportNamedDeclaration']);
 function walk(file,node,parent,label){if(!node||typeof node!=='object')return;let here=parent;if(expandedKinds.has(node.type)&&Number.isInteger(node.start)){
  const named=node.id?.name||node.key?.name||node.key?.value||node.name;const isLiteral=node.type==='Literal';
  const title=named||label||(isLiteral?String(node.value).slice(0,70):node.type);
  here=add(file,node.start,node.end,String(title),node.type,parent,isLiteral?typeof node.value:null);nodeIds.set(node,here);if(isLiteral)literalValues.set(here,node.value);
 }
 for(const [key,value]of Object.entries(node)){if(['loc','start','end','raw'].includes(key))continue;if(Array.isArray(value))value.forEach((child,i)=>{if(child&&typeof child==='object')walk(file,child,here,key==='properties'?(child.key?.name??child.key?.value??key+' '+i):key+' '+i);});else if(value&&typeof value==='object')walk(file,value,here,key==='value'&&node.type==='Property'?String(node.key.name??node.key.value):key);}
 }
 for(const file of paths.sort()){
  const bytes=fs.readFileSync(path.join(dist,file)),text=bytes.toString('utf8');files[file]={text,sha256:hash(bytes),bytes:bytes.length};const id=add(file,0,text.length,file,'SourceFile');
  if(/\.(?:js|cjs|mjs)$/.test(file)&&text.length<=presentationPolicy.maxCodeUnits){
   const tokens=[];try{const scanner=acorn.tokenizer(text,{ecmaVersion:'latest',sourceType:'module',onComment:(block,value,start,end)=>tokens.push({start,end,kind:block?'block':'line',keyword:null,category:'comment'})});let token;do{token=scanner.getToken();tokens.push({start:token.start,end:token.end,kind:token.type.label,keyword:token.type.keyword??null,category:'token'});}while(token.type.label!=='eof');lexicalObservations[file]={units:'utf16',sha256:files[file].sha256,tokens};}catch(error){lexicalObservations[file]=null;}
  }
  if(profile.syntaxExpansion.includes(file)){
   try{const isJson=file.endsWith('.json'),ast=acorn.parse(isJson?'('+text+')':text,{ecmaVersion:'latest',sourceType:'module'});if(isJson){const adjust=n=>{if(!n||typeof n!=='object')return;if(Number.isInteger(n.start)){n.start--;n.end--;}Object.values(n).forEach(v=>{if(v&&typeof v==='object')Array.isArray(v)?v.forEach(adjust):adjust(v);});};adjust(ast);walk(file,ast.body[0].expression,id);}else{asts[file]=ast;walk(file,ast,id);}}
   catch(error){if([profile.data.world,profile.data.expansion].includes(file))throw error;nodes[id].kind='SourceFile (syntax not expanded)';}
  }
 }
 const exported=(file,name)=>{for(const stmt of asts[file].body){const s=stmt.type==='ExportNamedDeclaration'?stmt.declaration:stmt;if(s?.type==='VariableDeclaration')for(const d of s.declarations)if(d.id.name===name)return d.init;}throw Error('Missing declared data binding '+file+' / '+name);};
 const props=node=>Object.fromEntries((node?.properties||[]).map(p=>{if(p.type!=='Property'||p.computed||p.kind!=='init')throw Error('Unsupported static object binding');return [p.key.name??p.key.value,p.value];}));
 const member=node=>node?.type==='Identifier'?[node.name]:node?.type==='MemberExpression'?[...member(node.object),node.computed?node.property.value:node.property.name]:[];
 const bind=node=>node?nodeIds.get(node)||null:null;
 const sceneNodes=props(exported(profile.data.world,profile.exports.scenes)),sourceNodes={...props(exported(profile.data.world,profile.exports.sources)),...props(exported(profile.data.expansion,profile.exports.expansionSources))},overrides={},prepend={};
 for(const stmt of asts[profile.data.world].body){const e=stmt.expression;if(!e)continue;
  if(e.type==='CallExpression'&&e.callee?.object?.name==='Object'&&e.callee?.property?.name==='assign'){const p=member(e.arguments[0]);if(p[0]===profile.exports.scenes){if(p.length===1)Object.assign(sceneNodes,props(e.arguments[1]));else if(p.length===2)Object.assign(overrides[p[1]]??={},props(e.arguments[1]));}}
  if(e.type==='AssignmentExpression'){const p=member(e.left);if(p[0]===profile.exports.sources&&p.length===2)sourceNodes[p[1]]=e.right;if(p[0]===profile.exports.scenes){if(p.length===2)sceneNodes[p[1]]=e.right;else if(p.length===3)(overrides[p[1]]??={})[p[2]]=e.right;}}
  if(e.type==='CallExpression'){const p=member(e.callee);if(p[0]===profile.exports.scenes&&p[2]==='choices'&&p[3]==='unshift')(prepend[p[1]]??=[]).unshift(...e.arguments);}
 }
 const choice=node=>{const parts=node.type==='ObjectExpression'?props(node):Object.fromEntries(Object.entries(profile.passage).map(([key,i])=>[key,node.arguments?.[i]]));return {root:bind(node),...Object.fromEntries(Object.entries(parts).map(([key,value])=>[key,bind(value)]))};};
 const scenes={};for(const [id,node]of Object.entries(sceneNodes)){const p={...props(node),...overrides[id]};scenes[id]={root:bind(node),...Object.fromEntries(Object.entries(p).filter(([k])=>!['body','choices'].includes(k)).map(([k,v])=>[k,bind(v)])),body:p.body.elements.map(bind),choices:[...(prepend[id]||[]),...p.choices.elements].map(choice),sourceKey:p.source.value};}
 for(const tuple of exported(profile.data.expansion,profile.exports.definitions).elements){const parts=Object.fromEntries(Object.entries(profile.tuple).map(([key,i])=>[key,tuple.elements[i]])),id=parts.id.value;scenes[id]={root:bind(tuple),...Object.fromEntries(Object.entries(parts).filter(([k])=>!['body','choices'].includes(k)).map(([k,v])=>[k,bind(v)])),body:parts.body.elements.map(bind),choices:parts.choices.elements.map(choice),sourceKey:parts.source.value,composedBy:'file:'+profile.data.expansion};}
 // The declared expansion installer appends passage tuples. Preserve their order.
 const installer=asts[profile.data.expansion].body.find(n=>n.declaration?.id?.name==='installExpansion')?.declaration;
 for(const statement of installer.body.body)if(statement.type==='ForOfStatement'&&statement.right.type==='ArrayExpression')for(const tuple of statement.right.elements){const [id,to,label,detail]=tuple.elements;if(scenes[id.value])scenes[id.value].choices.push({root:bind(tuple),to:bind(to),label:bind(label),detail:bind(detail)});}
 const sources=Object.fromEntries(Object.entries(sourceNodes).map(([key,node])=>[key,{root:bind(node),...Object.fromEntries(Object.entries(props(node)).map(([p,v])=>[p,bind(v)]))}]));
 for(const [id,s]of Object.entries(scenes)){if(!s.root||!s.title||!s.lead||s.body.some(x=>!x)||s.choices.some(c=>!c.root||!c.to||!c.label||!c.detail)||!sources[s.sourceKey])throw Error('Incomplete explicit scene source mapping '+id);s.sourceRecord=sources[s.sourceKey].root;
  const current=[{label:'Current title',target:s.title},{label:'Current lead',target:s.lead},...s.body.map((target,i)=>({label:'Paragraph '+(i+1),target})),...s.choices.map((c,i)=>({label:'Passage '+(i+1),target:c.root})),{label:'Field note · '+s.sourceKey,target:s.sourceRecord}];
  if(s.composedBy)current.push({label:'Composing rule · expansion installer',target:'source:'+profile.data.expansion+':0:'+files[profile.data.expansion].text.length});
  nodes[s.root].label='Encounter · '+id;nodes[s.root].links=[...current.map(l=>({...l,relation:'current-source-contribution'})),...nodes[s.root].links];
  for(const [key,label]of [['title','Title'],['lead','Introduction']])nodes[s[key]].label=label+' · '+id;
  s.body.forEach((target,i)=>nodes[target].label='Paragraph '+(i+1)+' · '+id);
  s.choices.forEach((choice,i)=>{nodes[choice.root].label='Passage '+(i+1)+' · '+id;for(const key of ['to','label','detail'])if(choice[key])nodes[choice[key]].label='Passage '+(i+1)+' / '+key+' · '+id;});
 }
 for(const [key,s]of Object.entries(sources))nodes[s.root].label='Field note · '+key;
 const reading=profile.reading,readingNodes=props(exported(profile.data.reading,reading.entries)),titles=props(exported(profile.data.reading,reading.titles));
 const sourceTitles=Object.fromEntries(Object.entries(props(exported(profile.data.reading,reading.sourceTitles))).map(([key,n])=>[key,bind(n)]));
 const sourceGuides=Object.fromEntries(Object.entries(props(exported(profile.data.reading,reading.guides))).map(([key,n])=>[key,n.elements.map(bind)]));
 const choiceFunction=asts[profile.data.reading].body.map(n=>n.declaration||n).find(n=>n.type==='FunctionDeclaration'&&n.id.name===reading.choiceFunction);
 const choiceObject=choiceFunction.body.body.find(n=>n.type==='ReturnStatement').argument.left.object;
 const labelOverrides=props(choiceObject),readings={};
 for(const [id,scene]of Object.entries(scenes)){
  const entry=readingNodes[id];if(entry?.type!=='CallExpression'||entry.callee.name!=='entry')throw Error('Unsupported declared reader entry '+id);
  const body=entry.arguments[reading.entryBody],item={root:bind(entry),title:bind(titles[id])||scene.title,lead:bind(entry.arguments[reading.entryLead])||scene.lead,body:body.type==='Literal'&&body.value===null?scene.body:body.elements.map(bind),choices:scene.choices.map(c=>({...c,label:bind(labelOverrides[literalValues.get(c.label)])||c.label}))};
  readings[id]=item;nodes[item.root].label='Reader explanation · '+id;
  for(const [key,label]of [['title','Title'],['lead','Introduction']])nodes[item[key]].label=label+' · '+id;
  item.body.forEach((target,i)=>nodes[target].label='Reader paragraph '+(i+1)+' · '+id);
  nodes[scene.root].links.unshift({label:'Current reader explanation',target:item.root,relation:'reader-projection'});
  nodes[item.root].links.unshift({label:'Current title',target:item.title,relation:'reader-projection'},{label:'Fuller authored explanation',target:scene.root,relation:'source'});
 }
 const applicationSnapshot='ownership/sources/'+applicationFile;
 const applicationRoot='source:'+applicationSnapshot+':0:'+files[applicationSnapshot].text.length;
 const applicationBindings={root:applicationRoot,features:{encounter:{root:applicationRoot,source:'source:workshop/sources/source/experiment/story.rel:0:'+files['workshop/sources/source/experiment/story.rel'].text.length},reason:{root:'source:application/compose.process.json:0:'+files['application/compose.process.json'].text.length},diagrams:{root:'source:views/diagrams.html:0:'+files['views/diagrams.html'].text.length}}};
 nodes[applicationRoot].label='Shared application · purpose, navigation and journey';nodes[applicationRoot].links.push({label:'Composition algebra',target:'source:application/compose.process.json:0:'+files['application/compose.process.json'].text.length,relation:'implements'},{label:'Encounter meaning and edit routes',target:applicationBindings.features.encounter.source,relation:'source'});nodes[scenes.workshop.root].links.unshift({label:'Shared Encounter view',target:applicationRoot,relation:'projects'});
 const catalogue={protocol:'encounter/source-catalogue/2',authority:profile.authority,files,nodes,lexicalObservations,bindings:{scenes,sources,readings,sourceTitles,sourceGuides,application:applicationBindings},roots:paths.sort().map(file=>({label:file,target:'source:'+file+':0:'+files[file].text.length})),baselineCommit:profile.basisCommit};
 if(provenance)await provenance.enrich(catalogue);
 for(const node of Object.values(nodes))for(const link of node.links)if(!nodes[link.target])throw Error('Unresolved catalogue link');
 for(const file of paths)if(hash(fs.readFileSync(path.join(dist,file)))!==files[file].sha256)throw Error('Source changed during capture: '+file);
 write('inspection/catalogue.json',catalogue);
 const artifacts=['inspection/catalogue.json','inspection/model.json',profile.native,'inspection/host.js','inspection/client.js','inspection/style.css','presentation/host.js','presentation/style.css'];
 write('inspection/manifest.json',{protocol:'encounter/source-inspection-runtime/2',executionBudget:20000000,entry:'inspection.document',files:artifacts.map(file=>{const b=fs.readFileSync(path.join(dist,file));return {file,bytes:b.length,sha256:hash(b)};}),ports:[...nativePorts].sort(),bridges:['kernel.invoke'],sourceFiles:paths.length,nodes:Object.keys(nodes).length,queries:[...used].sort(),scope:profile.limits});
 const parserFile=path.join(encounter,'native/acorn.cjs');
 write('inspection/capture.json',JSON.stringify({protocol:'encounter/static-source-capture/2',node:process.version,parser:{version:acorn.version,source:'source/inspection/native/acorn.cjs',sha256:hash(fs.readFileSync(parserFile))},baselineCommit:catalogue.baselineCommit,recipeSha256:hash(fs.readFileSync(__filename)),profileSha256:hash(fs.readFileSync(path.join(encounter,'profile.json'))),manifestSha256:hash(fs.readFileSync(path.join(dist,'inspection/manifest.json'))),authority:'build-time-source-projection;not-runtime-or-scientific-admission'},null,2)+'\n');
 return {files:paths.length,nodes:Object.keys(nodes).length,scenes:Object.keys(scenes).length,sources:Object.keys(sources).length,queries:used.size};
}

return await main();
}
module.exports={compileInspection};
