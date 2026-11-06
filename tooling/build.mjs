import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createExample} from './create-example.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pages=[['index','The project'],['start','Make your world'],['architecture','How it works'],['lightning','The lightning path'],['features','Feature library'],['templates','Template recipes'],['trial','Agent build trial'],['context','Agent context']];
const titles=Object.fromEntries(pages);
const inline=text=>{
  let rendered='',cursor=0;
  const tokens=/`([^`]+)`|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)/g;
  for(const token of text.matchAll(tokens)){
    rendered+=escape(text.slice(cursor,token.index));cursor=token.index+token[0].length;
    if(token[1]!==undefined){rendered+='<code>'+escape(token[1])+'</code>';continue;}
    const image=token[2]!==undefined,url=image?token[3]:token[5],label=image?token[2]:token[4];
    if(!/^(?:https?:\/\/|#|\.?\.?\/|[a-z0-9_-]+(?:\/|\.))/i.test(url)||url.startsWith('//')){rendered+=escape(token[0]);continue;}
    rendered+=image?`<img src="${escape(url)}" alt="${escape(label)}" loading="lazy">`:`<a href="${escape(url)}">${escape(label)}</a>`;
  }
  return rendered+escape(text.slice(cursor));
};
export function markdown(text) {
  const lines=text.split(/\r?\n/),out=[];let paragraph=[],code=null,table=false;
  const flush=()=>{if(paragraph.length){out.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[];}};
  for(const line of lines){
    if(line.startsWith('```')){flush();if(code){out.push('<pre><code>'+escape(code.join('\n'))+'</code></pre>');code=null;}else code=[];continue;}
    if(code){code.push(line);continue;}
    if(line.startsWith('|')){flush();if(!table){out.push('<div class="table-scroll" tabindex="0" role="region" aria-label="Lightning links"><table>');table=true;}
      const cells=line.split('|').slice(1,-1).map(x=>x.trim());
      if(cells.every(x=>/^[-: ]+$/.test(x)))continue;
      const tag=out.at(-1).endsWith('<table>')?'th':'td';out.push('<tr>'+cells.map(cell=>`<${tag}>${inline(cell)}</${tag}>`).join('')+'</tr>');continue;
    }
    if(table){out.push('</table></div>');table=false;}
    const heading=/^(#{1,3}) (.+)$/.exec(line);
    if(heading){flush();const n=heading[1].length,id=heading[2].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');out.push(`<h${n} id="${id}">${inline(heading[2])}</h${n}>`);}
    else if(!line.trim())flush();else paragraph.push(line);
  }
  flush();if(table)out.push('</table></div>');if(code)throw Error('Unclosed code block');return out.join('\n');
}
function shell(id,body){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Worldwright documentation, reusable world template and agent context."><title>${escape(titles[id])} — Worldwright</title><link rel="icon" href="../mark.svg"><link rel="stylesheet" href="../hub.css"></head><body><a class="skip" href="#main">Skip to content</a><header><a class="brand" href="../index.html">worldwright<span>.</span></a><nav aria-label="Site navigation"><a href="../index.html">The introduction</a><a href="https://github.com/aaron-alderman/worldwrightio">GitHub ↗</a></nav></header><div class="docs-layout"><aside><p class="eyebrow">BUILD A WORLD OF IDEAS</p><nav aria-label="Documentation">${pages.map(([key,label])=>`<a href="${key}.html"${key===id?' aria-current="page"':''}>${label}</a>`).join('')}<a href="../examples/first-world/index.html">Open the starter ↗</a></nav><p class="aside-note">Purpose → meaning → process → projection → evidence</p></aside><main id="main">${body}<footer><a href="https://github.com/aaron-alderman/worldwrightio/blob/master/${id==='index'?'README.md':'docs/'+id+'.md'}">Read the owned text on GitHub ↗</a><span>Worldwright · An open project by Aaron Alderman</span></footer></main></div></body></html>`;}
function catalogue(data){return `<section class="catalogue" aria-labelledby="catalogue-title"><h2 id="catalogue-title">Every module, an executable recipe</h2><p>${data.features.length} initial source modules. Expand for queries, ports and the reusable contract. <a href="../context/features.json">Machine-readable catalogue</a>.</p>${data.features.map(item=>`<details><summary><span>${escape(item.id)}</span><span class="status">${escape(item.status==='reusable-template'?'Reusable template':item.status==='included-core'?'Included core':'Reference')}</span></summary><p><a href="../${item.source}">Initial source JSON ↗</a> · ${item.queries.length} queries · ${item.operators.length} derived operators</p><p><a href="../${item.templateContract}">Feature recipe and dependency closure ↗</a></p><p><strong>Calls:</strong> ${escape(item.calls.join(', ')||'None declared literally')}</p><p><strong>Native ports:</strong> ${escape(item.ports.join(', ')||'None declared literally')}</p><p><strong>Named queries:</strong> ${escape(item.queries.join(', ')||'No queries; expression definitions')}</p>${item.missing.map(text=>'<p>'+escape(text)+'</p>').join('')}<p class="hash">Initial SHA-256 ${item.sha256}</p></details>`).join('')}</section>`;}
export async function build(){
  const env={...process.env};delete env.NODE_TEST_CONTEXT;
  const run=(args,cwd=root)=>{const result=spawnSync(process.execPath,args,{cwd,encoding:'utf8',env,maxBuffer:8*1024*1024});if(result.status!==0)throw Error(result.stdout+'\n'+result.stderr);return result;};
  run(['build.mjs'],path.join(root,'templates/expedition'));
  run(['tooling/verify-features.mjs','--check']);
  // Remove only our resolved, generated output; never a computed arbitrary path.
  if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='dist')throw Error('Unexpected output path');
  if(fs.existsSync(output)&&fs.lstatSync(output).isSymbolicLink())throw Error('Output must not be a symlink');
  fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
  for(const file of ['index.html','landing.css','hub.css','mark.svg','how-it-works.html','live-world.html','styles.css','script.js','CNAME','.nojekyll'])fs.copyFileSync(path.join(root,file),path.join(output,file));
  for(const dir of ['context','reference','templates','docs'])fs.cpSync(path.join(root,dir),path.join(output,dir),{recursive:true,filter:file=>!['dist','.build','node_modules','.git'].includes(path.basename(file))});
  if(fs.existsSync(path.join(root,'evidence')))fs.cpSync(path.join(root,'evidence'),path.join(output,'evidence'),{recursive:true});
  fs.copyFileSync(path.join(root,'AGENTS.md'),path.join(output,'AGENTS.md'));
  fs.copyFileSync(path.join(root,'README.md'),path.join(output,'README.md'));
  const featureData=JSON.parse(fs.readFileSync(path.join(root,'context/features.json'),'utf8'));
  const intro='<p class="eyebrow">THE PROJECT / THE PRACTICE</p><h1>A world of your own.<br><em>A source you can follow.</em></h1><p class="lead">Keep the curiosity of the first expedition. Bring your own meaning, compose its paths, and let people look beneath the surface.</p><div class="actions"><a class="button" href="start.html">Make your first world →</a><a href="../examples/first-world/index.html">Explore the running starter ↗</a></div><h2>From an introduction to a practice</h2><p>Aaron’s site is the initial personal breakdown. This is the project hub: a working starter, the underlying algebra, the necessary links and the context your agent needs to make another.</p><div class="paths">'+pages.slice(1).map(([key,label],i)=>`<a href="${key}.html"><span>0${i+1}</span><h3>${label}</h3><p>${({start:'Create, build and inspect a standalone world.',architecture:'Keep meaning, policy, presentation and effects explicit.',lightning:'Work backward from the promise. Test every necessary link.',features:'Explore 36 attributed algebra modules and their boundaries.',templates:'Choose a small reader or the full expedition composition.',trial:'Inspect a different-world agent build and its evidence.',context:'Give your agent a precise starting point.'})[key]}</p></a>`).join('')+'</div><h2>What you can use today</h2><p>The starter generates a complete small reading world through Temple algebra: places, choices, attributed sources, ordered styles, inspection and build receipts. The full expedition template carries the richer feature set with its source facts, assets, effects and checked authoring.</p><p>Concrete feature recipes and a separately assigned agent trial make reuse reviewable. Outside human usability and algebraic self-hosting of the documentation hub remain separate work. <a href="lightning.html">Follow the evidence and missing links →</a></p>';
  fs.writeFileSync(path.join(output,'docs/index.html'),shell('index',intro));
  for(const [id]of pages.slice(1)){
    const body=markdown(fs.readFileSync(path.join(root,'docs',id+'.md'),'utf8'))+(id==='features'?catalogue(featureData):'');
    fs.writeFileSync(path.join(output,'docs',id+'.html'),shell(id,body));
  }
  // The native closure verifies its physical module root. Build inside its own
  // source root, then copy its disposable output into the hub.
  const worldBuild=spawnSync(process.execPath,['build.mjs'],{cwd:path.join(root,'templates/world'),encoding:'utf8',env});
  if(worldBuild.status!==0)throw Error(worldBuild.stdout+'\n'+worldBuild.stderr);
  fs.mkdirSync(path.join(output,'examples'),{recursive:true});
  fs.cpSync(path.join(root,'templates/world/dist'),path.join(output,'examples/first-world'),{recursive:true});
  fs.cpSync(path.join(root,'templates/expedition/dist'),path.join(output,'examples/expedition'),{recursive:true});
  if(fs.existsSync(path.join(root,'examples/tidepool/example.json'))){
    const workspace=path.join(root,'.build');fs.mkdirSync(workspace,{recursive:true});
    const parent=fs.mkdtempSync(path.join(workspace,'hub-example-')),world=path.join(parent,'world');
    try{
      createExample('tidepool',world);run(['build.mjs'],world);run(['tooling/verify-features.mjs','--instance',world]);
      const command=['--test','--test-reporter=tap','template.test.mjs'],checks=run(command,world);
      const tests=Number([...checks.stdout.matchAll(/^# tests (\d+)$/gm)].at(-1)?.[1]??0);
      if(!tests)throw Error('The reproduced example must execute its portable checks.');
      fs.cpSync(path.join(world,'dist'),path.join(output,'examples/tidepool'),{recursive:true});
      fs.writeFileSync(path.join(output,'tidepool-qualification.json'),JSON.stringify({protocol:'worldwright/example-qualification/1',example:'tidepool',command:['node',...command],tests,status:checks.status,sourceOverlay:'example-sources/tidepool/example.json',evidenceFamily:'worldwright-feature-extraction-2026-11-06',boundary:'Native observation of portable checks against the freshly instantiated example, distinct from copied-world native authoring and actual-browser observations.'},null,2)+'\n');
    }
    finally{if(!path.resolve(parent).startsWith(workspace+path.sep))throw Error('Unexpected example cleanup target');fs.rmSync(parent,{recursive:true,force:true});}
    fs.cpSync(path.join(root,'examples/tidepool'),path.join(output,'example-sources/tidepool'),{recursive:true});
  }
  const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
  const inputs={};
  function scan(directory){for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){if(['dist','.build','.git','node_modules'].includes(entry.name))continue;const file=path.posix.join(directory,entry.name);if(entry.isDirectory())scan(file);else inputs[file]=sha(fs.readFileSync(path.join(root,file)));}}
  for(const dir of ['docs','context','templates','reference','tooling'])scan(dir);
  if(fs.existsSync(path.join(root,'examples')))scan('examples');
  if(fs.existsSync(path.join(root,'evidence')))scan('evidence');
  for(const file of ['index.html','landing.css','hub.css','AGENTS.md','README.md','package.json'])inputs[file]=sha(fs.readFileSync(path.join(root,file)));
  fs.writeFileSync(path.join(output,'hub-receipt.json'),JSON.stringify({protocol:'worldwright/hub-build/1',inputs,exampleReceipt:'examples/first-world/build-receipt.json',evidenceFamily:'worldwright-template-extraction-2026-11-06',boundary:'Native documentation publishing; algebraic example execution. No independent validation claimed.'},null,2)+'\n');
  console.log('Built Worldwright hub, catalogue and first-world example.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
