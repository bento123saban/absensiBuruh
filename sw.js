const CACHE_NAME    = "absensi-buruh-v1";
const urlsTOCache   = [
    "/",
    "/index.html",
    "/app2.js",
    "/style.css",
    "/bendhard16.min.css",
    "/offline.html"
]

self.addEventListener ("instal", e => {
    console.log("SW Instaled")
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("SW : Precaching aset")
                return cache.addAll(urlsTOCache)
            })
    )
})
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            const fetchPromise = fetch(e.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, responseClone);
                    })
                }
                return networkResponse
            }).catch(error => {
                consolelog("error")
            })
        })
    )
})