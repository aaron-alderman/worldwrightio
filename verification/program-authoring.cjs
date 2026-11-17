// One-time, reviewable migration of the behaviour reference. NOT a build input.
// Builds consume the resulting owned definitions; they never import dist.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const acorn=require('C:/Users/aaron/sourcery/sourcery-applications/node_modules/acorn');
const root=path.resolve(__dirname,'..');process.chdir(root);
const read=p=>fs.readFileSync(p,'utf8'),write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');};
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const manifest={protocol:'encounter/projection-build/1',reason:'Generated output must not become an editable authority.',target:'Worldwright and the Encounter workshop, including its own explanations.',goal:'Reconstruct all output from typed composition, styling, programme and algebra owners without reading dist.',programs:[],pages:[],styles:[],assets:[],native:[],semantics:[]};
const rules={},C=(...a)=>['concat',...a],I=(c,a,b)=>['if',c,a,b],J=(name)=>'$j.'+name,N=(name)=>'$n.'+name,Q=(name)=>'$q.'+name,F=(name)=>'$c.'+name;
const add=(op,render,validators={})=>rules[op]={render,validators};
add('Module',J('body'));add('NameReference',N('name'),{name:{pattern:'^[A-Za-z_$][A-Za-z0-9_$]*$'}});add('LiteralValue',Q('value'));
add('Pattern',C('new RegExp(',Q('pattern'),',',Q('flags'),')'));
add('BindGroup',C(N('kind'),' ',J('declarations'),I(N('terminate'),';','')),{kind:{enum:['let','const','var']}});
add('Binding',C(F('id'),I(F('init'),C(' = ',F('init')),'')));
add('Invoke',C(F('callee'),I(N('optional'),'?.',''),'(',J('arguments'),')'));
add('Select',C(F('object'),I(N('computed'),C(I(N('optional'),'?.',''),'[',F('property'),']'),C(I(N('optional'),'?.','.'),F('property')))));
add('Procedure',C('(',I(N('async'),'async ',''),'(',J('params'),') => ',I(N('block'),F('body'),C('(',F('body'),')')),')'));
add('Record',C('({',J('properties'),'})'));add('DestructureRecord',C('{',J('properties'),'}'));
add('Field',C(I(N('computed'),C('[',F('key'),']'),F('key')),':',F('value')));
add('Method',C(I(['eq',N('kind'),'init'],'',C(N('kind'),' ')),I(N('async'),'async ',''),I(N('generator'),'*',''),I(N('computed'),C('[',F('key'),']'),F('key')),'(',J('params'),')',F('body')));
add('List',C('[',J('elements'),']'));add('DestructureList',C('[',J('elements'),']'));
add('Recover',C('try ',F('block'),I(F('handler'),C(' ',F('handler')),''),I(F('finalizer'),C(' finally ',F('finalizer')),'')));
add('Sequence',C('{\n',J('body'),'\n}'));
add('Branch',C('if (',F('test'),') {',F('consequent'),'}',I(F('alternate'),C(' else {',F('alternate'),'}'),'')));
add('Do',C(F('expression'),';'));add('Set',C('(',F('left'),' ',N('operator'),' ',F('right'),')'),{operator:{enum:['=','+=','-=','*=','/=','??=','||=','&&=','%=']}});
add('Expand',C('...',F('argument')));add('Rest',C('...',F('argument')));add('Construct',C('new (',F('callee'),')(',J('arguments'),')'));
add('Catch',C('catch',I(F('param'),C(' (',F('param'),')'),''),' ',F('body')));
add('Define',C(I(N('async'),'async ',''),'function',I(N('generator'),'*',''),' ',F('id'),'(',J('params'),') ',F('body')));
add('FunctionValue',C('(',I(N('async'),'async ',''),'function',I(N('generator'),'*',''),I(F('id'),C(' ',F('id')),''),'(',J('params'),') ',F('body'),')'));
add('Default',C(F('left'),' = ',F('right')));add('Yield',C('return',I(F('argument'),C(' ',F('argument')),''),';'));
add('ComposeText',C('(""',I(J('parts'),C(' + ',J('parts')),''),')'));
const binary={operator:{enum:['===','!==','==','!=','+','-','*','/','%','**','<','<=','>','>=','in','instanceof','|','&','^','<<','>>','>>>','&&','||','??']}};
add('Calculate',C('(',F('left'),' ',N('operator'),' ',F('right'),')'),binary);add('ShortCircuit',rules.Calculate.render,binary);
add('Choose',C('(',F('test'),' ? ',F('consequent'),' : ',F('alternate'),')'));
add('Unary',C('(',N('operator'),' ',F('argument'),')'),{operator:{enum:['!','~','-','+','typeof','void','delete']}});
add('OptionalResult',C('(',F('expression'),')'));add('Await',C('(await ',F('argument'),')'));
add('Publish',I(F('declaration'),C('export ',F('declaration')),C('export {',J('specifiers'),'}',I(F('source'),C(' from ',F('source')),''),';')));
add('Each',C('for ',I(N('await'),'await ',''),'(',F('left'),' of ',F('right'),') ',F('body')));
add('Refuse',C('throw ',F('argument'),';'));add('Load',C('import(',F('source'),')'));add('ModuleContext',C(F('meta'),'.',F('property')));
add('Update',C('(',I(N('prefix'),N('operator'),''),F('argument'),I(N('prefix'),'',N('operator')),')'),{operator:{enum:['++','--']}});
add('RepeatFor',C('for (',F('init'),';',F('test'),';',F('update'),') ',F('body')));
add('RepeatWhile',C('while (',F('test'),') ',F('body')));add('Continue','continue;');
add('ExportBinding',C(F('local'),' as ',F('exported')));add('ImportBinding',C(F('imported'),' as ',F('local')));
add('Use',C('import ',I(J('specifiers'),C('{',J('specifiers'),'} from '),''),F('source'),';'));
add('MarkupText',Q('value'));
add('MarkupOpen',C('("<" + ',Q('tag'),I(J('attributes'),C(' + ',J('attributes')),''),' + ',I(N('closed'),'"/>"','">"'),')'),{tag:{pattern:'^[A-Za-z][A-Za-z0-9:_-]*$'}});
add('MarkupClose',C('("</" + ',Q('tag'),' + ">")'),{tag:{pattern:'^[A-Za-z][A-Za-z0-9:_-]*$'}});
add('MarkupAttribute',C('(" " + ',Q('name'),I(F('value'),C(' + "=" + ',Q('quote'),' + ',F('value'),' + ',Q('quote')),''),')'),{name:{pattern:'^[^\\s<>="\x27/]+$'}});

const names={ForStatement:'RepeatFor',Program:'Module',Identifier:'NameReference',Literal:'LiteralValue',VariableDeclaration:'BindGroup',VariableDeclarator:'Binding',CallExpression:'Invoke',MemberExpression:'Select',ArrowFunctionExpression:'Procedure',ObjectExpression:'Record',Property:'Field',ArrayExpression:'List',TryStatement:'Recover',BlockStatement:'Sequence',IfStatement:'Branch',ExpressionStatement:'Do',AssignmentExpression:'Set',SpreadElement:'Expand',NewExpression:'Construct',CatchClause:'Catch',FunctionDeclaration:'Define',AssignmentPattern:'Default',ReturnStatement:'Yield',BinaryExpression:'Calculate',ConditionalExpression:'Choose',LogicalExpression:'ShortCircuit',UnaryExpression:'Unary',ArrayPattern:'DestructureList',ChainExpression:'OptionalResult',ExportNamedDeclaration:'Publish',ForOfStatement:'Each',FunctionExpression:'FunctionValue',AwaitExpression:'Await',ThrowStatement:'Refuse',ImportExpression:'Load',MetaProperty:'ModuleContext',ObjectPattern:'DestructureRecord',UpdateExpression:'Update',RestElement:'Rest',WhileStatement:'RepeatWhile',ContinueStatement:'Continue',ExportSpecifier:'ExportBinding',ImportSpecifier:'ImportBinding',ImportDeclaration:'Use'};
const separators={body:'\n',declarations:',',arguments:',',params:',',properties:',',elements:',',specifiers:',',parts:' + ',attributes:' + '};
function program(text,file){
 const ast=acorn.parse(text,{ecmaVersion:'latest',sourceType:'module'}),nodes=[];
 function node(op,data={},links={}){if(!rules[op])throw Error('Unknown operation '+op);const id=nodes.length;nodes.push({id,op,data,links});return id;}
 function compose(parts){return node('ComposeText',{}, {parts:parts.map(p=>typeof p==='number'?p:node('LiteralValue',{value:p}))});}
 function markup(text,holes=[]){
  const pieces=[],re=/<\/?[A-Za-z][^>]*>|__ENCOUNTER_HOLE_\d+__/g;let cursor=0;
  for(const m of text.matchAll(re)){if(m.index>cursor)pieces.push(node('MarkupText',{value:text.slice(cursor,m.index)}));const t=m[0];
   if(t.startsWith('__ENCOUNTER_HOLE_'))pieces.push(holes[Number(/\d+/.exec(t)[0])]);
   else if(t.startsWith('</'))pieces.push(node('MarkupClose',{tag:/^<\/([^\s>]+)/.exec(t)[1]}));
   else {const tag=/^<([^\s/>]+)/.exec(t)[1],attrs=[],body=t.slice(tag.length+1).replace(/\/?\s*>$/,'');let at=0;const ar=/\s+|__ENCOUNTER_HOLE_\d+__|([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gy;
    while(at<body.length){ar.lastIndex=at;const a=ar.exec(body);if(!a)throw Error('Incomplete markup attribute in '+file+': '+body.slice(at));at=ar.lastIndex;if(/^\s+$/.test(a[0]))continue;if(a[0].startsWith('__ENCOUNTER_HOLE_')){attrs.push(holes[Number(/\d+/.exec(a[0])[0])]);continue;}
     const value=a[2]??a[3]??a[4],quote=a[2]!==undefined?'"':a[3]!==undefined?"'":'';
     const val=value===undefined?null:markup(value,holes);attrs.push(node('MarkupAttribute',{name:a[1],quote},{value:val}));
    }pieces.push(node('MarkupOpen',{tag,closed:/\/>$/.test(t)},{attributes:attrs}));
   }cursor=m.index+t.length;
  }if(cursor<text.length)pieces.push(node('MarkupText',{value:text.slice(cursor)}));return compose(pieces);
 }
 function walk(n,parent,key){
  if(n===null)return null;
  if(n.type==='TemplateLiteral'){const hs=n.expressions.map(e=>walk(e)),parts=n.quasis.map(q=>q.value.cooked);if(parts.some(s=>s===null))throw Error('Invalid template');let whole=parts[0];for(let i=0;i<hs.length;i++)whole+='__ENCOUNTER_HOLE_'+i+'__'+parts[i+1];if(/<\/?[A-Za-z]/.test(whole))return markup(whole,hs);const joined=[];for(let i=0;i<parts.length;i++){joined.push(node('LiteralValue',{value:parts[i]}));if(i<hs.length)joined.push(hs[i]);}return compose(joined);}
  if(n.type==='Literal'){if(n.regex)return node('Pattern',{pattern:n.regex.pattern,flags:n.regex.flags});if(typeof n.value==='string'&&/<\/?[A-Za-z]/.test(n.value))return markup(n.value);return node('LiteralValue',{value:n.value});}
  let op=names[n.type];if(!op)throw Error('No semantic operation for '+n.type+' in '+file);
  const data={},links={};
  if(n.type==='Property'&&(n.method||n.kind!=='init')){op='Method';data.kind=n.kind;data.computed=n.computed;data.async=n.value.async;data.generator=n.value.generator;links.key=walk(n.key);links.params=n.value.params.map(p=>walk(p));links.body=walk(n.value.body);return node(op,data,links);}
  for(const[k,v]of Object.entries(n)){
   if(['type','start','end','loc','raw','sourceType','expression','shorthand','method','regex'].includes(k)&&!(k==='expression'&&v&&typeof v==='object'))continue;
   if(v&&typeof v==='object'&&v.type)links[k]=walk(v,n,k);
   else if(Array.isArray(v))links[k]=v.map(c=>c===null?null:walk(c,n,k));
   else if(v===null&&['id','init','alternate','handler','finalizer','param','argument','declaration','source','label','test','update'].includes(k))links[k]=null;
   else if(['name','kind','operator','async','generator','optional','computed','prefix','await'].includes(k))data[k]=v;
   else if(v!==undefined&&v!==null)throw Error('Unclassified field '+n.type+'.'+k);
  }
  if(n.type==='VariableDeclaration')data.terminate=!((parent?.type==='ForOfStatement'&&key==='left')||(parent?.type==='ForStatement'&&key==='init'));
  if(n.type==='ArrowFunctionExpression')data.block=n.body.type==='BlockStatement';
  return node(op,data,links);
 }
 const entry=walk(ast);return {protocol:'encounter/program-projection/1',identity:file,reason:'Preserve the current behaviour while transferring ownership out of generated JavaScript.',target:file,goal:'A typed programme projected through the shared algebra grammar.',nodes,entry};
}


module.exports={program,rules};
