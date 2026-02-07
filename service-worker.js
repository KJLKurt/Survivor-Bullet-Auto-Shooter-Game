const CACHE_NAME = "survivor-shell-__BUILD_ID__";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./favicon.ico",
  "./dist/bundle.js",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/maskable-512.svg"
];

function getShellUrls() {
  return APP_SHELL.map((path) => new URL(path, self.registration.scope).toString());
}

function isShellRequest(requestUrl) {
  const shellUrls = getShellUrls();
  return shellUrls.some((url) => {
    const shell = new URL(url);
    return requestUrl.origin === shell.origin && requestUrl.pathname === shell.pathname;
  });
}

async function notifyClientsUpdateAvailable() {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: "SWUPDATEAVAILABLE" });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(getShellUrls());

      if (self.registration.active) {
        await notifyClientsUpdateAvailable();
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  const isNavigation = event.request.mode === "navigate";
  if (isNavigation || isShellRequest(requestUrl)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
