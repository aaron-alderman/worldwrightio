// Maintainer operation: bind the immutable initial index to checked extraction recipes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyFeatures} from './verify-features.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
verifyFeatures({refresh:true});
const file=path.join(root,'context/features.json'),catalogue=JSON.parse(fs.readFileSync(file,'utf8'));
const extraction=JSON.parse(fs.readFileSync(path.join(root,'context/extraction.json'),'utf8'));
if(extraction.missingClosure.length)throw Error('Cannot project an unclosed extraction catalogue.');
catalogue.protocol='worldwright/feature-catalogue/2';
catalogue.scope='All 36 initial reference modules mapped to runnable features in the full expedition composition. Individual JSON modules are not independent packages.';
catalogue.extraction='context/extraction.json';catalogue.evidenceFamily=extraction.evidenceFamily;
for(const feature of catalogue.features){
 const entry=extraction.features.find(item=>item.id===feature.id);if(!entry)throw Error('Missing recipe: '+feature.id);
 feature.status='reusable-template';feature.templateContract=entry.contract;feature.implementation={file:entry.implementation,sha256:entry.implementationSha256};
 feature.missing=[];delete feature.template;
}
fs.writeFileSync(file,JSON.stringify(catalogue,null,2)+'\n');
verifyFeatures();console.log(JSON.stringify({features:catalogue.features.length,missingClosure:0}));
