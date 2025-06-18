/**
 * Algoritmos de priorización de gastos según especificación del proyecto
 * Implementa la lógica para conectar ingresos con gastos y optimizar recursos
 */

class AlgoritmoPriorizacion {
    constructor() {
        this.resultados = [];
        this.configuracion = {
            // Pesos para el cálculo de prioridad
            pesoPrioridad: 0.4,
            pesoVencimiento: 0.3,
            pesoTipo: 0.2,
            pesoMonto: 0.1,
            
            // Configuraciones de tiempo
            diasCriticos: 3,
            diasUrgentes: 7,
            diasModerados: 15,
            
            // Tolerancia para sobregiros
            toleranciaSobregiro: 0.1 // 10%
        };
    }

    /**
     * Algoritmo principal de priorización según especificación
     * Conecta ingresos con gastos según prioridad y fechas de cobro
     */
    async priorizarGastos(ingresos = [], gastos = []) {
        try {
            console.log('🎯 Iniciando algoritmo de priorización...');
            
            // 1. Validar y limpiar datos de entrada
            const ingresosValidos = this.validarIngresos(ingresos);
            const gastosValidos = this.validarGastos(gastos);
            
            console.log(`📊 Procesando ${ingresosValidos.length} ingresos y ${gastosValidos.length} gastos`);
            
            // 2. Ordenar ingresos por fecha de cobro
            const ingresosOrdenados = this.ordenarIngresosPorFecha(ingresosValidos);
            
            // 3. Ordenar gastos por prioridad compuesta
            const gastosPriorizados = this.ordenarGastosPorPrioridad(gastosValidos);
            
            // 4. Ejecutar algoritmo de asignación
            const resultadoAsignacion = this.ejecutarAsignacion(ingresosOrdenados, gastosPriorizados);
            
            // 5. Generar reporte de resultados
            const reporte = this.generarReporte(resultadoAsignacion);
            
            // 6. Almacenar resultados para consulta posterior
            this.resultados = resultadoAsignacion;
            
            console.log('✅ Algoritmo de priorización completado');
            return reporte;
            
        } catch (error) {
            console.error('❌ Error en algoritmo de priorización:', error);
            throw error;
        }
    }

    /**
     * Validar y preparar datos de ingresos
     */
    validarIngresos(ingresos) {
        return ingresos
            .filter(ingreso => {
                if (!ingreso || typeof ingreso !== 'object') return false;
                if (!ingreso.monto || ingreso.monto <= 0) return false;
                if (!ingreso.fecha) return false;
                return true;
            })
            .map(ingreso => ({
                ...ingreso,
                montoDisponible: ingreso.monto,
                montoOriginal: ingreso.monto,
                gastosAsignados: []
            }));
    }

    /**
     * Validar y preparar datos de gastos
     */
    validarGastos(gastos) {
        return gastos
            .filter(gasto => {
                if (!gasto || typeof gasto !== 'object') return false;
                if (!gasto.monto || gasto.monto <= 0) return false;
                if (!gasto.fechaVencimiento) return false;
                if (gasto.estado === 'pagado' || gasto.estado === 'cancelado') return false;
                return true;
            })
            .map(gasto => ({
                ...gasto,
                montoRestante: gasto.monto,
                puntajePrioridad: this.calcularPuntajePrioridad(gasto),
                diasParaVencimiento: this.calcularDiasParaVencimiento(gasto.fechaVencimiento),
                fuentesAsignadas: []
            }));
    }

    /**
     * Ordenar ingresos por fecha de cobro (más próximos primero)
     */
    ordenarIngresosPorFecha(ingresos) {
        return ingresos.sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            return fechaA - fechaB;
        });
    }

    /**
     * Ordenar gastos por prioridad compuesta
     */
    ordenarGastosPorPrioridad(gastos) {
        return gastos.sort((a, b) => {
            // Primero por puntaje de prioridad (mayor a menor)
            if (a.puntajePrioridad !== b.puntajePrioridad) {
                return b.puntajePrioridad - a.puntajePrioridad;
            }
            
            // Después por días para vencimiento (menor a mayor)
            if (a.diasParaVencimiento !== b.diasParaVencimiento) {
                return a.diasParaVencimiento - b.diasParaVencimiento;
            }
            
            // Finalmente por monto (mayor a menor para gastos críticos)
            if (a.prioridad === 'alta' && b.prioridad === 'alta') {
                return b.monto - a.monto;
            }
            
            return a.monto - b.monto;
        });
    }

    /**
     * Algoritmo principal de asignación de fondos
     */
    ejecutarAsignacion(ingresos, gastos) {
        const resultados = {
            ingresos: [...ingresos],
            gastos: [...gastos],
            asignaciones: [],
            estadisticas: {
                totalIngresos: 0,
                totalGastos: 0,
                gastosCubiertos: 0,
                gastosParcialesCubiertos: 0,
                gastosPendientes: 0,
                sobrante: 0,
                deficit: 0
            }
        };

        // Calcular totales iniciales
        resultados.estadisticas.totalIngresos = ingresos.reduce((sum, ing) => sum + ing.monto, 0);
        resultados.estadisticas.totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

        // Proceso de asignación por prioridad
        for (const gasto of gastos) {
            this.asignarFondosAGasto(gasto, ingresos, resultados);
        }

        // Calcular estadísticas finales
        this.calcularEstadisticasFinales(resultados);

        return resultados;
    }

    /**
     * Asignar fondos de ingresos a un gasto específico
     */
    asignarFondosAGasto(gasto, ingresos, resultados) {
        let montoRestante = gasto.monto;
        const asignacionesGasto = [];

        // Intentar cubrir el gasto con los ingresos disponibles
        for (const ingreso of ingresos) {
            if (montoRestante <= 0) break;
            if (ingreso.montoDisponible <= 0) continue;

            // Verificar si el ingreso puede usarse para este gasto
            if (!this.puedeUsarIngresoParaGasto(ingreso, gasto)) continue;

            // Calcular monto a asignar
            const montoAAsignar = Math.min(montoRestante, ingreso.montoDisponible);

            // Crear asignación
            const asignacion = {
                id: this.generarIdAsignacion(),
                ingresoId: ingreso.id,
                gastoId: gasto.id,
                monto: montoAAsignar,
                fechaAsignacion: new Date().toISOString(),
                tipo: montoAAsignar >= montoRestante ? 'completo' : 'parcial'
            };

            // Actualizar disponibilidad
            ingreso.montoDisponible -= montoAAsignar;
            montoRestante -= montoAAsignar;

            // Registrar asignación
            asignacionesGasto.push(asignacion);
            resultados.asignaciones.push(asignacion);
            ingreso.gastosAsignados.push(gasto.id);
            gasto.fuentesAsignadas.push(ingreso.id);
        }

        // Actualizar estado del gasto
        gasto.montoRestante = montoRestante;
        if (montoRestante <= 0) {
            gasto.estado = 'cubierto';
            resultados.estadisticas.gastosCubiertos++;
        } else if (montoRestante < gasto.monto) {
            gasto.estado = 'parcialmente_cubierto';
            gasto.porcentajeCubierto = ((gasto.monto - montoRestante) / gasto.monto) * 100;
            resultados.estadisticas.gastosParcialesCubiertos++;
        } else {
            gasto.estado = 'pendiente';
            resultados.estadisticas.gastosPendientes++;
        }

        return asignacionesGasto;
    }

    /**
     * Verificar si un ingreso puede usarse para un gasto específico
     */
    puedeUsarIngresoParaGasto(ingreso, gasto) {
        // Verificar fechas - el ingreso debe estar disponible antes del vencimiento
        const fechaIngreso = new Date(ingreso.fecha);
        const fechaVencimiento = new Date(gasto.fechaVencimiento);
        
        // Permitir una ventana de gracia para gastos críticos
        if (gasto.prioridad === 'alta') {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 3);
        }

        return fechaIngreso <= fechaVencimiento;
    }

    /**
     * Calcular estadísticas finales del proceso
     */
    calcularEstadisticasFinales(resultados) {
        // Calcular sobrante total
        resultados.estadisticas.sobrante = resultados.ingresos.reduce(
            (sum, ingreso) => sum + ingreso.montoDisponible, 0
        );

        // Calcular déficit total
        resultados.estadisticas.deficit = resultados.gastos.reduce(
            (sum, gasto) => sum + gasto.montoRestante, 0
        );

        // Calcular porcentajes
        const totalGastos = resultados.estadisticas.totalGastos;
        resultados.estadisticas.porcentajeCubierto = totalGastos > 0 ? 
            ((totalGastos - resultados.estadisticas.deficit) / totalGastos) * 100 : 100;

        // Calcular eficiencia del algoritmo
        resultados.estadisticas.eficiencia = this.calcularEficiencia(resultados);
    }

    /**
     * Calcular puntaje de prioridad para un gasto
     */
    calcularPuntajePrioridad(gasto) {
        let puntaje = 0;
        const config = this.configuracion;

        // Factor prioridad base
        const prioridadPuntos = {
            'alta': 100,
            'media': 50,
            'baja': 10
        };
        puntaje += (prioridadPuntos[gasto.prioridad] || 10) * config.pesoPrioridad;

        // Factor vencimiento
        const dias = this.calcularDiasParaVencimiento(gasto.fechaVencimiento);
        let vencimientoPuntos = 0;
        
        if (dias <= 0) {
            vencimientoPuntos = 100; // Ya vencido
        } else if (dias <= config.diasCriticos) {
            vencimientoPuntos = 80; // Crítico
        } else if (dias <= config.diasUrgentes) {
            vencimientoPuntos = 60; // Urgente
        } else if (dias <= config.diasModerados) {
            vencimientoPuntos = 30; // Moderado
        } else {
            vencimientoPuntos = 10; // Lejano
        }
        
        puntaje += vencimientoPuntos * config.pesoVencimiento;

        // Factor tipo de gasto
        const tiposPuntos = {
            'hipoteca': 25,
            'alquiler': 25,
            'servicios': 20,
            'salud': 20,
            'alimentacion': 15,
            'transporte': 10,
            'educacion': 10,
            'deuda': 15,
            'entretenimiento': 5,
            'otro': 5
        };
        puntaje += (tiposPuntos[gasto.tipo] || 5) * config.pesoTipo;

        // Factor monto (inversamente proporcional para gastos no críticos)
        if (gasto.prioridad !== 'alta') {
            const montoPuntos = Math.max(0, 20 - (gasto.monto / 100)); // Menos puntos para montos altos
            puntaje += montoPuntos * config.pesoMonto;
        }

        return Math.round(puntaje);
    }

    /**
     * Calcular días hasta el vencimiento
     */
    calcularDiasParaVencimiento(fechaVencimiento) {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diferencia = vencimiento - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }

    /**
     * Calcular eficiencia del algoritmo
     */
    calcularEficiencia(resultados) {
        const stats = resultados.estadisticas;
        
        // Factores de eficiencia
        const factorCobertura = stats.porcentajeCubierto / 100;
        const factorPrioridad = this.calcularFactorPrioridad(resultados.gastos);
        const factorOptimizacion = this.calcularFactorOptimizacion(resultados);
        
        return Math.round((factorCobertura * 0.5 + factorPrioridad * 0.3 + factorOptimizacion * 0.2) * 100);
    }

    /**
     * Calcular factor de prioridad (qué tan bien se cubrieron los gastos prioritarios)
     */
    calcularFactorPrioridad(gastos) {
        const gastosAlta = gastos.filter(g => g.prioridad === 'alta');
        if (gastosAlta.length === 0) return 1;
        
        const gastosAltaCubiertos = gastosAlta.filter(g => g.estado === 'cubierto').length;
        return gastosAltaCubiertos / gastosAlta.length;
    }

    /**
     * Calcular factor de optimización (eficiencia en el uso de recursos)
     */
    calcularFactorOptimizacion(resultados) {
        const totalIngresos = resultados.estadisticas.totalIngresos;
        const sobrante = resultados.estadisticas.sobrante;
        
        if (totalIngresos === 0) return 0;
        return Math.max(0, 1 - (sobrante / totalIngresos));
    }

    /**
     * Generar reporte de resultados
     */
    generarReporte(resultados) {
        const reporte = {
            resumen: {
                fechaGeneracion: new Date().toISOString(),
                totalIngresos: resultados.estadisticas.totalIngresos,
                totalGastos: resultados.estadisticas.totalGastos,
                gastosCubiertos: resultados.estadisticas.gastosCubiertos,
                gastosParcialesCubiertos: resultados.estadisticas.gastosParcialesCubiertos,
                gastosPendientes: resultados.estadisticas.gastosPendientes,
                porcentajeCubierto: resultados.estadisticas.porcentajeCubierto,
                sobrante: resultados.estadisticas.sobrante,
                deficit: resultados.estadisticas.deficit,
                eficiencia: resultados.estadisticas.eficiencia
            },
            gastosPorPrioridad: this.agruparGastosPorPrioridad(resultados.gastos),
            recomendaciones: this.generarRecomendaciones(resultados),
            proximosVencimientos: this.obtenerProximosVencimientos(resultados.gastos),
            asignaciones: resultados.asignaciones
        };

        return reporte;
    }

    /**
     * Agrupar gastos por prioridad para el reporte
     */
    agruparGastosPorPrioridad(gastos) {
        const grupos = {
            alta: { gastos: [], cubiertos: 0, total: 0, monto: 0 },
            media: { gastos: [], cubiertos: 0, total: 0, monto: 0 },
            baja: { gastos: [], cubiertos: 0, total: 0, monto: 0 }
        };

        gastos.forEach(gasto => {
            const prioridad = gasto.prioridad || 'baja';
            grupos[prioridad].gastos.push(gasto);
            grupos[prioridad].total++;
            grupos[prioridad].monto += gasto.monto;
            
            if (gasto.estado === 'cubierto') {
                grupos[prioridad].cubiertos++;
            }
        });

        return grupos;
    }

    /**
     * Generar recomendaciones basadas en los resultados
     */
    generarRecomendaciones(resultados) {
        const recomendaciones = [];
        const stats = resultados.estadisticas;

        // Recomendaciones por déficit
        if (stats.deficit > 0) {
            recomendaciones.push({
                tipo: 'deficit',
                prioridad: 'alta',
                mensaje: `Tienes un déficit de ${this.formatearMonto(stats.deficit)}. Considera reducir gastos opcionales o buscar ingresos adicionales.`,
                acciones: ['Revisar gastos de baja prioridad', 'Buscar ingresos extra', 'Negociar plazos de pago']
            });
        }

        // Recomendaciones por gastos vencidos
        const gastosVencidos = resultados.gastos.filter(g => g.diasParaVencimiento < 0 && g.estado !== 'cubierto');
        if (gastosVencidos.length > 0) {
            recomendaciones.push({
                tipo: 'vencimientos',
                prioridad: 'alta',
                mensaje: `Tienes ${gastosVencidos.length} gastos vencidos que requieren atención inmediata.`,
                gastos: gastosVencidos.map(g => g.id)
            });
        }

        // Recomendaciones por sobrante
        if (stats.sobrante > stats.totalIngresos * 0.1) {
            recomendaciones.push({
                tipo: 'sobrante',
                prioridad: 'media',
                mensaje: `Tienes un sobrante de ${this.formatearMonto(stats.sobrante)}. Considera crear un fondo de emergencia o invertir.`,
                acciones: ['Crear fondo de emergencia', 'Considerar inversiones', 'Adelantar pagos']
            });
        }

        return recomendaciones;
    }

    /**
     * Obtener próximos vencimientos críticos
     */
    obtenerProximosVencimientos(gastos) {
        return gastos
            .filter(gasto => gasto.diasParaVencimiento <= 7 && gasto.estado !== 'cubierto')
            .sort((a, b) => a.diasParaVencimiento - b.diasParaVencimiento)
            .slice(0, 5);
    }

    /**
     * Formatear monto para mostrar
     */
    formatearMonto(monto) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(monto);
    }

    /**
     * Generar ID único para asignaciones
     */
    generarIdAsignacion() {
        return 'asig-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Configurar parámetros del algoritmo
     */
    configurarAlgoritmo(nuevaConfiguracion) {
        this.configuracion = { ...this.configuracion, ...nuevaConfiguracion };
    }

    /**
     * Obtener configuración actual
     */
    obtenerConfiguracion() {
        return { ...this.configuracion };
    }

    /**
     * Simular diferentes escenarios
     */
    simularEscenarios(ingresos, gastos, escenarios = []) {
        const resultados = [];

        for (const escenario of escenarios) {
            const ingresosModificados = this.aplicarEscenarioIngresos(ingresos, escenario);
            const gastosModificados = this.aplicarEscenarioGastos(gastos, escenario);
            
            const resultado = this.priorizarGastos(ingresosModificados, gastosModificados);
            resultado.escenario = escenario;
            resultados.push(resultado);
        }

        return resultados;
    }

    /**
     * Aplicar modificaciones de escenario a ingresos
     */
    aplicarEscenarioIngresos(ingresos, escenario) {
        if (!escenario.modificacionesIngresos) return ingresos;

        return ingresos.map(ingreso => {
            const modificacion = escenario.modificacionesIngresos[ingreso.id];
            if (!modificacion) return ingreso;

            return {
                ...ingreso,
                monto: modificacion.monto || ingreso.monto,
                fecha: modificacion.fecha || ingreso.fecha
            };
        });
    }

    /**
     * Aplicar modificaciones de escenario a gastos
     */
    aplicarEscenarioGastos(gastos, escenario) {
        if (!escenario.modificacionesGastos) return gastos;

        return gastos.map(gasto => {
            const modificacion = escenario.modificacionesGastos[gasto.id];
            if (!modificacion) return gasto;

            return {
                ...gasto,
                monto: modificacion.monto || gasto.monto,
                fechaVencimiento: modificacion.fechaVencimiento || gasto.fechaVencimiento,
                prioridad: modificacion.prioridad || gasto.prioridad
            };
        });
    }
}

// Crear instancia global
window.algoritmoPriorizacion = new AlgoritmoPriorizacion();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlgoritmoPriorizacion;
}
