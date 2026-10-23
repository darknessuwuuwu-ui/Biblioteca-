/* Service worker: guarda la app para abrirla sin Internet. */
const V='biblioteca-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(CORE.map(u=>c.add(u).catch(()=>{})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}            // primero la copia guardada; se actualiza en segundo plano
    const res=await net;
    if(res)return res;
    if(r.mode==='navigate'){const i=await c.match('./index.html')||await c.match('./');if(i)return i}
    return new Response('Sin conexión',{status:503,statusText:'Sin conexión'});
  })());
});
