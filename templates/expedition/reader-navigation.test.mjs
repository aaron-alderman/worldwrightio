// Execute the actual generated reader model with observed-effect fixtures.
// This proves process decisions and escaping, not browser layout/DOM APIs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {valuePorts}=require('./bootstrap/ports/value.cjs');
const {invoke}=require('./bootstrap/ports/programme.cjs');
const {browserEffects}=require('./bootstrap/ports/browser-effects.cjs');
const bundle=fs.readFileSync(new URL('dist/reader/runtime.js',import.meta.url),'utf8');
function snapshot(name){const marker='const '+name+'=hydrateSnapshot(',offset=bundle.indexOf(marker);assert.ok(offset>=0,name+' snapshot');const match=/^("(?:\\.|[^"\\])*")/.exec(bundle.slice(offset+marker.length));assert.ok(match,name+' encoded JSON');return JSON.parse(JSON.parse(match[1]));}
const model=snapshot('model'),factIndex=snapshot('factIndex');
const places={harbour:{region:'Harbour',title:'Listen to the tide',lead:'A sheltered inlet',light:'human'},garden:{region:'Garden',title:'Follow the shade',lead:'A tree canopy',light:'boundary'},orbit:{region:'Orbit',title:'Find a bearing',lead:'A distant signal',light:'unseen'}};
function session({hash='#home',visited=[],current='home'}={}){
 const state=new Map([['visited',visited],['current',current],['previous','home']]),writes=[],contents=[],titles=[],selections=[],navigations=[],focused=[];
 const data={...model.data,ids:Object.keys(places),places,notes:[{title:'A <source> & its scope',paragraphs:['Observation belongs to the field-guide author.'],note:'This is an illustrative record, not measured evidence.',kind:'Attributed example',href:'https://example.org/field-guide'}],echoes:{},trailKey:'worldwright.test.reader.trail'};
 const ports={...valuePorts(),'state.get':({key})=>state.get(key),'state.set':({key,value})=>{state.set(key,value);return true;},'browser.select':({selector})=>selector==='[data-reader-search]'?selections:selector==='#reader-content'?[{ref:'#reader-content',attributes:{id:'reader-content'}}]:[],'browser.write':value=>{writes.push(value);return true;},'browser.content':value=>{contents.push(value);return true;},'browser.location':()=>({hash,base:'https://example.org/'}),'browser.dialog':()=>true,'browser.title':({value})=>{titles.push(value);return true;},'browser.attribute':()=>true,'browser.scroll':()=>true,'browser.focus':value=>{focused.push(value);return true;},'browser.navigate':value=>{navigations.push(value);return true;},'asset.text':()=>{throw Error('Invalid route must not fetch an undeclared page.');}};
 const run=(entry,eventInput={})=>invoke({model,entry,input:{data,eventInput,factIndex},ports,limit:20000000});
 return {run,state,writes,contents,titles,selections,data,navigations,focused,ports};
}
test('reader search applies case-insensitive matching and empty-search reset to actual selected places',async()=>{
 const s=session();for(const [ref,text]of [['a','Harbour birds'],['b','Garden shade'],['c','Orbit signal']])s.selections.push({ref,attributes:{'data-reader-search':text}});
 await s.run('reader.search',{event:{target:{value:'  GARDEN  '}}});
 assert.deepEqual(s.writes.filter(w=>w.name==='hidden').map(w=>[w.ref,w.value]),[['a',true],['b',false],['c',true]]);
 assert.equal(s.writes.at(-1).value,'1 matching places.');
 s.writes.length=0;await s.run('reader.search',{event:{target:{value:''}}});assert.ok(s.writes.filter(w=>w.name==='hidden').every(w=>w.value===false));assert.equal(s.writes.at(-1).value,'');
});
test('reader hash links use the declared route effect while skip links focus the existing reading',async()=>{
 const s=session({current:'garden',visited:['garden']});
 await s.run('reader.follow',{matched:{attributes:{href:'#harbour'}}});assert.deepEqual(s.navigations,[{hash:'harbour'}]);
 await s.run('reader.follow',{matched:{attributes:{href:'#reader-content'}}});assert.equal(s.navigations.length,1);assert.equal(s.state.get('current'),'garden');assert.deepEqual(s.focused.at(-1),{ref:'#reader-content',preventScroll:false});
 await assert.rejects(s.run('reader.follow',{matched:{attributes:{href:'#not-in-this-world'}}}),/READER-LINK/);assert.equal(s.navigations.length,1);
});
test('the actual delegated native click prevents base-URL escape and keeps skip focus in the reader',async()=>{
 const binding=model.queries['reader.boot'].find(step=>step.port==='browser.on'&&step.args?.query==='reader.follow');assert.ok(binding,'The emitted reader must select and bind its follow process.');
 const s=session(),listeners=new Map(),url=new URL('https://example.org/reader.html'),focused=[];let pending;
 const reading={focus:options=>focused.push(options)},document={baseURI:'https://example.org/',addEventListener:(event,listener)=>listeners.set(event,listener),querySelectorAll:selector=>selector==='#reader-content'?[reading]:[]};
 const location={get href(){return url.href;},get hash(){return url.hash;},set hash(value){url.hash=value;}};
 const native=browserEffects({document,window:{location}},(query,input)=>{pending=s.run(query,input);return pending;});
 s.ports['browser.navigate']=native['browser.navigate'];s.ports['browser.focus']=native['browser.focus'];native['browser.on'](binding.args);
 async function click(href){
  const anchor={nodeType:1,tagName:'A',attributes:[{name:'href',value:href}],textContent:'A reader link',getBoundingClientRect:()=>({x:0,y:0,top:0,bottom:0,left:0,right:0,width:0,height:0})};anchor.closest=()=>anchor;
  let prevented=false;listeners.get('click')({type:'click',target:anchor,timeStamp:1,preventDefault(){prevented=true;}});assert.equal(prevented,true);await pending;
  // A real browser would perform this navigation if the handler failed to
  // prevent it; the emitted <base> makes that destination the wrong document.
  assert.equal(new URL(href,document.baseURI).pathname,'/');return prevented;
 }
 await click('#harbour');assert.equal(url.href,'https://example.org/reader.html#harbour');
 await click('#reader-content');assert.equal(url.href,'https://example.org/reader.html#harbour');assert.deepEqual(focused,[{preventScroll:false}]);
});
test('reader notes preserve attribution and escape content through the shared serializer',async()=>{
 const s=session();s.selections.push({ref:'garden',attributes:{'data-reader-search':'Garden shade'}});await s.run('reader.search',{event:{target:{value:'garden'}}});assert.equal(s.writes.at(-1).value,'1 matching places.');
 await s.run('reader.notes');const html=s.contents.at(-1).html;
 assert.ok(html.includes('A &lt;source&gt; &amp; its scope'));assert.ok(html.includes('Observation belongs to the field-guide author.'));assert.ok(html.includes('illustrative record, not measured evidence'));assert.ok(html.includes('https://example.org/field-guide'));assert.equal(s.writes.findLast(w=>w.ref==='#reader-search').value,true);assert.equal(s.writes.findLast(w=>w.ref==='#reader-search-result').value,'');
});
test('reader atlas and unknown-route fallback use the new world finite place set',async()=>{
 const s=session({visited:['garden'],current:'garden',hash:'#not-a-place'});await s.run('reader.atlas');const atlas=s.contents.at(-1).html;
 assert.ok(atlas.includes('1 of 3 places discovered.'));for(const id of Object.keys(places))assert.ok(atlas.includes('href="#'+id+'"'));
 await s.run('reader.route');assert.equal(s.state.get('current'),'home');const home=s.contents.findLast(item=>item.ref==='#reader-content').html;
 assert.ok(home.includes('3 places. More than one way through.'));assert.ok(!home.includes('Forty places.'));assert.ok(home.includes(' / A world of ideas'));assert.ok(!home.includes('A personal expedition'));assert.deepEqual(s.state.get('visited'),['garden']);
});
