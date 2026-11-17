const fs=require('fs'),read=p=>JSON.parse(fs.readFileSync(p)),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const L=(...x)=>['list',...x],A=(a,b)=>['append',a,b],T=(a,k)=>['at',a,k],N=(a,b)=>['add',a,b],E=(a,b)=>['eq',a,b],I=(c,a,b)=>['if',c,a,b],C=(...x)=>['concat',...x],v=(name,value)=>({let:name,value});
const Q=(owner,name)=>({owner,pointer:L('queries',name)}),origin=pointer=>({owner:'source/application.json',pointer});
const d=read('algebra/provenance.process.json');
// Composed navigation is itself a projection with canonical field origins.
d.queries['provenance.navigationDocument']=[{fold:['range',['count','$definition.navigation']],as:'number',accumulator:'nav',initial:{nodes:L(),children:L()},steps:[
 v('index',N('$number',-1)),v('item',T('$definition.navigation','$index')),v('id',['count','$nav.nodes']),v('route',E('$item.kind','route'))
],yield:{nodes:A('$nav.nodes',L(
 {id:'$id',op:'Attribute',data:{name:I('$route','href','data-action'),value:I('$route',T('$item','href'),T('$item','action'))},links:{},meaning:{origins:{value:origin(L('navigation','$index',I('$route','href','action')))}}},
 {id:N('$id',1),op:'Attribute',data:{name:'data-inspect-key',value:'application'},links:{}},
 {id:N('$id',2),op:'Text',data:{value:'$item.label'},links:{},meaning:{origins:{value:origin(L('navigation','$index','label'))}}},
 {id:N('$id',3),op:I('$route','Link','Action'),data:{},links:{attributes:L('$id',N('$id',1)),children:L(N('$id',2))}}
)),children:A('$nav.children',L(N('$id',3)))},into:'nav'},v('entry',['count','$nav.nodes']),v('result',{protocol:'encounter/composition-projection/1',identity:'application/navigation.html',nodes:A('$nav.nodes',L({id:'$entry',op:'Fragment',data:{},links:{children:'$nav.children'}})),entry:'$entry'})];
d.queries['provenance.envelope']=[
 v('profile',T('$policy.envelopes','$kind')),v('prefix',I(E('$profile.before',''),'',C('$profile.before','$owner','$profile.after'))),
 v('result',{text:C('$prefix','$body','$profile.suffix'),map:{protocol:'encounter/derivation-map/1',units:'utf16',artifact:'$artifact',sourceOwner:'$graph.sourceOwner',grammarOwner:'$graph.grammarOwner',root:'$graph.root',nodes:'$graph.nodes',length:'$graph.length',bodyStart:['count','$prefix'],bodyEnd:N(['count','$prefix'],'$graph.length'),envelope:{owner:'source/provenance.policy.json',pointer:L('envelopes','$kind'),rule:Q('algebra/provenance.process.json','provenance.envelope')}}})
];
d.queries['provenance.resolve']=[
 v('offset','$eventInput.offset'),v('graph',T('$maps','$eventInput.artifact')),v('artifactText',T('$texts','$eventInput.artifact')),
 {assert:I(E('$graph',null),false,true),message:'PROV-MAP: This artifact has no character map; inspect its declared producer instead.'},
 {assert:['includes',['range',['count','$artifactText']],N('$offset',1)],message:'PROV-OFFSET: Offset is outside the generated artifact.'},
 v('isBody',I(['includes',['range','$graph.bodyEnd'],N('$offset',1)],I(['includes',['range','$graph.bodyStart'],N('$offset',1)],false,true),false)),
 v('result',{origin:'$graph.envelope',external:null,path:L(),offset:'$offset'}),
 {when:'$isBody',then:[
  {port:'text.slice',args:{value:'$artifactText',start:'$graph.bodyStart',end:'$offset'},into:'bodyPrefix'},
  {port:'kernel.invoke',args:{query:'provenance.locate',input:{node:'$graph.root',offset:['count','$bodyPrefix']}},into:'result'},
  {when:I(E('$result.external',null),false,true),then:[v('prior','$result'),{port:'kernel.invoke',args:{query:'provenance.resolve',input:{artifact:'$prior.external.artifact',offset:'$prior.offset'}},into:'result'},v('result',{origin:'$result.origin',external:null,path:A('$prior.path','$result.path'),offset:'$result.offset'})]}
 ]}
];
// Producer uniqueness and provenance are derived before output is accepted.
d.queries['provenance.accept']=[
 {assert:E(['count',['distinct',['fold','$producers','p','paths',L(),A('$paths',L('$p.artifact'))]]],['count','$producers']),message:'PROV-PRODUCER: More than one producer claims an artifact.'},
 {each:'$observed',as:'output',steps:[
  v('matches',['fold','$producers','p','found',L(),I(E('$p.artifact','$output.path'),A('$found',L('$p')),'$found')]),
  {assert:E(['count','$matches'],1),message:'PROV-UNDECLARED: Output has no declared producer. Refuse automatic admission.'}
 ]},
 {each:'$producers',as:'producer',steps:[
  v('matches',['fold','$observed','o','found',L(),I(E('$o.path','$producer.artifact'),A('$found',L('$o')),'$found')]),
  {assert:E(['count','$matches'],1),message:'PROV-MISSING: A declared producer did not emit its artifact.'},
  {each:'$producer.sources',as:'source',steps:[v('input',['fold','$inputs','i','found',null,I(E('$i.path','$source'),'$i','$found')]),{assert:I(E('$input',null),false,true),message:'PROV-SOURCE: Producer refers to an undeclared source owner.'}]}
 ]},v('result',true)
];
save('algebra/provenance.process.json',d);
const grammar=read('algebra/composition-grammar.json');grammar.rules.Fragment={render:'$j.children',data:[],links:{children:{many:true,separator:''}},types:{},validators:{}};save('algebra/composition-grammar.json',grammar);
const manifest=read('source/build.json');manifest.styles=manifest.styles.filter(x=>x.output!=='presentation/style.css');for(const p of manifest.pages)if(p.output!=='index.html')p.output=null;save('source/build.json',manifest);
const app=read('source/application.json');app.views.example.composition='source/pages/workshop/index.page.json';app.views.reason.composition='source/pages/workshop/lightning.page.json';app.views.diagrams.composition='source/pages/workshop/infographics.page.json';save('source/application.json',app);
save('source/provenance.policy.json',{protocol:'encounter/provenance-policy/1',units:'utf16',inverse:'No inverse edit is inferred from a derivation map.',envelopes:{programs:{before:'// Generated from ',after:'; edit its owner and rebuild.\n',suffix:'\n'},styles:{before:'/* Generated from ',after:'; edit its owner and rebuild. */\n',suffix:'\n'},pages:{before:'<!-- Generated from ',after:'; edit its owner and rebuild. -->\n',suffix:'\n'},fragment:{before:'',after:'',suffix:''},semanticStyle:{before:'',after:'',suffix:''}}});
