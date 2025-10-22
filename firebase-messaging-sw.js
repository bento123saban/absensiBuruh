// Nama file: firebase-messaging-sw.js

// --- Bagian ini PENTING untuk menangani klik notifikasi sebelum FCM diinisialisasi ---
// Ini harus ada di paling atas file service worker kamu.
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification click received.', event);

    event.notification.close(); // Tutup notifikasi setelah diklik

    // Dapatkan URL dari data notifikasi. Pastikan data.url dikirim dari backend.
    const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/'; // Default ke root

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                // Jika tab dengan URL target sudah terbuka, fokus padanya
                if (client.url.includes(urlToOpen) && 'focus' in client) { // Menggunakan includes untuk pencocokan yang lebih fleksibel
                    return client.focus();
                }
            }
            // Jika tidak ada tab yang cocok, buka jendela/tab baru
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
// --- Akhir bagian penanganan klik notifikasi ---


// Import dan inisialisasi Firebase Messaging di dalam service worker
// Gunakan versi modular terbaru (10.12.2)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// TODO: Ganti dengan firebaseConfig dari proyek fcm-push-notif-50a72 kamu!
// Pastikan nilai messagingSenderId sama dengan yang di index.html
const firebaseConfig = {
            apiKey: "AIzaSyBhCRZ_OHqCRC7XUrgBUBQSPhMKovQr63o",
            authDomain: "fcm-push-notif-50a72.firebaseapp.com",
            projectId: "fcm-push-notif-50a72",
            storageBucket: "fcm-push-notif-50a72.firebasestorage.app",
            messagingSenderId: "119993278445",
            appId: "1:119993278445:web:bcdb4b7eb31db635de51e4",
            measurementId: "G-WHDCR50XE1"
        };

// Inisialisasi aplikasi Firebase di dalam service worker
firebase.initializeApp(firebaseConfig);

// Dapatkan instance Firebase Messaging agar dapat menangani pesan background.
const messaging = firebase.messaging();

// Tangani pesan saat aplikasi di background/tertutup
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customize notification here
    const notificationTitle = payload.notification.title || 'Pesan Baru';
    const notificationOptions = {
        body: payload.notification.body || 'Anda memiliki pesan baru.',
        icon: payload.notification.icon || '/firebase-logo.png', // Pastikan ikon ini ada di root domain atau URL yang bisa diakses
        data: payload.data // Sertakan data agar bisa diakses saat klik notifikasi
    };

    // Tampilkan notifikasi
    self.registration.showNotification(notificationTitle, notificationOptions);
});
