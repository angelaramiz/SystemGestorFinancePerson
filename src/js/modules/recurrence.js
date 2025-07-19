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
                    const intervaloDiasEl = document.getElementById('ingreso-intervalo-dias');
                    if (intervaloDiasEl) intervaloDiasEl.required = true;
                } else {
                    campoPersonalizada.style.display = 'none';
                    const intervaloDiasEl = document.getElementById('ingreso-intervalo-dias');
                    if (intervaloDiasEl) intervaloDiasEl.required = false;
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
     * Limpiar campos de recurrencia (función genérica)
     */
    limpiarCamposRecurrencia(tipo = 'ingreso') {
        try {
            // Obtener prefijo según el tipo
            const prefijo = tipo === 'ingreso' ? 'ingreso' : 'gasto';
            
            // Verificar y limpiar campos
            const frecuenciaEl = document.getElementById(`${prefijo}-frecuencia`);
            if (frecuenciaEl) frecuenciaEl.value = '';
            
            const intervaloDiasEl = document.getElementById(`${prefijo}-intervalo-dias`);
            if (intervaloDiasEl) intervaloDiasEl.value = '';
            
            const fechaFinEl = document.getElementById(`${prefijo}-fecha-fin`);
            if (fechaFinEl) fechaFinEl.value = '';
            
            const frecuenciaPersonalizadaEl = document.getElementById('frecuencia-personalizada');
            if (frecuenciaPersonalizadaEl) frecuenciaPersonalizadaEl.style.display = 'none';
            
            // Limpiar checkbox de recurrencia
            const esRecurrenteEl = document.getElementById(`${prefijo}-es-recurrente`);
            if (esRecurrenteEl) esRecurrenteEl.checked = false;
            
            // Ocultar campos de recurrencia
            const camposRecurrenciaEl = document.getElementById('campos-recurrencia');
            if (camposRecurrenciaEl) camposRecurrenciaEl.style.display = 'none';
            
        } catch (error) {
            console.warn('Error al limpiar campos de recurrencia:', error);
        }
    }

    /**
     * Obtener datos de recurrencia del formulario
     */
    obtenerDatosRecurrencia() {
        const esRecurrenteEl = document.getElementById('ingreso-es-recurrente');
        const esRecurrente = esRecurrenteEl ? esRecurrenteEl.checked : false;
        
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

        const frecuenciaEl = document.getElementById('ingreso-frecuencia');
        const frecuencia = frecuenciaEl ? frecuenciaEl.value : null;
        
        const fechaFinEl = document.getElementById('ingreso-fecha-fin');
        const fechaFin = fechaFinEl ? fechaFinEl.value || null : null;
        
        let intervaloDias = null;

        // Calcular intervalo en días
        if (frecuencia === 'personalizada') {
            const intervaloDiasEl = document.getElementById('ingreso-intervalo-dias');
            intervaloDias = intervaloDiasEl ? parseInt(intervaloDiasEl.value) || 30 : 30;
        } else if (this.frecuencias[frecuencia]) {
            intervaloDias = this.frecuencias[frecuencia];
        }

        // Calcular próximo pago
        const fechaInicialEl = document.getElementById('ingreso-fecha');
        const fechaInicial = fechaInicialEl ? fechaInicialEl.value : null;
        const proximoPago = fechaInicial ? this.calcularProximoPago(fechaInicial, intervaloDias) : null;

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
    calcularProximoPago(fechaInicial, intervaloDias, frecuencia = null, diaRecurrencia = null) {
        if (!fechaInicial || !intervaloDias) return null;
        
        const fecha = new Date(fechaInicial);
        
        // Para recurrencias mensuales con día específico, usar la función mejorada
        if (frecuencia === 'mensual' && diaRecurrencia) {
            const diaDelMes = parseInt(diaRecurrencia);
            const siguienteFecha = this.calcularSiguienteFechaMensual(fecha, diaDelMes, 1);
            return siguienteFecha.toISOString().split('T')[0];
        } else {
            // Para otras frecuencias, usar el intervalo de días
            fecha.setDate(fecha.getDate() + intervaloDias);
            return fecha.toISOString().split('T')[0];
        }
    }

    /**
     * Calcular siguiente fecha mensual manteniendo el día específico
     * Maneja correctamente meses con diferente cantidad de días (28, 29, 30, 31)
     */
    calcularSiguienteFechaMensual(fechaActual, diaDeseado, mesesAAgregar = 1) {
        const año = fechaActual.getFullYear();
        const mes = fechaActual.getMonth();
        
        // Ir al primer día del mes objetivo
        const nuevaFecha = new Date(año, mes + mesesAAgregar, 1);
        
        // Obtener el último día del mes objetivo
        const ultimoDiaDelMes = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1, 0).getDate();
        
        // Si el día deseado existe en el mes, usarlo; si no, usar el último día disponible
        const diaFinal = Math.min(diaDeseado, ultimoDiaDelMes);
        
        return new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), diaFinal);
    }

    /**
     * Generar ingresos recurrentes pendientes
     */
    async generarIngresosRecurrentes() {
        try {
            logger.info('🔄 Verificando ingresos recurrentes pendientes...');
            
            // Verificar si la estructura de la base de datos está actualizada
            const estructuraActualizada = await this.verificarEstructuraDB();
            if (!estructuraActualizada) {
                logger.warn('⚠️ La estructura de la base de datos no está actualizada para soportar recurrencia');
                return;
            }
            
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

    /**
     * Verificar si la estructura de la base de datos está actualizada para soportar recurrencia
     */
    async verificarEstructuraDB() {
        try {
            // Si no estamos usando Supabase, asumimos que está bien (LocalStorage)
            if (!window.gestorApp.storageManager.useSupabase) {
                return true;
            }

            // Verificar si la columna es_recurrente existe en la tabla ingresos
            if (window.SupabaseConfig && window.SupabaseConfig.utils) {
                // Intentar obtener un registro con el filtro es_recurrente
                // Si la columna no existe, generará un error 42703
                try {
                    await window.SupabaseConfig.utils.select('ingresos', { es_recurrente: true }, 1);
                    // Si no hay error, la columna existe
                    logger.info('✅ Estructura de base de datos actualizada para recurrencia');
                    return true;
                } catch (error) {
                    // Verificar si el error es por columna inexistente
                    if (error && error.code === '42703') {
                        logger.warn('⚠️ La columna es_recurrente no existe en la tabla ingresos');
                        this.mostrarAlertaActualizacion();
                        return false;
                    }
                    // Si es otro tipo de error, asumimos que está bien
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            logger.error('Error al verificar estructura de DB:', error);
            return false;
        }
    }

    /**
     * Mostrar alerta para actualizar la estructura de la base de datos
     */
    mostrarAlertaActualizacion() {
        if (window.gestorApp && window.gestorApp.mostrarNotificacion) {
            // Crear botón en la notificación para mostrar el script SQL
            const mensaje = `
                <div class="notification-with-action">
                    <p>⚠️ La base de datos necesita actualizarse para soportar ingresos y gastos recurrentes.</p>
                    <div class="notification-actions">
                        <button id="ver-script-sql" class="btn btn-primary">Ver instrucciones</button>
                        <button id="continuar-sin-recurrencia" class="btn btn-secondary">Continuar sin recurrencia</button>
                    </div>
                </div>
            `;
            
            window.gestorApp.mostrarNotificacion(mensaje, 'warning', 0); // 0 = no auto-cerrar
            
            // Agregar eventos a los botones
            setTimeout(() => {
                const botonVerScript = document.getElementById('ver-script-sql');
                if (botonVerScript) {
                    botonVerScript.addEventListener('click', () => {
                        if (window.gestorApp.mostrarScriptActualizacionBD) {
                            window.gestorApp.mostrarScriptActualizacionBD();
                            
                            // Cerrar la notificación después de mostrar el script
                            const notificacion = document.querySelector('.notification');
                            if (notificacion) {
                                notificacion.remove();
                            }
                        }
                    });
                }
                
                const botonContinuar = document.getElementById('continuar-sin-recurrencia');
                if (botonContinuar) {
                    botonContinuar.addEventListener('click', () => {
                        // Cerrar la notificación
                        const notificacion = document.querySelector('.notification');
                        if (notificacion) {
                            notificacion.remove();
                        }
                        
                        // Mostrar mensaje de confirmación
                        window.gestorApp.mostrarNotificacion(
                            'Continuando sin funcionalidad de recurrencia. Puede actualizar la base de datos más tarde desde el menú de configuración.',
                            'info'
                        );
                    });
                }
            }, 100);
        }
    }

    /**
     * Generar instancias futuras de un ingreso recurrente para mostrar en el calendario
     */
    async generarInstanciasFuturas(ingresoRecurrente, cantidadInstancias = 12) {
        try {
            const instancias = [];
            let fechaActual = new Date(ingresoRecurrente.proximo_pago);
            const fechaFin = ingresoRecurrente.fecha_fin_recurrencia ? new Date(ingresoRecurrente.fecha_fin_recurrencia) : null;
            
            // Si no hay fecha fin, limitar a 6 meses máximo
            if (!fechaFin) {
                cantidadInstancias = Math.min(cantidadInstancias, 6);
            }
            
            for (let i = 0; i < cantidadInstancias; i++) {
                // Verificar si ya pasó la fecha límite
                if (fechaFin && fechaActual > fechaFin) {
                    break;
                }
                
                const nuevaInstancia = {
                    id: `${ingresoRecurrente.id}_instancia_${i + 1}`,
                    tipo: ingresoRecurrente.tipo,
                    descripcion: `${ingresoRecurrente.descripcion} (${ingresoRecurrente.frecuencia_recurrencia} #${i + 1})`,
                    monto: ingresoRecurrente.monto,
                    fecha: fechaActual.toISOString().split('T')[0],
                    categoria: ingresoRecurrente.categoria,
                    notas: ingresoRecurrente.notas,
                    es_recurrente: false, // Las instancias no son recurrentes
                    es_instancia_futura: true, // Marcar como instancia futura
                    ingreso_padre_id: ingresoRecurrente.id,
                    numero_secuencia: i + 2, // Empezar desde 2 porque el padre es 1
                    estado: 'futuro'
                };
                
                instancias.push(nuevaInstancia);
                
                // Calcular siguiente fecha
                if (ingresoRecurrente.frecuencia_recurrencia === 'mensual' && ingresoRecurrente.dia_recurrencia) {
                    const diaDelMes = parseInt(ingresoRecurrente.dia_recurrencia);
                    fechaActual = this.calcularSiguienteFechaMensual(fechaActual, diaDelMes, 1);
                } else {
                    fechaActual = new Date(fechaActual.getTime() + (ingresoRecurrente.intervalo_dias * 24 * 60 * 60 * 1000));
                }
            }
            
            logger.info(`📅 Generadas ${instancias.length} instancias futuras para ingreso recurrente`);
            return instancias;
            
        } catch (error) {
            logger.error('Error al generar instancias futuras:', error);
            return [];
        }
    }

    /**
     * Generar instancias futuras de un gasto recurrente para mostrar en el calendario
     */
    async generarInstanciasFuturasGastos(gastoRecurrente, cantidadInstancias = 6) {
        try {
            const instancias = [];
            let fechaActual = new Date(gastoRecurrente.proximo_pago);
            const fechaFin = gastoRecurrente.fecha_fin_recurrencia ? new Date(gastoRecurrente.fecha_fin_recurrencia) : null;
            
            // Si no hay fecha fin, limitar a 6 meses máximo
            if (!fechaFin) {
                cantidadInstancias = Math.min(cantidadInstancias, 6);
            }
            
            for (let i = 0; i < cantidadInstancias; i++) {
                // Verificar si ya pasó la fecha límite
                if (fechaFin && fechaActual > fechaFin) {
                    break;
                }
                
                const nuevaInstancia = {
                    id: `${gastoRecurrente.id}_gasto_instancia_${i + 1}`,
                    tipo: gastoRecurrente.tipo,
                    descripcion: `${gastoRecurrente.descripcion} (${gastoRecurrente.frecuencia_recurrencia} #${i + 1})`,
                    monto: gastoRecurrente.monto,
                    fecha: fechaActual.toISOString().split('T')[0],
                    categoria: gastoRecurrente.categoria,
                    notas: gastoRecurrente.notas,
                    es_recurrente: false, // Las instancias no son recurrentes
                    es_instancia_futura: true, // Marcar como instancia futura
                    gasto_padre_id: gastoRecurrente.id,
                    numero_secuencia: i + 2, // Empezar desde 2 porque el padre es 1
                    estado: 'futuro'
                };
                
                instancias.push(nuevaInstancia);
                
                // Calcular siguiente fecha usando la lógica mejorada para fechas mensuales
                if (gastoRecurrente.frecuencia_recurrencia === 'mensual' && gastoRecurrente.dia_recurrencia) {
                    const diaDelMes = parseInt(gastoRecurrente.dia_recurrencia);
                    fechaActual = this.calcularSiguienteFechaMensual(fechaActual, diaDelMes, 1);
                } else {
                    // Para otras frecuencias, usar el intervalo de días
                    fechaActual = new Date(fechaActual.getTime() + (gastoRecurrente.intervalo_dias * 24 * 60 * 60 * 1000));
                }
            }
            
            logger.info(`📅 Generadas ${instancias.length} instancias futuras para gasto recurrente`);
            return instancias;
            
        } catch (error) {
            logger.error('Error al generar instancias futuras de gastos:', error);
            return [];
        }
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
