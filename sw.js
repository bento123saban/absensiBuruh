const CACHE_NAME = 'absensi-pwa-v1';
const CACHE_ASSETS = [
  './',
  'index.html',
  'app2.js',
  'style.css',
  'bendhard16.min.css',
  'manifest.json',
  'img/fav-icon.png',
  'img/icon-512x512.png',
  'font/fontawsome/css/all.css', // Pastikan jalur file Font Awesome ini benar
  'font/Barlow-Regular.ttf',
];





// 1. INSTALASI: Menyimpan App Shell ke cache
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                // Menggunakan 'addAll' untuk menyimpan semua file ke cache
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Gagal caching saat instalasi: ', err);
            })
    );
    // Memaksa Service Worker baru untuk segera mengambil kontrol
    self.skipWaiting();
});

// 2. AKTIVASI: Membersihkan cache lama
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Hapus cache yang versinya sudah lama
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Intersepsi permintaan jaringan (Strategi Cache-First)
self.addEventListener('fetch', (event) => {
    // Abaikan permintaan lintas-origin tertentu (misal: Google Sign-In, Geoapify API) agar tidak di-cache
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache Hit - kembalikan response dari cache
                if (response) {
                    return response;
                }
                // Cache Miss - ambil dari jaringan
                return fetch(event.request);
            })
    );
});