/* =====================================================================
   SERVICE WORKER — Hace que el juego funcione sin internet
   ---------------------------------------------------------------------
   La primera visita guarda todos los archivos en el dispositivo.
   Después siempre carga desde ahí (rápido y sin conexión) y, si hay
   internet, descarga en segundo plano la versión nueva para la
   siguiente vez. Al publicar cambios grandes, sube el número de CACHE.
   ===================================================================== */
const CACHE = "aventuras-v1";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/styles.css",
  "js/storage.js",
  "js/engine.js",
  "js/speech.js",
  "js/billing.js",
  "js/map.js",
  "js/app.js",
  "js/pwa.js",
  "stories/world1.js",
  "stories/world2.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primero la copia guardada; en paralelo, actualiza desde la red */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const network = fetch(e.request)
        .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
