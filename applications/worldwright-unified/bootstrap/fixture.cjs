'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {semanticSource,definitionSource}=require('./encounter-source.cjs');
async function compileFixture(root,listing,manifest=definitionSource(root,'source/build.json').definition,read=file=>semanticSource(root,file).definition){
 const source=path.join(root,'source/semantics'),load=file=>read('source/semantics/'+file);
 const {fixture}=require(path.join(source,'bootstrap/encounter-code-fixture.cjs'));
 const {lower}=require(path.join(source,'bootstrap/ports/algebra-lower.cjs'));
 const {valuePorts}=require(path.join(source,'bootstrap/ports/value.cjs'));
 const f=await fixture(load),lab=load('algebra/lab.process.json');
 const added={entry:'lab.snapshot',queries:{...load('algebra/language.process.json').queries,...lab.queries}};
 const lowered=await lower({compiler:load('algebra/lowering.process.json'),definitions:f.inputs.definitions,primitives:f.inputs.primitives,input:added,mode:'model',ports:valuePorts()});
 Object.assign(f.model.queries,lowered.queries);
 await f.call('admit.model',{}, {target:f.model,profile:f.inputs.profile});
 const original=await f.prepare(),runtime=load('algebra/encounter-code-runtime.process.json').queries;
 const hashes=manifest.semantics.filter(item=>item.output.startsWith('workshop/sources/')).map(item=>({file:item.output.slice('workshop/sources/'.length),hash:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,item.owner))).digest('hex')}));
 const entries={resolve:runtime['ec.resolve'],patch:runtime['ec.patch'],corePatch:f.model.queries['ec.patch'],serialize:f.model.queries['html.serialize'],live:lab.queries['lab.edit'],lightning:lab.queries['lab.lightning'],debugInstrument:[...lab.queries['lab.debugInstrument'],...lab.queries['lab.debugVisit']]};
 const runtimeListings=Object.fromEntries(await Promise.all(Object.entries(entries).map(async([name,programme])=>[name,await listing(programme)])));
 const panels=await f.run(original),page=panels.find(p=>p.output.type==='Page');
 const html=(await f.call('html.serialize',{}, {input:page.output.tree})).value;
 return {fixture:{model:f.model,original,hashes,runtimeListings},html};
}
module.exports={compileFixture};
