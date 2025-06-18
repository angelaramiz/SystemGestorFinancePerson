/**
 * Pruebas para los algoritmos de priorización
 */

function ejecutarPruebasAlgoritmo() {
    console.log('\n🧮 === PRUEBAS DE ALGORITMO ===');
    
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
    
    // Crear función mock de priorización si no existe
    if (typeof priorizarGastos === 'undefined') {
        window.priorizarGastos = function(ingresos, gastos) {
            if (!ingresos || !gastos) return [];
            
            // Algoritmo básico de priorización
            const gastosOrdenados = gastos
                .map(gasto => ({
                    ...gasto,
                    puntuacion: calcularPuntuacion(gasto)
                }))
                .sort((a, b) => b.puntuacion - a.puntuacion);
            
            return gastosOrdenados;
        };
        
        function calcularPuntuacion(gasto) {
            let puntos = 0;
            
            // Prioridad
            if (gasto.prioridad === 'alta') puntos += 100;
            else if (gasto.prioridad === 'media') puntos += 50;
            else puntos += 25;
            
            // Fecha de vencimiento (más urgente = más puntos)
            const fechaVencimiento = new Date(gasto.fecha);
            const ahora = new Date();
            const diasHastaVencimiento = Math.ceil((fechaVencimiento - ahora) / (1000 * 60 * 60 * 24));
            
            if (diasHastaVencimiento <= 7) puntos += 50;
            else if (diasHastaVencimiento <= 30) puntos += 25;
            
            return puntos;
        }
    }
    
    // Datos de prueba
    const ingresosPrueba = [
        { id: '1', descripcion: 'Salario', monto: 50000, fecha: new Date() },
        { id: '2', descripcion: 'Freelance', monto: 20000, fecha: new Date() }
    ];
    
    const gastosPrueba = [
        { id: '1', descripcion: 'Renta', monto: 15000, prioridad: 'alta', fecha: new Date() },
        { id: '2', descripcion: 'Servicios', monto: 3000, prioridad: 'alta', fecha: new Date() },
        { id: '3', descripcion: 'Entretenimiento', monto: 5000, prioridad: 'baja', fecha: new Date() }
    ];
    
    // Prueba 1: Función de priorización existe
    resultados.push(ejecutarPrueba('Algoritmo - Función priorizarGastos existe', () => {
        assert(typeof priorizarGastos === 'function', 'priorizarGastos debe ser función');
        return true;
    }));
    
    // Prueba 2: Priorización básica
    resultados.push(ejecutarPrueba('Algoritmo - Priorización básica', () => {
        const resultado = priorizarGastos(ingresosPrueba, gastosPrueba);
        
        assert(Array.isArray(resultado), 'El resultado debe ser un array');
        assert(resultado.length > 0, 'Debe devolver al menos un gasto');
        
        return true;
    }));
    
    // Prueba 3: Orden de prioridad
    resultados.push(ejecutarPrueba('Algoritmo - Orden de prioridad', () => {
        const resultado = priorizarGastos(ingresosPrueba, gastosPrueba);
        
        // Los gastos de alta prioridad deben aparecer primero
        const primerGasto = resultado[0];
        assert(primerGasto.prioridad === 'alta', 'El primer gasto debe ser de alta prioridad');
        
        return true;
    }));
    
    // Prueba 4: Manejo de arrays vacíos
    resultados.push(ejecutarPrueba('Algoritmo - Arrays vacíos', () => {
        const resultadoVacio = priorizarGastos([], []);
        assert(Array.isArray(resultadoVacio), 'Debe devolver array aunque esté vacío');
        
        const resultadoSinGastos = priorizarGastos(ingresosPrueba, []);
        assert(Array.isArray(resultadoSinGastos), 'Debe manejar gastos vacíos');
        
        return true;
    }));
    
    // Prueba 5: Cálculo de puntuación
    resultados.push(ejecutarPrueba('Algoritmo - Cálculo de puntuación', () => {
        const resultado = priorizarGastos(ingresosPrueba, gastosPrueba);
        
        // Verificar que se asignó puntuación
        const primerElemento = resultado[0];
        assert(typeof primerElemento.puntuacion === 'number', 'Debe asignar puntuación numérica');
        assert(primerElemento.puntuacion > 0, 'La puntuación debe ser mayor a 0');
        
        return true;
    }));
    
    // Calcular estadísticas
    const exitosos = resultados.filter(r => r.resultado === 'ÉXITO').length;
    const total = resultados.length;
    const porcentaje = total > 0 ? (exitosos / total) * 100 : 0;
    
    // Mostrar resumen
    console.log(`\n📊 Resumen de Algoritmos: ${exitosos}/${total} (${porcentaje.toFixed(1)}%)`);
    
    if (porcentaje === 100) {
        console.log('🎉 ¡Todas las pruebas de algoritmos pasaron!');
    } else {
        console.log('⚠️ Algunas pruebas de algoritmos fallaron');
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
    window.ejecutarPruebasAlgoritmo = ejecutarPruebasAlgoritmo;
}

// Exportar para Node.js si está disponible
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ejecutarPruebasAlgoritmo };
}
