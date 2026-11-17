const fs=require('node:fs');const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const manifest=read('source/build.json');
for(const [kind,g]of [['programs','program'],['pages','composition'],['styles','style']]){
 const file=`algebra/${g}-grammar.json`,grammar=read(file),seen={};
 for(const item of manifest[kind])for(const node of read(item.owner).nodes){
  if(!grammar.rules[node.op])throw Error('No declared projection: '+node.op);
  const state=seen[node.op]??={data:new Set(),types:{},links:{}};
  for(const[k,v]of Object.entries(node.data)){state.data.add(k);(state.types[k]??=new Set()).add(v===null?'null':Array.isArray(v)?'array':typeof v);}
  for(const[k,v]of Object.entries(node.links)){const many=Array.isArray(v);if(k in state.links&&state.links[k]!==many)throw Error('Mixed cardinality '+node.op+'.'+k);state.links[k]=many;}
 }
 for(const[op,state]of Object.entries(seen)){const rule=grammar.rules[op];rule.data=[...state.data];rule.types=Object.fromEntries(Object.entries(state.types).map(([k,v])=>[k,[...v]]));for(const[k,many]of Object.entries(state.links))rule.links[k]={...rule.links[k],many,separator:rule.links[k]?.separator??(many?',':'')};}
 save(file,grammar);
}
