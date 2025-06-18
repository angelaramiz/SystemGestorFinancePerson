/**
 * Pruebas para el almacenamiento (localStorage e IndexedDB)
 */

function ejecutarPruebasAlmacenamiento() {
    console.log('\n🏪 === PRUEBAS DE ALMACENAMIENTO ===');
    
    const resultados = [];
    
    // Función helper para ejecutar pruebas
    function ejecutarPrueba(nombre, testFn) {
        try {
            testFn();
            console.log(`✅ ${nombre}`);
            return { nombre, resultado: 'ÉXITO', error: null };
        } catch (error) {
            console.log(`❌ ${nombre}: ${error.message}`);
            return { nombre, resultado: 'FALLO', error: error.message };
        }
    }
    
    // Función helper para assertions
    function assert(condicion, mensaje = 'Assertion falló') {
        if (!condicion) {
            throw new Error(mensaje);
        }
    }
    
    // Prueba 1: LocalStorage básico
    resultados.push(ejecutarPrueba('LocalStorage - Guardar y recuperar', () => {
        const testKey = '_test_almacenamiento_' + Date.now();
        
        localStorage.setItem(testKey, 'test-value');
        const valor = localStorage.getItem(testKey);
        
        assert(valor === 'test-value', 'El valor recuperado debe coincidir');
        
        // Limpiar
        localStorage.removeItem(testKey);
        return true;
    }));
    
    // Prueba 2: LocalStorage - Datos JSON
    resultados.push(ejecutarPrueba('LocalStorage - Objetos JSON', () => {
        const testKey = '_test_json_' + Date.now();
        const objeto = { nombre: 'Test', numero: 123 };
        
        localStorage.setItem(testKey, JSON.stringify(objeto));
        const objetoRecuperado = JSON.parse(localStorage.getItem(testKey));
        
        assert(objetoRecuperado.nombre === objeto.nombre, 'Nombre debe coincidir');
        assert(objetoRecuperado.numero === objeto.numero, 'Número debe coincidir');
        
        // Limpiar
        localStorage.removeItem(testKey);
        return true;
    }));
    
    // Prueba 3: LocalStorage - Eliminar elementos
    resultados.push(ejecutarPrueba('LocalStorage - Eliminar elementos', () => {
        const testKey = '_test_eliminar_' + Date.now();
        
        localStorage.setItem(testKey, 'valor-a-eliminar');
        assert(localStorage.getItem(testKey) === 'valor-a-eliminar', 'Valor debe existir');
        
        localStorage.removeItem(testKey);
        assert(localStorage.getItem(testKey) === null, 'Valor debe estar eliminado');
        
        return true;
    }));
    
    // Prueba 4: Verificar disponibilidad de IndexedDB
    resultados.push(ejecutarPrueba('IndexedDB - Verificar disponibilidad', () => {
        assert(typeof indexedDB !== 'undefined', 'IndexedDB debe estar disponible');
        assert(typeof indexedDB.open === 'function', 'indexedDB.open debe ser función');
        return true;
    }));
    
    // Prueba 5: Verificar Storage API
    resultados.push(ejecutarPrueba('Storage API - Verificar localStorage', () => {
        assert(typeof localStorage !== 'undefined', 'localStorage debe estar disponible');
        assert(typeof localStorage.setItem === 'function', 'localStorage.setItem debe ser función');
        assert(typeof localStorage.getItem === 'function', 'localStorage.getItem debe ser función');
        assert(typeof localStorage.removeItem === 'function', 'localStorage.removeItem debe ser función');
        return true;
    }));
    
    // Calcular estadísticas
    const exitosos = resultados.filter(r => r.resultado === 'ÉXITO').length;
    const total = resultados.length;
    const porcentaje = total > 0 ? (exitosos / total) * 100 : 0;
    
    // Mostrar resumen
    console.log(`\n📊 Resumen de Almacenamiento: ${exitosos}/${total} (${porcentaje.toFixed(1)}%)`);
    
    if (porcentaje === 100) {
        console.log('🎉 ¡Todas las pruebas de almacenamiento pasaron!');
    } else {
        console.log('⚠️ Algunas pruebas de almacenamiento fallaron');
    }
    
    return {
        resultados,
        exitosos,
        total,
        porcentaje
    };
}

// Hacer la función disponible globalmente para el navegador
if (typeof window !== 'undefined') {
    window.ejecutarPruebasAlmacenamiento = ejecutarPruebasAlmacenamiento;
}

// Exportar para Node.js si está disponible
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ejecutarPruebasAlmacenamiento };
}
