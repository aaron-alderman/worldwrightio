'use strict';
// File loading, bounded invocation and coordinate observation only. Rendering,
// source/rule attribution and lookup decisions live in provenance.process.json.
const {processSource}=require('./encounter-source.cjs');
const fs=require('node:fs'),path=require('node:path');
function provenance(root){
 const model={queries:{...processSource(root,'projection').queries,...processSource(root,'provenance').queries}};
 const {invoke}=require(path.join(root,'source/semantics/bootstrap/ports/programme.cjs')),{valuePorts}=require(path.join(root,'source/semantics/bootstrap/ports/value.cjs'));
 const run=(entry,input,ports={})=>invoke({model,entry,input,ports:{...valuePorts(),...ports},nested:['kernel.invoke','kernel.evaluate'],limit:20000000});
 async function enrich(catalogue,maps,producers,{definition,sourceSpans,sourceKeySpans,authorityOwners,renderedOwners}){
  const acorn=require(path.join(root,'source/inspection/native/acorn.cjs')),parsed=new Map(),cache=new Map();
  const crypto=require('node:crypto'),hash=text=>crypto.createHash('sha256').update(text).digest('hex');
  // Observe compiler spans or JSON syntax. Selection and links stay in algebra.
  const encounterSpan=(owner,pointer,facet)=>(facet==='key'?sourceKeySpans.get(owner):sourceSpans.get(owner))?.get(JSON.stringify(pointer));
  const hasSpan=({owner,pointer,facet})=>pointer.length===0||Boolean(encounterSpan(owner,pointer,facet));
  const observe=({owner,pointer,facet})=>{
   const key=JSON.stringify([owner,pointer,facet]);if(cache.has(key))return cache.get(key);
   const span=pointer.length?encounterSpan(owner,pointer,facet):null;
   const observedOwner=span?.file??owner;
   const file=catalogue.files['ownership/sources/'+observedOwner]?'ownership/sources/'+observedOwner:observedOwner,item=catalogue.files[file];
   if(!item)throw Error('PROV-SOURCE: Declared source snapshot is unavailable: '+observedOwner);
   if(sourceSpans.has(owner)&&pointer.length){
    if(!span||span.sourceHash!==item.sha256||span.lexemeSha256!==hash(item.text.slice(span.start,span.end)))
     throw Error('PROV-POINTER: Missing or stale Encounter compiler span for '+key);
    const before=item.text.slice(0,span.end).split('\n');
    const value={id:'source:'+file+':'+span.start+':'+span.end,pointerText:JSON.stringify(pointer),
     source:{file,revision:'sha256:'+item.sha256,fileSha256:item.sha256,startUtf16:span.start,endUtf16Exclusive:span.end,
      start:{line:span.line,columnUtf16:span.column},end:{line:before.length,columnUtf16Exclusive:before.at(-1).length+1},lexemeSha256:span.lexemeSha256}};
    cache.set(key,value);
    return value;
   }
   if(!parsed.has(file)){const lines=[0];for(let i=0;i<item.text.length;i++)if(item.text[i]==='\n')lines.push(i+1);parsed.set(file,{ast:null,lines});}
   const syntax=parsed.get(file);if(pointer.length&&!syntax.ast)syntax.ast=acorn.parse('('+item.text+')',{ecmaVersion:'latest'}).body[0].expression;
   const {ast,lines}=syntax;let node=ast;for(let i=0;i<pointer.length;i++){const part=pointer[i];if(node.type==='ArrayExpression')node=node.elements[Number(part)];else{const property=node.properties?.find(p=>(p.key.name??p.key.value)===part);node=facet==='key'&&i===pointer.length-1?property?.key:property?.value;}if(!node)throw Error('PROV-POINTER: Source coordinate is absent: '+key);}
   const start=pointer.length?node.start-1:0,end=pointer.length?node.end-1:item.text.length;
   const line=offset=>{let lo=0,hi=lines.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(lines[mid]<=offset)lo=mid;else hi=mid;}return {line:lo+1,columnUtf16:offset-lines[lo]+1};};
   const value={id:'source:'+file+':'+start+':'+end,pointerText:JSON.stringify(pointer),source:{file,revision:'sha256:'+item.sha256,fileSha256:item.sha256,startUtf16:start,endUtf16Exclusive:end,start:line(start),end:{line:line(end).line,columnUtf16Exclusive:line(end).columnUtf16},lexemeSha256:hash(item.text.slice(start,end))}};cache.set(key,value);return value;
  };
  const producerIndex=Object.fromEntries(producers.map(p=>[p.artifact,p])),texts=Object.fromEntries(Object.entries(catalogue.files).map(([f,v])=>[f,v.text]));
  for(const record of Object.values(catalogue.nodes)){
   const {value}=await run('provenance.recordLinks',{producerIndex,maps,texts,authorityOwners,eventInput:{record}},{'source.observe':observe,'source.hasSpan':hasSpan});
   catalogue.nodes[record.id]=value.record;for(const node of value.nodes)catalogue.nodes[node.id]??=node;
  }
  for(const [file,graph] of Object.entries(maps)){
   if(!renderedOwners.includes(graph.sourceOwner))continue;
   const item=catalogue.files[file];
   const lines=[0];for(let i=0;i<item.text.length;i++)if(item.text[i]==='\n')lines.push(i+1);
   const line=offset=>{let lo=0,hi=lines.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(lines[mid]<=offset)lo=mid;else hi=mid;}return {line:lo+1,columnUtf16:offset-lines[lo]+1};};
   const output=({start,end})=>{
    if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>item.text.length)
     throw Error('PROV-OFFSET: Invalid rendered page span in '+file);
    const text=item.text.slice(start,end);
    return {id:'source:'+file+':'+start+':'+end,text,
     source:{file,revision:'sha256:'+item.sha256,fileSha256:item.sha256,startUtf16:start,endUtf16Exclusive:end,
      start:line(start),end:{line:line(end).line,columnUtf16Exclusive:line(end).columnUtf16},lexemeSha256:hash(text)}};
   };
   const {value}=await run('provenance.renderedRecords',{graph,renderedOwners,recordKind:file.endsWith('.css')?'Rendered style value':'Rendered page value'},{'source.observe':observe,'output.observe':output});
   for(const node of value.nodes)catalogue.nodes[node.id]??=node;
   catalogue.nodes['source:'+file+':0:'+item.text.length].links.push(...value.links);
  }
  const binding=catalogue.bindings.application;
  const {value}=await run('provenance.applicationBindings',{definition},{'source.observe':observe});
  Object.assign(binding,value.bindings);
  for(const node of value.nodes)catalogue.nodes[node.id]??=node;
  catalogue.nodes[binding.root].links.push(...value.links);
  return catalogue;
 }
 const selectPaths=async(paths,producers)=>(await run('provenance.cataloguePaths',{paths,producerIndex:Object.fromEntries(producers.map(p=>[p.artifact,p]))})).value;
 return {run,enrich,selectPaths,trace:(document,grammar,sourceOwner,grammarOwner,slots={},slotSources={})=>run('provenance.document',{document,grammar,sourceOwner,grammarOwner,slots,slotSources}),locate:(graph,offset,artifactText)=>run('provenance.locate',{graph,artifactText,eventInput:{node:graph.root,offset}})};
}
module.exports={provenance};
if(require.main===module){const root=path.resolve(__dirname,'..'),[artifact,offset]=process.argv.slice(2);(async()=>{
 if(!artifact||offset===undefined)throw Error('Usage: node bootstrap/provenance.cjs <generated artifact, e.g. app.js> <UTF-16 offset>');
 await require('./guard.cjs').verify(root);
 const index=JSON.parse(fs.readFileSync(path.join(root,'dist/ownership/index.json'))),maps={},texts={};
 for(const record of index.producers)if(record.coverage==='character-map'){
  maps[record.artifact]=JSON.parse(fs.readFileSync(path.join(root,'dist/ownership/maps',record.artifact+'.map.json')));
  texts[record.artifact]=fs.readFileSync(path.join(root,'dist',record.artifact),'utf8');
 }
 const result=await provenance(root).run('provenance.resolve',{maps,texts,eventInput:{artifact,offset:Number(offset)}});console.log(JSON.stringify(result.value,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});}
