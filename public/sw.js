// Kerala Lottery Results Today - PWA Service Worker
const CACHE_NAME = "kerala-lottery-pwa-v1";

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/icon-maskable-192x192.png",
  "/icon-maskable-512x512.png",
  "/apple-touch-icon-180x180.png",
  "/logo-round-192.png",
  "/logo-master-1024.png",
  "/search",
  "/schedule",
  "/kerala-lottery-app"
];

// Install Event - Pre-cache essential static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[PWA SW] Pre-cache partial warning:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Smart Strategy:
// 1. Static images & fonts: Cache-first with network fallback
// 2. HTML pages & API routes: Network-first with cache fallback (always deliver fresh 3 PM results!)
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Skip browser extensions or cross-origin external analytics (GTM, Google Analytics)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Static Assets (Icons, Images, Fonts, CSS, JS chunks) -> Cache-first / Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf|css)$/) ||
    url.pathname.startsWith("/_next/static/");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached and fetch in background to refresh cache
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML Pages & Navigation & APIs -> Network-first for fresh results, fallback to cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback to cached home page if navigation request fails offline
        if (request.mode === "navigate") {
          const homeFallback = await caches.match("/");
          if (homeFallback) return homeFallback;
        }
        return new Response("Offline - Live connection required", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      })
  );
});
