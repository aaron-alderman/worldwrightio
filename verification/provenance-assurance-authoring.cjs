const fs=require('fs'),read=p=>JSON.parse(fs.readFileSync(p)),save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const L=(...x)=>['list',...x],A=(a,b)=>['append',a,b],T=(a,k)=>['at',a,k],E=(a,b)=>['eq',a,b],I=(c,a,b)=>['if',c,a,b],v=(name,value)=>({let:name,value});
const d=read('algebra/provenance.process.json'),spOwner='source/inspection/algebra/source-presentation.process.json';
const namePath=['queries','sp.stylePlan',2,'steps',3,'steps',0,'value'];
const selectorPath=['queries','sp.stylePlan',2,'steps',3,'steps',2,'value',2,1,'selector'];
const colourBase=['queries','sp.stylePlan',2,'steps',3,'steps',2,'value',2,1,'declarations',1];
const gen=(pointer,inputs)=>({owner:spOwner,pointer:L(...pointer),transform:'derived-expression',inputs});
function correct(x){if(!x||typeof x!=='object')return;
 if(x.transform==='generated-custom-property-name'){x.owner=spOwner;x.pointer=L(...namePath);x.inputs[2].facet='key';}
 if(x.transform==='generated-theme-selector'){x.owner=spOwner;x.pointer=L(...selectorPath);x.inputs=L({owner:'source/inspection/source/presentation/source-presentation.json',pointer:'$roleOrigin',facet:'key'});}
 if(x.origins?.property?.[0]==='if'){const inputs=L({owner:'source/inspection/source/presentation/source-presentation.json',pointer:'$roleOrigin',facet:'key'});x.origins.property[3]=gen(colourBase.concat('property'),inputs);x.origins.value[3]=gen(colourBase.concat('value'),inputs);}
 if(x.owner==='source/inspection/algebra/css.process.json'&&JSON.stringify(x.pointer).includes('css.renderPlan'))x.pointer=L('queries','css.renderPlan',3,'value',2);
 Object.values(x).forEach(correct);
}
correct(d.queries['provenance.cssDocument']);
function reduce(x){if(!x||typeof x!=='object')return;if(x.let==='origins'){
 if(Array.isArray(x.value)&&x.value[0]==='append'&&x.value[1]?.[0]==='fold')x.value=I(E('$record.kind','SourceFile'),x.value,L());
 }Object.values(x).forEach(reduce);}reduce(d.queries['provenance.recordLinks']);
// Explicit contributing inputs of a generated name/selector remain visible too.
function inputs(x){if(!x||typeof x!=='object')return;if(Array.isArray(x.then)){const i=x.then.findIndex(s=>s.let==='last');if(i>=0)x.then.splice(i+1,0,{port:'record.get',args:{record:'$location.origin',key:'inputs'},into:'originInputs'},{when:I(E('$originInputs',null),false,true),then:[v('origins',A('$origins','$originInputs'))]});}Object.values(x).forEach(inputs);}inputs(d.queries['provenance.recordLinks']);
// Origin inputs are syntax coordinates, never inferred inverse edits.
d.queries['provenance.pointer']=[
 {port:'record.get',args:{record:'$sourceValues',key:'$eventInput.owner'},into:'sourceValue'},
 {port:'value.describe',args:{value:'$sourceValue'},into:'sourceType'},
 {assert:I('$sourceType.null',false,true),message:'PROV-SOURCE: Missing declared source value for provenance.'},
 v('point',['fold','$eventInput.pointer','key','value','$sourceValue',T('$value','$key')]),
 {port:'value.describe',args:{value:'$point'},into:'pointType'},
 {assert:I(E('$pointType.type','undefined'),false,true),message:'PROV-POINTER: Attribution points to a missing source field or algebra rule.'},v('result',true)
];
d.queries['provenance.checkMap']=[
 {each:'$graph.nodes',as:'node',steps:[
  {port:'kernel.invoke',args:{query:'provenance.pointer',input:'$node.source'},into:'_'},
  {port:'kernel.invoke',args:{query:'provenance.pointer',input:'$node.rule'},into:'_'},
  {each:'$node.pieces',as:'piece',steps:[{when:I(E('$piece.origin',null),false,true),then:[{port:'kernel.invoke',args:{query:'provenance.pointer',input:'$piece.origin'},into:'_'}]}]}
 ]},v('result',true)
];
save('algebra/provenance.process.json',d);
