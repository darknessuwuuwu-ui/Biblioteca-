const V='biblioteca-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png',
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
/* guarda en caché y responde al instante; se actualiza en segundo plano */
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const ok=u.origin===location.origin||/cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname);
  if(!ok)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:r.mode==='navigate'});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    return hit||(await net)||(r.mode==='navigate'?c.match('./index.html'):Response.error());
  }));
});
