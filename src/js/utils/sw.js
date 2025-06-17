const CACHE_NAME = "DicodingStory-V1";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/favicon-16x16.png",
  "/images/icon-192x192.png",
  "/images/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();

          if (
            event.request.url.includes("/assets/") ||
            event.request.url.includes("/styles/") ||
            event.request.url.includes(".js") ||
            event.request.url.includes(".html")
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

self.addEventListener("push", (event) => {
  console.log("Service Worker: Push Received");

  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: "Notifikasi Baru",
      body: event.data ? event.data.text() : "Tidak ada detail",
      icon: "/images/icon-192x192.png",
    };
  }

  const title = notificationData.title || "Dicoding Story";
  const options = {
    body: notificationData.body || "Ada pembaruan baru untuk Anda",
    icon: notificationData.icon || "/images/icon-192x192.png",
    badge: "/images/badge-72x72.png",
    vibrate: [100, 50, 100, 50, 100],
    data: {
      url: notificationData.url || "/",
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification Clicked");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const hadWindowToFocus = clientList.some((client) => {
          if (client.url === urlToOpen) {
            return client.focus();
          }
          return false;
        });

        if (!hadWindowToFocus) {
          clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("Service Worker: Notification Closed", event);
});
