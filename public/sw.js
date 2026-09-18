const CACHE_NAME = 'gt-spa-v3';
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Explicitly clear specific legacy names and anything that isn't the new CACHE_NAME
                    if (cacheName !== CACHE_NAME || cacheName === 'gt-spa-v1' || cacheName === 'gt-spa-v2') {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and Supabase API calls
    if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
        return;
    }

    // special handling for index.html or root - Network First
    if (event.request.mode === 'navigate' || event.request.url.endsWith('/') || event.request.url.endsWith('index.html')) {
        event.respondWith(
            fetch(event.request).then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
