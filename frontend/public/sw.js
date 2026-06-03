const CACHE_NAME = 'game-center-v1'

const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/pos',
  '/billing',
  '/units',
  '/members',
]

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache))
        return response
      }).catch(() => {
        // Offline fallback
        return caches.match('/')
      })
    })
  )
})

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  )
})

export {}
