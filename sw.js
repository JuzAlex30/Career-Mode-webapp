/* Boardhub — Service Worker
   Estrategia: network-first para index.html (siempre la versión más reciente),
   cache-first para el resto de assets estáticos (manifest, icono).
   Offline: sirve index.html cacheado como fallback. */
const CACHE_KEY = "boardhub-v1784565057790";
const ASSETS = ["./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./social.png", "./logo.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_KEY).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_KEY).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isHtml = url.pathname.endsWith(".html") || url.pathname.endsWith("/") || !url.pathname.includes(".");
  if (isHtml) {
    // Network-first: siempre intenta la red; cae al caché solo si offline
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE_KEY).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    // Cache-first para assets (manifest, icono, etc.)
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
