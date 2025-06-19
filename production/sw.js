/**
 * Service Worker para Sistema de Gestión Financiera Personal
 * Versión: 1.0.0
 * Proporciona funcionalidad offline y cacheo para PWA
 */

const CACHE_NAME = 'sistema-financiero-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DATA_CACHE = 'data-v1';

// Archivos a cachear para funcionamiento offline
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/ventanas.css',
    '/assets/js/app.min.js',
    '/manifest.json',
    // External dependencies
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.5/main.min.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.5/main.min.css',
    'https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.js',
    'https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.css'
];

// URLs de API/datos para cache dinámico
const DATA_URLS = [
    '/api/',
    '/data/'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[ServiceWorker] Pre-cacheando archivos estáticos');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Error durante la instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activando...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((thisCacheName) => {
                    // Eliminar caches antiguos
                    if (thisCacheName !== STATIC_CACHE && thisCacheName !== DATA_CACHE) {
                        console.log('[ServiceWorker] Eliminando cache antiguo:', thisCacheName);
                        return caches.delete(thisCacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Activación completada');
            return self.clients.claim();
        })
    );
});

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
    const requestURL = new URL(event.request.url);
    
    // Estrategias de cache según el tipo de recurso
    if (event.request.destination === 'document') {
        // HTML: Network First, fallback to cache
        event.respondWith(networkFirstStrategy(event.request));
    } else if (requestURL.pathname.startsWith('/api/') || DATA_URLS.some(url => requestURL.pathname.startsWith(url))) {
        // API/Data: Network First con cache de respaldo
        event.respondWith(networkFirstDataStrategy(event.request));
    } else if (event.request.destination === 'image') {
        // Imágenes: Cache First
        event.respondWith(cacheFirstStrategy(event.request));
    } else {
        // Otros recursos estáticos: Stale While Revalidate
        event.respondWith(staleWhileRevalidateStrategy(event.request));
    }
});

// Estrategia Network First
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Network first fallback to cache:', request.url);
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline - Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Network First para datos
async function networkFirstDataStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(DATA_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Data network first fallback to cache:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Respuesta offline para datos
        return new Response(JSON.stringify({
            offline: true,
            message: 'Datos no disponibles offline',
            timestamp: Date.now()
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
        });
    }
}

// Estrategia Cache First
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Cache first network error:', request.url);
        return new Response('Offline - Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        const cache = caches.open(STATIC_CACHE);
        cache.then(c => c.put(request, networkResponse.clone()));
        return networkResponse;
    }).catch(() => {
        console.log('[ServiceWorker] Stale while revalidate network error:', request.url);
    });
    
    return cachedResponse || fetchPromise;
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            type: 'VERSION_RESPONSE'
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({
                success: true,
                type: 'CACHE_CLEARED'
            });
        });
    }
});

// Manejo de sincronización en background
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'background-data-sync') {
        event.waitUntil(doBackgroundDataSync());
    }
    
    if (event.tag === 'backup-data') {
        event.waitUntil(doBackupSync());
    }
});

// Sincronización de datos en background
async function doBackgroundDataSync() {
    try {
        console.log('[ServiceWorker] Ejecutando sincronización de datos en background');
        
        // Aquí iría la lógica de sincronización con el servidor
        // Por ejemplo, subir datos pendientes, descargar actualizaciones, etc.
        
        // Notificar al cliente que la sincronización fue exitosa
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                success: true,
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('[ServiceWorker] Error en sincronización:', error);
    }
}

// Backup de datos
async function doBackupSync() {
    try {
        console.log('[ServiceWorker] Ejecutando backup de datos');
        
        // Lógica de backup
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKUP_COMPLETE',
                success: true,
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('[ServiceWorker] Error en backup:', error);
    }
}

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push recibido:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Notificación del Sistema Financiero',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver detalles',
                icon: '/icon-check.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Sistema Financiero', options)
    );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification click:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[ServiceWorker] Service Worker cargado y listo');
