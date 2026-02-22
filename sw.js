const CACHE_NAME = 'nusuk-keys-v1';
const ASSETS = [
    '/nusuk-quiz-codes/',
    '/nusuk-quiz-codes/index.html',
    '/nusuk-quiz-codes/styles.css?v=1.7.0',
    '/nusuk-quiz-codes/i18n.js?v=1.0.0',
    '/nusuk-quiz-codes/codes.js?v=1.6.0',
    '/nusuk-quiz-codes/script.js?v=1.8.0',
    '/nusuk-quiz-codes/logo.png',
    '/nusuk-quiz-codes/favicon.png',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
