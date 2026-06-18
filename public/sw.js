const CACHE_NAME = "fitness-realm-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/dashboard",
  "/login",
  "/profile",
  "/workouts",
  "/conquest",
  "/leaderboard",
  "/favicon.ico",
  "/manifest.json"
];

// Install Event - cache core shell assets
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching core shell assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - clear old caches
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - network-first then fallback to cache
self.addEventListener("fetch", (event: any) => {
  // Ignore API requests and non-GET requests
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache clone of response if successful
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Default offline fallback if cache empty
          return new Response("Offline connection error.", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});
