const fs=require('node:fs');const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const model=read('algebra/application.process.json');
model.queries['application.compose'].at(-1).value.interfaces={resolve:'application.resolve',mount:'application.activate',leave:'application.leave'};
const activate=model.queries['application.activate'],open=activate.find(s=>s.port==='view.open');delete open.args.journey;
open.args.chrome={tag:'nav',attrs:{'aria-label':'Encounter journey','class':'encounter-journey'},children:['fold','$data.definition.journey','step','children',[],['append','$children',['list',{tag:'a',attrs:{href:'$step.href','data-application-route':'','data-inspect-key':'application',title:'$step.reason','aria-current':['if',['eq','$step.view','$eventInput.view'],'page','false']},children:['list','$step.label']}]]]};
// A view is a declared cross-section of an owned composition, not copied HTML.
model.queries['application.view']=[{let:'result',value:''},{each:'$parts',as:'part',steps:[
 {each:'$document.nodes',as:'node',steps:[{when:['if',['eq','$part.select','identity'],['eq',['at','$node.meaning','identity'],'$part.value'],['eq','$node.op','Main']],then:[
 {when:['eq','$part.select','identity'],then:[{let:'result',value:['concat','$result',['at','$compiled','$node.id']]}],else:[{each:'$node.links.children',as:'child',steps:[{when:['not',['includes','$part.exclude',['at',['at','$document.nodes','$child'],'op']]],then:[{let:'result',value:['concat','$result',['at','$compiled','$child']]}]}]}]}
 ]}]}]},{let:'result',value:'$result'}];
save('algebra/application.process.json',model);
const definition=read('source/application.json');definition.session.stateMethod='state';definition.session.stateEvent='encounter-state';definition.views.diagrams.body={'data-paper':'a3','data-print-scope':'current'};definition.compatibility.push({path:'workshop/',target:'#workshop'});save('source/application.json',definition);
// Source code uses one complete text presentation, sharing the reader's lexer.
const {author}=require('./ir-authoring.cjs');const file='source/programs/workshop/app.program.json',doc=read(file),a=author(doc);
const fn=doc.nodes.find(n=>n.op==='Define'&&doc.nodes[n.links.id].data.name==='renderSource');
const pre=a.name('pre'),key=a.name('key'),state=a.name('state');
fn.links.body=a.block([a.bind('pre',a.call('$',[a.literal('#source-code')])),a.bind('key',a.member(a.call('$',[a.literal('#source-file')]),'value')),a.expr(a.call('paint',[pre,a.member(a.member(state,'sources'),key,true),a.add('Choose',{}, {test:a.binary('===',key,a.literal('encounter')),consequent:a.literal('encounter'),alternate:a.literal('rel')}),a.record({lineNumbers:a.literal(true),selectedLine:a.add('Choose',{}, {test:a.binary('===',a.member(a.name('sourceHighlight'),'file'),key),consequent:a.member(a.name('sourceHighlight'),'line'),alternate:a.literal(null)})})]))]);
// Null selection must remain valid before any edit route has been opened.
const conditional=doc.nodes.at(-3);for(const n of doc.nodes)if(n.op==='Select'&&n.links.object!==null&&doc.nodes[n.links.object]?.op==='NameReference'&&doc.nodes[n.links.object].data.name==='sourceHighlight')n.data.optional=true;
a.finish(file);
