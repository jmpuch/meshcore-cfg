// meshcore-cfg web — service worker: network first (always the latest
// published version when online), the cache only when offline. Trunk names
// the wasm/js after their content hash: when a new one is cached, the old
// ones are dropped so the cache never keeps more than one version.
const CACHE = 'meshcore-cfg';
const HASHED = /meshcore-cfg-web-[0-9a-f]+(_bg\.wasm|\.js)$/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

async function remember(request, response) {
  const cache = await caches.open(CACHE);
  const path = new URL(request.url).pathname;
  const hashed = path.match(HASHED);
  if (hashed) {
    for (const key of await cache.keys()) {
      const other = new URL(key.url).pathname;
      if (other !== path && HASHED.test(other) && other.endsWith(hashed[1])) await cache.delete(key);
    }
  }
  await cache.put(request, response);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  // GitHub Pages serves everything with max-age=600: without this, the
  // browser's own HTTP cache could hand back the previous index.html (and
  // so the previous version) for up to 10 minutes after a publish. The
  // hashed wasm/js never change under a given name: plain fetch for them.
  const hashed = HASHED.test(new URL(event.request.url).pathname);
  event.respondWith(
    (hashed ? fetch(event.request) : fetch(event.request.url, { cache: 'no-cache' }))
      .then((response) => {
        if (response.ok) event.waitUntil(remember(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Response.error())),
  );
});
