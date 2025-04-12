const CACHE_NAME = "version-1";
const urlsToCache = ["/index.html", "/offline.html", "/manifest.json"];

// Installation event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }).catch((err) => console.error("Cache Open Failed:", err))
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) {
    return; // Ignore non-HTTP requests (e.g., chrome-extension://)
  }

  event.respondWith(
    caches.match(event.request)
      .then((res) => res || fetch(event.request))
      .catch(() => caches.match("/offline.html"))
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});