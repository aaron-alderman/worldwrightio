import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const bytes=file=>fs.readFileSync(new URL(file,import.meta.url));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
test('The build admits the selected source closure and records current bytes',()=>{
 const manifest=read('bootstrap/site.json'),composition=read('composition-receipt.json'),receipt=read('dist/build-receipt.json');
 assert.equal(manifest.executionBudget,20000000);assert.equal(receipt.execution.limit,20000000);
 assert.equal(receipt.seedSha256,composition.files.find(f=>f.target==='bootstrap/temple-seed.cjs').sha256);
 assert.ok(receipt.admission.passes>=4);
 for(const [file,sha] of Object.entries(receipt.sources))assert.equal(hash(bytes(file)),sha,'Current input '+file);
 for(const [file,sha] of Object.entries(receipt.artifacts))assert.equal(hash(bytes('dist/'+file)),sha,'Output '+file);
 assert.deepEqual(manifest.modules,[...composition.modules,'algebra/composition.process.json']);
 assert.deepEqual(manifest.sources,[...composition.sources,'source/composition.rel']);
 for(const file of composition.files)assert.ok(file.owner==='foundation'||composition.selected.includes(file.owner));
 for(const name of Object.keys(composition.profiles))if(name.endsWith('Browser'))assert.ok(composition.selected.includes(name.slice(0,-7)));
});
