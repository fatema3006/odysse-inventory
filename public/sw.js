self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("odysse-v1").then((cache) => cache.addAll(["/", "/products", "/variants", "/reports", "/colors"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== "odysse-v1").map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
