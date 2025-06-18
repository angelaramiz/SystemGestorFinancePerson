/**
 * Archivo de configuración y utilidades para las pruebas
 */

// Simulación de entorno de navegador para las pruebas
class MockStorage {
    constructor() {
        this.data = {};
    }
    
    getItem(key) {
        return this.data[key] || null;
    }
    
    setItem(key, value) {
        this.data[key] = value;
    }
    
    removeItem(key) {
        delete this.data[key];
    }
    
    clear() {
        this.data = {};
    }
}

class MockIndexedDB {
    constructor() {
        this.stores = {
            ingresos: [],
            gastos: [],
            conexiones: [],
            proyecciones: [],
            diagramas: [],
            configuraciones: []
        };
    }
    
    async init() {
        return true;
    }
    
    async guardar(store, data) {
        if (!this.stores[store]) {
            this.stores[store] = [];
        }
        
        const existingIndex = this.stores[store].findIndex(item => item.id === data.id);
        if (existingIndex >= 0) {
            this.stores[store][existingIndex] = data;
        } else {
            this.stores[store].push(data);
        }
        
        return data;
    }
    
    async obtener(store, id) {
        if (!this.stores[store]) return null;
        return this.stores[store].find(item => item.id === id) || null;
    }
    
    async obtenerTodos(store) {
        return this.stores[store] || [];
    }
    
    async eliminar(store, id) {
        if (!this.stores[store]) return false;
        const index = this.stores[store].findIndex(item => item.id === id);
        if (index >= 0) {
            this.stores[store].splice(index, 1);
            return true;
        }
        return false;
    }
    
    async actualizar(store, data) {
        return await this.guardar(store, data);
    }
    
    async limpiar(store) {
        this.stores[store] = [];
    }
}

class MockNotificaciones {
    constructor() {
        this.notificaciones = [];
    }
    
    mostrar(mensaje, tipo = 'info') {
        this.notificaciones.push({ mensaje, tipo, fecha: new Date() });
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }
    
    obtenerHistorial() {
        return this.notificaciones;
    }
    
    limpiar() {
        this.notificaciones = [];
    }
}

// Función para crear datos de prueba
function crearDatosPrueba() {
    const ingresos = [
        {
            id: 'ingreso-test-1',
            fuente: 'Salario Principal',
            monto: 50000,
            fecha: '2025-06-15',
            recurrente: true,
            frecuencia: 'mensual',
            estado: 'activo'
        },
        {
            id: 'ingreso-test-2',
            fuente: 'Freelance',
            monto: 15000,
            fecha: '2025-06-20',
            recurrente: false,
            estado: 'activo'
        }
    ];
    
    const gastos = [
        {
            id: 'gasto-test-1',
            nombre: 'Hipoteca',
            monto: 20000,
            fechaVencimiento: '2025-06-30',
            prioridad: 'alta',
            estado: 'pendiente',
            recurrente: true
        },
        {
            id: 'gasto-test-2',
            nombre: 'Supermercado',
            monto: 8000,
            fechaVencimiento: '2025-06-25',
            prioridad: 'media',
            estado: 'pendiente',
            recurrente: false
        },
        {
            id: 'gasto-test-3',
            nombre: 'Entretenimiento',
            monto: 5000,
            fechaVencimiento: '2025-07-05',
            prioridad: 'baja',
            estado: 'pendiente',
            recurrente: false
        }
    ];
    
    return { ingresos, gastos };
}

// Función para configurar entorno de pruebas
function configurarEntornoPruebas() {
    // Simular localStorage
    global.localStorage = new MockStorage();
    
    // Simular IndexedDB
    global.mockIndexedDB = new MockIndexedDB();
    
    // Simular notificaciones
    global.mockNotificaciones = new MockNotificaciones();
    
    // Simular Date actual para pruebas consistentes
    const fechaFija = new Date('2025-06-18T10:00:00Z');
    global.Date = class extends Date {
        constructor(...args) {
            if (args.length === 0) {
                super(fechaFija);
            } else {
                super(...args);
            }
        }
        
        static now() {
            return fechaFija.getTime();
        }
    };
    
    return {
        localStorage: global.localStorage,
        indexedDB: global.mockIndexedDB,
        notificaciones: global.mockNotificaciones
    };
}

// Función para ejecutar pruebas
function ejecutarPrueba(nombre, funcion) {
    try {
        console.log(`\n🧪 Ejecutando prueba: ${nombre}`);
        const resultado = funcion();
        
        if (resultado === true || resultado === undefined) {
            console.log(`✅ PASÓ: ${nombre}`);
            return true;
        } else {
            console.log(`❌ FALLÓ: ${nombre} - ${resultado}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ ERROR en ${nombre}:`, error.message);
        return false;
    }
}

// Función para assertions
function assert(condicion, mensaje) {
    if (!condicion) {
        throw new Error(mensaje || 'Assertion falló');
    }
}

function assertEqual(actual, esperado, mensaje) {
    if (actual !== esperado) {
        throw new Error(mensaje || `Esperado: ${esperado}, Actual: ${actual}`);
    }
}

function assertArrayEqual(actual, esperado, mensaje) {
    if (JSON.stringify(actual) !== JSON.stringify(esperado)) {
        throw new Error(mensaje || `Arrays no son iguales: ${JSON.stringify(actual)} !== ${JSON.stringify(esperado)}`);
    }
}

// Exportar utilidades para Node.js si está disponible
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MockStorage,
        MockIndexedDB,
        MockNotificaciones,
        crearDatosPrueba,
        configurarEntornoPruebas,
        ejecutarPrueba,
        assert,
        assertEqual,
        assertArrayEqual
    };
}
