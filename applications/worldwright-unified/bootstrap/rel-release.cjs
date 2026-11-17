'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {createGzip} = require('node:zlib');
const {Readable} = require('node:stream');
const {pipeline} = require('node:stream/promises');

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fact = (subject, predicate, object) =>
  '(' + [subject, predicate, object].map(value => JSON.stringify(value)).join(', ') + ')\n';

function *rows(key, value) {
  if (value === null) yield fact(key, 'null', '');
  else if (Array.isArray(value)) {
    yield fact(key, 'sequence', String(value.length));
    for (const child of value) yield *rows('', child);
  } else if (typeof value === 'object') {
    const keys = Object.keys(value);
    yield fact(key, 'record', String(keys.length));
    for (const child of keys) yield *rows(child, value[child]);
  } else {
    yield fact(key, typeof value === 'string' ? 'text' : typeof value, String(value));
  }
}

function layout(value, original) {
  for (const [kind, spacing] of [['compact', 0], ['pretty', 2]]) {
    const rendered = JSON.stringify(value, null, spacing);
    if (original === rendered) return kind;
    if (original === rendered + '\n') return kind + '-lf';
    if (original === rendered.replaceAll('\n', '\r\n') + '\r\n') return kind + '-crlf';
  }
  throw Error('REL release cannot preserve the checked JSON representation');
}

async function writeRel(file, bytes) {
  const original = bytes.toString('utf8');
  const value = JSON.parse(original);
  const style = layout(value, original);
  function *document() {
    yield fact('publication.data', 'encounter/ordered-value/1', style);
    let chunk = '';
    for (const row of rows('', value)) {
      chunk += row;
      if (chunk.length >= 64 * 1024) {
        yield chunk;
        chunk = '';
      }
    }
    if (chunk) yield chunk;
  }
  await pipeline(Readable.from(document()), createGzip(), fs.createWriteStream(file, {flags:'wx'}));
}

async function relRelease(verifiedOutput, destination, receipt) {
  assert(!fs.existsSync(destination), 'REL release destination already exists');
  const scratch = fs.mkdtempSync(destination + '.stage-');
  try {
    const assets = path.join(scratch, 'assets');
    fs.mkdirSync(assets);
    const entries = [fact('publication', 'version', 'encounter/pinned-publication/2')];
    for (const artifact of receipt.artifacts) {
      const bytes = fs.readFileSync(path.join(verifiedOutput, artifact.path));
      assert.equal(digest(bytes), artifact.sha256, artifact.path);
      const isData = artifact.path.endsWith('.json');
      const name = isData ? artifact.path.slice(0, -5) + '.rel.gz' : artifact.path;
      const output = path.join(assets, name);
      fs.mkdirSync(path.dirname(output), {recursive:true});
      if (isData) {
        await writeRel(output, bytes);
        entries.push(fact('projection', artifact.path, name),
          fact('projectionSha256', artifact.path, artifact.sha256));
      } else {
        fs.writeFileSync(output, bytes, {flag:'wx'});
      }
      entries.push(fact('artifact', name, digest(fs.readFileSync(output))));
    }
    fs.writeFileSync(path.join(scratch, 'publication.rel'), entries.join(''));
    fs.renameSync(scratch, destination);
  } catch (error) {
    fs.rmSync(scratch, {recursive:true, force:true});
    throw error;
  }
}

module.exports = {relRelease};
