'use strict';
// Loading and value mechanisms only. All projection/validation policy is algebra.
const {processSource}=require('./encounter-source.cjs');
const path=require('node:path');
function projector(root){
 const {createKernel}=require(path.join(root,'source/semantics/bootstrap/temple-seed.cjs'));
 const {valuePorts}=require(path.join(root,'source/semantics/bootstrap/ports/value.cjs'));
 const {kernelPorts}=require(path.join(root,'source/semantics/bootstrap/ports/kernel.cjs'));
 const model=processSource(root,'projection');
 let kernel;kernel=createKernel({...valuePorts(),...kernelPorts(()=>kernel)},20000000);
 return {async project(document,grammar,slots={}){const before=kernel.usage.steps,env={model,document,grammar,slots};try{await kernel.run(model.queries['projection.document'],env);}catch(error){throw Error(`${document.identity}: ${error.message}`,{cause:error});}return {text:env.result,compiled:env.compiled,steps:kernel.usage.steps-before};},get usage(){return kernel.usage;}};
}
module.exports={projector};
