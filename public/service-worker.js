/* eslint-disable no-restricted-globals */
// Service Worker für Push-Benachrichtigungen

globalThis.addEventListener('install', (event) => {
  globalThis.skipWaiting();
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(globalThis.clients.claim());
});

// Push-Event Handler

globalThis.addEventListener('push', (event) => {
  let data = {
    title: 'Familie Planner',
    body: 'Du hast neue Termine',
    icon: '/icons/icon-192x192.png',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
      console.error('Error parsing push event data:', e);
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
      { action: 'open', title: 'Öffnen' },
      { action: 'close', title: 'Schließen' },
    ],
  };

  event.waitUntil(globalThis.registration.showNotification(data.title, options));
});

// Notification Click Handler
globalThis.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    globalThis.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url === new URL(urlToOpen, globalThis.location.origin).href &&
            'focus' in client
          ) {
            return client.focus();
          }
        }
        if (globalThis.clients.openWindow) {
          return globalThis.clients.openWindow(urlToOpen);
        }
      })
  );
});
