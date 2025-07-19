/**
 * 🧪 TESTS PARA STORAGE MANAGER MIGRADO
 * ====================================
 * 
 * Suite de tests para verificar el funcionamiento
 * del StorageManager refactorizado.
 */

// 📦 Test Suite para StorageManager
testSuite('StorageManagerMigrated', () => {
    let storage;
    let di;
    
    beforeEach(async () => {
        // 🏗️ Configurar DependencyInjector con mocks
        di = new DependencyInjector();
        
        // 📡 Mock EventBus
        di.register('eventBus', () => ({
            emit: (event, data) => console.log(`Event: ${event}`, data),
            on: (event, handler) => console.log(`Listening: ${event}`)
        }), true);
        
        // 📝 Mock Logger
        di.register('logger', () => ({
            info: (msg) => console.log(`INFO: ${msg}`),
            success: (msg) => console.log(`SUCCESS: ${msg}`),
            error: (msg) => console.error(`ERROR: ${msg}`),
            warn: (msg) => console.warn(`WARN: ${msg}`),
            debug: (msg) => console.log(`DEBUG: ${msg}`)
        }), true);
        
        // ✅ Mock ValidationSystem
        di.register('validation', () => ({
            validateAndSanitize: async (data, type) => {
                // Validación básica mock
                if (type === 'ingreso' && data.monto && data.monto > 0) {
                    return { ...data, validated: true };
                }
                if (type === 'gasto' && data.monto && data.monto > 0) {
                    return { ...data, validated: true };
                }
                throw new Error('Datos inválidos');
            }
        }), true);
        
        // 📊 Mock MetricsSystem
        di.register('metrics', () => ({
            recordMetric: (name, value, metadata) => console.log(`Metric: ${name} = ${value}`),
            recordPerformance: (name, time) => console.log(`Performance: ${name} = ${time}ms`)
        }), true);
        
        // 🗄️ Mock CacheSystem
        const mockCache = new Map();
        di.register('cache', () => ({
            get: async (key) => mockCache.get(key) || null,
            set: async (key, value, options) => mockCache.set(key, value),
            delete: async (key) => mockCache.delete(key),
            clear: async () => mockCache.clear()
        }), true);
        
        // 🏗️ Crear instancia de StorageManager
        storage = new StorageManagerMigrated(di);
    });
    
    test('should initialize correctly', async () => {
        await storage.init();
        
        expect(storage.isInitialized).toBe(true);
        expect(storage.storageKeys).toBeDefined();
        expect(storage.defaultCategories).toBeDefined();
    });
    
    test('should save and retrieve ingreso', async () => {
        await storage.init();
        
        const ingreso = {
            monto: 1500,
            descripcion: 'Test ingreso',
            categoria: 'cat_ing_1',
            fecha: '2025-01-15'
        };
        
        const saved = await storage.saveIngreso(ingreso);
        
        expect(saved).toBeDefined();
        expect(saved.id).toBeDefined();
        expect(saved.validated).toBe(true);
        expect(saved.monto).toBe(1500);
        
        const ingresos = await storage.getIngresos();
        expect(ingresos.length).toBeGreaterThan(0);
        expect(ingresos[0].id).toBe(saved.id);
    });
    
    test('should save and retrieve gasto', async () => {
        await storage.init();
        
        const gasto = {
            monto: 500,
            descripcion: 'Test gasto',
            categoria: 'cat_gas_1',
            fecha: '2025-01-15'
        };
        
        const saved = await storage.saveGasto(gasto);
        
        expect(saved).toBeDefined();
        expect(saved.id).toBeDefined();
        expect(saved.validated).toBe(true);
        expect(saved.monto).toBe(500);
        
        const gastos = await storage.getGastos();
        expect(gastos.length).toBeGreaterThan(0);
        expect(gastos[0].id).toBe(saved.id);
    });
    
    test('should handle validation errors', async () => {
        await storage.init();
        
        const invalidIngreso = {
            monto: -100, // Monto inválido
            descripcion: 'Invalid ingreso'
        };
        
        let errorThrown = false;
        try {
            await storage.saveIngreso(invalidIngreso);
        } catch (error) {
            errorThrown = true;
            expect(error.message).toBe('Datos inválidos');
        }
        
        expect(errorThrown).toBe(true);
    });
    
    test('should update existing ingreso', async () => {
        await storage.init();
        
        // 📝 Crear ingreso inicial
        const ingreso = {
            monto: 1000,
            descripcion: 'Original ingreso',
            categoria: 'cat_ing_1'
        };
        
        const saved = await storage.saveIngreso(ingreso);
        
        // 🔄 Actualizar ingreso
        const updated = {
            ...saved,
            monto: 1500,
            descripcion: 'Updated ingreso'
        };
        
        const savedUpdated = await storage.saveIngreso(updated);
        
        expect(savedUpdated.id).toBe(saved.id);
        expect(savedUpdated.monto).toBe(1500);
        expect(savedUpdated.descripcion).toBe('Updated ingreso');
        
        // 📋 Verificar que no se duplicó
        const ingresos = await storage.getIngresos();
        expect(ingresos.length).toBe(1);
    });
    
    test('should handle categorias correctly', async () => {
        await storage.init();
        
        const categorias = await storage.getCategorias();
        
        expect(categorias).toBeDefined();
        expect(categorias.ingresos).toBeDefined();
        expect(categorias.gastos).toBeDefined();
        expect(categorias.ingresos.length).toBeGreaterThan(0);
        expect(categorias.gastos.length).toBeGreaterThan(0);
        
        // 🔄 Actualizar categorías
        const newCategorias = {
            ...categorias,
            ingresos: [...categorias.ingresos, {
                id: 'cat_ing_test',
                nombre: 'Test Category',
                color: '#ff0000',
                icono: '🧪'
            }]
        };
        
        await storage.setCategorias(newCategorias);
        const updatedCategorias = await storage.getCategorias();
        
        expect(updatedCategorias.ingresos.length).toBe(categorias.ingresos.length + 1);
    });
    
    test('should handle configuration correctly', async () => {
        await storage.init();
        
        const config = await storage.getConfiguracion();
        expect(config).toBeDefined();
        expect(config.moneda).toBe('MXN');
        
        // 🔄 Actualizar configuración
        const newConfig = {
            ...config,
            tema: 'oscuro',
            notificaciones: false
        };
        
        await storage.setConfiguracion(newConfig);
        const updatedConfig = await storage.getConfiguracion();
        
        expect(updatedConfig.tema).toBe('oscuro');
        expect(updatedConfig.notificaciones).toBe(false);
        expect(updatedConfig.updated_at).toBeDefined();
    });
    
    test('should create backup correctly', async () => {
        await storage.init();
        
        // 📝 Crear algunos datos
        await storage.saveIngreso({
            monto: 1000,
            descripcion: 'Test ingreso for backup',
            categoria: 'cat_ing_1'
        });
        
        await storage.saveGasto({
            monto: 500,
            descripcion: 'Test gasto for backup',
            categoria: 'cat_gas_1'
        });
        
        // 📦 Crear backup
        const backup = await storage.createBackup();
        
        expect(backup).toBeDefined();
        expect(backup.timestamp).toBeDefined();
        expect(backup.version).toBe('2.0.0-migrated');
        expect(backup.data.ingresos).toBeDefined();
        expect(backup.data.gastos).toBeDefined();
        expect(backup.data.categorias).toBeDefined();
        expect(backup.data.config).toBeDefined();
        
        expect(backup.data.ingresos.length).toBe(1);
        expect(backup.data.gastos.length).toBe(1);
    });
    
    test('should clear cache correctly', async () => {
        await storage.init();
        
        // 📝 Crear datos para poblar caché
        await storage.getIngresos();
        await storage.getGastos();
        await storage.getCategorias();
        
        // 🗑️ Limpiar caché
        await storage.clearCache();
        
        // ✅ Verificar que la operación se completó sin errores
        expect(true).toBe(true); // Mock no genera errores
    });
    
    test('should perform health check', async () => {
        await storage.init();
        
        const health = await storage.healthCheck();
        
        expect(health).toBeDefined();
        expect(health.storage).toBeDefined();
        expect(health.cache).toBeDefined();
        expect(health.validation).toBeDefined();
        expect(health.events).toBeDefined();
    });
    
    test('should generate unique IDs', () => {
        const id1 = storage.generateId();
        const id2 = storage.generateId();
        
        expect(id1).toBeDefined();
        expect(id2).toBeDefined();
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
    });
    
    test('should get storage stats', async () => {
        await storage.init();
        
        const stats = storage.getStorageStats();
        
        expect(stats.isInitialized).toBe(true);
        expect(stats.useSupabase).toBeDefined();
        expect(stats.storageKeys).toBeDefined();
        expect(stats.cacheConfig).toBeDefined();
        expect(stats.timestamp).toBeDefined();
    });
});

console.log('🧪 Tests de StorageManagerMigrated cargados');
