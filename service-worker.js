const CACHE_VERSION = 'survivor-shell-v1';
const DYNAMIC_CACHE = 'survivor-dynamic-v1';

const APP_SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './dist/bundle.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

function normalizeRequestPath(url) {
  return url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
}

function isAppShellRequest(requestUrl) {
  const path = normalizeRequestPath(requestUrl);
  return [
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/dist/bundle.js',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg'
  ].some((shellPath) => path.endsWith(shellPath));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(APP_SHELL_FILES);

    // Broadcast update notice when this install replaces an existing active worker.
    if (self.registration.active) {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({ type: 'SWUPDATEAVAILABLE' });
      });
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => ![CACHE_VERSION, DYNAMIC_CACHE].includes(cacheName))
        .map((cacheName) => caches.delete(cacheName))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', networkResponse.clone());
        return networkResponse;
      } catch {
        const cached = await caches.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }

  if (sameOrigin && isAppShellRequest(requestUrl)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
      const response = await fetch(request);
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
      return response;
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (sameOrigin) {
        const dynamic = await caches.open(DYNAMIC_CACHE);
        dynamic.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      return cached || Response.error();
    }
  })());
});
