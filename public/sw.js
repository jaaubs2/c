// Service worker de la version web.
// Stratégie « réseau d'abord » : on sert toujours la version la plus récente quand
// la connexion marche, et la dernière copie connue sinon.
// Seuls les fichiers de l'app sont mis en cache (polices comprises, elles sont intégrées).
// Les données des carnets, qui viennent d'un autre serveur, ne le sont jamais.
const CACHE = "carnet-vivant-v2";

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
  if (!sameOrigin) return;

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
