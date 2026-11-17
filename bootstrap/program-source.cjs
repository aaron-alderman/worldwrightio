'use strict';

const assert = require('node:assert/strict');
const path = require('node:path').posix;
const {staticSource} = require('./encounter-source.cjs');

function programSource(file, read, grammar) {
  const diagnostic = 'PROGRAM-DEFINITION: Expected a typed programme tree in ' + file;
  const load = (source, entry) => staticSource(source, read(source).toString('utf8'), entry, diagnostic, true);
  const main = load(file, 'programme.definition');
  const {protocol, identity, reason, target, goal, tree, fragments: includes = [], ...extra} = main.definition;
  assert(Object.keys(extra).length === 0 && Array.isArray(includes) &&
    [protocol, identity, reason, target, goal].every(value => typeof value === 'string'), diagnostic);
  const nodes = [], spans = new Map(), fragments = new Map(), used = new Set(), bindings = new Map(), inputs = [file];
  const fragmentDirectory = path.basename(file, '.encounter') + '-parts/';
  for(const include of includes){
    assert(typeof include==='string' && include.startsWith(fragmentDirectory) &&
      /^group-[0-9]+\.encounter$/.test(include.slice(fragmentDirectory.length)), diagnostic+' · Invalid fragment path');
    const source=path.join(path.dirname(file),include);
    assert(!inputs.includes(source),diagnostic+' · Duplicate fragment file');
    const authored=load(source,'programme.fragments');
    inputs.push(source);
    for(const [name,term] of Object.entries(authored.definition)){
      assert(!fragments.has(name),diagnostic+' · Duplicate fragment '+name);
      fragments.set(name,{term,authored});
    }
  }

  function span(targetPath, source, sourcePath) {
    const observed = source.spans.get(JSON.stringify(sourcePath));
    assert(observed, diagnostic + ' · Missing span at ' + JSON.stringify(sourcePath));
    spans.set(JSON.stringify(targetPath), observed);
  }

  function visit(term, source, pointer) {
    if(term===null)return null;
    if(term && typeof term==='object' && !Array.isArray(term)){
      const keys=Object.keys(term);
      if(keys.length===1 && Object.hasOwn(term,'fragment')){
        const name=term.fragment,fragment=fragments.get(name);
        assert(fragment&&!used.has(name),diagnostic+' · Missing, repeated or cyclic fragment '+name);
        used.add(name);
        return visit(fragment.term,fragment.authored,[name]);
      }
      if(keys.length===1 && Object.hasOwn(term,'ref')){
        assert(bindings.has(term.ref),diagnostic+' · Unbound shared node '+term.ref);
        return bindings.get(term.ref);
      }
      assert(keys.length===2&&typeof term.share==='string'&&Object.hasOwn(term,'node')&&!bindings.has(term.share),
        diagnostic+' · Invalid shared node');
      const id=visit(term.node,source,[...pointer,'node']);
      assert(id!==null&&!bindings.has(term.share),diagnostic+' · Invalid shared node '+term.share);
      bindings.set(term.share,id);
      return id;
    }
    assert(Array.isArray(term) && term.length>=1 && term.length<=2 && typeof term[0]==='string',diagnostic);
    const [op, fields = {}] = term;
    assert(fields && typeof fields==='object' && !Array.isArray(fields),diagnostic);
    assert(Object.hasOwn(grammar.rules,op),'PROJECT-T001: Unknown operation '+op+' in '+file);
    const rule=grammar.rules[op],data={},links={};
    for(const [name,value] of Object.entries(fields)){
      if(!Object.hasOwn(rule.links,name)){
        assert(rule.data.includes(name),diagnostic+' · Unknown field '+op+'.'+name);
        data[name]=value;
        continue;
      }
      const at=[...pointer,1,name];
      if(rule.links[name].many){
        assert(Array.isArray(value),diagnostic+' · Expected ordered children for '+op+'.'+name);
        links[name]=value.map((child,index)=>visit(child,source,[...at,index]));
      }else links[name]=visit(value,source,at);
    }
    const id=nodes.length;
    span(['nodes',id],source,pointer);
    for(const name of Object.keys(data))span(['nodes',id,'data',name],source,[...pointer,1,name]);
    nodes.push({id,op,data,links});
    return id;
  }

  const entry=visit(tree,main,['tree']);
  assert(entry!==null&&used.size===fragments.size,diagnostic+' · Unused fragment or missing root');
  return {document:{protocol,identity,reason,target,goal,nodes,entry},spans,inputs};
}

module.exports = {programSource};
