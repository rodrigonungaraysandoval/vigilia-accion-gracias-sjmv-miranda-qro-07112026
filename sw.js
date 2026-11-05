/* Guarda la página para leerla sin señal. Con señal, muestra siempre lo más reciente. */
var CACHE='oraciones-v1';
var ARCHIVOS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ARCHIVOS)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  var clave=req.mode==='navigate'?'index.html':req;
  e.respondWith(caches.open(CACHE).then(function(c){
    var red=fetch(req).then(function(r){if(r&&r.ok)c.put(clave,r.clone());return r});
    var plazo=new Promise(function(res){setTimeout(res,2500)});
    return Promise.race([red.catch(function(){return null}),plazo]).then(function(r){
      return r||c.match(clave).then(function(m){return m||red});
    });
  }));
});
