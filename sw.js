/* PDF Desk service worker.
   Caches ONLY the app itself (page, icons and the bundled libraries in ./vendor). User PDFs are never fetched
   over the network, so they are never cached here. Everything the app needs is same-origin, so it works offline. */
const CACHE = 'pdfdesk-v7';   // keep in sync with OFFLINE_CACHE in index.html
const CORE = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './vendor/runtime.js', './vendor/pdf-lib.min.js', './vendor/fontkit.umd.min.js',
  './vendor/pdf.min.js', './vendor/pdf.worker.min.js', './vendor/jszip.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map(u => c.add(u).catch(() => { })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // never touch other sites

  // Bundled libraries / OCR files: never change for a given cache version -> cache first, fill on demand.
  if (url.pathname.includes('/vendor/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  // The app page and files: network first (so updates arrive), but fall back to the cache quickly when offline/slow.
  e.respondWith((async () => {
    try {
      const res = await withTimeout(fetch(req), req.mode === 'navigate' ? 4000 : 8000);
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy)); }
      return res;
    } catch (err) {
      return (await caches.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await caches.match('./index.html') : undefined) || Response.error();
    }
  })());
});
