const fs=require('node:fs'),{author}=require('./ir-authoring.cjs');const read=p=>JSON.parse(fs.readFileSync(p)),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const app=read('source/application.json');
const fragments={'story-title':'#edit-title','web-label':'#edit-web-label','return-path':'#edit-receipt','source-story':'#edit-title','inspect':'#edit-source'};
for(const alias of app.compatibility)if(alias.path.endsWith('index.html')||alias.path==='workshop/'||alias.path==='encounter/')alias.fragments=fragments;
for(const[hash,focus]of Object.entries({'edit-title':'story-title','edit-web-label':'web-label','edit-receipt':'return-path','edit-source':'inspect'}))app.routes.push({hash,scene:'workshop',view:'example',focus});
save('source/application.json',app);
const model=read('algebra/application.process.json'),compose=model.queries['application.compose'];
compose.find(s=>s.port==='record.fromEntries').args.entries.at(-1).at(-1).at(-1).at(-1).focus=['at','$route','focus'];
// Null focus is explicit in every emitted route and can be safely transported.
const value=compose.find(s=>s.port==='record.fromEntries').args.entries[5][2][1][1];
value.focus=['if',['eq',['at','$route','focus'],null],null,['at','$route','focus']];
model.queries['application.activate'].splice(-1,0,{port:'view.focus',args:{scope:'$scope',identity:['at','$eventInput','focus']},into:'_'});
save('algebra/application.process.json',model);
const file='source/programs/app.program.json',doc=read(file),a=author(doc);
for(const n of [...doc.nodes]){if(n.op==='Invoke'&&doc.nodes[n.links.callee]?.op==='Select'){const s=doc.nodes[n.links.callee];if(doc.nodes[s.links.object]?.data.name==='application'&&doc.nodes[s.links.property]?.data.name==='mount')n.links.arguments.push(a.member(a.name('selection'),'focus'));}
// Don't scroll back to the top after the algebra has chosen a specific control.
if(n.op==='Do'){const e=doc.nodes[n.links.expression];if(e?.op==='Invoke'){const s=doc.nodes[e.links.callee];if(s?.op==='Select'&&doc.nodes[s.links.object]?.data.name==='window'&&doc.nodes[s.links.property]?.data.name==='scrollTo'){const test=a.add('Unary',{operator:'!',prefix:true},{argument:a.member(a.name('selection'),'focus')});n.op='Branch';n.links={test,consequent:a.expr(e.id),alternate:null};}}}}
a.finish(file);
