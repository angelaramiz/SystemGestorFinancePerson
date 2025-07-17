/**
 * Service Worker para Gestor Financiero Personal
 * Permite funcionalidad offline y mejora el rendimiento
 */

const CACHE_NAME = 'gestor-financiero-v2.0.1';
const urlsToCache = [
    '/index-new.html',
    '/src/css/main.css',
    '/src/js/app.js',
    '/src/js/modules/supabase-config.js',
    '/src/js/modules/storage.js',
    '/src/js/modules/calendar-ingresos.js',
    '/src/js/modules/calendar-gastos.js',
    '/src/js/modules/consultas.js',
    '/src/js/modules/modals.js',
    '/manifest.json',
    // CDN resources (external)
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/locales/es.global.min.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/locales/es.global.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Evento de instalación
self.addEventListener('install', (event) => {
    console.log('💾 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando archivos...');
                // Cachear solo los archivos locales primero
                const localFiles = urlsToCache.filter(url => !url.startsWith('http'));
                return cache.addAll(localFiles);
            })
            .catch((error) => {
                console.error('❌ Error al cachear archivos:', error);
            })
    );
    
    // Forzar activación inmediata
    self.skipWaiting();
});

// Evento de activación
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eliminar caches antiguos
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Tomar control inmediatamente
    self.clients.claim();
});

// Evento de fetch (interceptar peticiones)
self.addEventListener('fetch', (event) => {
    // Solo manejar peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ignorar peticiones a APIs externas excepto CDN
    if (event.request.url.includes('supabase.co') || 
        event.request.url.includes('chrome-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si encontramos en cache, devolver
                if (response) {
                    return response;
                }
                
                // Si no, hacer fetch y cachear
                return fetch(event.request)
                    .then((response) => {
                        // Verificar que la respuesta es válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Solo cachear recursos de nuestra app
                        if (event.request.url.includes(self.location.origin)) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        
                        return response;
                    })
                    .catch(() => {
                        // Si falla y es una página HTML, mostrar página offline
                        if (event.request.destination === 'document') {
                            return new Response(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Sin conexión - Gestor Financiero</title>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            min-height: 100vh;
                                            margin: 0;
                                            background: #f8fafc;
                                            color: #1e293b;
                                        }
                                        .offline-container {
                                            text-align: center;
                                            padding: 2rem;
                                            max-width: 400px;
                                        }
                                        .offline-icon {
                                            font-size: 4rem;
                                            margin-bottom: 1rem;
                                        }
                                        .btn {
                                            background: #2563eb;
                                            color: white;
                                            border: none;
                                            padding: 0.75rem 1.5rem;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            margin-top: 1rem;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="offline-container">
                                        <div class="offline-icon">📱</div>
                                        <h1>Sin conexión</h1>
                                        <p>No hay conexión a internet. Los datos se guardan localmente y se sincronizarán cuando vuelvas a estar online.</p>
                                        <button class="btn" onclick="window.location.reload()">
                                            🔄 Reintentar
                                        </button>
                                    </div>
                                </body>
                                </html>
                            `, {
                                headers: { 'Content-Type': 'text/html' }
                            });
                        }
                    });
            })
    );
});

// Mensaje del Service Worker
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker: Cargado correctamente');
