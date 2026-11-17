'use strict';

const assert = require('node:assert/strict');
const {staticSource} = require('./encounter-source.cjs');

function styleSource(file, text, grammar) {
  const diagnostic = 'STYLE-DEFINITION: Expected a static stylesheet in ' + file;
  const authored = staticSource(file, text, 'style.definition', diagnostic);
  const {protocol, identity, reason, target, goal, sheet, ...extra} = authored.definition;
  assert(Object.keys(extra).length === 0 &&
    [protocol, identity, reason, target, goal].every(value => typeof value === 'string'), diagnostic);
  const nodes = [], spans = new Map();

  function span(targetPath, sourcePath) {
    const observed = authored.spans.get(JSON.stringify(sourcePath));
    assert(observed, diagnostic + ' · Missing span at ' + JSON.stringify(sourcePath));
    spans.set(JSON.stringify(targetPath), observed);
  }

  function visit(tree, pointer) {
    assert(Array.isArray(tree) && typeof tree[0] === 'string', diagnostic);
    const [op, ...args] = tree;
    assert(Object.hasOwn(grammar.rules, op), 'PROJECT-T001: Unknown operation ' + op + ' in ' + file);
    const rule = grammar.rules[op], hasChildren = Object.hasOwn(rule.links, 'children');
    assert(args.length === rule.data.length + Number(hasChildren), diagnostic + ' · Wrong argument count for ' + op);
    const data = Object.fromEntries(rule.data.map((name, index) => [name, args[index]]));
    const links = {};
    if (hasChildren) {
      const children = args.at(-1);
      assert(Array.isArray(children), diagnostic + ' · Expected ordered children for ' + op);
      links.children = children.map((child, index) => visit(child, [...pointer, args.length, index]));
    }
    const id = nodes.length;
    span(['nodes', id], pointer);
    rule.data.forEach((name, index) => span(['nodes', id, 'data', name], [...pointer, index + 1]));
    nodes.push({id, op, data, links});
    return id;
  }

  const entry = visit(sheet, ['sheet']);
  return {document:{protocol, identity, reason, target, goal, nodes, entry}, spans};
}

module.exports = {styleSource};
