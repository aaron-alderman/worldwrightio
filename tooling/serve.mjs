import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fs.realpathSync(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.env.PORT??4179);
const types={'.mp4':'video/mp4','.wav':'audio/wav','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.rel':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  try {
    let route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(route.endsWith('/'))route+='index.html';
    const file=path.resolve(root,'.'+route),relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Outside preview');
    const real=fs.realpathSync(file);
    if(!real.startsWith(root+path.sep)||!fs.statSync(real).isFile())throw Error('Not a file');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(real).pipe(res);
  }catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
