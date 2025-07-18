/**
 * recurrencia.js - Módulo para gestionar transacciones recurrentes
 * Parte del Sistema de Gestión Financiera Personal
 */

// Objeto principal para gestionar recurrencias
const GestorRecurrencia = {
    // Opciones de frecuencia disponibles
    FRECUENCIAS: {
        SEMANAL: 'semanal',
        QUINCENAL: 'quincenal',
        MENSUAL: 'mensual',
        BIMESTRAL: 'bimestral',
        TRIMESTRAL: 'trimestral',
        SEMESTRAL: 'semestral',
        ANUAL: 'anual'
    },

    /**
     * Configurar una transacción como recurrente
     * @param {Object} transaccion - Objeto de ingreso o gasto
     * @param {String} tipoTransaccion - 'ingreso' o 'gasto'
     * @param {Object} datosRecurrencia - Configuración de recurrencia
     * @returns {Object} - La transacción con datos de recurrencia
     */
    configurarRecurrencia(transaccion, tipoTransaccion, datosRecurrencia) {
        // Validamos el tipo de transacción
        if (tipoTransaccion !== 'ingreso' && tipoTransaccion !== 'gasto') {
            console.error('Tipo de transacción no válido');
            return null;
        }

        // Copiamos la transacción y agregamos los datos de recurrencia
        const transaccionRecurrente = { ...transaccion };
        
        transaccionRecurrente.es_recurrente = true;
        transaccionRecurrente.frecuencia_recurrencia = datosRecurrencia.frecuencia || this.FRECUENCIAS.MENSUAL;
        transaccionRecurrente.dia_recurrencia = datosRecurrencia.dia || '1';
        transaccionRecurrente.fecha_fin_recurrencia = datosRecurrencia.fechaFin || null;
        transaccionRecurrente.activo = true;
        
        // Calcular próximo pago basado en la frecuencia
        transaccionRecurrente.proximo_pago = this.calcularProximoPago(
            transaccion.fecha, 
            transaccionRecurrente.frecuencia_recurrencia,
            transaccionRecurrente.dia_recurrencia
        );
        
        // Número inicial de secuencia
        transaccionRecurrente.numero_secuencia = 1;
        
        // El ID padre será null ya que esta es la transacción original
        if (tipoTransaccion === 'ingreso') {
            transaccionRecurrente.ingreso_padre_id = null;
        } else {
            transaccionRecurrente.gasto_padre_id = null;
        }
        
        return transaccionRecurrente;
    },

    /**
     * Calcula la fecha del próximo pago basado en la fecha actual y frecuencia
     * @param {Date|String} fechaBase - Fecha desde la que calcular
     * @param {String} frecuencia - Tipo de frecuencia (de FRECUENCIAS)
     * @param {String} dia - Día específico para la recurrencia
     * @returns {Date} - Fecha del próximo pago
     */
    calcularProximoPago(fechaBase, frecuencia, dia) {
        // Convertir a objeto Date si es un string
        const fecha = (typeof fechaBase === 'string') 
            ? new Date(fechaBase) 
            : new Date(fechaBase.getTime());
        
        // Clonar la fecha para no modificar la original
        const proximaFecha = new Date(fecha.getTime());
        
        // Ajustar según la frecuencia
        switch (frecuencia) {
            case this.FRECUENCIAS.SEMANAL:
                proximaFecha.setDate(proximaFecha.getDate() + 7);
                break;
                
            case this.FRECUENCIAS.QUINCENAL:
                proximaFecha.setDate(proximaFecha.getDate() + 15);
                break;
                
            case this.FRECUENCIAS.MENSUAL:
                proximaFecha.setMonth(proximaFecha.getMonth() + 1);
                // Si hay un día específico, intentamos ajustar
                if (dia && !isNaN(parseInt(dia))) {
                    const diaEspecifico = parseInt(dia);
                    proximaFecha.setDate(Math.min(diaEspecifico, 
                        this.obtenerUltimoDiaMes(proximaFecha.getFullYear(), proximaFecha.getMonth())));
                }
                break;
                
            case this.FRECUENCIAS.BIMESTRAL:
                proximaFecha.setMonth(proximaFecha.getMonth() + 2);
                if (dia && !isNaN(parseInt(dia))) {
                    const diaEspecifico = parseInt(dia);
                    proximaFecha.setDate(Math.min(diaEspecifico, 
                        this.obtenerUltimoDiaMes(proximaFecha.getFullYear(), proximaFecha.getMonth())));
                }
                break;
                
            case this.FRECUENCIAS.TRIMESTRAL:
                proximaFecha.setMonth(proximaFecha.getMonth() + 3);
                if (dia && !isNaN(parseInt(dia))) {
                    const diaEspecifico = parseInt(dia);
                    proximaFecha.setDate(Math.min(diaEspecifico, 
                        this.obtenerUltimoDiaMes(proximaFecha.getFullYear(), proximaFecha.getMonth())));
                }
                break;
                
            case this.FRECUENCIAS.SEMESTRAL:
                proximaFecha.setMonth(proximaFecha.getMonth() + 6);
                if (dia && !isNaN(parseInt(dia))) {
                    const diaEspecifico = parseInt(dia);
                    proximaFecha.setDate(Math.min(diaEspecifico, 
                        this.obtenerUltimoDiaMes(proximaFecha.getFullYear(), proximaFecha.getMonth())));
                }
                break;
                
            case this.FRECUENCIAS.ANUAL:
                proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);
                if (dia && !isNaN(parseInt(dia))) {
                    const diaEspecifico = parseInt(dia);
                    proximaFecha.setDate(Math.min(diaEspecifico, 
                        this.obtenerUltimoDiaMes(proximaFecha.getFullYear(), proximaFecha.getMonth())));
                }
                break;
                
            default:
                console.warn('Frecuencia no reconocida, usando mensual por defecto');
                proximaFecha.setMonth(proximaFecha.getMonth() + 1);
        }
        
        return proximaFecha;
    },

    /**
     * Obtiene el último día del mes
     * @param {Number} año - Año a consultar
     * @param {Number} mes - Mes a consultar (0-11)
     * @returns {Number} - Último día del mes
     */
    obtenerUltimoDiaMes(año, mes) {
        return new Date(año, mes + 1, 0).getDate();
    },

    /**
     * Genera la próxima transacción en una serie recurrente
     * @param {Object} transaccionPadre - Transacción recurrente original
     * @param {String} tipoTransaccion - 'ingreso' o 'gasto'
     * @returns {Object} - Nueva instancia de la transacción recurrente
     */
    generarSiguienteTransaccion(transaccionPadre, tipoTransaccion) {
        if (!transaccionPadre.es_recurrente || !transaccionPadre.activo) {
            console.error('La transacción no es recurrente o está inactiva');
            return null;
        }
        
        // Verificar si ya se alcanzó la fecha límite
        if (transaccionPadre.fecha_fin_recurrencia) {
            const fechaFin = new Date(transaccionPadre.fecha_fin_recurrencia);
            const hoy = new Date();
            
            if (hoy > fechaFin) {
                console.log('Se ha alcanzado la fecha límite para esta recurrencia');
                // Desactivar la recurrencia
                transaccionPadre.activo = false;
                return null;
            }
        }
        
        // Crear una nueva instancia basada en la transacción padre
        const nuevaTransaccion = { ...transaccionPadre };
        
        // Actualizar campos específicos
        nuevaTransaccion.id = null; // Será generado por la base de datos
        nuevaTransaccion.fecha = transaccionPadre.proximo_pago;
        nuevaTransaccion.pagado = false;
        nuevaTransaccion.numero_secuencia = transaccionPadre.numero_secuencia + 1;
        
        // Establecer referencia al padre
        if (tipoTransaccion === 'ingreso') {
            nuevaTransaccion.ingreso_padre_id = transaccionPadre.id;
        } else {
            nuevaTransaccion.gasto_padre_id = transaccionPadre.id;
        }
        
        // Calcular el próximo pago para esta nueva instancia
        nuevaTransaccion.proximo_pago = this.calcularProximoPago(
            nuevaTransaccion.fecha,
            nuevaTransaccion.frecuencia_recurrencia,
            nuevaTransaccion.dia_recurrencia
        );
        
        return nuevaTransaccion;
    },

    /**
     * Verifica y genera las transacciones recurrentes pendientes
     * @param {Array} ingresos - Lista de ingresos
     * @param {Array} gastos - Lista de gastos
     * @param {Function} callbackGuardarIngreso - Función para guardar un ingreso
     * @param {Function} callbackGuardarGasto - Función para guardar un gasto
     * @returns {Object} - Estadísticas de las transacciones generadas
     */
    procesarRecurrenciasPendientes(ingresos, gastos, callbackGuardarIngreso, callbackGuardarGasto) {
        const hoy = new Date();
        const estadisticas = {
            ingresosGenerados: 0,
            gastosGenerados: 0,
            errores: 0
        };
        
        // Procesar ingresos recurrentes
        if (ingresos && ingresos.length) {
            const ingresosRecurrentes = ingresos.filter(ingreso => 
                ingreso.es_recurrente && 
                ingreso.activo && 
                new Date(ingreso.proximo_pago) <= hoy
            );
            
            for (const ingresoPadre of ingresosRecurrentes) {
                try {
                    const nuevoIngreso = this.generarSiguienteTransaccion(ingresoPadre, 'ingreso');
                    if (nuevoIngreso) {
                        // Actualizar la fecha del próximo pago en el padre
                        ingresoPadre.proximo_pago = nuevoIngreso.proximo_pago;
                        
                        // Guardar tanto el nuevo ingreso como el padre actualizado
                        if (typeof callbackGuardarIngreso === 'function') {
                            callbackGuardarIngreso(nuevoIngreso);
                            callbackGuardarIngreso(ingresoPadre);
                            estadisticas.ingresosGenerados++;
                        }
                    }
                } catch (error) {
                    console.error('Error al procesar ingreso recurrente:', error);
                    estadisticas.errores++;
                }
            }
        }
        
        // Procesar gastos recurrentes
        if (gastos && gastos.length) {
            const gastosRecurrentes = gastos.filter(gasto => 
                gasto.es_recurrente && 
                gasto.activo && 
                new Date(gasto.proximo_pago) <= hoy
            );
            
            for (const gastoPadre of gastosRecurrentes) {
                try {
                    const nuevoGasto = this.generarSiguienteTransaccion(gastoPadre, 'gasto');
                    if (nuevoGasto) {
                        // Actualizar la fecha del próximo pago en el padre
                        gastoPadre.proximo_pago = nuevoGasto.proximo_pago;
                        
                        // Guardar tanto el nuevo gasto como el padre actualizado
                        if (typeof callbackGuardarGasto === 'function') {
                            callbackGuardarGasto(nuevoGasto);
                            callbackGuardarGasto(gastoPadre);
                            estadisticas.gastosGenerados++;
                        }
                    }
                } catch (error) {
                    console.error('Error al procesar gasto recurrente:', error);
                    estadisticas.errores++;
                }
            }
        }
        
        return estadisticas;
    },

    /**
     * Obtiene un texto descriptivo para la frecuencia
     * @param {String} frecuencia - Código de frecuencia
     * @returns {String} - Texto descriptivo en español
     */
    obtenerTextoFrecuencia(frecuencia) {
        switch (frecuencia) {
            case this.FRECUENCIAS.SEMANAL:
                return 'Semanal';
            case this.FRECUENCIAS.QUINCENAL:
                return 'Quincenal';
            case this.FRECUENCIAS.MENSUAL:
                return 'Mensual';
            case this.FRECUENCIAS.BIMESTRAL:
                return 'Bimestral';
            case this.FRECUENCIAS.TRIMESTRAL:
                return 'Trimestral';
            case this.FRECUENCIAS.SEMESTRAL:
                return 'Semestral';
            case this.FRECUENCIAS.ANUAL:
                return 'Anual';
            default:
                return 'Desconocida';
        }
    },

    /**
     * Obtiene opciones para un selector de frecuencias
     * @returns {String} - HTML con las opciones
     */
    obtenerOpcionesFrecuencia() {
        return `
            <option value="${this.FRECUENCIAS.SEMANAL}">Semanal</option>
            <option value="${this.FRECUENCIAS.QUINCENAL}">Quincenal</option>
            <option value="${this.FRECUENCIAS.MENSUAL}" selected>Mensual</option>
            <option value="${this.FRECUENCIAS.BIMESTRAL}">Bimestral</option>
            <option value="${this.FRECUENCIAS.TRIMESTRAL}">Trimestral</option>
            <option value="${this.FRECUENCIAS.SEMESTRAL}">Semestral</option>
            <option value="${this.FRECUENCIAS.ANUAL}">Anual</option>
        `;
    }
};

// Exponer el objeto globalmente
window.GestorRecurrencia = GestorRecurrencia;
