/* sam quiz : service worker (mode hors ligne) - change le numero de version quand tu ajoutes des fichiers */
const CACHE = "samquiz-v1";

const FILES = [
  "/",
  "/manifest.webmanifest",
  "/css/style.css",
  "/css/subject.css",
  "/css/editor.css",
  "/css/quiz.css",
  "/css/levels.css",
  "/css/ranking.css",
  "/css/daily.css",
  "/css/hub.css",
  "/css/install.css",
  "/js/storage.js",
  "/js/home.js",
  "/js/editor.js",
  "/js/progress.js",
  "/js/levels.js",
  "/js/quiz.js",
  "/js/config.js",
  "/js/cloud.js",
  "/js/ranking.js",
  "/js/daily.js",
  "/js/hub.js",
  "/js/install.js",
  "/js/app.js",
  "/data/loader.js",
  "/data/maths.js",
  "/data/physique.js",
  "/data/svt.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(function (cache) {
        return Promise.all(
          FILES.map(function (url) {
            return cache.add(url).catch(function () {
              return null;
            });
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    if (request.mode === "navigate") {
      const home = await cache.match("/");
      if (home) return home;
    }
    throw err;
  }
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const cdn = url.hostname === "cdn.jsdelivr.net";

  if (!sameOrigin && !cdn) return;
  if (sameOrigin && url.pathname.indexOf("/api/") === 0) return;

  event.respondWith(networkFirst(request));
});
