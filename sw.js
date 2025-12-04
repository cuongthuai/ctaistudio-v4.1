const CACHE_NAME = 'ctai-studio-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://i.postimg.cc/1RjHYzzS/Logo-Photoroom.png',
  'https://i.pinimg.com/736x/ff/70/f7/ff70f7276c6feb63debbc98bad993489.jpg',
  'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1a8fd38f-b2e9-4931-9a9c-c26a2dd4d3a5/original=true,quality=90/85f88a24af726c42ad1f95f380c4da10ebc18c45ef0ff0a25991e32d2a87fa9a.jpeg',
  'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/52a00a82-0d85-44fa-a367-24412fcb9512/anim=false,width=450,optimized=true/460bc4a70567da20d82365cf02c5e9b3251552ebb7b3101a0b229529975503f6.jpeg',
  'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/fb903b68-7ad2-4519-866d-56d8ef8f17e0/anim=false,width=450,optimized=true/2098526-58cde6739ce51447483a2480.jpeg',
  'https://i.pinimg.com/736x/c2/f8/fd/c2f8fdf5ab12e38164fd635882817dc3.jpg',
  'https://i.pinimg.com/736x/1c/16/45/1c16456d213688be2c34a422bab08624.jpg',
  'https://i.pinimg.com/1200x/a6/ce/e6/a6cee607734b85e19a9f252eb2c7d405.jpg',
  'https://i.pinimg.com/736x/63/0f/40/630f407d688aef2d92dd8cc01017a319.jpg',
  'https://i.pinimg.com/736x/10/61/4b/10614be47ed494fabebd89abfcb0a0ab.jpg',
  'https://www.ctai.vn/wp-content/uploads/2025/11/cropped-Logo.jpg',
  'https://i.pinimg.com/1200x/26/48/5f/26485fdd6298ff0deb5c3f5c676d6087.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE).catch(error => {
          console.error('Failed to cache one or more resources during install:', error);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response because it's a stream and can be consumed only once.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.log('Fetch failed; the device is likely offline.', error);
            // If the request fails (e.g., offline) and it's not in the cache,
            // the browser will show its default offline error page.
            // For a more advanced PWA, you might return a custom offline page here.
        });
      })
  );
});