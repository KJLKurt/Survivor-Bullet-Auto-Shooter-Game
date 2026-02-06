const VERSION = 'v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/dist/bundle.js',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(`app-${VERSION}`).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.postMessage({ type: 'SWUPDATEAVAILABLE' }));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isShell = url.origin === location.origin && (APP_SHELL.includes(url.pathname) || url.pathname.startsWith('/dist/'));
  if (isShell) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(`app-${VERSION}`).then((c) => c.put(req, copy)); return res;
    })));
    return;
  }
  event.respondWith(fetch(req).then((res) => {
    const copy = res.clone(); caches.open(`dyn-${VERSION}`).then((c) => c.put(req, copy)); return res;
  }).catch(() => caches.match(req)));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
