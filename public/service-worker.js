/* eslint-disable no-restricted-globals */
// Service Worker für Push-Benachrichtigungen

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  globalThis.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(globalThis.clients.claim());
});

// Push-Event Handler
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let data = {
    title: 'Familie Planner',
    body: 'Du hast neue Termine',
    icon: '/icons/icon-192x192.png',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push event data as JSON:', e);
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      eventId: data.eventId,
    },
    actions: data.actions || [
      {
        action: 'open',
        title: 'Öffnen',
      },
      {
        action: 'close',
        title: 'Schließen',
      },
    ],
  };

  event.waitUntil(globalThis.registration.showNotification(data.title, options));
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    globalThis.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Prüfe ob die App bereits geöffnet ist
        for (const client of clientList) {
          if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
            return client.focus();
          }
        }
        // Öffne neues Fenster wenn App nicht geöffnet ist
        if (globalThis.clients.openWindow) {
          return globalThis.clients.openWindow(urlToOpen);
        }
      })
  );
});
