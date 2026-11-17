'use strict';
const path=require('node:path'),crypto=require('node:crypto');
const {verify}=require('./guard.cjs'),{build}=require('./build.cjs');
async function check(root=path.resolve(__dirname,'..')){
 const accepted=await verify(root);
 const fresh=await build(root,path.join(root,'.check-'+crypto.randomUUID()));
 const expected=new Map(accepted.artifacts.map(a=>[a.path,a.sha256]));
 // Reuse the ownership algebra for the reconstruction comparison too.
 const reconstructed={...fresh,artifacts:accepted.artifacts};
 await verify(root,{output:fresh.outputDirectory,receipt:reconstructed});
 return {artifacts:expected.size};
}
module.exports={check};
if(require.main===module)check().then(r=>console.log(`Verified ${r.artifacts} artifacts: current owners, exact output closure and clean reconstruction.`)).catch(error=>{console.error(error.message);process.exitCode=1;});
