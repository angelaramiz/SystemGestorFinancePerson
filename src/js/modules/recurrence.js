/**
 * Módulo para manejar ingresos y gastos recurrentes
 * Gestor Financiero Personal - México
 */

class RecurrenceManager {
    constructor() {
        this.frecuencias = {
            'semanal': 7,
            'quincenal': 15,
            'mensual': 30,
            'bimestral': 60,
            'trimestral': 90,
            'semestral': 180,
            'anual': 365
        };
    }

    /**
     * Inicializar eventos de los campos de recurrencia
     */
    inicializarEventos() {
        // Toggle para mostrar/ocultar campos de recurrencia
        const checkboxRecurrente = document.getElementById('ingreso-es-recurrente');
        const camposRecurrencia = document.getElementById('campos-recurrencia');
        
        if (checkboxRecurrente && camposRecurrencia) {
            checkboxRecurrente.addEventListener('change', (e) => {
                if (e.target.checked) {
                    camposRecurrencia.style.display = 'block';
                    this.marcarCamposRequeridos(true);
                } else {
                    camposRecurrencia.style.display = 'none';
                    this.marcarCamposRequeridos(false);
                    this.limpiarCamposRecurrencia();
                }
            });
        }

        // Toggle para frecuencia personalizada
        const selectFrecuencia = document.getElementById('ingreso-frecuencia');
        const campoPersonalizada = document.getElementById('frecuencia-personalizada');
        
        if (selectFrecuencia && campoPersonalizada) {
            selectFrecuencia.addEventListener('change', (e) => {
                if (e.target.value === 'personalizada') {
                    campoPersonalizada.style.display = 'block';
                    document.getElementById('ingreso-intervalo-dias').required = true;
                } else {
                    campoPersonalizada.style.display = 'none';
                    document.getElementById('ingreso-intervalo-dias').required = false;
                }
            });
        }
    }

    /**
     * Marcar campos como requeridos o no
     */
    marcarCamposRequeridos(requeridos) {
        const frecuenciaSelect = document.getElementById('ingreso-frecuencia');
        if (frecuenciaSelect) {
            frecuenciaSelect.required = requeridos;
        }
    }

    /**
     * Limpiar campos de recurrencia
     */
    limpiarCamposRecurrencia() {
        document.getElementById('ingreso-frecuencia').value = '';
        document.getElementById('ingreso-intervalo-dias').value = '';
        document.getElementById('ingreso-fecha-fin').value = '';
        document.getElementById('frecuencia-personalizada').style.display = 'none';
    }

    /**
     * Obtener datos de recurrencia del formulario
     */
    obtenerDatosRecurrencia() {
        const esRecurrente = document.getElementById('ingreso-es-recurrente').checked;
        
        if (!esRecurrente) {
            return {
                es_recurrente: false,
                frecuencia: null,
                intervalo_dias: null,
                fecha_fin: null,
                activo: true,
                proximo_pago: null
            };
        }

        const frecuencia = document.getElementById('ingreso-frecuencia').value;
        const fechaFin = document.getElementById('ingreso-fecha-fin').value || null;
        let intervaloDias = null;

        // Calcular intervalo en días
        if (frecuencia === 'personalizada') {
            intervaloDias = parseInt(document.getElementById('ingreso-intervalo-dias').value) || 30;
        } else if (this.frecuencias[frecuencia]) {
            intervaloDias = this.frecuencias[frecuencia];
        }

        // Calcular próximo pago
        const fechaInicial = document.getElementById('ingreso-fecha').value;
        const proximoPago = this.calcularProximoPago(fechaInicial, intervaloDias);

        return {
            es_recurrente: true,
            frecuencia: frecuencia,
            intervalo_dias: intervaloDias,
            fecha_fin: fechaFin,
            activo: true,
            proximo_pago: proximoPago,
            numero_secuencia: 1
        };
    }

    /**
     * Calcular la fecha del próximo pago
     */
    calcularProximoPago(fechaInicial, intervaloDias) {
        if (!fechaInicial || !intervaloDias) return null;
        
        const fecha = new Date(fechaInicial);
        fecha.setDate(fecha.getDate() + intervaloDias);
        return fecha.toISOString().split('T')[0];
    }

    /**
     * Generar ingresos recurrentes pendientes
     */
    async generarIngresosRecurrentes() {
        try {
            logger.info('🔄 Verificando ingresos recurrentes pendientes...');
            
            // Obtener todos los ingresos recurrentes activos
            const filtros = {
                es_recurrente: true,
                activo: true
            };
            
            const ingresos = await window.gestorApp.storageManager.getIngresos(filtros);
            const hoy = new Date().toISOString().split('T')[0];
            let generados = 0;

            for (const ingreso of ingresos) {
                if (ingreso.proximo_pago && ingreso.proximo_pago <= hoy) {
                    // Verificar si ya pasó la fecha límite
                    if (ingreso.fecha_fin && ingreso.proximo_pago > ingreso.fecha_fin) {
                        // Desactivar recurrencia
                        await this.desactivarRecurrencia(ingreso.id, 'ingreso');
                        continue;
                    }

                    // Generar nuevo ingreso
                    await this.generarNuevoIngreso(ingreso);
                    generados++;
                }
            }

            if (generados > 0) {
                logger.info(`✅ Se generaron ${generados} ingresos recurrentes`);
                window.gestorApp.mostrarNotificacion(
                    `🔄 Se generaron ${generados} ingresos recurrentes`, 
                    'success'
                );
                
                // Recargar datos
                await window.gestorApp.cargarTabla();
            }

        } catch (error) {
            logger.error('Error al generar ingresos recurrentes:', error);
        }
    }

    /**
     * Generar un nuevo ingreso basado en uno recurrente
     */
    async generarNuevoIngreso(ingresoOriginal) {
        try {
            const nuevoIngreso = {
                titulo: ingresoOriginal.titulo || ingresoOriginal.descripcion,
                cantidad: ingresoOriginal.cantidad || ingresoOriginal.monto,
                categoria: ingresoOriginal.categoria,
                fecha: ingresoOriginal.proximo_pago,
                descripcion: `${ingresoOriginal.descripcion || ingresoOriginal.titulo} (Recurrente #${(ingresoOriginal.numero_secuencia || 0) + 1})`,
                es_recurrente: false, // El ingreso generado no es recurrente
                ingreso_padre_id: ingresoOriginal.ingreso_padre_id || ingresoOriginal.id,
                numero_secuencia: (ingresoOriginal.numero_secuencia || 0) + 1
            };

            // Guardar el nuevo ingreso
            await window.gestorApp.storageManager.addIngreso(nuevoIngreso);

            // Actualizar el próximo pago del ingreso original
            const proximoPago = this.calcularProximoPago(
                ingresoOriginal.proximo_pago, 
                ingresoOriginal.intervalo_dias
            );

            await this.actualizarProximoPago(ingresoOriginal.id, proximoPago, ingresoOriginal.numero_secuencia + 1);

        } catch (error) {
            logger.error('Error al generar nuevo ingreso recurrente:', error);
        }
    }

    /**
     * Actualizar la fecha del próximo pago
     */
    async actualizarProximoPago(ingresoId, proximoPago, numeroSecuencia) {
        try {
            const datosActualizacion = {
                proximo_pago: proximoPago,
                numero_secuencia: numeroSecuencia,
                updated_at: new Date().toISOString()
            };

            if (window.gestorApp.storageManager.useSupabase) {
                await window.SupabaseConfig.utils.update('ingresos', ingresoId, datosActualizacion);
            } else {
                // Actualizar en localStorage
                const ingresos = window.gestorApp.storageManager.getFromLocalStorage('ingresos') || [];
                const index = ingresos.findIndex(i => i.id === ingresoId);
                if (index !== -1) {
                    Object.assign(ingresos[index], datosActualizacion);
                    window.gestorApp.storageManager.saveToLocalStorage('ingresos', ingresos);
                }
            }

        } catch (error) {
            logger.error('Error al actualizar próximo pago:', error);
        }
    }

    /**
     * Desactivar recurrencia de un ingreso
     */
    async desactivarRecurrencia(ingresoId, tipo) {
        try {
            const tabla = tipo === 'ingreso' ? 'ingresos' : 'gastos';
            const datosActualizacion = {
                activo: false,
                updated_at: new Date().toISOString()
            };

            if (window.gestorApp.storageManager.useSupabase) {
                await window.SupabaseConfig.utils.update(tabla, ingresoId, datosActualizacion);
            }

            logger.info(`🔄 Recurrencia desactivada para ${tipo}: ${ingresoId}`);

        } catch (error) {
            logger.error('Error al desactivar recurrencia:', error);
        }
    }

    /**
     * Obtener resumen de ingresos recurrentes
     */
    async obtenerResumenRecurrentes() {
        try {
            const filtros = { es_recurrente: true, activo: true };
            const ingresos = await window.gestorApp.storageManager.getIngresos(filtros);
            
            return {
                total: ingresos.length,
                montoMensual: this.calcularMontoMensualEstimado(ingresos),
                proximos: ingresos
                    .filter(i => i.proximo_pago)
                    .sort((a, b) => new Date(a.proximo_pago) - new Date(b.proximo_pago))
                    .slice(0, 5)
            };

        } catch (error) {
            logger.error('Error al obtener resumen de recurrentes:', error);
            return { total: 0, montoMensual: 0, proximos: [] };
        }
    }

    /**
     * Calcular monto mensual estimado de ingresos recurrentes
     */
    calcularMontoMensualEstimado(ingresos) {
        return ingresos.reduce((total, ingreso) => {
            const monto = parseFloat(ingreso.cantidad || ingreso.monto || 0);
            const intervaloDias = ingreso.intervalo_dias || 30;
            const montoMensual = (monto * 30) / intervaloDias;
            return total + montoMensual;
        }, 0);
    }
}

// Crear instancia global
window.RecurrenceManager = new RecurrenceManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.RecurrenceManager.inicializarEventos();
    
    // Verificar ingresos recurrentes cada vez que se carga la página
    setTimeout(() => {
        if (window.gestorApp && window.gestorApp.storageManager) {
            window.RecurrenceManager.generarIngresosRecurrentes();
        }
    }, 2000);
});
