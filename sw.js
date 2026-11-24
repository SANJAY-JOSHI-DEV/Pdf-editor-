/* PDF Desk service worker.
   Caches ONLY the app itself (page, icons, bundled libraries and fonts in ./vendor). User PDFs are never fetched
   over the network, so they are never cached here. Everything the app needs is same-origin, so it works offline. */
const CACHE = 'pdfdesk-v8';   // keep in sync with OFFLINE_CACHE in index.html
const CORE = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './vendor/runtime.js', './vendor/pdf-lib.min.js', './vendor/fontkit.umd.min.js', './vendor/jszip.min.js',
  './vendor/pdfjs/pdf.module.js', './vendor/pdfjs/pdf.worker.module.js',
  './vendor/fonts/NotoSans-Regular.ttf', './vendor/fonts/NotoSans-Bold.ttf', './vendor/fonts/NotoSansDevanagari-Regular.ttf',
  './vendor/fonts/NotoSansDevanagari-Bold.ttf', './vendor/fonts/NotoSansMath-Regular.ttf', './vendor/fonts/NotoSansSymbols2-Regular.ttf',
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

  // Bundled libraries / fonts / OCR files: never change for a given cache version -> cache first, fill on demand.
  if (url.pathname.includes('/vendor/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  // The app page and files: network first (so updates arrive). If the network is offline, slow, OR answers with an
  // error page (404/5xx, e.g. the site was moved or is down), fall back to the copy saved on this device.
  e.respondWith((async () => {
    const key = req.mode === 'navigate' ? './index.html' : req;
    let res = null;
    try { res = await withTimeout(fetch(req), req.mode === 'navigate' ? 4000 : 8000); } catch (err) { /* offline or slow */ }
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); return res; }
    const hit = await caches.match(key, { ignoreSearch: true });
    return hit || res || Response.error();
  })());
});
