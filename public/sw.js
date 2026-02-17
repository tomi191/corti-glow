// Service Worker for push notifications
// Keep minimal — only handles push events and notification clicks

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "LURA", body: event.data.text() };
  }

  const { title = "LURA", body, icon, badge, tag, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || "/images/icon-192x192.png",
      badge: badge || "/images/icon-192x192.png",
      tag: tag || "lura-default",
      data: data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/app";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if one is open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
