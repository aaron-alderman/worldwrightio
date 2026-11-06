import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditResources} from './resource-audit.mjs';
test('every emitted application document and stylesheet retains local resources, fragments and subpath-safe links',()=>{
 const result=auditResources(fileURLToPath(new URL('./dist/',import.meta.url)));
 assert.ok(result.documents>10);assert.ok(result.stylesheets>3);assert.ok(result.localReferences>100);
 assert.deepEqual(result.errors,[]); // The error list includes exact source and target routes.
});
test('resource checking honors a relative HTML base and still rejects subpath escapes',()=>{
 const workspace=fileURLToPath(new URL('./.build/',import.meta.url));fs.mkdirSync(workspace,{recursive:true});const fixture=fs.mkdtempSync(path.join(workspace,'resource-audit-'));
 try{
  fs.mkdirSync(path.join(fixture,'retained'));fs.mkdirSync(path.join(fixture,'reader'));
  fs.writeFileSync(path.join(fixture,'index.html'),'<main id="start">Root</main>');fs.writeFileSync(path.join(fixture,'base.css'),'body{background:url(art.svg)}');fs.writeFileSync(path.join(fixture,'art.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
  const model={entry:'reader.boot',queries:{'reader.route':[]},data:{ids:['forest']}};
  fs.writeFileSync(path.join(fixture,'reader/runtime.js'),'const model=hydrateSnapshot('+JSON.stringify(JSON.stringify(model))+');');
  fs.writeFileSync(path.join(fixture,'reader.html'),'<script src="reader/runtime.js"></script>');
  fs.writeFileSync(path.join(fixture,'retained/index.html'),'<head><base href="../"><link rel="stylesheet" href="base.css"><script src="reader/runtime.js"></script></head><a href="reader.html#forest">An explicitly addressed reader route</a><a href="index.html#start">A root anchor</a><img src="art.svg">');
  assert.deepEqual(auditResources(fixture).errors,[],'The base resolves resources at the publication root and explicit links address the actual reader document.');
  fs.appendFileSync(path.join(fixture,'retained/index.html'),'<a href="#forest">A hash incorrectly shifted by the base</a>');
  assert.ok(auditResources(fixture).errors.some(error=>error.includes('#forest')&&error.includes('no static or declared routed')),'A router in the current document cannot excuse navigation to a different base-resolved document.');
  fs.appendFileSync(path.join(fixture,'retained/index.html'),'<a href="/outside.html">Escape</a><a href="missing.html">Missing</a>');
  const errors=auditResources(fixture).errors;assert.ok(errors.some(error=>error.includes('escapes a hosted subpath')));assert.ok(errors.some(error=>error.includes('missing.html')&&error.includes('no local target')));
 }finally{if(!path.resolve(fixture).startsWith(workspace))throw Error('Unexpected resource-test cleanup target');fs.rmSync(fixture,{recursive:true,force:true});}
});
