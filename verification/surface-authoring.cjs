// One-time reference decomposition. Build uses only the resulting typed owners.
const fs=require('node:fs'),path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const manifest=JSON.parse(fs.readFileSync('source/build.json','utf8'));
const read=f=>fs.readFileSync(f,'utf8'),write=(f,x)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');};
const C=(...args)=>['concat',...args],I=(c,a,b)=>['if',c,a,b];
function decode(s){return s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|times);/gi,(all,key)=>key[0]==='#'?String.fromCodePoint(key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1))):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0',times:'×'}[key.toLowerCase()]));}
const roles={html:'DocumentElement',head:'Metadata',body:'PageBody',title:'PageTitle',meta:'MetaValue',link:'Resource',script:'Runtime',main:'Main',header:'Header',footer:'Footer',section:'Section',article:'Article',aside:'Aside',nav:'Navigation',p:'Paragraph',a:'Link',button:'Action',input:'Input',label:'Label',select:'SelectControl',option:'Choice',form:'Form',textarea:'TextArea',details:'Disclosure',summary:'DisclosureLabel',pre:'CodeBlock',code:'Code',ol:'OrderedCollection',ul:'Collection',li:'CollectionItem',dl:'NamedValues',dt:'ValueName',dd:'ValueDescription',img:'Image',iframe:'Preview',span:'Inline',div:'Group',br:'LineBreak',strong:'Emphasis',small:'SmallPrint',h1:'HeadingOne',h2:'HeadingTwo',h3:'HeadingThree',h4:'HeadingFour',svg:'Vector',path:'VectorPath',dialog:'Dialog'};
const voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const pageRules={Document:{render:C('<!doctype html>\n','$j.children'),data:[],links:{children:{many:true,separator:''}}},Text:{render:'$h.value',data:['value'],links:{}},Attribute:{render:C(' ','$n.name',I(['eq','$n.value',null],'',C('="','$h.value','"'))),data:['name','value'],links:{},validators:{name:{pattern:'^[A-Za-z_:][A-Za-z0-9_:.-]*$'}}}};
function page(text,output){
 const root={tag:'#document',attrs:[],children:[]},stack=[root];let at=0;
 const re=/<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[A-Za-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/gi;
 for(const m of text.matchAll(re)){
  if(m.index>at)stack.at(-1).children.push({text:decode(text.slice(at,m.index))});const tag=m[0];at=m.index+tag.length;
  if(tag.startsWith('<!'))continue;
  if(tag.startsWith('</')){const name=/^<\/([^\s>]+)/.exec(tag)[1];if(stack.at(-1).tag.toLowerCase()!==name.toLowerCase())throw Error('Unbalanced '+output+': '+name);stack.pop();continue;}
  const name=/^<([^\s/>]+)/.exec(tag)[1],attrs=[],body=tag.slice(name.length+1).replace(/\/?\s*>$/,'');const ar=/\s+|([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gy;let i=0;
  while(i<body.length){ar.lastIndex=i;const a=ar.exec(body);if(!a)throw Error('Invalid attribute '+body.slice(i));i=ar.lastIndex;if(/^\s+$/.test(a[0]))continue;attrs.push({name:a[1],value:a[2]===undefined&&a[3]===undefined&&a[4]===undefined?null:decode(a[2]??a[3]??a[4])});}
  const node={tag:name,attrs,children:[]};stack.at(-1).children.push(node);if(!voids.has(name.toLowerCase())&&!tag.endsWith('/>'))stack.push(node);
 }
 if(at<text.length)stack.at(-1).children.push({text:decode(text.slice(at))});if(stack.length!==1)throw Error('Unclosed element in '+output);
 const nodes=[];const node=(op,data,links,meaning)=>{const id=nodes.length;nodes.push({id,op,data,links,...(meaning?{meaning}:{})});return id;};
 function lower(n){if(n.text!==undefined)return node('Text',{value:n.text},{});if(n.tag==='#document')return node('Document',{}, {children:n.children.map(lower)});
  const role=roles[n.tag]??('Element_'+n.tag);if(!pageRules[role])pageRules[role]={render:C('<'+n.tag,'$j.attributes','>',...(voids.has(n.tag)?[]:['$j.children','</'+n.tag+'>'])),data:[],links:{attributes:{many:true,separator:''},children:{many:true,separator:''}}};
  const attributes=n.attrs.map(a=>node('Attribute',a,{})),children=n.children.map(lower),identity=n.attrs.find(a=>a.name==='id')?.value;
  return node(role,{}, {attributes,children},identity?{identity:output+'#'+identity,role}:undefined);
 }
 const entry=lower(root);return {protocol:'encounter/composition-projection/1',identity:output,reason:'Compose the page from named presentation roles and explicit control/source identities.',target:output,goal:'Project HTML without importing a handwritten page.',nodes,entry};
}
function splitSyntax(text,delimiter){const parts=[];let start=0,quote='',depth=0;for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c==='('||c==='[')depth++;if(c===')'||c===']')depth--;if(!depth&&c===delimiter){parts.push(text.slice(start,i));start=i+1;}}parts.push(text.slice(start));return parts;}
function style(text,output){
 text=text.replace(/\/\*[\s\S]*?\*\//g,'');const nodes=[];const node=(op,data,links)=>{const id=nodes.length;nodes.push({id,op,data,links});return id;};
 function declarations(body){return splitSyntax(body,';').filter(x=>x.trim()).map(part=>{const pieces=splitSyntax(part,':'),property=pieces.shift().trim(),value=pieces.join(':').trim();if(!value)throw Error('Missing CSS value '+output+' '+property);return node('Declaration',{property,value},{});});}
 function blocks(body){const result=[];let at=0;while(at<body.length){while(/\s/.test(body[at]??'')&&at<body.length)at++;if(at===body.length)break;let quote='',depth=0,i=at;for(;i<body.length;i++){const c=body[i];if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c==='('||c==='[')depth++;if(c===')'||c===']')depth--;if(!depth&&(c==='{'||c===';'))break;}
   const heading=body.slice(at,i).trim();if(body[i]===';'){const m=/^@([\w-]+)\s+([\s\S]*)$/.exec(heading);if(!m)throw Error('Invalid CSS statement');result.push(node('StyleStatement',{name:m[1],condition:m[2]},{}));at=i+1;continue;}
   if(body[i]!=='{')throw Error('Unterminated CSS rule '+output);let end=i+1,nest=1;quote='';for(;end<body.length;end++){const c=body[end];if(quote){if(c==='\\')end++;else if(c===quote)quote='';continue;}if(c==='"'||c==="'")quote=c;else if(c==='{')nest++;else if(c==='}'&&!--nest)break;}if(nest)throw Error('Unbalanced CSS '+output);const inner=body.slice(i+1,end);
   if(heading.startsWith('@')){const m=/^@([\w-]+)\s*([\s\S]*)$/.exec(heading);const group=['media','supports','keyframes','-webkit-keyframes','layer','container'].includes(m[1]);result.push(node(group?'StyleGroup':'StyleDescriptor',{name:m[1],condition:m[2]},{children:group?blocks(inner):declarations(inner)}));}
   else result.push(node('StyleRule',{selector:heading},{children:declarations(inner)}));at=end+1;
  }return result;
 }
 const children=blocks(text),entry=node('StyleSheet',{}, {children});return {protocol:'encounter/style-projection/1',identity:output,reason:'Own selectors, contexts and individual declarations as editable values.',target:output,goal:'Generate CSS from rules without a latent stylesheet.',nodes,entry};
}

module.exports={page,style,pageRules};
