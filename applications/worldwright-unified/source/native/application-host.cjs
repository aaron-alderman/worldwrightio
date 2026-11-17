'use strict';
// Generic view/module/event mechanisms. The algebra selects the view, route,
// service, modules, chrome tree and source binding; this host supplies no defaults.
async function createApplicationRuntime(data,{mountTree,base}={}){
 const origin=new URL(base??location.href),services=new Map(),scopes=new Map(),hosts=new Map(),bus=new EventTarget(),notes=new Map();
 let active=null,generation=0,inspectRoot=null,serial=0;
 const url=file=>{const u=new URL(file,origin);if(u.origin!==origin.origin)throw Error('VIEW-CAP: Module/resource crosses its declared origin.');return u.href;};
 const dispatch=async(method,input={})=>{const env={model:data.model,data,eventInput:input};await createKernel({...valuePorts(),...ports},20000000).run(data.model.queries[data.interfaces[method]],env);return env.result;};
 function close(){generation++;if(!active)return;const scope=active;active=null;scope.closed=true;for(const cleanup of scope.cleanups.splice(0))cleanup();scope.host.replaceChildren();scopes.delete(scope.id);}
 const ports={
  'view.close':()=>{close();return true;},
  'programme.service':async({definition})=>{
   const key=definition.module+'#'+definition.exportName;
   if(!services.has(key))services.set(key,(async()=>{const module=await import(url(definition.module));return {value:await module[definition.exportName](),definition};})());
   await services.get(key);return key;
  },
  'view.open':async({host,definition,service,chrome})=>{
   const element=hosts.get(host);if(!element?.isConnected)throw Error('VIEW-STALE: The requested host is no longer displayed.');
   const ticket=generation,response=await fetch(url(definition.fragment));if(!response.ok)throw Error('VIEW-SOURCE: Declared view fragment is unavailable.');const html=await response.text();
   if(ticket!==generation||!element.isConnected)throw Error('VIEW-STALE: A newer route replaced this view.');
   const owner=element.ownerDocument,shadow=element.attachShadow({mode:'open'}),container=owner.createElement('div');
   for(const file of definition.styles){const link=owner.createElement('link');link.rel='stylesheet';link.href=url(file);shadow.append(link);}
   const chromeHost=owner.createElement('div');mountTree(chromeHost,chrome);shadow.append(chromeHost);container.className='application-view';container.innerHTML=html;shadow.append(container);
   const scope={id:'scope.'+(++serial),host:element,root:shadow,container,definition,cleanups:[],closed:false,location:{hash:''}};active=scope;scopes.set(scope.id,scope);
   const serviceRecord=await services.get(service),transport=serviceRecord.value;scope.serviceRecord=serviceRecord;
   for(const [name,value]of Object.entries(definition.body??{}))container.setAttribute(name,value);
   const events={addEventListener:(name,fn,...rest)=>{bus.addEventListener(name,fn,...rest);scope.cleanups.push(()=>bus.removeEventListener(name,fn,...rest));},dispatchEvent:event=>bus.dispatchEvent(event)};
   const localEvents=new EventTarget();
   scope.document={querySelector:s=>shadow.querySelector(s),querySelectorAll:s=>shadow.querySelectorAll(s),getElementById:id=>shadow.getElementById(id),createElement:(...args)=>owner.createElement(...args),createTextNode:t=>owner.createTextNode(t),createDocumentFragment:()=>owner.createDocumentFragment(),body:container,addEventListener:(...args)=>shadow.addEventListener(...args)};
   scope.window={...events,[serviceRecord.definition.alias]:transport,services:{notes},print:()=>{
    const frame=owner.createElement('iframe');frame.style.display='none';owner.body.append(frame);const doc=frame.contentDocument;doc.open();doc.write('<!doctype html>');doc.close();
    const printRoot=doc.body.attachShadow({mode:'open'}),ready=[];
    for(const link of shadow.querySelectorAll('link[rel=stylesheet]')){const copy=link.cloneNode(true);ready.push(new Promise((resolve,reject)=>{copy.onload=resolve;copy.onerror=()=>reject(Error('PRINT-STYLE: A declared stylesheet could not load.'));}));printRoot.append(copy);}
    for(const [name,value]of Object.entries(container.dataset))doc.body.dataset[name]=value;
    printRoot.append(...[...container.childNodes].map(n=>n.cloneNode(true)));ready.push(...[...printRoot.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('PRINT-IMAGE: A declared diagram could not load.'));})));
    Promise.all(ready).then(()=>{frame.contentWindow.focus();frame.contentWindow.print();}).catch(error=>{frame.remove();container.setAttribute('aria-description',error.message);});frame.contentWindow.addEventListener('afterprint',()=>frame.remove(),{once:true});
   }};
   const add=scope.window.addEventListener;scope.window.addEventListener=(name,fn,...rest)=>{if(name==='hashchange'){localEvents.addEventListener(name,fn,...rest);scope.cleanups.push(()=>localEvents.removeEventListener(name,fn,...rest));}else add(name,fn,...rest);};
   const resourceBase=new URL(definition.base,origin);
   for(const node of container.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){const value=node.getAttribute(attr);if(value&&!value.startsWith('#')&&!value.startsWith('data:'))node.setAttribute(attr,new URL(value,resourceBase).href);}
   shadow.addEventListener('click',event=>{
    const a=event.composedPath().find(n=>n?.tagName==='A');if(!a||a.hasAttribute('download')||a.target==='_blank')return;
    const target=new URL(a.getAttribute('href'),resourceBase);
    if(a.hasAttribute('data-application-route')){event.preventDefault();location.hash=target.hash;return;}
    if(target.hash&&shadow.getElementById(target.hash.slice(1))){event.preventDefault();scope.location.hash=target.hash;localEvents.dispatchEvent(new Event('hashchange'));shadow.getElementById(target.hash.slice(1)).scrollIntoView({block:'start'});return;}
   const alias=data.definition.compatibility.find(r=>new URL(r.path,origin).pathname===target.pathname);
    if(alias){event.preventDefault();location.hash=alias.fragments?.[target.hash.slice(1)]??alias.target;}
   });
   element.setAttribute('data-inspect-key',definition.binding);if(inspectRoot)scope.cleanups.push(inspectRoot(shadow));return scope.id;
  },
  'programme.mount':async({scope:id,definition})=>{
   const scope=scopes.get(id);if(!scope||scope.closed)return false;const module=await import(url(definition.module));if(scope.closed)return false;
   const result=await module[definition.exportName](scope.document,scope.window,scope.location);
   if(typeof result==='function')scope.cleanups.push(result);
   if(definition.render){const service=scope.serviceRecord;const render=async()=>{const state=await service.value[service.definition.stateMethod]();if(!scope.closed)result[definition.render](state);};await render();scope.window.addEventListener(service.definition.stateEvent,render);}
   return true;
  },
  'view.focus':({scope:id,identity})=>{
   if(!identity)return false;const scope=scopes.get(id);if(!scope||scope.closed)return false;
   const target=scope.root.getElementById(identity);if(!target)throw Error('VIEW-FOCUS: The declared destination is missing: '+identity);
   for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
   target.scrollIntoView({block:'center'});target.focus({preventScroll:true});return true;
  }
 };
 return {definition:data.definition,resolve:hash=>dispatch('resolve',{hash}),async mount(host,view,focus=null){const id='host.'+(++serial);hosts.set(id,host);try{return await dispatch('mount',{host:id,view,focus});}finally{hosts.delete(id);}},leave:()=>dispatch('leave'),registerInspector:fn=>{inspectRoot=fn;}};
}
module.exports={createApplicationRuntime};
