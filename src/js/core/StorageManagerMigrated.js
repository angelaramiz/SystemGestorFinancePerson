/**
 * 🔄 STORAGE MANAGER MIGRADO - Fase 2
 * ===================================
 * 
 * StorageManager refactorizado que integra:
 * - ValidationSystem para validación de datos
 * - CacheSystem para optimización de rendimiento
 * - EventBus para comunicación de cambios
 * - MetricsSystem para monitoreo de operaciones
 * 
 * @version 2.0.0-migrated
 * @author Sistema de Gestión Financiera Personal
 */

class StorageManagerMigrated {
    constructor(dependencyInjector) {
        // 🏗️ Inyección de dependencias
        this.di = dependencyInjector;
        this.eventBus = this.di.resolve('eventBus');
        this.logger = this.di.resolve('logger');
        this.validation = this.di.resolve('validation');
        this.metrics = this.di.resolve('metrics');
        this.cache = this.di.resolve('cache');
        
        // 🔧 Configuración
        this.useSupabase = false;
        this.isInitialized = false;
        
        // 🔑 Claves de almacenamiento
        this.storageKeys = {
            ingresos: 'gestor_ingresos',
            gastos: 'gestor_gastos',
            categorias: 'gestor_categorias',
            config: 'gestor_config',
            metadata: 'gestor_metadata'
        };
        
        // 🗄️ Configuración de caché
        this.cacheConfig = {
            ttl: 300000, // 5 minutos
            useMemory: true,
            useLocalStorage: true,
            usePersistent: false
        };
        
        // 📊 Categorías por defecto
        this.defaultCategories = {
            ingresos: [
                { id: 'cat_ing_1', nombre: 'Salario', color: '#10b981', icono: '💼' },
                { id: 'cat_ing_2', nombre: 'Freelance', color: '#3b82f6', icono: '💻' },
                { id: 'cat_ing_3', nombre: 'Inversiones', color: '#8b5cf6', icono: '📈' },
                { id: 'cat_ing_4', nombre: 'Ventas', color: '#f59e0b', icono: '🛒' },
                { id: 'cat_ing_5', nombre: 'Otros', color: '#6b7280', icono: '💰' }
            ],
            gastos: [
                { id: 'cat_gas_1', nombre: 'Vivienda', color: '#ef4444', icono: '🏠' },
                { id: 'cat_gas_2', nombre: 'Alimentación', color: '#f59e0b', icono: '🍽️' },
                { id: 'cat_gas_3', nombre: 'Transporte', color: '#06b6d4', icono: '🚗' },
                { id: 'cat_gas_4', nombre: 'Salud', color: '#ec4899', icono: '🏥' },
                { id: 'cat_gas_5', nombre: 'Entretenimiento', color: '#84cc16', icono: '🎮' },
                { id: 'cat_gas_6', nombre: 'Servicios', color: '#8b5cf6', icono: '💡' },
                { id: 'cat_gas_7', nombre: 'Otros', color: '#6b7280', icono: '💸' }
            ]
        };
    }

    /**
     * 🚀 Inicializar StorageManager migrado
     */
    async init() {
        try {
            this.logger.info('🚀 Inicializando StorageManager migrado...');
            const startTime = performance.now();
            
            // 📊 Registrar inicio de inicialización
            this.metrics.recordMetric('storage.initialization.started', 1);
            
            // 🔧 Configurar sistema de almacenamiento
            await this.setupStorageSystem();
            
            // 📂 Inicializar datos por defecto
            await this.initializeDefaultData();
            
            // 🔄 Configurar sincronización
            this.setupSynchronization();
            
            // 📡 Configurar eventos
            this.setupEventHandlers();
            
            // ✅ Marcar como inicializado
            this.isInitialized = true;
            
            // 📊 Registrar tiempo de inicialización
            const initTime = performance.now() - startTime;
            this.metrics.recordMetric('storage.initialization.completed', 1);
            this.metrics.recordMetric('storage.initialization.time', initTime);
            
            // 🎯 Emitir evento de inicialización
            this.eventBus.emit('storage:initialized', {
                useSupabase: this.useSupabase,
                initTime,
                version: '2.0.0-migrated'
            });
            
            this.logger.success(`✅ StorageManager migrado inicializado en ${initTime.toFixed(2)}ms`);
            return true;
            
        } catch (error) {
            this.logger.error('❌ Error inicializando StorageManager:', error);
            this.metrics.recordMetric('storage.initialization.failed', 1);
            throw error;
        }
    }

    /**
     * 🔧 Configurar sistema de almacenamiento
     */
    async setupStorageSystem() {
        try {
            // 🔍 Verificar disponibilidad de Supabase
            if (typeof window.SupabaseConfig !== 'undefined') {
                this.useSupabase = await this.initializeSupabase();
                if (this.useSupabase) {
                    this.logger.info('📡 Supabase configurado correctamente');
                    this.metrics.recordMetric('storage.supabase.connected', 1);
                } else {
                    this.logger.warn('⚠️ Supabase no disponible, usando localStorage');
                }
            } else {
                this.logger.warn('⚠️ SupabaseConfig no encontrado, usando localStorage');
            }
            
            // 💾 Configurar localStorage como respaldo
            this.initializeLocalStorage();
            this.metrics.recordMetric('storage.localStorage.initialized', 1);
            
        } catch (error) {
            this.logger.error('❌ Error configurando almacenamiento:', error);
            this.useSupabase = false;
            this.initializeLocalStorage();
        }
    }

    /**
     * 📡 Inicializar Supabase
     */
    async initializeSupabase() {
        try {
            if (window.SupabaseConfig.initWithRetry) {
                return await window.SupabaseConfig.initWithRetry();
            } else if (window.SupabaseConfig.init) {
                return window.SupabaseConfig.init();
            }
            return false;
        } catch (error) {
            this.logger.warn('⚠️ Error inicializando Supabase:', error);
            return false;
        }
    }

    /**
     * 💾 Inicializar localStorage
     */
    initializeLocalStorage() {
        // 🔍 Verificar disponibilidad de localStorage
        if (typeof Storage === 'undefined') {
            throw new Error('localStorage no está disponible');
        }
        
        this.logger.debug('💾 Inicializando localStorage');
    }

    /**
     * 📂 Inicializar datos por defecto
     */
    async initializeDefaultData() {
        try {
            // 📊 Categorías por defecto
            const categories = await this.getCategorias();
            if (!categories || Object.keys(categories).length === 0) {
                await this.setCategorias(this.defaultCategories);
                this.logger.info('📊 Categorías por defecto inicializadas');
            }
            
            // ⚙️ Configuración por defecto
            const config = await this.getConfiguracion();
            if (!config) {
                const defaultConfig = {
                    moneda: 'MXN',
                    formato_fecha: 'dd/MM/yyyy',
                    primera_vez: true,
                    tema: 'claro',
                    notificaciones: true,
                    backup_automatico: true,
                    created_at: new Date().toISOString()
                };
                
                await this.setConfiguracion(defaultConfig);
                this.logger.info('⚙️ Configuración por defecto inicializada');
            }
            
        } catch (error) {
            this.logger.error('❌ Error inicializando datos por defecto:', error);
            throw error;
        }
    }

    /**
     * 🔄 Configurar sincronización automática
     */
    setupSynchronization() {
        if (this.useSupabase) {
            // 🕐 Sincronización cada 5 minutos
            setInterval(async () => {
                try {
                    await this.syncWithSupabase();
                } catch (error) {
                    this.logger.error('❌ Error en sincronización automática:', error);
                }
            }, 300000); // 5 minutos
            
            this.logger.info('🔄 Sincronización automática configurada');
        }
    }

    /**
     * 📡 Configurar manejadores de eventos
     */
    setupEventHandlers() {
        // 🔄 Evento de sincronización manual
        this.eventBus.on('storage:sync', async () => {
            if (this.useSupabase) {
                await this.syncWithSupabase();
            }
        });
        
        // 🗑️ Evento de limpieza de caché
        this.eventBus.on('storage:clearCache', async () => {
            await this.clearCache();
        });
        
        // 📊 Evento de backup
        this.eventBus.on('storage:backup', async () => {
            await this.createBackup();
        });
        
        this.logger.debug('📡 Event handlers configurados');
    }

    /**
     * 💾 Guardar ingreso con validación y caché
     */
    async saveIngreso(ingreso) {
        try {
            const startTime = performance.now();
            this.metrics.recordMetric('storage.ingreso.save.started', 1);
            
            // ✅ Validar datos
            const validationResult = await this.validation.validateAndSanitize('ingreso', ingreso);
            
            if (!validationResult.isValid) {
                throw new Error(`Datos inválidos: ${validationResult.errors.join(', ')}`);
            }
            
            const validatedIngreso = validationResult.sanitizedData;
            
            // 🆔 Generar ID si no existe
            if (!validatedIngreso.id) {
                validatedIngreso.id = this.generateId();
            }
            
            // ⏰ Timestamp de modificación
            validatedIngreso.updated_at = new Date().toISOString();
            if (!validatedIngreso.created_at) {
                validatedIngreso.created_at = validatedIngreso.updated_at;
            }
            
            // 💾 Obtener ingresos existentes
            const ingresos = await this.getIngresos();
            
            // 🔍 Verificar si es actualización o nuevo
            const existingIndex = ingresos.findIndex(i => i.id === validatedIngreso.id);
            const isUpdate = existingIndex !== -1;
            
            if (isUpdate) {
                ingresos[existingIndex] = validatedIngreso;
                this.logger.debug(`🔄 Ingreso actualizado: ${validatedIngreso.id}`);
            } else {
                ingresos.push(validatedIngreso);
                this.logger.debug(`➕ Nuevo ingreso: ${validatedIngreso.id}`);
            }
            
            // 💾 Guardar en almacenamiento principal
            await this.saveData('ingresos', ingresos);
            
            // 🗑️ Invalidar caché relacionado
            await this.cache.delete('ingresos_list');
            await this.cache.delete('ingresos_summary');
            await this.cache.delete('financial_overview');
            
            // 📊 Registrar métricas
            const saveTime = performance.now() - startTime;
            this.metrics.recordMetric('storage.ingreso.save.completed', 1);
            this.metrics.recordMetric('storage.ingreso.save.time', saveTime);
            this.metrics.recordMetric(`storage.ingreso.${isUpdate ? 'updated' : 'created'}`, 1);
            
            // 🎯 Emitir eventos
            this.eventBus.emit('storage:ingreso-saved', {
                ingreso: validatedIngreso,
                isUpdate,
                saveTime
            });
            
            this.eventBus.emit('data:changed', {
                type: 'ingreso',
                action: isUpdate ? 'updated' : 'created',
                id: validatedIngreso.id
            });
            
            this.logger.success(`✅ Ingreso guardado: ${validatedIngreso.descripcion || validatedIngreso.id}`);
            return validatedIngreso;
            
        } catch (error) {
            this.logger.error('❌ Error guardando ingreso:', error);
            this.metrics.recordMetric('storage.ingreso.save.failed', 1);
            throw error;
        }
    }

    /**
     * 💸 Guardar gasto con validación y caché
     */
    async saveGasto(gasto) {
        try {
            const startTime = performance.now();
            this.metrics.recordMetric('storage.gasto.save.started', 1);
            
            // ✅ Validar datos
            const validationResult = await this.validation.validateAndSanitize('gasto', gasto);
            
            if (!validationResult.isValid) {
                throw new Error(`Datos inválidos: ${validationResult.errors.join(', ')}`);
            }
            
            const validatedGasto = validationResult.sanitizedData;
            
            // 🆔 Generar ID si no existe
            if (!validatedGasto.id) {
                validatedGasto.id = this.generateId();
            }
            
            // ⏰ Timestamp de modificación
            validatedGasto.updated_at = new Date().toISOString();
            if (!validatedGasto.created_at) {
                validatedGasto.created_at = validatedGasto.updated_at;
            }
            
            // 💾 Obtener gastos existentes
            const gastos = await this.getGastos();
            
            // 🔍 Verificar si es actualización o nuevo
            const existingIndex = gastos.findIndex(g => g.id === validatedGasto.id);
            const isUpdate = existingIndex !== -1;
            
            if (isUpdate) {
                gastos[existingIndex] = validatedGasto;
                this.logger.debug(`🔄 Gasto actualizado: ${validatedGasto.id}`);
            } else {
                gastos.push(validatedGasto);
                this.logger.debug(`➕ Nuevo gasto: ${validatedGasto.id}`);
            }
            
            // 💾 Guardar en almacenamiento principal
            await this.saveData('gastos', gastos);
            
            // 🗑️ Invalidar caché relacionado
            await this.cache.delete('gastos_list');
            await this.cache.delete('gastos_summary');
            await this.cache.delete('financial_overview');
            
            // 📊 Registrar métricas
            const saveTime = performance.now() - startTime;
            this.metrics.recordMetric('storage.gasto.save.completed', 1);
            this.metrics.recordMetric('storage.gasto.save.time', saveTime);
            this.metrics.recordMetric(`storage.gasto.${isUpdate ? 'updated' : 'created'}`, 1);
            
            // 🎯 Emitir eventos
            this.eventBus.emit('storage:gasto-saved', {
                gasto: validatedGasto,
                isUpdate,
                saveTime
            });
            
            this.eventBus.emit('data:changed', {
                type: 'gasto',
                action: isUpdate ? 'updated' : 'created',
                id: validatedGasto.id
            });
            
            this.logger.success(`✅ Gasto guardado: ${validatedGasto.descripcion || validatedGasto.id}`);
            return validatedGasto;
            
        } catch (error) {
            this.logger.error('❌ Error guardando gasto:', error);
            this.metrics.recordMetric('storage.gasto.save.failed', 1);
            throw error;
        }
    }

    /**
     * 📥 Obtener ingresos con caché
     */
    async getIngresos() {
        try {
            const cacheKey = 'ingresos_list';
            
            // 🗄️ Verificar caché primero
            let ingresos = await this.cache.get(cacheKey, this.cacheConfig);
            
            if (ingresos) {
                this.metrics.recordMetric('storage.ingresos.cache_hit', 1);
                return ingresos;
            }
            
            // 📥 Cargar desde almacenamiento
            ingresos = await this.loadData('ingresos') || [];
            
            // 🗄️ Guardar en caché
            await this.cache.set(cacheKey, ingresos, this.cacheConfig);
            
            this.metrics.recordMetric('storage.ingresos.loaded', ingresos.length);
            this.metrics.recordMetric('storage.ingresos.cache_miss', 1);
            
            return ingresos;
            
        } catch (error) {
            this.logger.error('❌ Error obteniendo ingresos:', error);
            this.metrics.recordMetric('storage.ingresos.load.failed', 1);
            return [];
        }
    }

    /**
     * 📥 Obtener gastos con caché
     */
    async getGastos() {
        try {
            const cacheKey = 'gastos_list';
            
            // 🗄️ Verificar caché primero
            let gastos = await this.cache.get(cacheKey, this.cacheConfig);
            
            if (gastos) {
                this.metrics.recordMetric('storage.gastos.cache_hit', 1);
                return gastos;
            }
            
            // 📥 Cargar desde almacenamiento
            gastos = await this.loadData('gastos') || [];
            
            // 🗄️ Guardar en caché
            await this.cache.set(cacheKey, gastos, this.cacheConfig);
            
            this.metrics.recordMetric('storage.gastos.loaded', gastos.length);
            this.metrics.recordMetric('storage.gastos.cache_miss', 1);
            
            return gastos;
            
        } catch (error) {
            this.logger.error('❌ Error obteniendo gastos:', error);
            this.metrics.recordMetric('storage.gastos.load.failed', 1);
            return [];
        }
    }

    /**
     * 📊 Obtener categorías
     */
    async getCategorias() {
        try {
            const cacheKey = 'categorias_list';
            
            // 🗄️ Verificar caché
            let categorias = await this.cache.get(cacheKey, this.cacheConfig);
            
            if (categorias) {
                return categorias;
            }
            
            // 📥 Cargar desde almacenamiento
            categorias = await this.loadData('categorias') || this.defaultCategories;
            
            // 🗄️ Guardar en caché
            await this.cache.set(cacheKey, categorias, this.cacheConfig);
            
            return categorias;
            
        } catch (error) {
            this.logger.error('❌ Error obteniendo categorías:', error);
            return this.defaultCategories;
        }
    }

    /**
     * ⚙️ Obtener configuración
     */
    async getConfiguracion() {
        try {
            const cacheKey = 'config_data';
            
            // 🗄️ Verificar caché
            let config = await this.cache.get(cacheKey, this.cacheConfig);
            
            if (config) {
                return config;
            }
            
            // 📥 Cargar desde almacenamiento
            config = await this.loadData('config');
            
            // 🗄️ Guardar en caché
            if (config) {
                await this.cache.set(cacheKey, config, this.cacheConfig);
            }
            
            return config;
            
        } catch (error) {
            this.logger.error('❌ Error obteniendo configuración:', error);
            return null;
        }
    }

    /**
     * 📊 Guardar categorías
     */
    async setCategorias(categorias) {
        try {
            await this.saveData('categorias', categorias);
            await this.cache.delete('categorias_list');
            
            this.eventBus.emit('storage:categorias-updated', { categorias });
            this.logger.success('✅ Categorías actualizadas');
            
        } catch (error) {
            this.logger.error('❌ Error guardando categorías:', error);
            throw error;
        }
    }

    /**
     * ⚙️ Guardar configuración
     */
    async setConfiguracion(config) {
        try {
            config.updated_at = new Date().toISOString();
            
            await this.saveData('config', config);
            await this.cache.delete('config_data');
            
            this.eventBus.emit('storage:config-updated', { config });
            this.logger.success('✅ Configuración actualizada');
            
        } catch (error) {
            this.logger.error('❌ Error guardando configuración:', error);
            throw error;
        }
    }

    /**
     * 💾 Guardar datos en almacenamiento principal
     */
    async saveData(type, data) {
        try {
            const key = this.storageKeys[type];
            if (!key) {
                throw new Error(`Tipo de dato no válido: ${type}`);
            }
            
            // 💾 Guardar en localStorage
            this.saveToLocalStorage(key, data);
            
            // 📡 Guardar en Supabase si está disponible
            if (this.useSupabase) {
                await this.saveToSupabase(type, data);
            }
            
            this.metrics.recordMetric(`storage.${type}.saved`, 1);
            
        } catch (error) {
            this.logger.error(`❌ Error guardando ${type}:`, error);
            throw error;
        }
    }

    /**
     * 📥 Cargar datos desde almacenamiento
     */
    async loadData(type) {
        try {
            // 📡 Intentar cargar desde Supabase primero
            if (this.useSupabase) {
                try {
                    const supabaseData = await this.loadFromSupabase(type);
                    if (supabaseData) {
                        // 💾 Sincronizar con localStorage
                        this.saveToLocalStorage(this.storageKeys[type], supabaseData);
                        return supabaseData;
                    }
                } catch (error) {
                    this.logger.warn(`⚠️ Error cargando ${type} desde Supabase, usando localStorage`);
                }
            }
            
            // 💾 Cargar desde localStorage
            return this.getFromLocalStorage(this.storageKeys[type]);
            
        } catch (error) {
            this.logger.error(`❌ Error cargando ${type}:`, error);
            return null;
        }
    }

    /**
     * 💾 Guardar en localStorage
     */
    saveToLocalStorage(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            
            this.metrics.recordMetric('storage.localStorage.write', 1);
            
        } catch (error) {
            this.logger.error(`❌ Error guardando en localStorage (${key}):`, error);
            throw error;
        }
    }

    /**
     * 📥 Obtener desde localStorage
     */
    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                this.metrics.recordMetric('storage.localStorage.read', 1);
                return JSON.parse(data);
            }
            return null;
            
        } catch (error) {
            this.logger.error(`❌ Error leyendo localStorage (${key}):`, error);
            return null;
        }
    }

    /**
     * 📡 Guardar en Supabase
     */
    async saveToSupabase(type, data) {
        // TODO: Implementar cuando SupabaseConfig esté disponible
        this.logger.debug(`📡 Guardando ${type} en Supabase (pendiente implementación)`);
    }

    /**
     * 📥 Cargar desde Supabase
     */
    async loadFromSupabase(type) {
        // TODO: Implementar cuando SupabaseConfig esté disponible
        this.logger.debug(`📥 Cargando ${type} desde Supabase (pendiente implementación)`);
        return null;
    }

    /**
     * 🔄 Sincronizar con Supabase
     */
    async syncWithSupabase() {
        if (!this.useSupabase) return;
        
        try {
            this.logger.info('🔄 Iniciando sincronización con Supabase...');
            this.metrics.recordMetric('storage.sync.started', 1);
            
            // TODO: Implementar sincronización bidireccional
            
            this.metrics.recordMetric('storage.sync.completed', 1);
            this.eventBus.emit('storage:sync-completed');
            
        } catch (error) {
            this.logger.error('❌ Error en sincronización:', error);
            this.metrics.recordMetric('storage.sync.failed', 1);
        }
    }

    /**
     * 🗑️ Limpiar caché del storage
     */
    async clearCache() {
        try {
            const cacheKeys = [
                'ingresos_list',
                'gastos_list',
                'categorias_list',
                'config_data',
                'ingresos_summary',
                'gastos_summary',
                'financial_overview'
            ];
            
            for (const key of cacheKeys) {
                await this.cache.delete(key);
            }
            
            this.logger.success('🗑️ Caché de storage limpiado');
            this.eventBus.emit('storage:cache-cleared');
            
        } catch (error) {
            this.logger.error('❌ Error limpiando caché:', error);
        }
    }

    /**
     * 📦 Crear backup de datos
     */
    async createBackup() {
        try {
            this.logger.info('📦 Creando backup de datos...');
            
            const backup = {
                timestamp: new Date().toISOString(),
                version: '2.0.0-migrated',
                data: {
                    ingresos: await this.getIngresos(),
                    gastos: await this.getGastos(),
                    categorias: await this.getCategorias(),
                    config: await this.getConfiguracion()
                }
            };
            
            // 💾 Guardar backup en localStorage
            this.saveToLocalStorage('backup_latest', backup);
            
            this.metrics.recordMetric('storage.backup.created', 1);
            this.eventBus.emit('storage:backup-created', { backup });
            
            this.logger.success('📦 Backup creado correctamente');
            return backup;
            
        } catch (error) {
            this.logger.error('❌ Error creando backup:', error);
            this.metrics.recordMetric('storage.backup.failed', 1);
            throw error;
        }
    }

    /**
     * 🆔 Generar ID único
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 📊 Obtener estadísticas del storage
     */
    getStorageStats() {
        return {
            isInitialized: this.isInitialized,
            useSupabase: this.useSupabase,
            storageKeys: this.storageKeys,
            cacheConfig: this.cacheConfig,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 🔧 Verificar salud del sistema
     */
    async healthCheck() {
        const health = {
            storage: 'unknown',
            cache: 'unknown',
            validation: 'unknown',
            events: 'unknown'
        };
        
        try {
            // 💾 Test localStorage
            const testKey = 'health_check_test';
            this.saveToLocalStorage(testKey, { test: true });
            const testData = this.getFromLocalStorage(testKey);
            localStorage.removeItem(testKey);
            health.storage = testData ? 'healthy' : 'error';
            
            // 🗄️ Test cache
            await this.cache.set('health_test', 'ok', { ttl: 1000 });
            const cacheTest = await this.cache.get('health_test');
            health.cache = cacheTest === 'ok' ? 'healthy' : 'error';
            
            // ✅ Test validation
            try {
                await this.validation.validateAndSanitize('ingreso', { monto: 100 });
                health.validation = 'healthy';
            } catch (e) {
                health.validation = 'error';
            }
            
            // 📡 Test events
            let eventTest = false;
            this.eventBus.on('health:test', () => { eventTest = true; });
            this.eventBus.emit('health:test');
            health.events = eventTest ? 'healthy' : 'error';
            
        } catch (error) {
            this.logger.error('❌ Error en health check:', error);
        }
        
        return health;
    }
}

// 🌍 Hacer disponible globalmente
window.StorageManagerMigrated = StorageManagerMigrated;

// 📤 Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManagerMigrated;
}

console.log('📦 StorageManagerMigrated cargado correctamente');
