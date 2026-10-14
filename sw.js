// ==================== MARKET-HUB SERVICE WORKER ====================
// Caches files so the app works offline and loads fast on repeat visits.

const CACHE_NAME = "markethub-v1";

// Files we want to cache immediately on first load
const PRECACHE_URLS = [
    "./",
    "./index.html",
    "./style.css",
    "./main.js",
    "./manifest.json",
    "./icon-192.svg",
    "./icon-512.svg"
];

// Install: cache the core files
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches from previous versions
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: serve from cache first, fall back to network
self.addEventListener("fetch", function (event) {
    // Only handle GET requests
    if (event.request.method !== "GET") return;

    // Skip requests to other origins (like Unsplash images)
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                // Cache a copy of the response for later
                if (response && response.status === 200 && response.type === "basic") {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });
                }
                return response;
            }).catch(() => {
                // If offline and file isn't cached, fall back to index.html
                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }
            });
        })
    );
});