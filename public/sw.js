// Service worker untuk push notification + precache shell PWA
// ponytail: push event handler minimal — tidak ada retry queue/offline support.
//           tambah queue (e.g. workbox-background-sync) jika butuh jaminan delivery saat tab tertutup.

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("promo-auto-v1").then((cache) =>
      cache.add(["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== "promo-auto-v1").map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "Promo", body: event.data?.text() ?? "" };
  }

  const title = data.title || "Notifikasi Promo";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/icon-192x192.png",
    tag: data.tag || "promo",
    renotify: true,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      const existing = clientList.find((c) => "focus" in c);
      if (existing) {
        existing.navigate?.(targetUrl);
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
