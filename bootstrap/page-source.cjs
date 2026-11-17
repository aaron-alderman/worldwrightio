'use strict';

const assert = require('node:assert/strict');
const {staticSource} = require('./encounter-source.cjs');

function pageSource(file, text, grammar) {
  const diagnostic = 'PAGE-DEFINITION: Expected a static page tree in ' + file;
  const authored = staticSource(file, text, 'page.definition', diagnostic);
  const {protocol, identity, reason, target, goal, identify = false, page, ...extra} = authored.definition;
  assert(Object.keys(extra).length === 0 && typeof identify === 'boolean' &&
    [protocol, identity, reason, target, goal].every(value => typeof value === 'string'), diagnostic);
  const nodes = [], spans = new Map();

  function span(targetPath, sourcePath, key = false) {
    const observed = (key ? authored.keySpans : authored.spans).get(JSON.stringify(sourcePath));
    assert(observed, diagnostic + ' · Missing span at ' + JSON.stringify(sourcePath));
    spans.set(JSON.stringify(targetPath), observed);
  }

  function emit(op, data, links, pointer, dataPointers, meaning) {
    const id = nodes.length, base = ['nodes', id];
    span(base, pointer);
    for (const [name, path, key] of dataPointers) span([...base, 'data', name], path, key);
    nodes.push(meaning ? {id, op, data, links, meaning} : {id, op, data, links});
    return id;
  }

  function visit(tree, pointer) {
    if (typeof tree === 'string') return emit('Text', {value:tree}, {}, pointer, [['value', pointer]]);
    assert(Array.isArray(tree) && tree.length >= 1 && tree.length <= 2 && typeof tree[0] === 'string', diagnostic);
    const [op, fields = {}] = tree;
    assert(fields && typeof fields === 'object' && !Array.isArray(fields), diagnostic);
    assert(Object.hasOwn(grammar.rules, op), 'PROJECT-T001: Unknown operation ' + op + ' in ' + file);
    const {attributes = {}, children = [], meaning, ...data} = fields;
    const {links: slots} = grammar.rules[op];
    assert(attributes && typeof attributes === 'object' && !Array.isArray(attributes) && Array.isArray(children), diagnostic);
    assert((Object.hasOwn(slots,'attributes') || !Object.hasOwn(fields,'attributes')) &&
      (Object.hasOwn(slots,'children') || !Object.hasOwn(fields,'children')), diagnostic);
    assert(meaning === undefined || (meaning && typeof meaning === 'object' &&
      Object.keys(meaning).length === 2 && typeof meaning.identity === 'string' && typeof meaning.role === 'string'), diagnostic);

    const links = {};
    if (slots.attributes) links.attributes = Object.entries(attributes).map(([name, value]) => {
      const at = [...pointer, 1, 'attributes', name];
      return emit('Attribute', {name, value}, {}, at, [['name', at, true], ['value', at]]);
    });
    if (slots.children) links.children = children.map((child, index) => visit(child, [...pointer, 1, 'children', index]));
    const identified = identify && Object.hasOwn(attributes,'id') ? {identity:identity+'#'+attributes.id, role:op} : undefined;
    return emit(op, data, links, pointer, Object.keys(data).map(name => [name, [...pointer, 1, name]]), meaning ?? identified);
  }

  const entry = visit(page, ['page']);
  return {document:{protocol, identity, reason, target, goal, nodes, entry}, spans};
}

module.exports = {pageSource};
