const CACHE_NAME = 'word-tower-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/sounds/correct.mp3',
  '/sounds/wrong.mp3',
  '/sounds/win.mp3',
  '/sounds/lose.mp3',
  '/sounds/powerup.mp3',
  '/sounds/button.mp3',
  '/sounds/achievement.mp3',
  '/sounds/level-up.mp3',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return offline response for API requests
        return new Response(
          JSON.stringify({ error: 'You are offline' }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Cache new responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('Offline');
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-results') {
    event.waitUntil(syncGameResults());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Now',
        icon: '/icons/play.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Word Tower', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/game')
    );
  }
});

// Helper function to sync game results
async function syncGameResults() {
  const db = await openDB();
  const results = await db.getAll('gameResults');
  
  for (const result of results) {
    try {
      await fetch('/api/games/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      await db.delete('gameResults', result.id);
    } catch (error) {
      console.error('Error syncing game result:', error);
    }
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WordTowerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('gameResults', { keyPath: 'id' });
    };
  });
} 