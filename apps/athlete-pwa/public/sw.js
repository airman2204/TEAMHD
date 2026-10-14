self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener para notificaciones disparadas desde la aplicación o temporizadores
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REST_ALARM') {
    const title = event.data.title || '⏱️ ¡Tiempo de descanso terminado!';
    const options = {
      body: event.data.body || 'Es momento de iniciar tu siguiente serie 🔥',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [300, 100, 300, 100, 400],
      tag: 'teamhd-rest-timer',
      renotify: true,
      requireInteraction: true
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || 'https://teamhd-athlete.vercel.app';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.includes('teamhd-athlete') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});


