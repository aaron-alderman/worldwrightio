'use strict';

const assert = require('node:assert/strict');

function projectSource(file, text, target, compile, codec) {
  const surface = compile(file, text);
  if (target.endsWith('.process.json')) return JSON.stringify(surface, null, 2) + '\n';

  const [entry] = Object.keys(surface.queries);
  const diagnostic = 'WORLD-SOURCE: Expected one static definition in ' + file;
  const statements = surface.queries[entry] ?? [], bindings = new Map();
  assert(Object.keys(surface.queries).length === 1 && statements.at(-1)?.let === 'result', diagnostic);
  function materialize(value) {
    if (Array.isArray(value)) {
      assert(value[0] === 'list', diagnostic);
      return value.slice(1).map(materialize);
    }
    if (value && typeof value === 'object') {
      if (Object.keys(value).length === 1 && typeof value.dollarPrefix === 'string')
        return '$' + value.dollarPrefix;
      return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,materialize(v)]));
    }
    if(typeof value==='string'&&value.startsWith('$')){
      assert(bindings.has(value),diagnostic+' · Unknown local '+value);
      return bindings.get(value);
    }
    return value;
  }

  for(const statement of statements){
    const name='$'+statement.let;
    assert(typeof statement.let==='string'&&Object.keys(statement).length===2&&!bindings.has(name),diagnostic);
    bindings.set(name,materialize(statement.value));
  }
  const definition=bindings.get('$result');
  if (entry === 'composition.definition' && target.endsWith('.json')) {
    assert(definition && typeof definition === 'object' && !Array.isArray(definition), diagnostic);
    return JSON.stringify(definition, null, 2) + '\n';
  }
  if (entry === 'imports.definition') {
    assert(Array.isArray(definition), diagnostic);
    return codec.encode(definition);
  }
  const facts = [];
  const fact = (s,p,o) => {
    assert([s,p,o].every(v=>typeof v==='string'),diagnostic);
    facts.push({s,p,o});
  };
  function configuration({owner,value}) {
    assert(typeof owner==='string' && owner.length>0 && value!==undefined,diagnostic);
    const document = owner+'.configuration', pointers = new Set(['root','entry','item','value']);
    const id = name => name==='rel.document'?document:document+'.'+name;
    fact(owner,'configuration',document);
    for(const {s,p,o} of codec.parse(codec.encode(value)))fact(id(s),p,pointers.has(p)?id(o):o);
  }
  if (entry === 'configuration.definition') {
    configuration(definition);
  } else if (entry === 'microsites.definition') {
    assert(Array.isArray(definition.documents),diagnostic);
    const owners=new Set();
    for(const document of definition.documents){
      assert(!owners.has(document.owner),diagnostic+' · Duplicate microsite source identity');
      configuration(document);owners.add(document.owner);
    }
  } else if (entry === 'presentation.definition') {
    assert(Array.isArray(definition.rules),diagnostic);
    for (const [index,rule] of definition.rules.entries()) {
      const order=String(index+1),id=rule.id??'style.'+order;
      fact(id,'isa','StyleRule');fact(id,'order',rule.order??order);fact(id,'selector',rule.selector);
      assert(Array.isArray(rule.declarations),diagnostic);
      for (const declaration of rule.declarations) {
        const {property,value}=declaration,entryId=declaration.id??id+'.'+property;
        fact(id,'declaration',entryId);fact(entryId,'property',property);fact(entryId,'value',value);
      }
    }
  } else {
    throw Error(diagnostic);
  }
  return codec.print(facts);
}

module.exports = {projectSource};
