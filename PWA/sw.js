const CACHE_NAME = 'greenkeeper-v16';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
    }));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
                return caches.delete(cache);
            }
        }))
    }));
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('identitytoolkit.googleapis.com')) return;

    event.respondWith(fetch(event.request).then(response => {
        if (response && (response.status === 200 || response.status === 0)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
            });
        }
        return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
})