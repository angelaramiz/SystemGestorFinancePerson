/**
 * Sistema de Testing Automatizado
 * Framework ligero para pruebas unitarias e integración
 */

class TestFramework {
    constructor() {
        this.tests = [];
        this.suites = new Map();
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0
        };
        this.beforeEachCallbacks = [];
        this.afterEachCallbacks = [];
        this.beforeAllCallbacks = [];
        this.afterAllCallbacks = [];
    }

    /**
     * Definir una suite de tests
     */
    describe(suiteName, callback) {
        const suite = {
            name: suiteName,
            tests: [],
            beforeEach: [],
            afterEach: [],
            beforeAll: [],
            afterAll: []
        };

        this.suites.set(suiteName, suite);
        
        // Contexto temporal para la suite
        const originalBeforeEach = this.beforeEach.bind(this);
        const originalAfterEach = this.afterEach.bind(this);
        const originalBeforeAll = this.beforeAll.bind(this);
        const originalAfterAll = this.afterAll.bind(this);
        const originalTest = this.test.bind(this);

        // Override métodos para capturar en la suite actual
        this.beforeEach = (fn) => suite.beforeEach.push(fn);
        this.afterEach = (fn) => suite.afterEach.push(fn);
        this.beforeAll = (fn) => suite.beforeAll.push(fn);
        this.afterAll = (fn) => suite.afterAll.push(fn);
        this.test = (name, fn, options = {}) => {
            suite.tests.push({
                name,
                fn,
                suite: suiteName,
                skip: options.skip || false,
                timeout: options.timeout || 5000
            });
        };

        // Ejecutar callback de definición
        callback();

        // Restaurar métodos originales
        this.beforeEach = originalBeforeEach;
        this.afterEach = originalAfterEach;
        this.beforeAll = originalBeforeAll;
        this.afterAll = originalAfterAll;
        this.test = originalTest;

        // Agregar tests de la suite al array principal
        this.tests.push(...suite.tests);
    }

    /**
     * Definir un test individual
     */
    test(name, fn, options = {}) {
        this.tests.push({
            name,
            fn,
            suite: 'default',
            skip: options.skip || false,
            timeout: options.timeout || 5000
        });
    }

    /**
     * Callbacks de lifecycle
     */
    beforeEach(fn) { this.beforeEachCallbacks.push(fn); }
    afterEach(fn) { this.afterEachCallbacks.push(fn); }
    beforeAll(fn) { this.beforeAllCallbacks.push(fn); }
    afterAll(fn) { this.afterAllCallbacks.push(fn); }

    /**
     * Ejecutar todos los tests
     */
    async run() {
        console.log('🧪 Iniciando ejecución de tests...\n');
        const startTime = performance.now();

        // Ejecutar beforeAll callbacks
        for (const callback of this.beforeAllCallbacks) {
            await callback();
        }

        // Ejecutar beforeAll de cada suite
        for (const [suiteName, suite] of this.suites.entries()) {
            for (const callback of suite.beforeAll) {
                await callback();
            }
        }

        // Ejecutar tests agrupados por suite
        const suiteNames = ['default', ...Array.from(this.suites.keys())];
        
        for (const suiteName of suiteNames) {
            const suiteTests = this.tests.filter(test => test.suite === suiteName);
            if (suiteTests.length === 0) continue;

            console.log(`📁 Suite: ${suiteName}`);
            
            for (const test of suiteTests) {
                await this.runSingleTest(test, suiteName);
            }
            
            console.log(''); // Línea en blanco entre suites
        }

        // Ejecutar afterAll de cada suite
        for (const [suiteName, suite] of this.suites.entries()) {
            for (const callback of suite.afterAll) {
                await callback();
            }
        }

        // Ejecutar afterAll callbacks
        for (const callback of this.afterAllCallbacks) {
            await callback();
        }

        const endTime = performance.now();
        this.printResults(endTime - startTime);
    }

    /**
     * Ejecutar un test individual
     */
    async runSingleTest(test, suiteName) {
        this.results.total++;

        if (test.skip) {
            console.log(`  ⏭️  ${test.name} (skipped)`);
            this.results.skipped++;
            return;
        }

        const testStartTime = performance.now();

        try {
            // Ejecutar beforeEach callbacks globales
            for (const callback of this.beforeEachCallbacks) {
                await callback();
            }

            // Ejecutar beforeEach de la suite
            const suite = this.suites.get(suiteName);
            if (suite) {
                for (const callback of suite.beforeEach) {
                    await callback();
                }
            }

            // Ejecutar el test con timeout
            await this.executeWithTimeout(test.fn, test.timeout);

            // Ejecutar afterEach de la suite
            if (suite) {
                for (const callback of suite.afterEach) {
                    await callback();
                }
            }

            // Ejecutar afterEach callbacks globales
            for (const callback of this.afterEachCallbacks) {
                await callback();
            }

            const duration = performance.now() - testStartTime;
            console.log(`  ✅ ${test.name} (${duration.toFixed(2)}ms)`);
            this.results.passed++;

        } catch (error) {
            const duration = performance.now() - testStartTime;
            console.log(`  ❌ ${test.name} (${duration.toFixed(2)}ms)`);
            console.log(`     Error: ${error.message}`);
            if (error.stack) {
                console.log(`     Stack: ${error.stack.split('\n')[1]?.trim() || 'N/A'}`);
            }
            this.results.failed++;
        }
    }

    /**
     * Ejecutar función con timeout
     */
    executeWithTimeout(fn, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Test timeout after ${timeout}ms`));
            }, timeout);

            Promise.resolve(fn())
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });
    }

    /**
     * Mostrar resultados finales
     */
    printResults(totalTime) {
        console.log('\n📊 Resultados de los Tests:');
        console.log('='.repeat(40));
        console.log(`✅ Pasados: ${this.results.passed}`);
        console.log(`❌ Fallidos: ${this.results.failed}`);
        console.log(`⏭️  Omitidos: ${this.results.skipped}`);
        console.log(`📊 Total: ${this.results.total}`);
        console.log(`⏱️  Tiempo: ${totalTime.toFixed(2)}ms`);
        
        const successRate = (this.results.passed / (this.results.total - this.results.skipped)) * 100;
        console.log(`📈 Tasa de éxito: ${successRate.toFixed(1)}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 ¡Todos los tests pasaron!');
        } else {
            console.log(`\n⚠️  ${this.results.failed} test(s) fallaron`);
        }
    }

    /**
     * Obtener resultados en formato JSON
     */
    getResults() {
        return {
            ...this.results,
            successRate: (this.results.passed / (this.results.total - this.results.skipped)) * 100
        };
    }
}

/**
 * Funciones de aseveración (assertions)
 */
class Expect {
    constructor(actual) {
        this.actual = actual;
    }

    toBe(expected) {
        if (this.actual !== expected) {
            throw new Error(`Expected ${expected} but got ${this.actual}`);
        }
        return this;
    }

    toEqual(expected) {
        if (JSON.stringify(this.actual) !== JSON.stringify(expected)) {
            throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(this.actual)}`);
        }
        return this;
    }

    toBeNull() {
        if (this.actual !== null) {
            throw new Error(`Expected null but got ${this.actual}`);
        }
        return this;
    }

    toBeUndefined() {
        if (this.actual !== undefined) {
            throw new Error(`Expected undefined but got ${this.actual}`);
        }
        return this;
    }

    toBeTruthy() {
        if (!this.actual) {
            throw new Error(`Expected truthy value but got ${this.actual}`);
        }
        return this;
    }

    toBeFalsy() {
        if (this.actual) {
            throw new Error(`Expected falsy value but got ${this.actual}`);
        }
        return this;
    }

    toThrow(expectedError) {
        if (typeof this.actual !== 'function') {
            throw new Error('Expected a function that throws');
        }
        
        try {
            this.actual();
            throw new Error('Expected function to throw an error');
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(`Expected error containing "${expectedError}" but got "${error.message}"`);
            }
        }
        return this;
    }

    async toResolve() {
        try {
            await this.actual;
        } catch (error) {
            throw new Error(`Expected promise to resolve but it rejected with: ${error.message}`);
        }
        return this;
    }

    async toReject(expectedError) {
        try {
            await this.actual;
            throw new Error('Expected promise to reject but it resolved');
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(`Expected rejection containing "${expectedError}" but got "${error.message}"`);
            }
        }
        return this;
    }

    toHaveLength(length) {
        if (!this.actual || typeof this.actual.length !== 'number') {
            throw new Error('Expected value to have length property');
        }
        if (this.actual.length !== length) {
            throw new Error(`Expected length ${length} but got ${this.actual.length}`);
        }
        return this;
    }

    toBeDefined() {
        if (this.actual === undefined) {
            throw new Error('Expected value to be defined but got undefined');
        }
        return this;
    }

    toHaveProperty(property) {
        if (typeof this.actual !== 'object' || this.actual === null) {
            throw new Error('Expected value to be an object');
        }
        if (!(property in this.actual)) {
            throw new Error(`Expected object to have property '${property}'`);
        }
        return this;
    }

    toContain(item) {
        if (!this.actual || typeof this.actual.includes !== 'function') {
            throw new Error('Expected value to have includes method');
        }
        if (!this.actual.includes(item)) {
            throw new Error(`Expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(item)}`);
        }
        return this;
    }

    toBeGreaterThan(value) {
        if (this.actual <= value) {
            throw new Error(`Expected ${this.actual} to be greater than ${value}`);
        }
        return this;
    }

    toBeLessThan(value) {
        if (this.actual >= value) {
            throw new Error(`Expected ${this.actual} to be less than ${value}`);
        }
        return this;
    }
}

/**
 * Utilidades de testing
 */
class TestUtils {
    /**
     * Crear mock de función
     */
    static createMock(implementation) {
        const mock = implementation || (() => {});
        mock.calls = [];
        mock.results = [];
        
        const mockFn = (...args) => {
            mock.calls.push(args);
            try {
                const result = mock(...args);
                mock.results.push({ type: 'return', value: result });
                return result;
            } catch (error) {
                mock.results.push({ type: 'throw', value: error });
                throw error;
            }
        };
        
        // Copiar propiedades del mock
        Object.assign(mockFn, mock);
        
        // Métodos de utilidad
        mockFn.mockReturnValue = (value) => {
            mockFn.implementation = () => value;
            return mockFn;
        };
        
        mockFn.mockImplementation = (fn) => {
            mockFn.implementation = fn;
            return mockFn;
        };
        
        mockFn.mockResolvedValue = (value) => {
            mockFn.implementation = () => Promise.resolve(value);
            return mockFn;
        };
        
        mockFn.mockRejectedValue = (error) => {
            mockFn.implementation = () => Promise.reject(error);
            return mockFn;
        };
        
        return mockFn;
    }

    /**
     * Simular delay para tests asíncronos
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Crear datos de prueba para ingresos
     */
    static createTestIngreso(overrides = {}) {
        return {
            id: 'test_' + Date.now(),
            descripcion: 'Ingreso de prueba',
            monto: 1000,
            categoria: 'salario',
            fecha: '2024-01-15',
            es_recurrente: false,
            ...overrides
        };
    }

    /**
     * Crear datos de prueba para gastos
     */
    static createTestGasto(overrides = {}) {
        return {
            id: 'test_' + Date.now(),
            descripcion: 'Gasto de prueba',
            monto: 500,
            categoria: 'vivienda',
            fecha: '2024-01-15',
            estado: 'pendiente',
            ...overrides
        };
    }
}

// Crear instancia global del framework
const testFramework = new TestFramework();

// Funciones globales para tests
window.describe = testFramework.describe.bind(testFramework);
window.test = testFramework.test.bind(testFramework);
window.beforeEach = testFramework.beforeEach.bind(testFramework);
window.afterEach = testFramework.afterEach.bind(testFramework);
window.beforeAll = testFramework.beforeAll.bind(testFramework);
window.afterAll = testFramework.afterAll.bind(testFramework);
window.runTests = testFramework.run.bind(testFramework);

// Función expect global
window.expect = (actual) => new Expect(actual);

// Utilidades globales
window.createMock = TestUtils.createMock;
window.delay = TestUtils.delay;
window.createTestIngreso = TestUtils.createTestIngreso;
window.createTestGasto = TestUtils.createTestGasto;

// Exportar para módulos
window.TestFramework = TestFramework;
window.TestUtils = TestUtils;
