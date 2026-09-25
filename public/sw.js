// Service worker de la version web.
// Stratégie « réseau d'abord » : on sert toujours la version la plus récente quand
// la connexion marche, et la dernière copie connue sinon.
// Seuls les fichiers de l'app et les polices sont mis en cache. Les données des
// carnets (qui viendront d'un autre serveur) ne le seront jamais.
const CACHE = "carnet-vivant-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") cache.put(request, response.clone());
        return response;
      } catch (error) {
        const cached =
          (await cache.match(request)) ||
          (request.mode === "navigate" ? await cache.match("./") : undefined);
        if (cached) return cached;
        throw error;
      }
    })()
  );
});
