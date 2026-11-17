const fs=require('fs'),p='algebra/provenance.process.json',d=JSON.parse(fs.readFileSync(p));
const L=(...x)=>['list',...x],T=(a,k)=>['at',a,k],N=(a,b)=>['add',a,b],E=(a,b)=>['eq',a,b],I=(c,a,b)=>['if',c,a,b],v=(name,value)=>({let:name,value}),slice=(start,end,into)=>({port:'text.slice',args:{value:'$artifactText',start,end},into});
const q=d.queries['provenance.locate'];
q.splice(3,2,slice(0,'$offset','prefix'),{assert:E(['count','$prefix'],'$offset'),message:'PROV-OFFSET: Use an in-range nonnegative integer coordinate.'},slice('$offset','$current.length','remaining'),{assert:I(E(['count','$remaining'],0),false,true),message:'PROV-OFFSET: Offset is outside this generated node.'},
 {fold:'$current.pieces',as:'p',accumulator:'found',initial:null,steps:[slice('$offset','$p.end','beforeEnd'),slice('$p.start',N('$offset',1),'afterStart')],yield:I(E(['count','$beforeEnd'],0),'$found',I(E(['count','$afterStart'],0),'$found','$p')),into:'piece'});
const resolve=d.queries['provenance.resolve'];const at=resolve.findIndex(s=>s.let==='isBody');resolve.splice(at,1,slice('$offset','$graph.bodyEnd','beforeBodyEnd'),slice('$graph.bodyStart',N('$offset',1),'afterBodyStart'),v('isBody',I(E(['count','$beforeBodyEnd'],0),false,I(E(['count','$afterBodyStart'],0),false,true))));
resolve.find(s=>s.assert).assert=I(E('$graph',null),false,true);
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
