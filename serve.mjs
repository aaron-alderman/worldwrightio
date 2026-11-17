import http from 'node:http';
import {execFileSync} from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{verify}=require('./bootstrap/guard.cjs');
const workspace=path.dirname(fileURLToPath(import.meta.url));
execFileSync(process.env.ENCOUNTER || process.env.PORTFOLIO_ENCOUNTER || 'encounter', ['check-package', workspace], {stdio:'inherit'});
await verify(workspace);
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.env.WORLDWRIGHT_PORT||4186);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{
 await verify(workspace,{inputs:false});
 const url=new URL(req.url,'http://localhost');
 const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname));
 if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
 const info=await stat(filename);if(!info.isFile())throw Error('Not a file');
 const body=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
}catch(error){const drift=error.message.startsWith('GUARD-');res.writeHead(drift?503:404,{'Content-Type':'text/plain'});res.end(drift?error.message+'\nCorrect its source owner and rebuild.':'Not found');}});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
