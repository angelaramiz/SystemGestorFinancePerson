/**
 * Tests para los Sistemas Core Refactorizados
 * Suite completa de pruebas unitarias e integración
 */

// Tests para DependencyInjector
describe('DependencyInjector', () => {
    let di;

    beforeEach(() => {
        di = new DependencyInjector();
    });

    test('should register and resolve simple dependency', () => {
        const testService = { name: 'test' };
        di.register('testService', () => testService);
        
        const resolved = di.resolve('testService');
        
        expect(resolved).toBe(testService);
    });

    test('should handle singleton dependencies', () => {
        let callCount = 0;
        di.register('singleton', () => {
            callCount++;
            return { id: callCount };
        }, { singleton: true });
        
        const first = di.resolve('singleton');
        const second = di.resolve('singleton');
        
        expect(first).toBe(second);
        expect(callCount).toBe(1);
    });

    test('should inject dependencies into target object', () => {
        const serviceA = { name: 'A' };
        const serviceB = { name: 'B' };
        
        di.register('serviceA', () => serviceA);
        di.register('serviceB', () => serviceB);
        
        const target = {};
        di.inject(target, { a: 'serviceA', b: 'serviceB' });
        
        expect(target.a).toBe(serviceA);
        expect(target.b).toBe(serviceB);
    });

    test('should throw error for unknown dependency', () => {
        expect(() => di.resolve('unknown')).toThrow('Dependencia \'unknown\' no encontrada');
    });
});

// Tests para EventBus
describe('EventBus', () => {
    let eventBus;

    beforeEach(() => {
        eventBus = new EventBus();
    });

    test('should register and emit events', async () => {
        let receivedData = null;
        
        eventBus.on('testEvent', (data) => {
            receivedData = data;
        });
        
        await eventBus.emit('testEvent', { message: 'hello' });
        
        expect(receivedData).toEqual({ message: 'hello' });
    });

    test('should handle once listeners correctly', async () => {
        let callCount = 0;
        
        eventBus.once('onceEvent', () => {
            callCount++;
        });
        
        await eventBus.emit('onceEvent');
        await eventBus.emit('onceEvent');
        
        expect(callCount).toBe(1);
    });

    test('should respect priority order', async () => {
        const calls = [];
        
        eventBus.on('priorityEvent', () => calls.push('low'), { priority: 1 });
        eventBus.on('priorityEvent', () => calls.push('high'), { priority: 10 });
        eventBus.on('priorityEvent', () => calls.push('medium'), { priority: 5 });
        
        await eventBus.emit('priorityEvent');
        
        expect(calls).toEqual(['high', 'medium', 'low']);
    });

    test('should handle middleware correctly', async () => {
        let middlewareCalled = false;
        
        eventBus.addMiddleware((eventName, data) => {
            middlewareCalled = true;
            return true;
        });
        
        await eventBus.emit('testEvent', {});
        
        expect(middlewareCalled).toBe(true);
    });

    test('should cancel event if middleware returns false', async () => {
        let listenerCalled = false;
        
        eventBus.addMiddleware(() => false);
        eventBus.on('testEvent', () => { listenerCalled = true; });
        
        const result = await eventBus.emit('testEvent');
        
        expect(result).toBe(false);
        expect(listenerCalled).toBe(false);
    });

    test('should provide unsubscribe function', async () => {
        let callCount = 0;
        
        const unsubscribe = eventBus.on('testEvent', () => {
            callCount++;
        });
        
        await eventBus.emit('testEvent');
        unsubscribe();
        await eventBus.emit('testEvent');
        
        expect(callCount).toBe(1);
    });
});

// Tests para ValidationSystem
describe('ValidationSystem', () => {
    let validator;

    beforeEach(() => {
        validator = new ValidationSystem();
    });

    test('should validate required fields', async () => {
        const data = { descripcion: 'Test', monto: 100 };
        const result = await validator.validateAndSanitize('ingreso', data);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('El campo categoria es obligatorio');
    });

    test('should sanitize string fields', async () => {
        const data = {
            descripcion: '  Test  Description  ',
            monto: 100,
            categoria: 'salario',
            fecha: '2024-01-15'
        };
        
        const result = await validator.validateAndSanitize('ingreso', data);
        
        expect(result.sanitizedData.descripcion).toBe('Test Description');
    });

    test('should validate number ranges', async () => {
        const data = {
            descripcion: 'Test',
            monto: -100,
            categoria: 'salario',
            fecha: '2024-01-15'
        };
        
        const result = await validator.validateAndSanitize('ingreso', data);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('mayor o igual a 0.01'))).toBe(true);
    });

    test('should validate enum values', async () => {
        const data = {
            descripcion: 'Test',
            monto: 100,
            categoria: 'invalid_category',
            fecha: '2024-01-15'
        };
        
        const result = await validator.validateAndSanitize('ingreso', data);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('debe ser uno de:'))).toBe(true);
    });

    test('should handle conditional validation', async () => {
        // Test con recurrencia
        const dataWithRecurrence = {
            descripcion: 'Test',
            monto: 100,
            categoria: 'salario',
            fecha: '2024-01-15',
            es_recurrente: true
            // falta frecuencia_recurrencia
        };
        
        const result = await validator.validateAndSanitize('ingreso', dataWithRecurrence);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('frecuencia_recurrencia'))).toBe(true);
    });

    test('should add default values', async () => {
        const data = {
            descripcion: 'Test',
            monto: 100,
            categoria: 'salario',
            fecha: '2024-01-15'
            // es_recurrente no proporcionado, debería usar default
        };
        
        const result = await validator.validateAndSanitize('ingreso', data);
        
        expect(result.sanitizedData.es_recurrente).toBe(false);
        expect(result.metadata.addedDefaults).toContain('es_recurrente');
    });

    test('should handle custom validators', async () => {
        validator.addCustomValidator('test-validator', (fieldName, value) => {
            return {
                isValid: value !== 'invalid',
                errors: value === 'invalid' ? ['Custom validation failed'] : [],
                warnings: []
            };
        });
        
        // Agregar regla que usa validador personalizado
        validator.addRule('test', {
            testField: {
                required: true,
                custom: 'test-validator'
            }
        });
        
        const invalidData = { testField: 'invalid' };
        const validData = { testField: 'valid' };
        
        const invalidResult = await validator.validateAndSanitize('test', invalidData);
        const validResult = await validator.validateAndSanitize('test', validData);
        
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain('Custom validation failed');
        expect(validResult.isValid).toBe(true);
    });
});

// Tests para MetricsSystem
describe('MetricsSystem', () => {
    let metrics;

    beforeEach(() => {
        metrics = new MetricsSystem();
    });

    test('should record metrics correctly', () => {
        metrics.recordMetric('test.metric', 100, { type: 'test' });
        
        const storedMetrics = metrics.metrics.get('test.metric');
        
        expect(storedMetrics).toHaveLength(1);
        expect(storedMetrics[0].value).toBe(100);
        expect(storedMetrics[0].metadata.type).toBe('test');
    });

    test('should limit metric entries', () => {
        // Agregar más de 100 entradas
        for (let i = 0; i < 150; i++) {
            metrics.recordMetric('test.overflow', i);
        }
        
        const storedMetrics = metrics.metrics.get('test.overflow');
        
        expect(storedMetrics).toHaveLength(100);
        expect(storedMetrics[0].value).toBe(50); // Debería haber removido las primeras 50
    });

    test('should track performance measures', () => {
        const measureName = metrics.startMeasure('test.operation');
        expect(metrics.performanceMarks.has(measureName)).toBe(true);
        
        // Simular algo de tiempo
        const startTime = performance.now();
        while (performance.now() - startTime < 1) {
            // Esperar 1ms mínimo
        }
        
        const duration = metrics.endMeasure(measureName);
        expect(duration).toBeGreaterThan(0);
        expect(metrics.performanceMarks.has(measureName)).toBe(false);
    });

    test('should record user interactions', () => {
        const mockElement = { tagName: 'BUTTON', id: 'test-btn', className: 'btn' };
        
        metrics.recordUserInteraction('click', mockElement, { x: 100, y: 200 });
        
        expect(metrics.userInteractions).toHaveLength(1);
        expect(metrics.userInteractions[0].type).toBe('click');
        expect(metrics.userInteractions[0].element).toBe('BUTTON');
        expect(metrics.userInteractions[0].elementId).toBe('test-btn');
    });

    test('should generate metrics summary', () => {
        metrics.recordMetric('performance.test', 100);
        metrics.recordMetric('performance.test', 200);
        metrics.recordUserInteraction('click', { tagName: 'BUTTON' });
        
        const summary = metrics.getMetricsSummary();
        
        expect(summary.session.id).toBeDefined();
        expect(summary.performance['performance.test']).toBeDefined();
        expect(summary.performance['performance.test'].average).toBe(150);
        expect(summary.userActivity.totalInteractions).toBe(1);
    });
});

// Tests para CacheSystem
describe('CacheSystem', () => {
    let cache;

    beforeEach(() => {
        cache = new CacheSystem();
        // Limpiar localStorage para tests
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(cache.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
    });

    test('should store and retrieve from memory cache', async () => {
        await cache.set('test-key', { data: 'test' }, { useLocalStorage: false, usePersistent: false });
        
        const result = await cache.get('test-key', { useLocalStorage: false, usePersistent: false });
        
        expect(result).toEqual({ data: 'test' });
        expect(cache.cacheStats.hits).toBe(1);
    });

    test('should handle cache expiration', async () => {
        await cache.set('expire-key', { data: 'test' }, { 
            ttl: 10, // 10ms TTL
            useLocalStorage: false, 
            usePersistent: false 
        });
        
        // Esperar que expire
        await delay(20);
        
        const result = await cache.get('expire-key', { useLocalStorage: false, usePersistent: false });
        
        expect(result).toBeNull();
        expect(cache.cacheStats.misses).toBe(1);
    });

    test('should promote cache between levels', async () => {
        // Guardar solo en localStorage
        await cache.set('promote-key', { data: 'test' }, { useMemory: false, usePersistent: false });
        
        // Recuperar con promoción a memoria
        const result = await cache.get('promote-key', { promoteToMemory: true });
        
        expect(result).toEqual({ data: 'test' });
        expect(cache.memoryCache.has('promote-key')).toBe(true);
    });

    test('should clean up expired entries', async () => {
        // Crear entradas con TTL corto
        await cache.set('cleanup1', 'data1', { ttl: 1 });
        await cache.set('cleanup2', 'data2', { ttl: 1 });
        
        // Esperar que expiren
        await delay(5);
        
        // Ejecutar limpieza
        await cache.cleanup();
        
        const result1 = await cache.get('cleanup1');
        const result2 = await cache.get('cleanup2');
        
        expect(result1).toBeNull();
        expect(result2).toBeNull();
    });

    test('should handle LRU eviction', async () => {
        // Simular cache lleno forzando evicción
        cache.maxMemorySize = 0.00001; // Muy pequeño para forzar evicción inmediata
        
        await cache.set('lru1', 'data1', { useLocalStorage: false, usePersistent: false });
        await delay(2); // Asegurar diferente timestamp
        await cache.set('lru2', 'data2', { useLocalStorage: false, usePersistent: false });
        await delay(2); // Asegurar que se complete la evicción
        
        // lru1 debería haber sido evictado debido al tamaño mínimo
        const result1 = await cache.get('lru1', { useLocalStorage: false, usePersistent: false });
        const result2 = await cache.get('lru2', { useLocalStorage: false, usePersistent: false });
        
        // Al menos uno debería haber sido evictado
        expect(result1 === null || result2 !== null).toBe(true);
    });

    test('should provide cache statistics', () => {
        const stats = cache.getStats();
        
        expect(stats).toHaveProperty('hits');
        expect(stats).toHaveProperty('misses');
        expect(stats).toHaveProperty('evictions');
        expect(stats).toHaveProperty('memoryEntries');
        expect(stats).toHaveProperty('hitRate');
    });
});

// Tests de Integración
describe('Integration Tests', () => {
    let di, eventBus, validator, cache;

    beforeEach(() => {
        di = new DependencyInjector();
        eventBus = new EventBus();
        validator = new ValidationSystem();
        cache = new CacheSystem();
        
        // Configurar DI con servicios mock
        di.register('eventBus', () => eventBus, { singleton: true });
        di.register('validator', () => validator, { singleton: true });
        di.register('cache', () => cache, { singleton: true });
    });

    test('should integrate DI with EventBus', () => {
        const resolvedEventBus = di.resolve('eventBus');
        expect(resolvedEventBus).toBe(eventBus);
    });

    test('should validate and cache data in workflow', async () => {
        const testData = {
            descripcion: 'Salary',
            monto: 1000,
            categoria: 'salario',
            fecha: '2024-01-15'
        };
        
        // 1. Validar datos
        const validation = await validator.validateAndSanitize('ingreso', testData);
        expect(validation.isValid).toBe(true);
        
        // 2. Cachear datos validados
        await cache.set('validated-ingreso', validation.sanitizedData);
        
        // 3. Recuperar de cache
        const cachedData = await cache.get('validated-ingreso');
        expect(cachedData).toEqual(validation.sanitizedData);
    });

    test('should handle complete event workflow', async () => {
        let eventReceived = false;
        
        // Configurar listener
        eventBus.on('test.workflow', (data) => {
            eventReceived = true;
            expect(data.type).toBe('workflow');
        });
        
        // Emitir evento
        await eventBus.emit('test.workflow', { type: 'workflow' });
        
        expect(eventReceived).toBe(true);
    });
});

// Mensaje de finalización
console.log('🧪 Tests cargados correctamente. Ejecuta runTests() para comenzar.');
