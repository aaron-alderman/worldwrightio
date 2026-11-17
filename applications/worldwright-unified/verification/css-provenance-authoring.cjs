const fs=require('fs');const read=p=>JSON.parse(fs.readFileSync(p)),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const L=(...x)=>['list',...x],A=(a,b)=>['append',a,b],T=(a,k)=>['at',a,k],N=(a,b)=>['add',a,b],E=(a,b)=>['eq',a,b],I=(c,a,b)=>['if',c,a,b],C=(...x)=>['concat',...x];const v=(name,value)=>({let:name,value}),P=(pointer,extra={})=>({owner:'source/inspection/source/presentation/source-presentation.json',pointer,...extra});
const spFile='source/inspection/algebra/source-presentation.process.json',sp=read(spFile);
if(!sp.queries['sp.stylePlan']){const body=sp.queries['sp.style'];sp.queries['sp.stylePlan']=[...body.slice(0,-1),v('result','$cssPlan')];sp.queries['sp.style']=[{call:'sp.stylePlan'},v('cssPlan','$result'),{call:'css.renderPlan'}];save(spFile,sp);}
const d=read('algebra/provenance.process.json');
const generated={owner:spFile,pointer:L('queries','sp.stylePlan')};
const fieldOrigin=(field)=>I('$layout',P(A(L('layoutRules','$ruleIndex','declarations','$declarationIndex'),L(field))),P('$roleOrigin',{transform:'generated-token-reference',derivation:generated}));
d.queries['provenance.cssDocument']=[
 {fold:['range',['count','$policy.themes']],as:'themeNumber',accumulator:'origins',initial:L(),steps:[
  v('themeIndex',N('$themeNumber',-1)),v('theme',T('$policy.themes','$themeIndex')),{port:'record.entries',args:{value:'$theme.roles'},into:'roles'}
 ],yield:A('$origins',['fold','$roles','role','items',L(),A('$items',L({pointer:L('themes','$themeIndex','roles',T('$role',0)),theme:L('themes','$themeIndex','id')}))]),into:'tokenOrigins'},
 {fold:['range',['count','$plan.tokens']],as:'tokenNumber',accumulator:'tokens',initial:L(),steps:[
  v('tokenIndex',N('$tokenNumber',-1)),v('token',T('$plan.tokens','$tokenIndex')),v('tokenOrigin',T('$tokenOrigins','$tokenIndex'))
 ],yield:A('$tokens',L({id:'$tokenIndex',op:'Declaration',data:{property:C('--','$token.name'),value:'$token.value'},links:{},meaning:{origins:{property:P('$tokenOrigin.pointer',{transform:'generated-custom-property-name',derivation:generated,inputs:L(P('$tokenOrigin.theme'),P('$tokenOrigin.pointer'))}),value:P('$tokenOrigin.pointer')}}})),into:'nodes'},
 v('rootId',['count','$nodes']),v('rootRule',{id:'$rootId',op:'StyleRule',data:{selector:':root'},links:{children:['fold',['range','$rootId'],'n','ids',L(),A('$ids',L(N('$n',-1)))]},meaning:{origins:{selector:{owner:'source/inspection/algebra/css.process.json',pointer:L('queries','css.renderPlan',4,'value',2)}}}}),
 {fold:['range',['count','$plan.rules']],as:'ruleNumber',accumulator:'state',initial:{nodes:A('$nodes',L('$rootRule')),rules:L('$rootId')},steps:[
  v('ruleIndex',N('$ruleNumber',-1)),v('cssRule',T('$plan.rules','$ruleIndex')),
  v('layout',['includes',['range',['count','$policy.layoutRules']],'$ruleNumber']),
  v('roleIndex',N('$ruleIndex',I('$layout',0,N(-1,N(['count','$policy.layoutRules'],-1))))),
  // Coordinate subtraction is an observation supplied by slicing a fixed sequence.
  {port:'text.slice',args:{value:['concat',['fold','$policy.layoutRules','r','s','',C('$s','x')]],start:0,end:'$ruleIndex'},into:'unused'},
  v('roleOrigin',T(T('$tokenOrigins',N('$ruleIndex',-1)),'pointer')),
  {when:I('$layout',false,true),then:[
   {port:'text.slice',args:{value:['fold','$plan.rules','r','s','',C('$s','x')],start:['count','$policy.layoutRules'],end:'$ruleIndex'},into:'palettePrefix'},v('roleOrigin',T(T('$tokenOrigins',['count','$palettePrefix']),'pointer'))
  ]},
  {fold:['range',['count','$cssRule.declarations']],as:'declarationNumber',accumulator:'declarations',initial:{nodes:'$state.nodes',children:L()},steps:[
   v('declarationIndex',N('$declarationNumber',-1)),v('declaration',T('$cssRule.declarations','$declarationIndex')),v('id',['count','$declarations.nodes'])
  ],yield:{nodes:A('$declarations.nodes',L({id:'$id',op:'Declaration',data:{property:'$declaration.property',value:'$declaration.value'},links:{},meaning:{origins:{property:fieldOrigin('property'),value:fieldOrigin('value')}}})),children:A('$declarations.children',L('$id'))},into:'declarations'},
  v('id',['count','$declarations.nodes']),v('styleRule',{id:'$id',op:'StyleRule',data:{selector:'$cssRule.selector'},links:{children:'$declarations.children'},meaning:{origins:{selector:I('$layout',P(L('layoutRules','$ruleIndex','selector')),P('$roleOrigin',{transform:'generated-theme-selector',derivation:generated}))}}}),
  v('nextNodes',A('$declarations.nodes',L('$styleRule'))),v('ruleId','$id'),
  {when:I(E('$cssRule.context',null),false,true),then:[v('ruleId',N('$id',1)),v('nextNodes',A('$nextNodes',L({id:'$ruleId',op:'MediaRule',data:{condition:'$cssRule.context'},links:{children:L('$id')},meaning:{origins:{condition:P(L('layoutRules','$ruleIndex','context'))}}})))]}
 ],yield:{nodes:'$nextNodes',rules:A('$state.rules',L('$ruleId'))},into:'state'},
 v('entry',['count','$state.nodes']),v('result',{protocol:'encounter/style-projection/1',identity:'presentation/style.css',nodes:A('$state.nodes',L({id:'$entry',op:'StyleStream',data:{},links:{children:'$state.rules'}})),entry:'$entry'})
];
save('algebra/provenance.process.json',d);
const grammar=read('algebra/style-grammar.json');grammar.rules.StyleStream={render:'$j.children',data:[],links:{children:{many:true,separator:''}},validators:{},types:{}};grammar.rules.MediaRule={render:['concat','@media','$n.condition','{','$j.children','}'],data:['condition'],links:{children:{many:true,separator:''}},validators:{},types:{condition:['string']}};save('algebra/style-grammar.json',grammar);
