// Projection regressions use different owned facts; metadata cannot satisfy them.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),read=file=>fs.readFileSync(new URL(file,import.meta.url),'utf8'),json=file=>JSON.parse(read(file));
const {parseRel}=require('./bootstrap/ports/rel-codec.cjs'),{lower}=require('./bootstrap/ports/algebra-lower.cjs'),{createKernel}=require('./bootstrap/temple-seed.cjs'),{valuePorts}=require('./bootstrap/ports/value.cjs'),{invoke}=require('./bootstrap/ports/programme.cjs');
const manifest=json('bootstrap/site.json'),allFacts=manifest.sources.flatMap(file=>parseRel(read(file),file)),queries=Object.assign({},...manifest.modules.map(file=>json(file).queries));
// These projection-only calls need graph/content facts, not thousands of CSS
// declarations or unrelated microsite text nodes. Retain their exact owned
// dependency closure; the full build and receipt tests cover all inputs.
const types=new Set(['Place','Territory','SourceNote','Entrance','PublishedMicrosite','CapabilitySet']);
const wanted=new Set(['site','atlas','gateway','sharing.home','sharing.claimipedia','claimipedia.example','ms.editorial.temple/index.html.55','ms.editorial.temple/index.html.56','template.original-credit.ms.editorial.temple/index.html.56','template.original-credit.ms.editorial.temple/index.html.56.text']);
for(const f of allFacts)if(f.p==='isa'&&types.has(f.o)||f.p==='projection'&&f.o==='claimipedia')wanted.add(f.s);
const subjects=new Set(allFacts.map(f=>f.s));let previous=-1;
while(previous!==wanted.size){previous=wanted.size;for(const f of allFacts)if(wanted.has(f.s)&&subjects.has(f.o))wanted.add(f.o);}
const facts=allFacts.filter(f=>wanted.has(f.s));
const model=await lower({compiler:json(manifest.operatorCompiler),definitions:json(manifest.operatorDefinitions),primitives:createKernel.operators,input:{queries,entry:manifest.entry},mode:'model',ports:valuePorts(),limit:20000000});
const invokeEntry=(entry,input={},ports={})=>invoke({model,entry,input,ports:{...valuePorts(),...ports},nested:['kernel.invoke','kernel.execute','kernel.evaluate'],limit:20000000});
const indexes=new WeakMap();
const index=rows=>{if(!indexes.has(rows))indexes.set(rows,invokeEntry('facts.index',{input:rows}).then(result=>result.value));return indexes.get(rows);};
const run=async(entry,rows,bindings={},ports={})=>(await invokeEntry(entry,{factIndex:await index(rows),...bindings},ports)).value;
const set=(rows,s,p,o)=>[...rows.filter(f=>f.s!==s||f.p!==p),{s,p,o,pol:'is'}];
const one=(rows,s,p)=>rows.find(f=>f.s===s&&f.p===p&&f.pol==='is')?.o;
const text=node=>Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.children??[]):typeof node==='string'?node:'';
function find(node,predicate){if(Array.isArray(node))return node.flatMap(x=>find(x,predicate));if(!node||typeof node!=='object')return [];return [...(predicate(node)?[node]:[]),...find(node.children??[],predicate)];}
const escaped=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

test('visible homepage headline, introduction, purpose and footer follow different world facts',async()=>{
 for(const identity of [
  {name:'A different <workshop>',headline:'Objects that invite a question',description:'Seven objects, two routes and attributed notes.',purpose:'Help readers notice how everyday tools shape attention.',about:'An imaginary workshop, composed as a reusable example.'},
  {name:'The Seed Library',headline:'Keep the next season possible',description:'Stories about seeds, care and shared records.',purpose:'Let readers follow a local growing question.',about:'Fictional learning material, with sources kept in reach.'}
 ]){
  let rows=facts.filter(f=>f.s!=='site'||f.p!=='monogram');for(const [key,value]of Object.entries(identity))rows=set(rows,'site',key,value);
  const body=await run('publication.home',rows),hero=find(body,node=>node.attrs?.id==='hero-title');assert.equal(hero.length,1);assert.equal(text(hero[0]),identity.headline);
  assert.equal(text(find(body,node=>node.attrs?.class==='hero-copy')[0]),identity.description);
  assert.equal(text(find(body,node=>node.attrs?.class==='word-note')[0]),identity.purpose);
  const visible=text(body);assert.ok(!visible.includes('Inside the mind'));assert.ok(!visible.includes('Physics, faith, machines'));assert.ok(!visible.includes('This personal expedition is its first composition.'));
  const html=await run('publication.document',rows,{body,prefix:'',pageTitle:'Metadata is deliberately different',description:'Metadata is not visible body evidence',canonical:'https://worldwright.example/',light:'home'});
  const footer=/<footer\b[^>]*>([\s\S]*?)<\/footer>/.exec(html)?.[1];assert.ok(footer);assert.ok(footer.includes(escaped(identity.name)));assert.ok(footer.includes(escaped(identity.about)));assert.ok(!footer.includes('A few things I’ve built'));
  assert.ok(html.includes('class="monogram" aria-hidden="true">'+escaped(identity.name.slice(0,1))+'</span>'));
 }
});

test('a source-owned monogram overrides the name-derived default in both the visible brand and icon',async()=>{
 const rows=set(set(facts,'site','name','The Seed Library'),'site','monogram','SL'),body=await run('publication.home',rows),output={};
 const html=await run('publication.document',rows,{body,prefix:'',pageTitle:'Test',description:'Metadata',canonical:'https://worldwright.example/',light:'home'});assert.ok(html.includes('class="monogram" aria-hidden="true">SL</span>'));
 await run('publication.icon',rows,{}, {'file.write':({path,text})=>{output[path]=text;return true;}});assert.ok(output['assets/personal-mark.svg'].includes('>SL</text>'));
});

test('atlas list navigation follows configured territory identities rather than the initial unseen anchor',async()=>{
 const first=facts.find(f=>f.p==='isa'&&f.o==='Territory').s,rows=set(facts,first,'atlasSlug','a-different-district'),output={};
 await run('atlas.build',rows,{}, {'runtime.bundle':()=> 'The model is not executed in this projection-only test.','file.write':({path,text})=>{output[path]=text;return true;}});
 const anchor=/<a\b[^>]*href="([^"]+)"[^>]*class="atlas-list-link"/.exec(output['atlas.html']);assert.ok(anchor);assert.equal(anchor[1],'#a-different-district');assert.ok(output['atlas.html'].includes('id="a-different-district"'));
});

test('places without activities omit frames; explicit owned activity references project and invalid references refuse',async()=>{
 const place=facts.find(f=>f.p==='isa'&&f.o==='Place').s,without=facts.filter(f=>f.s!==place||f.p!=='activity');
 const reading=await run('publication.place',without,{place,prefix:'../'});assert.equal(find(reading,node=>node.tag==='iframe').length,0);assert.ok(find(reading,node=>node.attrs?.class==='encounter-layout reading-only').length);
 const selected=set(without,place,'activity','a-different-exercise'),withActivity=await run('publication.place',selected,{place,prefix:'../'}),frame=find(withActivity,node=>node.tag==='iframe');assert.equal(frame.length,1);assert.ok(frame[0].attrs.src.endsWith('#a-different-exercise'));
 const definitions=json('source/reader/activities.json');definitions.activities['a-different-exercise']={id:'a-different-exercise',type:'illustration',html:'<p>An explicitly selected illustrative exercise.</p>'};
 await run('template.activities',selected,{templateActivities:definitions});
 await assert.rejects(run('template.activities',set(without,place,'activity','unknown-exercise'),{templateActivities:definitions}),/WORLD-ACTIVITY/);
});

test('local world context and original demonstration attribution remain separate',async()=>{
 const rows=set(facts,'site','name','A Different Host'),html=await run('source.markup',rows,{input:'ms.editorial.temple/index.html.55'});assert.ok(html.includes('A Different Host'));assert.ok(!html.includes('Aaron Alderman'));
 const credit=await run('source.markup',rows,{input:'template.original-credit.ms.editorial.temple/index.html.56'});assert.ok(credit.includes('href="https://aaronalderman.com/"'));assert.ok(credit.includes('Original demonstrations · Aaron Alderman'));
 const encounter=read('dist/encounter/index.html'),footer=/<footer\b[^>]*>([\s\S]*?)<\/footer>/.exec(encounter)?.[1];assert.ok(footer.includes('Encounter · within '+escaped(one(facts,'site','name'))));assert.ok(footer.includes('Original demonstration · Aaron Alderman'));assert.ok(!footer.includes('Encounter · by '+escaped(one(facts,'site','name'))));
});

test('framework resources remain selected independently of the editable identity and world graph',()=>{
 for(const file of ['source/world.rel','source/expedition.rel'])assert.ok(!parseRel(read(file),file).some(f=>f.p==='isa'&&f.o==='PublicationAsset'),file);
 assert.ok(manifest.sources.includes('source/assets.rel'));const assets=parseRel(read('source/assets.rel'),'source/assets.rel');assert.ok(assets.some(f=>f.p==='path'&&f.o==='retained/workshop/style.css'));assert.ok(assets.some(f=>f.p==='path'&&f.o==='source/world.rel'));
 const schema=json('source/world-schema.json');assert.ok(schema.types.Place.required.includes('mapTipAbove'));assert.ok(schema.types.Place.optional.includes('activity'));
});

test('Claimipedia navigation follows the selected gateway route without requiring an original named door',async()=>{
 const rows=set(facts,'gateway','route','another-reading-path.html'),output={};
 await run('claimipedia.build',rows,{}, {'runtime.bundle':()=> 'Projection-only fixture; runtime behavior is qualified separately.','file.write':({path,text})=>{output[path]=text;return true;}});
 const html=output['claimipedia/index.html'];assert.ok(html);assert.ok(!html.includes('#path-claimipedia'));assert.ok(!html.includes('href="../gate.html'));
 assert.equal((html.match(/href="\.\.\/another-reading-path\.html"/g)||[]).length,4);
 for(const file of manifest.modules){const source=json(file),links=[];const scan=node=>{if(node&&typeof node==='object'){if(typeof node.href==='string')links.push(node.href);for(const child of Object.values(node))scan(child);}};scan(source);assert.ok(!links.some(href=>/#path-|#unseen|(?:^|\/)places\/[^$]/.test(href)),file+' must not depend on initial world graph identities');}
});

test('home social metadata follows owned identity and image facts without inheriting original image dimensions',async()=>{
 let rows=facts.filter(f=>f.s!=='site'||!['imageWidth','imageHeight','imageType'].includes(f.p));
 const identity={name:'The Seed Library',headline:'Keep the next season possible',description:'Fictional records of a shared growing question.',origin:'https://different.example/library/',image:'assets/a-different-image.svg',imageAlt:'An explicitly selected imagined seed cabinet.'};
 for(const [key,value]of Object.entries(identity))rows=set(rows,'site',key,value);
 const render=async values=>run('publication.document',values,{body:[],prefix:'',pageTitle:'An unrelated title cannot supply homepage identity',description:'An unrelated description',canonical:identity.origin,light:'home'});
 const metadata=html=>{const result=new Map();for(const tag of html.matchAll(/<meta\b[^>]*>/g)){const key=/(?:property|name)="([^"]+)"/.exec(tag[0])?.[1],value=/content="([^"]*)"/.exec(tag[0])?.[1];if(key)result.set(key,value);}return result;};
 const actual=metadata(await render(rows));
 for(const key of ['og:title','twitter:title'])assert.equal(actual.get(key),escaped(identity.name+' — '+identity.headline));
 for(const key of ['og:description','twitter:description'])assert.equal(actual.get(key),escaped(identity.description));
 for(const key of ['og:image:alt','twitter:image:alt'])assert.equal(actual.get(key),escaped(identity.imageAlt));
 for(const key of ['og:image','twitter:image'])assert.equal(actual.get(key),identity.origin+identity.image);
 assert.equal(actual.get('og:site_name'),identity.name);assert.equal(actual.get('og:url'),identity.origin);
 for(const key of ['og:image:width','og:image:height','og:image:type'])assert.ok(!actual.has(key),key+' is omitted without explicit facts');
 rows=set(set(set(rows,'site','imageWidth','320'),'site','imageHeight','200'),'site','imageType','image/svg+xml');
 const declared=metadata(await render(rows));assert.equal(declared.get('og:image:width'),'320');assert.equal(declared.get('og:image:height'),'200');assert.equal(declared.get('og:image:type'),'image/svg+xml');
});
