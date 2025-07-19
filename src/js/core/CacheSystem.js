/**
 * Sistema de Cache Inteligente Multi-Nivel
 * Maneja cache en memoria, localStorage e IndexedDB con estrategias TTL
 */

class CacheSystem {
    constructor() {
        this.memoryCache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        this.maxMemorySize = 50; // MB
        this.defaultTTL = 1000 * 60 * 30; // 30 minutos
        this.storagePrefix = 'financiero_cache_';
        
        this.initIndexedDB();
        this.setupCleanupInterval();
    }

    /**
     * Inicializar IndexedDB para cache persistente
     */
    async initIndexedDB() {
        try {
            this.db = await this.openIndexedDB();
        } catch (error) {
            console.warn('IndexedDB no disponible para cache:', error);
            this.db = null;
        }
    }

    /**
     * Abrir base de datos IndexedDB
     */
    openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FinancieroCacheDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'key' });
                    store.createIndex('expiresAt', 'expiresAt', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                }
            };
        });
    }

    /**
     * Configurar limpieza automática de cache expirado
     */
    setupCleanupInterval() {
        // Limpiar cada 10 minutos
        setInterval(() => {
            this.cleanup();
        }, 1000 * 60 * 10);
    }

    /**
     * Almacenar en cache con múltiples niveles
     */
    async set(key, value, options = {}) {
        const cacheEntry = this.createCacheEntry(key, value, options);
        
        try {
            // 1. Memoria (más rápido)
            if (options.useMemory !== false) {
                this.setMemoryCache(key, cacheEntry);
            }

            // 2. localStorage (medio)
            if (options.useLocalStorage !== false) {
                this.setLocalStorageCache(key, cacheEntry);
            }

            // 3. IndexedDB (persistente)
            if (options.usePersistent !== false && this.db) {
                await this.setIndexedDBCache(key, cacheEntry);
            }

            window.EventBus?.emit('cache:item-set', { key, options });
            
        } catch (error) {
            console.error('Error al almacenar en cache:', error);
            throw new CacheError(`Failed to cache item: ${error.message}`);
        }
    }

    /**
     * Obtener de cache con estrategia de fallback
     */
    async get(key, options = {}) {
        const startTime = performance.now();
        let result = null;
        let source = null;

        try {
            // 1. Intentar memoria primero
            if (options.preferMemory !== false) {
                result = this.getMemoryCache(key);
                if (result) {
                    source = 'memory';
                }
            }

            // 2. Fallback a localStorage
            if (!result && options.useLocalStorage !== false) {
                result = this.getLocalStorageCache(key);
                if (result) {
                    source = 'localStorage';
                    // Promover a memoria si está configurado
                    if (options.promoteToMemory !== false) {
                        this.setMemoryCache(key, result);
                    }
                }
            }

            // 3. Fallback a IndexedDB
            if (!result && options.usePersistent !== false && this.db) {
                result = await this.getIndexedDBCache(key);
                if (result) {
                    source = 'indexedDB';
                    // Promover a niveles superiores si está configurado
                    if (options.promoteToMemory !== false) {
                        this.setMemoryCache(key, result);
                    }
                    if (options.promoteToLocalStorage !== false) {
                        this.setLocalStorageCache(key, result);
                    }
                }
            }

            const duration = performance.now() - startTime;

            if (result) {
                this.cacheStats.hits++;
                window.MetricsSystem?.recordMetric('cache.hit', duration, { source, key });
                
                // Verificar si no ha expirado
                if (this.isExpired(result)) {
                    await this.delete(key);
                    this.cacheStats.misses++;
                    return null;
                }
                
                return result.value;
            } else {
                this.cacheStats.misses++;
                window.MetricsSystem?.recordMetric('cache.miss', duration, { key });
                return null;
            }

        } catch (error) {
            console.error('Error al obtener de cache:', error);
            this.cacheStats.misses++;
            return null;
        }
    }

    /**
     * Crear entrada de cache con metadatos
     */
    createCacheEntry(key, value, options) {
        const now = Date.now();
        const ttl = options.ttl || this.defaultTTL;
        
        return {
            key,
            value,
            createdAt: now,
            expiresAt: now + ttl,
            accessCount: 0,
            lastAccessed: now,
            size: this.calculateSize(value),
            category: options.category || 'default',
            metadata: options.metadata || {}
        };
    }

    /**
     * Cache en memoria con LRU
     */
    setMemoryCache(key, entry) {
        // Verificar límite de memoria
        if (this.getMemoryCacheSize() > this.maxMemorySize * 1024 * 1024) {
            this.evictLRU();
        }
        
        this.memoryCache.set(key, entry);
    }

    /**
     * Obtener de cache en memoria
     */
    getMemoryCache(key) {
        const entry = this.memoryCache.get(key);
        if (entry) {
            entry.lastAccessed = Date.now();
            entry.accessCount++;
        }
        return entry;
    }

    /**
     * Cache en localStorage
     */
    setLocalStorageCache(key, entry) {
        try {
            const storageKey = this.storagePrefix + key;
            localStorage.setItem(storageKey, JSON.stringify(entry));
        } catch (error) {
            // Storage lleno - limpiar entradas antiguas
            this.cleanupLocalStorage();
            try {
                localStorage.setItem(storageKey, JSON.stringify(entry));
            } catch (retryError) {
                console.warn('localStorage lleno, no se puede cachear:', key);
            }
        }
    }

    /**
     * Obtener de localStorage
     */
    getLocalStorageCache(key) {
        try {
            const storageKey = this.storagePrefix + key;
            const item = localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('Error al obtener de localStorage:', error);
            return null;
        }
    }

    /**
     * Cache en IndexedDB
     */
    async setIndexedDBCache(key, entry) {
        if (!this.db) return;

        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        await new Promise((resolve, reject) => {
            const request = store.put(entry);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Obtener de IndexedDB
     */
    async getIndexedDBCache(key) {
        if (!this.db) return null;

        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    result.lastAccessed = Date.now();
                    result.accessCount++;
                    // Actualizar estadísticas de acceso
                    this.setIndexedDBCache(key, result).catch(console.warn);
                }
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Eliminar entrada de cache
     */
    async delete(key) {
        // Eliminar de memoria
        this.memoryCache.delete(key);
        
        // Eliminar de localStorage
        try {
            localStorage.removeItem(this.storagePrefix + key);
        } catch (error) {
            console.warn('Error al eliminar de localStorage:', error);
        }
        
        // Eliminar de IndexedDB
        if (this.db) {
            try {
                const transaction = this.db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                store.delete(key);
            } catch (error) {
                console.warn('Error al eliminar de IndexedDB:', error);
            }
        }
    }

    /**
     * Limpiar cache expirado
     */
    async cleanup() {
        const now = Date.now();
        const keysToDelete = [];

        // Limpiar memoria
        for (const [key, entry] of this.memoryCache.entries()) {
            if (this.isExpired(entry)) {
                keysToDelete.push(key);
            }
        }

        // Limpiar localStorage
        this.cleanupLocalStorage();

        // Limpiar IndexedDB
        if (this.db) {
            await this.cleanupIndexedDB();
        }

        // Eliminar claves identificadas
        for (const key of keysToDelete) {
            this.memoryCache.delete(key);
            this.cacheStats.evictions++;
        }

        window.MetricsSystem?.recordMetric('cache.cleanup', keysToDelete.length);
    }

    /**
     * Limpiar localStorage
     */
    cleanupLocalStorage() {
        const keysToDelete = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.storagePrefix)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (this.isExpired(item)) {
                        keysToDelete.push(key);
                    }
                } catch (error) {
                    // Item corrupto, eliminarlo
                    keysToDelete.push(key);
                }
            }
        }

        keysToDelete.forEach(key => {
            localStorage.removeItem(key);
            this.cacheStats.evictions++;
        });
    }

    /**
     * Limpiar IndexedDB
     */
    async cleanupIndexedDB() {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const index = store.index('expiresAt');
        
        const range = IDBKeyRange.upperBound(Date.now());
        const request = index.openCursor(range);
        
        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    this.cacheStats.evictions++;
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        });
    }

    /**
     * Verificar si una entrada ha expirado
     */
    isExpired(entry) {
        return entry.expiresAt < Date.now();
    }

    /**
     * Calcular tamaño aproximado de un objeto
     */
    calculateSize(obj) {
        try {
            return JSON.stringify(obj).length * 2; // Aproximación en bytes
        } catch (error) {
            return 0;
        }
    }

    /**
     * Obtener tamaño total del cache en memoria
     */
    getMemoryCacheSize() {
        let totalSize = 0;
        for (const entry of this.memoryCache.values()) {
            totalSize += entry.size || 0;
        }
        return totalSize;
    }

    /**
     * Evicción LRU (Least Recently Used)
     */
    evictLRU() {
        let oldestEntry = null;
        let oldestKey = null;
        
        for (const [key, entry] of this.memoryCache.entries()) {
            if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
                oldestEntry = entry;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
            this.cacheStats.evictions++;
        }
    }

    /**
     * Obtener estadísticas del cache
     */
    getStats() {
        return {
            ...this.cacheStats,
            memoryEntries: this.memoryCache.size,
            memorySizeBytes: this.getMemoryCacheSize(),
            hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100,
            localStorageEntries: this.getLocalStorageEntriesCount(),
            indexedDBAvailable: !!this.db
        };
    }

    /**
     * Contar entradas en localStorage
     */
    getLocalStorageEntriesCount() {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.storagePrefix)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Limpiar todo el cache
     */
    async clear() {
        // Limpiar memoria
        this.memoryCache.clear();
        
        // Limpiar localStorage
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.storagePrefix)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => localStorage.removeItem(key));
        
        // Limpiar IndexedDB
        if (this.db) {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            store.clear();
        }
        
        // Resetear estadísticas
        this.cacheStats = { hits: 0, misses: 0, evictions: 0 };
    }
}

// Error personalizado para el sistema de cache
class CacheError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CacheError';
    }
}

// Crear instancia global
window.CacheSystem = new CacheSystem();
