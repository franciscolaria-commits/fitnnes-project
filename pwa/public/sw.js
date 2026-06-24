const CACHE_NAME = "fitness-cache-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png"
];

// Instalar el Service Worker y almacenar los assets estáticos base en el caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Cacheando assets estáticos base");
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y limpiar cachés obsoletos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Limpiando caché antiguo:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones HTTP para servir desde caché de forma offline
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Evitar interceptar llamadas a la API de FastAPI (queremos que vayan a la red o se manejen por el cliente)
  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Fallback a red si no está en caché
      return fetch(event.request).then((networkResponse) => {
        // Cachear dinámicamente nuevas peticiones del mismo origen que sean válidas
        if (
          event.request.method === "GET" &&
          networkResponse.status === 200 &&
          requestUrl.origin === self.location.origin
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    })
  );
});
