const fs=require('fs'),read=p=>JSON.parse(fs.readFileSync(p)),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const L=(...x)=>['list',...x],A=(a,b)=>['append',a,b],T=(a,k)=>['at',a,k],N=(a,b)=>['add',a,b],E=(a,b)=>['eq',a,b],I=(c,a,b)=>['if',c,a,b],C=(...x)=>['concat',...x],v=(name,value)=>({let:name,value});
const rule=(owner,query)=>({owner,pointer:['queries',query]});
const policy=read('source/provenance.policy.json'),sem=read('source/build.json').semantics.map(i=>i.owner);
const fixed=[];const add=(artifact,kind,sources,rules=[])=>fixed.push({artifact,kind,sources:[...new Set(sources)],rules,coverage:kind==='byte-copy'?'byte-identity':'declared-inputs',inverse:'none'});
const bootstrap=['bootstrap/build.cjs','bootstrap/inspection.cjs','bootstrap/fixture.cjs','bootstrap/provenance.cjs'];
const native=['source/semantics/bootstrap/temple-seed.cjs','source/semantics/bootstrap/ports/value.cjs','source/semantics/bootstrap/ports/kernel.cjs','source/semantics/bootstrap/ports/programme.cjs'];
add('workshop/temple-native.js','native-assembly',native.concat('bootstrap/build.cjs'));
add('application-native.js','native-assembly',[native[0],native[1],'source/native/application-host.cjs','bootstrap/build.cjs']);
for(const file of ['package.json','workshop/package.json','workshop/README.txt'])add(file,'native-template',['bootstrap/build.cjs']);
for(const file of ['workshop/fixture.json','workshop/source-manifest.txt'])add(file,'composed-model',sem.concat(bootstrap),[rule('source/semantics/algebra/encounter-code-runtime.process.json','ec.prepare'),rule('source/semantics/algebra/lowering.process.json','lower.start')]);
add('workshop/encounter-story.html','semantic-projection',sem.concat('bootstrap/fixture.cjs'),[rule('source/semantics/algebra/encounter-code-runtime.process.json','ec.run'),rule('source/semantics/algebra/html.process.json','html.serialize')]);
add('application.json','semantic-composition',['source/application.json','algebra/application.process.json','bootstrap/application.cjs'],[rule('algebra/application.process.json','application.compose')]);
for(const [artifact,source]of [['application/definition.json','source/application.json'],['application/compose.process.json','algebra/application.process.json'],['inspection/sources/build-inspection.cjs','bootstrap/inspection.cjs'],['inspection/sources/inspection-profile.json','source/inspection/profile.json']])add(artifact,'byte-copy',[source]);
for(const artifact of ['inspection/model.json','inspection/catalogue.json','inspection/manifest.json','inspection/capture.json'])add(artifact,'native-source-observation',sem.concat(bootstrap,'source/inspection/native/acorn.cjs','source/inspection/profile.json','algebra/provenance.process.json'),[rule('source/inspection/algebra/lowering.process.json','lower.start'),rule('algebra/provenance.process.json','provenance.recordLinks')]);
add('ownership/intermediates/presentation.style.json','semantic-intermediate',['source/inspection/source/presentation/source-presentation.json','source/inspection/algebra/source-presentation.process.json','algebra/provenance.process.json'],[rule('source/inspection/algebra/source-presentation.process.json','sp.stylePlan'),rule('algebra/provenance.process.json','provenance.cssDocument')]);
add('ownership/intermediates/navigation.page.json','semantic-intermediate',['source/application.json','algebra/provenance.process.json'],[rule('algebra/provenance.process.json','provenance.navigationDocument')]);
policy.fixed=fixed;save('source/provenance.policy.json',policy);
const d=read('algebra/provenance.process.json');
d.queries['provenance.plan']=[
 {fold:L('programs','styles','pages','assets','semantics','data'),as:'kind',accumulator:'plan',initial:'$policy.fixed',steps:[
  v('projected',['includes',L('programs','styles','pages'),'$kind']),v('grammar',I(E('$kind','programs'),'algebra/program-grammar.json',I(E('$kind','styles'),'algebra/style-grammar.json','algebra/composition-grammar.json'))),
  {fold:T('$manifest','$kind'),as:'item',accumulator:'records',initial:'$plan',steps:[],yield:I(E('$item.output',null),'$records',A('$records',L({artifact:'$item.output',kind:I('$projected','typed-projection','byte-copy'),sources:I('$projected',L('$item.owner','$grammar','algebra/projection.process.json','algebra/provenance.process.json','source/provenance.policy.json'),L('$item.owner')),rules:I('$projected',L({owner:'algebra/projection.process.json',pointer:L('queries','projection.document')}),L()),coverage:I('$projected','character-map','byte-identity'),inverse:'none'}))),into:'next'}
 ],yield:'$next',into:'plan'},
 {port:'record.entries',args:{value:'$definition.views'},into:'views'},
 {fold:'$views',as:'pair',accumulator:'viewsPlan',initial:'$plan',steps:[v('view',T('$pair',1))],yield:A('$viewsPlan',L({artifact:'$view.fragment',kind:'composition-slice',sources:L('$view.composition','source/application.json','algebra/application.process.json','algebra/composition-grammar.json','algebra/projection.process.json','algebra/provenance.process.json'),rules:L({owner:'algebra/application.process.json',pointer:L('queries','application.selection')},{owner:'algebra/projection.process.json',pointer:L('queries','projection.document')}),coverage:'character-map',inverse:'none'})),into:'plan'},
 {fold:'$definition.compatibility',as:'alias',accumulator:'aliases',initial:{items:L(),paths:L()},steps:[
  {port:'text.matches',args:{value:'$alias.path',pattern:'/$'},into:'directory'},v('artifact',I('$directory',C('$alias.path','index.html'),'$alias.path'))
 ],yield:I(['includes','$aliases.paths','$artifact'],'$aliases',{items:A('$aliases.items',L({artifact:'$artifact',kind:'compatibility-route',sources:L('source/application.json','bootstrap/build.cjs','source/semantics/algebra/html.process.json'),rules:L({owner:'source/semantics/algebra/html.process.json',pointer:L('queries','html.serialize')}),coverage:'declared-inputs',inverse:'none'})),paths:A('$aliases.paths',L('$artifact'))}),into:'aliases'},
 v('plan',A('$plan','$aliases.items')),
 v('plan',A('$plan',L({artifact:'application/navigation.html',kind:'semantic-projection',sources:L('source/application.json','algebra/provenance.process.json','algebra/composition-grammar.json','algebra/projection.process.json','source/provenance.policy.json'),rules:L({owner:'algebra/provenance.process.json',pointer:L('queries','provenance.navigationDocument')}),coverage:'character-map',inverse:'none'},
 {artifact:'presentation/style.css',kind:'semantic-style',sources:L('source/inspection/source/presentation/source-presentation.json','source/inspection/algebra/source-presentation.process.json','source/inspection/algebra/css.process.json','algebra/provenance.process.json','algebra/style-grammar.json','algebra/projection.process.json'),rules:L({owner:'source/inspection/algebra/source-presentation.process.json',pointer:L('queries','sp.stylePlan')},{owner:'algebra/provenance.process.json',pointer:L('queries','provenance.cssDocument')},{owner:'source/inspection/algebra/css.process.json',pointer:L('queries','css.renderPlan')}),coverage:'character-map',inverse:'none'}))),
 v('maps',['fold','$plan','p','records',L(),I(E('$p.coverage','character-map'),A('$records',L({artifact:C('ownership/maps/','$p.artifact','.map.json'),kind:'derivation-map',sources:A('$p.sources',L('algebra/provenance.process.json','bootstrap/provenance.cjs')),rules:L({owner:'algebra/provenance.process.json',pointer:L('queries','provenance.document')}),coverage:'declared-inputs',inverse:'none'})),'$records')]),
 v('snapshots',['fold','$inputs','input','records',L(),A('$records',L({artifact:C('ownership/sources/','$input.path'),kind:'byte-copy',sources:L('$input.path'),rules:L(),coverage:'byte-identity',inverse:'none'}))]),
 v('result',A(A('$plan','$maps'),A('$snapshots',L({artifact:'ownership/index.json',kind:'provenance-index',sources:L('algebra/provenance.process.json','source/provenance.policy.json','source/build.json','source/application.json'),rules:L({owner:'algebra/provenance.process.json',pointer:L('queries','provenance.plan')}),coverage:'declared-inputs',inverse:'none'}))))
];
d.queries['provenance.fragment']=[
 {fold:'$refs',as:'ref',accumulator:'fragment',initial:{text:'',parts:L()},steps:[v('text',T('$compiled','$ref'))],yield:{text:C('$fragment.text','$text'),parts:A('$fragment.parts',I(E(['count','$text'],0),L(),L({start:['count','$fragment.text'],end:N(['count','$fragment.text'],['count','$text']),origin:null,child:'$ref',external:null})))},into:'fragment'},
 v('id',['count','$graph.nodes']),v('result',{text:'$fragment.text',graph:{protocol:'encounter/derivation-map/1',units:'utf16',sourceOwner:'$graph.sourceOwner',grammarOwner:'$graph.grammarOwner',root:'$id',length:['count','$fragment.text'],nodes:A('$graph.nodes',L({id:'$id',op:'CompositionSlice',length:['count','$fragment.text'],source:{owner:'source/application.json',pointer:'$partsPointer'},rule:{owner:'algebra/application.process.json',pointer:L('queries','application.selection')},pieces:'$fragment.parts'}))}})
];
// Catalogue links are derived here. The host only observes JSON coordinates and
// stores returned records; no UI programme or new JavaScript IR is introduced.
d.queries['provenance.recordLinks']=[
 v('record','$eventInput.record'),{port:'record.get',args:{record:'$producerIndex',key:'$record.source.file'},into:'producer'},v('result',{record:'$record',nodes:L()}),
 {when:I(E('$producer',null),false,true),then:[
  v('origins',A(['fold','$producer.sources','owner','refs',L(),A('$refs',L({owner:'$owner',pointer:L()}))],'$producer.rules')),
  {port:'record.get',args:{record:'$maps',key:'$record.source.file'},into:'mapped'},
  {when:I(E('$mapped',null),false,I(E('$record.kind','SourceFile'),false,true)),then:[
   {port:'kernel.invoke',args:{query:'provenance.resolve',input:{artifact:'$record.source.file',offset:'$record.source.startUtf16'}},into:'location'},
   v('last',T('$location.path',N(['count','$location.path'],-1))),
   v('origins',A('$origins',I(E('$location.origin',null),L(),L('$location.origin')))),
   {when:I(E('$last',null),false,true),then:[v('origins',A('$origins',L('$last.source','$last.rule')))]}
  ]},
  {fold:'$origins',as:'origin',accumulator:'attribution',initial:{nodes:L(),links:'$record.links'},steps:[
   {port:'json.observe',args:{owner:'$origin.owner',pointer:'$origin.pointer'},into:'observed'},
   v('label',C('$origin.owner',' · ','$observed.pointerText')),
   v('node',{id:'$observed.id',label:'$label',kind:'Canonical source / derivation rule',literalType:null,source:'$observed.source',links:L()})
  ],yield:{nodes:A('$attribution.nodes',L('$node')),links:A('$attribution.links',L({label:C('Derived from → ','$label'),target:'$observed.id',relation:'derivation'}))},into:'attribution'},
  {port:'record.put',args:{record:'$record',key:'links',value:'$attribution.links'},into:'record'},v('result',{record:'$record',nodes:'$attribution.nodes'})
 ]}
];
save('algebra/provenance.process.json',d);
const app=read('algebra/application.process.json');
const selectedChildren=['fold','$node.links.children','child','children',L(),I(['includes','$part.exclude',T(T('$document.nodes','$child'),'op')],'$children',A('$children',L('$child')))];
const selectedNode=I(E('$part.select','identity'),I(E(T(T('$node','meaning'),'identity'),'$part.value'),L('$node.id'),L()),I(E('$node.op','Main'),selectedChildren,L()));
const selectedNodes=['fold','$document.nodes','node','selected',L(),A('$selected',selectedNode)];
app.queries['application.selection']=[v('result',['fold','$parts','part','ids',L(),A('$ids',selectedNodes)])];
app.queries['application.view']=[{call:'application.selection'},v('result',['fold','$result','ref','html','',C('$html',T('$compiled','$ref'))])];save('algebra/application.process.json',app);
