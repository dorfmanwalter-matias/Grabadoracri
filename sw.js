
// Service Worker mínimo para cumplimiento de PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Estrategia básica: red primero
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
