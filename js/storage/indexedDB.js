/**
 * Gestión de IndexedDB para datos estructurados
 * Según la especificación: almacenar historial de transacciones, reglas de priorización, 
 * diagramas de flujo y datos críticos con esquema relacional
 */

class IndexedDBManager {
    constructor() {
        this.dbName = 'SistemaGestorFinancieroPersonal';
        this.version = 1;
        this.db = null;
        this.isReady = false;
        
        // Definición de tablas según especificación
        this.stores = {
            ingresos: {
                keyPath: 'id',
                indexes: [
                    { name: 'tipo', keyPath: 'tipo' },
                    { name: 'fecha', keyPath: 'fecha' },
                    { name: 'recurrente', keyPath: 'recurrente' },
                    { name: 'monto', keyPath: 'monto' }
                ]
            },
            gastos: {
                keyPath: 'id',
                indexes: [
                    { name: 'tipo', keyPath: 'tipo' },
                    { name: 'fechaVencimiento', keyPath: 'fechaVencimiento' },
                    { name: 'prioridad', keyPath: 'prioridad' },
                    { name: 'monto', keyPath: 'monto' },
                    { name: 'estado', keyPath: 'estado' }
                ]
            },
            conexiones: {
                keyPath: 'id',
                indexes: [
                    { name: 'ingresoId', keyPath: 'ingresoId' },
                    { name: 'gastoId', keyPath: 'gastoId' },
                    { name: 'estado', keyPath: 'estado' },
                    { name: 'fechaConexion', keyPath: 'fechaConexion' }
                ]
            },
            proyecciones: {
                keyPath: 'id',
                indexes: [
                    { name: 'periodo', keyPath: 'periodo' },
                    { name: 'fechaGeneracion', keyPath: 'fechaGeneracion' },
                    { name: 'tipo', keyPath: 'tipo' }
                ]
            },
            diagramas: {
                keyPath: 'id',
                indexes: [
                    { name: 'nombre', keyPath: 'nombre' },
                    { name: 'fechaCreacion', keyPath: 'fechaCreacion' },
                    { name: 'fechaModificacion', keyPath: 'fechaModificacion' }
                ]
            },
            configuraciones: {
                keyPath: 'clave',
                indexes: [
                    { name: 'categoria', keyPath: 'categoria' },
                    { name: 'fechaModificacion', keyPath: 'fechaModificacion' }
                ]
            }
        };
    }

    async init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB no está soportado en este navegador'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('Error al abrir la base de datos: ' + request.error));
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                console.log('IndexedDB inicializada correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createStores();
            };
        });
    }

    createStores() {
        // Eliminar stores existentes si es una actualización
        for (const storeName of this.db.objectStoreNames) {
            if (Object.keys(this.stores).includes(storeName)) {
                this.db.deleteObjectStore(storeName);
            }
        }

        // Crear nuevos stores
        for (const [storeName, config] of Object.entries(this.stores)) {
            const store = this.db.createObjectStore(storeName, { 
                keyPath: config.keyPath 
            });

            // Crear índices
            if (config.indexes) {
                config.indexes.forEach(index => {
                    store.createIndex(index.name, index.keyPath, { 
                        unique: false 
                    });
                });
            }
        }

        console.log('Stores de IndexedDB creados exitosamente');
    }

    async isInitialized() {
        if (this.isReady) return true;
        
        try {
            await this.init();
            return true;
        } catch (error) {
            console.error('Error al inicializar IndexedDB:', error);
            return false;
        }
    }

    // Métodos CRUD genéricos
    async add(storeName, data) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Asegurar que tenga ID y timestamp
            if (!data.id) {
                data.id = this.generateId();
            }
            data.fechaCreacion = data.fechaCreacion || new Date().toISOString();
            data.fechaModificacion = new Date().toISOString();

            const request = store.add(data);
            
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            data.fechaModificacion = new Date().toISOString();
            
            const request = store.put(data);
            
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAll(storeName) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Métodos específicos para Ingresos
    async agregarIngreso(ingreso) {
        return await this.add('ingresos', ingreso);
    }

    async obtenerIngresos() {
        return await this.getAll('ingresos');
    }

    async obtenerIngresosPorTipo(tipo) {
        return await this.getByIndex('ingresos', 'tipo', tipo);
    }

    async obtenerIngresosRecurrentes() {
        return await this.getByIndex('ingresos', 'recurrente', true);
    }

    // Métodos específicos para Gastos
    async agregarGasto(gasto) {
        return await this.add('gastos', gasto);
    }

    async obtenerGastos() {
        return await this.getAll('gastos');
    }

    async obtenerGastosPorPrioridad(prioridad) {
        return await this.getByIndex('gastos', 'prioridad', prioridad);
    }

    async obtenerGastosVencidos() {
        const gastos = await this.getAll('gastos');
        const hoy = new Date().toISOString().split('T')[0];
        return gastos.filter(gasto => 
            gasto.fechaVencimiento < hoy && gasto.estado !== 'pagado'
        );
    }

    // Métodos específicos para Conexiones
    async agregarConexion(conexion) {
        return await this.add('conexiones', conexion);
    }

    async obtenerConexiones() {
        return await this.getAll('conexiones');
    }

    async obtenerConexionesPorIngreso(ingresoId) {
        return await this.getByIndex('conexiones', 'ingresoId', ingresoId);
    }

    async obtenerConexionesPorGasto(gastoId) {
        return await this.getByIndex('conexiones', 'gastoId', gastoId);
    }

    // Métodos específicos para Proyecciones
    async guardarProyeccion(proyeccion) {
        return await this.add('proyecciones', proyeccion);
    }

    async obtenerProyecciones() {
        return await this.getAll('proyecciones');
    }

    async obtenerProyeccionPorPeriodo(periodo) {
        return await this.getByIndex('proyecciones', 'periodo', periodo);
    }

    // Métodos específicos para Diagramas
    async guardarDiagrama(diagrama) {
        return await this.add('diagramas', diagrama);
    }

    async obtenerDiagramas() {
        return await this.getAll('diagramas');
    }

    // Métodos de búsqueda por índice
    async getByIndex(storeName, indexName, value) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Métodos de consulta avanzada
    async query(storeName, filter = null, limit = null) {
        if (!await this.isInitialized()) throw new Error('DB no inicializada');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.openCursor();
            const results = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const data = cursor.value;
                    
                    // Aplicar filtro si existe
                    if (!filter || filter(data)) {
                        results.push(data);
                        count++;
                    }
                    
                    // Aplicar límite si existe
                    if (limit && count >= limit) {
                        resolve(results);
                        return;
                    }
                    
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    // Métodos de utilidad
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async getStats() {
        const stats = {};
        
        for (const storeName of Object.keys(this.stores)) {
            try {
                const data = await this.getAll(storeName);
                stats[storeName] = data.length;
            } catch (error) {
                stats[storeName] = 0;
            }
        }
        
        return stats;
    }

    async exportData() {
        const data = {};
        
        for (const storeName of Object.keys(this.stores)) {
            try {
                data[storeName] = await this.getAll(storeName);
            } catch (error) {
                console.error(`Error al exportar ${storeName}:`, error);
                data[storeName] = [];
            }
        }
        
        return {
            version: this.version,
            exportDate: new Date().toISOString(),
            data: data
        };
    }

    async importData(importData) {
        if (!importData.data) {
            throw new Error('Formato de datos inválido');
        }

        const results = {};
        
        for (const [storeName, items] of Object.entries(importData.data)) {
            if (!this.stores[storeName]) continue;
            
            try {
                // Limpiar store existente
                await this.deleteAll(storeName);
                
                // Importar nuevos datos
                const imported = [];
                for (const item of items) {
                    const result = await this.add(storeName, item);
                    imported.push(result);
                }
                
                results[storeName] = imported.length;
            } catch (error) {
                console.error(`Error al importar ${storeName}:`, error);
                results[storeName] = 0;
            }
        }
        
        return results;
    }

    // Sincronización con localStorage
    async syncWithLocalStorage() {
        if (!window.localStorageManager) return false;

        try {
            // Guardar configuraciones críticas en IndexedDB
            const config = window.localStorageManager.get('configuracion');
            if (config) {
                await this.update('configuraciones', {
                    clave: 'configuracion_principal',
                    valor: config,
                    categoria: 'sistema'
                });
            }

            // Obtener estadísticas para localStorage
            const stats = await this.getStats();
            window.localStorageManager.setSincronizacion({
                estado: 'sincronizado',
                ultimaSincronizacion: Date.now(),
                estadisticas: stats
            });

            return true;
        } catch (error) {
            console.error('Error en sincronización:', error);
            window.localStorageManager.setSincronizacion({
                estado: 'error',
                ultimoError: error.message
            });
            return false;
        }
    }

    // Método de debug
    async debug() {
        console.group('IndexedDB Debug Info');
        console.log('Base de datos:', this.dbName);
        console.log('Versión:', this.version);
        console.log('Estado:', this.isReady ? 'Inicializada' : 'No inicializada');
        
        if (this.isReady) {
            const stats = await this.getStats();
            console.log('Estadísticas:', stats);
        }
        
        console.groupEnd();
    }
}

// Crear instancia global
window.indexedDBManager = new IndexedDBManager();

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.indexedDBManager.init();
        console.log('IndexedDB iniciada correctamente');
        
        // Sincronizar con localStorage si está disponible
        if (window.localStorageManager) {
            setTimeout(() => {
                window.indexedDBManager.syncWithLocalStorage();
            }, 1000);
        }
    } catch (error) {
        console.error('Error al inicializar IndexedDB:', error);
    }
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexedDBManager;
}
