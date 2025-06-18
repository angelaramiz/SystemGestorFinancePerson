/**
 * Pruebas para el almacenamiento (localStorage e IndexedDB)
 */

// Importar utilidades de prueba si están disponibles
let testUtils;
if (typeof require !== 'undefined') {
    testUtils = require('./test-utils.js');
} else {
    // En el navegador, las utilidades estarán disponibles globalmente
    testUtils = {
        MockStorage, MockIndexedDB, MockNotificaciones,
        crearDatosPrueba, configurarEntornoPruebas,
        ejecutarPrueba, assert, assertEqual, assertArrayEqual
    };
}

const { configurarEntornoPruebas, ejecutarPrueba, assert, assertEqual, crearDatosPrueba } = testUtils;

function ejecutarPruebasAlmacenamiento() {
    console.log('\n🏪 === PRUEBAS DE ALMACENAMIENTO ===');
    
    const entorno = configurarEntornoPruebas();
    const resultados = [];
    
    // Prueba 1: LocalStorage básico
    resultados.push(ejecutarPrueba('LocalStorage - Guardar y recuperar', () => {
        const storage = entorno.localStorage;
        
        storage.setItem('test-key', 'test-value');
        const valor = storage.getItem('test-key');
        
        assertEqual(valor, 'test-value', 'El valor recuperado debe coincidir');
        return true;
    }));
    
    // Prueba 2: LocalStorage - Datos JSON
    resultados.push(ejecutarPrueba('LocalStorage - Objetos JSON', () => {
        const storage = entorno.localStorage;
        const objeto = { nombre: 'Test', numero: 123 };
        
        storage.setItem('test-objeto', JSON.stringify(objeto));
        const objetoRecuperado = JSON.parse(storage.getItem('test-objeto'));
        
        assertEqual(objetoRecuperado.nombre, objeto.nombre);
        assertEqual(objetoRecuperado.numero, objeto.numero);
        return true;
    }));
    
    // Prueba 3: IndexedDB - Operaciones básicas
    resultados.push(ejecutarPrueba('IndexedDB - Guardar ingreso', async () => {
        const db = entorno.indexedDB;
        const { ingresos } = crearDatosPrueba();
        
        await db.init();
        const resultado = await db.guardar('ingresos', ingresos[0]);
        
        assertEqual(resultado.id, ingresos[0].id);
        return true;
    }));
    
    // Prueba 4: IndexedDB - Recuperar datos
    resultados.push(ejecutarPrueba('IndexedDB - Recuperar ingreso', async () => {
        const db = entorno.indexedDB;
        const { ingresos } = crearDatosPrueba();
        
        await db.guardar('ingresos', ingresos[0]);
        const recuperado = await db.obtener('ingresos', ingresos[0].id);
        
        assert(recuperado !== null, 'El ingreso debe ser recuperado');
        assertEqual(recuperado.fuente, ingresos[0].fuente);
        return true;
    }));
    
    // Prueba 5: IndexedDB - Obtener todos
    resultados.push(ejecutarPrueba('IndexedDB - Obtener todos los ingresos', async () => {
        const db = entorno.indexedDB;
        const { ingresos } = crearDatosPrueba();
        
        await db.limpiar('ingresos');
        
        for (const ingreso of ingresos) {
            await db.guardar('ingresos', ingreso);
        }
        
        const todos = await db.obtenerTodos('ingresos');
        assertEqual(todos.length, ingresos.length);
        return true;
    }));
    
    // Prueba 6: IndexedDB - Eliminar
    resultados.push(ejecutarPrueba('IndexedDB - Eliminar ingreso', async () => {
        const db = entorno.indexedDB;
        const { ingresos } = crearDatosPrueba();
        
        await db.guardar('ingresos', ingresos[0]);
        const eliminado = await db.eliminar('ingresos', ingresos[0].id);
        const recuperado = await db.obtener('ingresos', ingresos[0].id);
        
        assert(eliminado === true, 'La eliminación debe ser exitosa');
        assert(recuperado === null, 'El ingreso no debe existir después de eliminarlo');
        return true;
    }));
    
    // Prueba 7: IndexedDB - Actualizar
    resultados.push(ejecutarPrueba('IndexedDB - Actualizar ingreso', async () => {
        const db = entorno.indexedDB;
        const { ingresos } = crearDatosPrueba();
        
        await db.guardar('ingresos', ingresos[0]);
        
        const actualizado = { ...ingresos[0], monto: 60000 };
        await db.actualizar('ingresos', actualizado);
        
        const recuperado = await db.obtener('ingresos', ingresos[0].id);
        assertEqual(recuperado.monto, 60000);
        return true;
    }));
    
    const exitosos = resultados.filter(r => r).length;
    const total = resultados.length;
    
    console.log(`\n📊 Resultados de Almacenamiento: ${exitosos}/${total} pruebas pasaron`);
    return { exitosos, total, porcentaje: (exitosos / total) * 100 };
}

// Ejecutar si está en Node.js
if (typeof require !== 'undefined' && require.main === module) {
    ejecutarPruebasAlmacenamiento();
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ejecutarPruebasAlmacenamiento };
}
