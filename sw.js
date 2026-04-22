const CACHE = 'igreja-nvc-v2';
const ASSETS = [
  './igreja-novo-vivo-caminho.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Open+Sans:wght@400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase/Google APIs: network only
  if(e.request.url.includes('firebase')||e.request.url.includes('firestore')||e.request.url.includes('googleapis.com/firestore')){
    return;
  }
  // Google Fonts: cache first
  if(e.request.url.includes('fonts.googleapis.com')||e.request.url.includes('fonts.gstatic.com')){
    e.respondWith(caches.open(CACHE).then(cache=>
      cache.match(e.request).then(cached=>{
        if(cached) return cached;
        return fetch(e.request).then(r=>{cache.put(e.request,r.clone());return r;}).catch(()=>cached);
      })
    ));
    return;
  }
  // App shell: cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(r=>{
        if(r&&r.status===200){
          const clone=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return r;
      }).catch(()=>caches.match('./igreja-novo-vivo-caminho.html'));
    })
  );
});
