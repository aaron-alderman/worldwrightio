'use strict';
// Native model loading/execution and file observation only. All application
// routes, composition slices and navigation trees are selected by the algebra.
const {processSource,applicationSource}=require('./encounter-source.cjs');
const path=require('node:path');
async function application(root,sceneIds,definition=applicationSource(root).definition){
 const model=processSource(root,'application');
 const {createKernel}=require(path.join(root,'source/semantics/bootstrap/temple-seed.cjs')),{valuePorts}=require(path.join(root,'source/semantics/bootstrap/ports/value.cjs'));
 async function run(entry,bindings){const env={model,...bindings};await createKernel(valuePorts(),20000000).run(model.queries[entry],env);return env.result;}
 const data=await run('application.compose',{definition,sceneIds});
 return {data,view:(document,compiled,parts)=>run('application.view',{document,compiled,parts}),selection:(document,parts)=>run('application.selection',{document,parts})};
}
module.exports={application};
