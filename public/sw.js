const CACHE_NAME = 'playsong-v2';
const STATIC_CACHE = 'playsong-static-v2';
const DYNAMIC_CACHE = 'playsong-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/67508e0d-5de8-4d0a-a3e9-3d86ae04639e.png'
];

// Background playback state
let isBackgroundPlaybackActive = false;
let currentTrack = null;

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event  
self.addEventListener('fetch', (event) => {
  // Handle audio streaming requests differently
  if (event.request.url.includes('audio-stream') || event.request.url.includes('.m4a') || event.request.url.includes('.mp3')) {
    // Don't cache audio streams, always fetch fresh
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(fetchResponse => {
        // Check if valid response
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }

        // Clone the response
        const responseClone = fetchResponse.clone();

        // Add to dynamic cache
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, responseClone);
        });

        return fetchResponse;
      }).catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Handle background playback messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ENABLE_BACKGROUND_PLAYBACK') {
    isBackgroundPlaybackActive = true;
    console.log('Background playback enabled');
    
    // Keep service worker alive for background playback
    event.waitUntil(maintainBackgroundPlayback());
  }
  
  if (event.data && event.data.type === 'UPDATE_TRACK') {
    currentTrack = event.data.track;
    console.log('Track updated in service worker:', currentTrack?.title);
  }
  
  if (event.data && event.data.type === 'DISABLE_BACKGROUND_PLAYBACK') {
    isBackgroundPlaybackActive = false;
    console.log('Background playback disabled');
  }
});

// Maintain background playback by keeping the service worker active
async function maintainBackgroundPlayback() {
  while (isBackgroundPlaybackActive) {
    // Send periodic heartbeat to main thread
    try {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'BACKGROUND_HEARTBEAT',
          timestamp: Date.now()
        });
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
    
    // Wait 30 seconds before next heartbeat
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync tasks
  return Promise.resolve();
}

// Prevent service worker from being terminated during audio playback
self.addEventListener('beforeunload', (event) => {
  if (isBackgroundPlaybackActive) {
    console.log('Preventing service worker termination during playback');
    event.preventDefault();
  }
});