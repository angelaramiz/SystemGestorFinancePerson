/**
 * Service Worker para Gestor Financiero Personal - México 🇲🇽
 * Versión optimizada sin logs para producción
 */

const CACHE_NAME = 'gestor-financiero-mx-v2.1.0';
const urlsToCache = [
    './index.html',
    './src/css/main.css',
    './src/js/app.js',
    './src/js/utils/logger.js',
    './src/js/utils/configuracion-mexico.js',
    './src/js/modules/supabase-config.js',
    './src/js/modules/storage.js',
    './src/js/modules/calendar-ingresos.js',
    './src/js/modules/calendar-gastos.js',
    './src/js/modules/consultas.js',
    './src/js/modules/modals.js',
    './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                try {
                    // Cachear archivos uno por uno
                    for (const url of urlsToCache) {
                        try {
                            await cache.add(url);
                        } catch (error) {
                            // Silencioso en producción
                        }
                    }
                } catch (error) {
                    // Silencioso en producción
                }
            })
    );
    
    self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Estrategia de caché: Network First con fallback a caché
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    if (event.request.url.includes('extension://') || 
        event.request.url.includes('chrome://') ||
        event.request.url.includes('moz-extension://')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        return new Response('Recurso no disponible offline', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });
            })
    );
});

// Mensaje del cliente para forzar actualización
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
