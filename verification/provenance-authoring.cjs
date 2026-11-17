// Author process definitions. This utility is never a build/runtime input.
const fs=require('node:fs');
const L=(...x)=>['list',...x],A=(...x)=>['append',...x],C=(...x)=>['concat',...x],E=(a,b)=>['eq',a,b],I=(c,a,b)=>['if',c,a,b],T=(x,k)=>['at',x,k],N=(a,b)=>['add',a,b],P=(owner,pointer)=>({owner,pointer});
const letv=(name,value)=>({let:name,value}),port=(name,args,into)=>({port:name,args,into}),call=(query,input,into)=>port('kernel.invoke',{query,input},into),when=(condition,then)=>({when:condition,then});
const scalar=(text,origin)=>({text,parts:I(E(['count',text],0),L(),L({start:0,end:['count',text],origin,child:null,external:null}))});
const queries={};
queries['provenance.expression']=[
 letv('expression','$eventInput.expression'),letv('path','$eventInput.path'),letv('result',null),
 when(['isArray','$expression'],[
  letv('operator',T('$expression',0)),
  {assert:['includes',L('concat','if','at'),'$operator'],message:'PROV-GRAMMAR: Rendering operation needs an explicit provenance law.'},
  when(E('$operator','concat'),[
   {fold:['range',N(['count','$expression'],-1)],as:'index',accumulator:'joined',initial:{text:'',parts:L()},steps:[
    call('provenance.expression',{expression:T('$expression','$index'),path:A('$path',L('$index'))},'part')
   ],yield:{text:C('$joined.text','$part.text'),parts:A('$joined.parts',['fold','$part.parts','p','items',L(),A('$items',L({start:N('$p.start',['count','$joined.text']),end:N('$p.end',['count','$joined.text']),origin:'$p.origin',child:'$p.child',external:'$p.external'}))])},into:'result'}
  ]),
  when(E('$operator','if'),[
   port('kernel.evaluate',{expression:T('$expression',1),bindings:'$bindings'},'test'),letv('branch',I('$test',2,3)),
   call('provenance.expression',{expression:T('$expression','$branch'),path:A('$path',L('$branch'))},'result')
  ]),
  when(E('$operator','at'),[
   port('text.matches',{value:T('$expression',1),pattern:'^\\$slots$'},'isSlot'),
   {assert:'$isSlot',message:'PROV-SLOT: Only declared composition slots may be external provenance inputs.'},
   port('kernel.evaluate',{expression:T('$expression',2),bindings:'$bindings'},'slotName'),
   port('record.get',{record:'$slotSources',key:'$slotName'},'slotSource'),
   {assert:I(E('$slotSource',null),false,true),message:'PROV-SLOT: A composed slot requires an explicit source map.'},
   port('kernel.evaluate',{expression:'$expression',bindings:'$bindings'},'text'),
   letv('result',{text:'$text',parts:L({start:0,end:['count','$text'],origin:null,child:null,external:'$slotSource'})})
  ])
 ]),
 when(I(['isArray','$expression'],false,true),[
  port('kernel.evaluate',{expression:'$expression',bindings:'$bindings'},'raw'),port('value.string',{value:'$raw'},'text'),
  letv('origin',P('$grammarOwner',A(L('rules','$node.op','render'),'$path'))),letv('kind','rule'),
  port('text.matches',{value:'$expression',pattern:'^\\$(?:n|q|h|c|j)\\.'},'reference'),
  when('$reference',[
   port('text.split',{value:'$expression',pattern:'\\.'},'referencePath'),port('text.slice',{value:T('$referencePath',0),start:1},'namespace'),letv('field',T('$referencePath',1)),
   when(['includes',L('n','q','h'),'$namespace'],[
    letv('kind','source'),letv('origin',P('$sourceOwner',L('nodes','$node.id','data','$field'))),
    port('record.get',{record:T(T('$node','meaning'),'origins'),key:'$field'},'explicitOrigin'),
    when(I(E('$explicitOrigin',null),false,true),[letv('origin','$explicitOrigin')])
   ]),
   when(['includes',L('c','j'),'$namespace'],[letv('kind','children')])
  ]),
  letv('result',scalar('$text','$origin')),
  when(E('$kind','children'),[
   letv('refs',I(E('$namespace','c'),L(T('$node.links','$field')),T('$node.links','$field'))),
   letv('separator',I(E('$namespace','j'),T(T('$rule.links','$field'),'separator'),'')),
   {fold:'$refs',as:'ref',accumulator:'children',initial:{text:'',parts:L(),index:0},steps:[
    letv('separatorText',I(E('$children.index',0),'','$separator')),
    letv('offset',N(['count','$children.text'],['count','$separatorText'])),
    letv('childText',I(E('$ref',null),'',T('$compiled','$ref'))),
    letv('separatorParts',I(E(['count','$separatorText'],0),L(),L({start:['count','$children.text'],end:'$offset',origin:P('$grammarOwner',L('rules','$node.op','links','$field','separator')),child:null,external:null}))),
    letv('childParts',I(E(['count','$childText'],0),L(),L({start:'$offset',end:N('$offset',['count','$childText']),origin:null,child:'$ref',external:null})))
   ],yield:{text:C('$children.text','$separatorText','$childText'),parts:A('$children.parts',A('$separatorParts','$childParts')),index:N('$children.index',1)},into:'children'},
   {assert:E('$children.text','$text'),message:'PROV-JOIN: Child provenance must reproduce the exact rendered dependency.'},
   letv('result',{text:'$children.text',parts:'$children.parts'})
  ])
 ])
];
queries['provenance.document']=[
 {fold:'$document.nodes',as:'node',accumulator:'state',initial:{compiled:L(),nodes:L()},steps:[
  letv('compiled','$state.compiled'),{call:'projection.node'},letv('projected','$result'),
  letv('bindings',{n:'$node.data',q:'$q',h:'$h',c:'$c',j:'$j',slots:'$slots'}),
  call('provenance.expression',{expression:'$rule.render',path:L()},'trace'),
  {assert:E('$trace.text','$projected'),message:'PROV-REPRODUCTION: Provenance does not reproduce the projection. Refuse the build.'}
 ],yield:{compiled:A('$state.compiled',L('$projected')),nodes:A('$state.nodes',L({id:'$node.id',op:'$node.op',length:['count','$projected'],source:P('$sourceOwner',L('nodes','$node.id')),rule:P('$grammarOwner',L('rules','$node.op')),pieces:'$trace.parts'}))},into:'state'},
 letv('result',{protocol:'encounter/derivation-map/1',units:'utf16',sourceOwner:'$sourceOwner',grammarOwner:'$grammarOwner',root:'$document.entry',length:['count',T('$state.compiled','$document.entry')],nodes:'$state.nodes'})
];
queries['provenance.locate']=[
 letv('id','$eventInput.node'),letv('offset','$eventInput.offset'),letv('current',T('$graph.nodes','$id')),
 {assert:['includes',['range','$current.length'],N('$offset',1)],message:'PROV-OFFSET: Offset is outside this generated node.'},
 letv('piece',['fold','$current.pieces','p','found',null,I(['includes',['range','$p.end'],N('$offset',1)],I(['includes',['range','$p.start'],N('$offset',1)],'$found','$p'),'$found')]),
 {assert:I(E('$piece',null),false,true),message:'PROV-COVERAGE: This generated character has no derivation.'},
 letv('result',{origin:'$piece.origin',external:'$piece.external',path:L({node:'$id',source:'$current.source',rule:'$current.rule'}),offset:'$offset'}),
 when(I(E('$piece.child',null),false,true),[
  port('text.slice',{value:'$artifactText',start:'$piece.start',end:'$offset'},'relativePrefix'),
  // Native slicing observes a coordinate difference; selection stays algebraic.
  call('provenance.locate',{node:'$piece.child',offset:['count','$relativePrefix']},'nested'),
  letv('result',{origin:'$nested.origin',external:'$nested.external',path:A(L({node:'$id',source:'$current.source',rule:'$current.rule'}),'$nested.path'),offset:'$nested.offset'})
 ])
];
// A generic record-to-text explanation; it is also used by the existing inspector.
queries['provenance.describe']=[letv('result',{boundary:'Exact generated definition; no inverse edit is claimed.',source:'$eventInput.source',rule:'$eventInput.rule',mapping:'$eventInput.mapping'})];
fs.writeFileSync('algebra/provenance.process.json',JSON.stringify({protocol:'temple/surface-process-module/1',queries},null,2)+'\n');
