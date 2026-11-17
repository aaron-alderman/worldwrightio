// Authoring utility for the typed projection IR. Not a build/runtime input.
const fs=require('node:fs');
function author(document){
 const nodes=document.nodes;
 const add=(op,data={},links={})=>{const id=nodes.length;nodes.push({id,op,data,links});return id;};
 const name=n=>add('NameReference',{name:n}),literal=value=>add('LiteralValue',{value});
 const member=(object,property,computed=false)=>add('Select',{computed,optional:false},{object,property:computed?property:name(property)});
 const call=(callee,args=[])=>add('Invoke',{optional:false},{callee:typeof callee==='string'?name(callee):callee,arguments:args});
 const expr=expression=>add('Do',{}, {expression}),ret=argument=>add('Yield',{}, {argument}),block=body=>add('Sequence',{}, {body});
 const bind=(id,init,kind='const')=>add('BindGroup',{kind,terminate:true},{declarations:[add('Binding',{}, {id:name(id),init})]});
 const array=elements=>add('List',{}, {elements});
 const record=entries=>add('Record',{}, {properties:Object.entries(entries).map(([key,value])=>add('Field',{kind:'init',computed:false},{key:name(key),value}))});
 const arrow=(params,body,async=false,isBlock=false)=>add('Procedure',{async,block:isBlock},{params:params.map(name),body});
 const binary=(operator,left,right)=>add(['&&','||','??'].includes(operator)?'ShortCircuit':'Calculate',{operator},{left,right});
 const set=(left,right,operator='=')=>add('Set',{operator},{left,right}),awaitValue=argument=>add('Await',{}, {argument});
 const fn=(id,params,body,async=false)=>add('Define',{async,generator:false},{id:name(id),params:params.map(p=>typeof p==='string'?name(p):p),body:block(body)});
 function finish(file){const result=[],seen=new Map();function visit(id){if(id===null)return null;if(seen.has(id))return seen.get(id);const n=nodes[id];if(!n)throw Error('Missing authored reference '+id);const links={};for(const[k,v]of Object.entries(n.links))links[k]=Array.isArray(v)?v.map(visit):visit(v);const next=result.length;seen.set(id,next);result.push({...n,id:next,links});return next;}document.entry=visit(document.entry);document.nodes=result;fs.writeFileSync(file,JSON.stringify(document,null,2)+'\n');return document;}
 return {nodes,add,name,literal,member,call,expr,ret,block,bind,array,record,arrow,binary,set,awaitValue,fn,finish};
}
module.exports={author};
