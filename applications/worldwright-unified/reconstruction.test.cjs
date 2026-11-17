const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
test('the whole application reconstructs with no output, Git, MJS tree or authoring utilities',()=>{
 const root=path.join(__dirname,'.isolated-'+crypto.randomUUID());fs.mkdirSync(root);
 for(const dir of ['source','algebra','bootstrap'])fs.cpSync(path.join(__dirname,dir),path.join(root,dir),{recursive:true});fs.copyFileSync(path.join(__dirname,'package.json'),path.join(root,'package.json'));
 for(const absent of ['dist','.git','verification','node_modules','encounter'])assert.equal(fs.existsSync(path.join(root,absent)),false);
 const build=()=>{const r=spawnSync(process.execPath,['bootstrap/build.cjs'],{cwd:root,encoding:'utf8',env:{...process.env,PATH:'',NODE_PATH:'',NODE_OPTIONS:''},timeout:120000});assert.equal(r.status,0,r.stderr);return JSON.parse(fs.readFileSync(path.join(root,'generated/build-receipt.json')));};
 const first=build(),second=build(),hashes=r=>Object.fromEntries(r.artifacts.map(a=>[a.path,a.sha256]));
 assert.deepEqual(hashes(first),hashes(second));assert.equal(first.distReadAsSource,false);assert.ok(first.projectionUsage.steps<20000000);assert.ok(first.inputs.every(i=>!i.path.startsWith('dist/')&&!i.path.startsWith('verification/')));
 assert.ok(first.inputs.some(input=>input.path==='source/application.encounter'));
 assert.ok(first.artifacts.some(artifact=>artifact.path==='ownership/sources/source/application.encounter'));
 assert.ok(first.artifacts.some(artifact=>artifact.path==='application/definition.json'));
 const semantic=path.join(root,'source/application.encounter'),source=fs.readFileSync(semantic,'utf8');
 fs.writeFileSync(semantic,source.replace('label = "Encounter"','label = $unbound'));
 const refusalWithProjection=spawnSync(process.execPath,['bootstrap/build.cjs'],{cwd:root,encoding:'utf8',timeout:120000});
 assert.notEqual(refusalWithProjection.status,0);assert.match(refusalWithProjection.stderr,/APP-DEFINITION.*source\/application.encounter/);
 assert.equal(hashes(first)['index.html'],crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'dist/index.html'))).digest('hex'));
 const edited=source.replace('label = "Encounter"','label = "A source-owned name"')
  .replace('title = "Encounter"','title = "An authored view"')
  .replace('href = "#workshop"','href = "#new-workshop"')
  .replace('hash = "workshop"','hash = "new-workshop"');
 fs.writeFileSync(semantic,edited);
 const page=path.join(root,'source/pages/index.page.encounter');
 const pageSource=fs.readFileSync(page,'utf8');
 fs.writeFileSync(page,pageSource.replace('Worldwright — Follow a question','An authored page title'));
 const changed=build();
 assert.ok(changed.artifacts.some(artifact=>artifact.path==='ownership/intermediates/pages/index.page.json'));
 assert.match(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),/<title>An authored page title<\/title>/);
 assert.match(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),/href="#new-workshop"[^>]*>A source-owned name/);
 const app=JSON.parse(fs.readFileSync(path.join(root,'dist/application.json')));
 assert.equal(app.routes['new-workshop'].view,'example');assert.equal(app.definition.views.example.title,'An authored view');
 const accepted=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
 fs.writeFileSync(page,pageSource.replace('list("Document",','list("RawHtml",'));
 const refusal=spawnSync(process.execPath,['bootstrap/build.cjs'],{cwd:root,encoding:'utf8',timeout:120000});assert.notEqual(refusal.status,0);assert.match(refusal.stderr,/PROJECT-T001/);assert.equal(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),accepted);
});
