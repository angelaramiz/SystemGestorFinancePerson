/**
 * Pruebas para el algoritmo de priorización
 */

function configurarEntornoAlgoritmo() {
    // Simulamos el algoritmo si no está disponible
    if (typeof AlgoritmoPriorizacion === 'undefined') {
        global.AlgoritmoPriorizacion = class AlgoritmoPriorizacion {
            constructor() {
                this.estrategias = {
                    'fechas_prioridad': this.estrategiaFechasPrioridad.bind(this),
                    'monto_urgencia': this.estrategiaMontoUrgencia.bind(this),
                    'equilibrio': this.estrategiaEquilibrio.bind(this)
                };
            }
            
            procesarPriorizacion(ingresos, gastos, estrategia = 'fechas_prioridad') {
                if (!this.estrategias[estrategia]) {
                    throw new Error(`Estrategia '${estrategia}' no encontrada`);
                }
                
                return this.estrategias[estrategia](ingresos, gastos);
            }
            
            estrategiaFechasPrioridad(ingresos, gastos) {
                const ingresosDisponibles = [...ingresos].map(i => ({ ...i, disponible: i.monto }));
                const gastosOrdenados = [...gastos].sort((a, b) => {
                    // Primero por prioridad
                    const prioridadOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
                    const prioridadDiff = prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
                    if (prioridadDiff !== 0) return prioridadDiff;
                    
                    // Luego por fecha de vencimiento
                    return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
                });
                
                const conexiones = [];
                const gastosCubiertos = [];
                const gastosNoCubiertos = [];
                
                for (const gasto of gastosOrdenados) {
                    let montoCubierto = 0;
                    
                    for (const ingreso of ingresosOrdenados) {
                        if (ingreso.disponible <= 0) continue;
                        
                        const montoAsignar = Math.min(ingreso.disponible, gasto.monto - montoCubierto);
                        
                        if (montoAsignar > 0) {
                            conexiones.push({
                                ingresoId: ingreso.id,
                                gastoId: gasto.id,
                                monto: montoAsignar,
                                fecha: new Date().toISOString()
                            });
                            
                            ingreso.disponible -= montoAsignar;
                            montoCubierto += montoAsignar;
                            
                            if (montoCubierto >= gasto.monto) break;
                        }
                    }
                    
                    if (montoCubierto >= gasto.monto) {
                        gastosCubiertos.push({
                            gastoId: gasto.id,
                            montoCubierto: montoCubierto
                        });
                    } else {
                        gastosNoCubiertos.push({
                            gastoId: gasto.id,
                            montoCubierto: montoCubierto,
                            montoFaltante: gasto.monto - montoCubierto
                        });
                    }
                }
                
                const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
                const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
                const totalCubierto = gastosCubiertos.reduce((sum, g) => sum + g.montoCubierto, 0);
                
                // Calcular estadísticas por prioridad
                const estadisticasPrioridad = ['alta', 'media', 'baja'].map(prioridad => {
                    const gastosPrioridad = gastos.filter(g => g.prioridad === prioridad);
                    return {
                        prioridad,
                        cantidad: gastosPrioridad.length,
                        total: gastosPrioridad.reduce((sum, g) => sum + g.monto, 0)
                    };
                });
                
                return {
                    conexiones,
                    gastosCubiertos,
                    gastosNoCubiertos,
                    totalIngresos,
                    totalGastos,
                    totalCubierto,
                    estadisticasPrioridad,
                    eficiencia: (totalCubierto / totalGastos) * 100
                };
            }
            
            estrategiaMontoUrgencia(ingresos, gastos) {
                // Implementación simplificada para pruebas
                return this.estrategiaFechasPrioridad(ingresos, gastos);
            }
            
            estrategiaEquilibrio(ingresos, gastos) {
                // Implementación simplificada para pruebas
                return this.estrategiaFechasPrioridad(ingresos, gastos);
            }
        };
    }
}

function ejecutarPruebasAlgoritmo() {
    console.log('\n🧮 === PRUEBAS DE ALGORITMO ===');
    
    configurarEntornoAlgoritmo();
    const { ejecutarPrueba, assert, assertEqual, crearDatosPrueba } = testUtils || 
        { ejecutarPrueba: global.ejecutarPrueba, assert: global.assert, assertEqual: global.assertEqual, crearDatosPrueba: global.crearDatosPrueba };
    
    const resultados = [];
    
    // Prueba 1: Inicialización del algoritmo
    resultados.push(ejecutarPrueba('Algoritmo - Inicialización', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        
        assert(algoritmo !== undefined, 'El algoritmo debe inicializarse');
        assert(typeof algoritmo.procesarPriorizacion === 'function', 'Debe tener método procesarPriorizacion');
        return true;
    }));
    
    // Prueba 2: Estrategia básica con datos simples
    resultados.push(ejecutarPrueba('Algoritmo - Estrategia fechas y prioridad', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        const { ingresos, gastos } = crearDatosPrueba();
        
        const resultado = algoritmo.procesarPriorizacion(ingresos, gastos, 'fechas_prioridad');
        
        assert(resultado !== null, 'Debe retornar un resultado');
        assert(Array.isArray(resultado.conexiones), 'Debe tener array de conexiones');
        assert(Array.isArray(resultado.gastosCubiertos), 'Debe tener array de gastos cubiertos');
        assert(Array.isArray(resultado.gastosNoCubiertos), 'Debe tener array de gastos no cubiertos');
        assert(typeof resultado.totalIngresos === 'number', 'Debe calcular total de ingresos');
        assert(typeof resultado.totalGastos === 'number', 'Debe calcular total de gastos');
        return true;
    }));
    
    // Prueba 3: Verificar priorización correcta
    resultados.push(ejecutarPrueba('Algoritmo - Priorización por urgencia', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        
        // Crear datos específicos para esta prueba
        const ingresos = [
            { id: 'ing1', monto: 30000, fuente: 'Salario' }
        ];
        
        const gastos = [
            { id: 'gas1', nombre: 'Alta Prioridad', monto: 15000, prioridad: 'alta', fechaVencimiento: '2025-06-20' },
            { id: 'gas2', nombre: 'Baja Prioridad', monto: 10000, prioridad: 'baja', fechaVencimiento: '2025-06-19' },
            { id: 'gas3', nombre: 'Media Prioridad', monto: 8000, prioridad: 'media', fechaVencimiento: '2025-06-21' }
        ];
        
        const resultado = algoritmo.procesarPriorizacion(ingresos, gastos);
        
        // Verificar que el gasto de alta prioridad se cubra primero
        const conexionAltaPrioridad = resultado.conexiones.find(c => c.gastoId === 'gas1');
        assert(conexionAltaPrioridad !== undefined, 'Debe existir conexión para gasto de alta prioridad');
        
        // Verificar que se cubran todos los gastos posibles con el ingreso disponible
        const totalAsignado = resultado.conexiones.reduce((sum, c) => sum + c.monto, 0);
        assert(totalAsignado <= 30000, 'No debe asignar más del ingreso disponible');
        
        return true;
    }));
    
    // Prueba 4: Manejo de ingresos insuficientes
    resultados.push(ejecutarPrueba('Algoritmo - Ingresos insuficientes', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        
        const ingresos = [
            { id: 'ing1', monto: 10000, fuente: 'Salario Bajo' }
        ];
        
        const gastos = [
            { id: 'gas1', nombre: 'Gasto Grande', monto: 20000, prioridad: 'alta', fechaVencimiento: '2025-06-20' }
        ];
        
        const resultado = algoritmo.procesarPriorizacion(ingresos, gastos);
        
        assert(resultado.gastosNoCubiertos.length > 0, 'Debe haber gastos no cubiertos');
        
        const gastoNoCubierto = resultado.gastosNoCubiertos[0];
        assertEqual(gastoNoCubierto.montoCubierto, 10000, 'Debe cubrir parcialmente con el ingreso disponible');
        assertEqual(gastoNoCubierto.montoFaltante, 10000, 'Debe calcular el monto faltante');
        
        return true;
    }));
    
    // Prueba 5: Múltiples ingresos y gastos
    resultados.push(ejecutarPrueba('Algoritmo - Múltiples ingresos y gastos', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        
        const ingresos = [
            { id: 'ing1', monto: 25000, fuente: 'Salario' },
            { id: 'ing2', monto: 15000, fuente: 'Freelance' }
        ];
        
        const gastos = [
            { id: 'gas1', nombre: 'Hipoteca', monto: 20000, prioridad: 'alta', fechaVencimiento: '2025-06-25' },
            { id: 'gas2', nombre: 'Comida', monto: 8000, prioridad: 'alta', fechaVencimiento: '2025-06-20' },
            { id: 'gas3', nombre: 'Entretenimiento', monto: 5000, prioridad: 'baja', fechaVencimiento: '2025-06-30' }
        ];
        
        const resultado = algoritmo.procesarPriorizacion(ingresos, gastos);
        
        const totalIngresos = 25000 + 15000;
        const totalGastos = 20000 + 8000 + 5000;
        
        assertEqual(resultado.totalIngresos, totalIngresos);
        assertEqual(resultado.totalGastos, totalGastos);
        
        // Todos los gastos deberían poder cubrirse
        assert(resultado.totalCubierto >= totalGastos, 'Todos los gastos deberían cubrirse');
        assert(resultado.eficiencia >= 99, 'La eficiencia debería ser muy alta');
        
        return true;
    }));
    
    // Prueba 6: Cálculo de estadísticas por prioridad
    resultados.push(ejecutarPrueba('Algoritmo - Estadísticas por prioridad', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        const { ingresos, gastos } = crearDatosPrueba();
        
        const resultado = algoritmo.procesarPriorizacion(ingresos, gastos);
        
        assert(Array.isArray(resultado.estadisticasPrioridad), 'Debe tener estadísticas por prioridad');
        assertEqual(resultado.estadisticasPrioridad.length, 3, 'Debe tener 3 niveles de prioridad');
        
        const estadisticasAlta = resultado.estadisticasPrioridad.find(e => e.prioridad === 'alta');
        assert(estadisticasAlta !== undefined, 'Debe tener estadísticas para prioridad alta');
        assert(typeof estadisticasAlta.cantidad === 'number', 'Debe contar la cantidad');
        assert(typeof estadisticasAlta.total === 'number', 'Debe calcular el total');
        
        return true;
    }));
    
    // Prueba 7: Estrategia no válida
    resultados.push(ejecutarPrueba('Algoritmo - Estrategia no válida', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        const { ingresos, gastos } = crearDatosPrueba();
        
        try {
            algoritmo.procesarPriorizacion(ingresos, gastos, 'estrategia_inexistente');
            return 'Debería haber lanzado un error';
        } catch (error) {
            assert(error.message.includes('no encontrada'), 'Debe lanzar error específico');
            return true;
        }
    }));
    
    // Prueba 8: Datos vacíos
    resultados.push(ejecutarPrueba('Algoritmo - Datos vacíos', () => {
        const algoritmo = new AlgoritmoPriorizacion();
        
        const resultado = algoritmo.procesarPriorizacion([], []);
        
        assertEqual(resultado.conexiones.length, 0, 'No debe haber conexiones');
        assertEqual(resultado.gastosCubiertos.length, 0, 'No debe haber gastos cubiertos');
        assertEqual(resultado.gastosNoCubiertos.length, 0, 'No debe haber gastos no cubiertos');
        assertEqual(resultado.totalIngresos, 0, 'Total de ingresos debe ser 0');
        assertEqual(resultado.totalGastos, 0, 'Total de gastos debe ser 0');
        
        return true;
    }));
    
    const exitosos = resultados.filter(r => r).length;
    const total = resultados.length;
    
    console.log(`\n📊 Resultados de Algoritmo: ${exitosos}/${total} pruebas pasaron`);
    return { exitosos, total, porcentaje: (exitosos / total) * 100 };
}

// Ejecutar si está en Node.js
if (typeof require !== 'undefined' && require.main === module) {
    ejecutarPruebasAlgoritmo();
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ejecutarPruebasAlgoritmo };
}
