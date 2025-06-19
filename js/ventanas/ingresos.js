/**
 * Gestión de la ventana de ingresos
 * Implementa el calendario dinámico y la lista de ingresos según especificación
 */

class VentanaIngresos {
    constructor() {
        this.ingresos = [];
        this.calendario = null;
        this.filtros = {
            tipo: '',
            recurrencia: ''
        };
        
        this.init();
    }

    init() {
        this.configurarEventListeners();
        this.inicializarCalendario();
        this.cargarIngresos();
    }

    configurarEventListeners() {
        // Filtros
        const filtroTipo = document.getElementById('filtro-tipo-ingreso');
        const filtroRecurrencia = document.getElementById('filtro-recurrencia');

        if (filtroTipo) {
            filtroTipo.addEventListener('change', () => {
                this.filtros.tipo = filtroTipo.value;
                this.aplicarFiltros();
            });
        }

        if (filtroRecurrencia) {
            filtroRecurrencia.addEventListener('change', () => {
                this.filtros.recurrencia = filtroRecurrencia.value;
                this.aplicarFiltros();
            });
        }
    }

    /**
     * Inicializar calendario usando FullCalendar
     */
    inicializarCalendario() {
        const calendarioElement = document.getElementById('calendar-ingresos');
        if (!calendarioElement) return;

        try {
            this.calendario = new FullCalendar.Calendar(calendarioElement, {
                initialView: 'dayGridMonth',
                locale: 'es',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listWeek'
                },
                buttonText: {
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    list: 'Lista'
                },
                events: [],
                eventClick: (info) => {
                    this.manejarClickEvento(info);
                },
                dateClick: (info) => {
                    this.manejarClickFecha(info);
                },
                eventDidMount: (info) => {
                    // Agregar tooltip
                    info.el.setAttribute('title', this.generarTooltipIngreso(info.event));
                }
            });

            this.calendario.render();
            console.log('📅 Calendario de ingresos inicializado');

        } catch (error) {
            console.error('Error inicializando calendario de ingresos:', error);
        }
    }

    /**
     * Cargar ingresos desde IndexedDB
     */
    async cargarIngresos() {
        try {
            if (!window.indexedDBManager) {
                console.warn('IndexedDB no disponible');
                return;
            }

            this.ingresos = await window.indexedDBManager.obtenerIngresos();
            console.log(`📈 ${this.ingresos.length} ingresos cargados`);

            this.actualizarLista();
            this.actualizarCalendario();

        } catch (error) {
            console.error('Error cargando ingresos:', error);
            this.mostrarError('Error al cargar los ingresos');
        }
    }

    /**
     * Actualizar la lista visual de ingresos
     */
    actualizarLista() {
        const lista = document.getElementById('lista-ingresos');
        if (!lista) return;

        const ingresosFiltrados = this.aplicarFiltrosADatos(this.ingresos);

        if (ingresosFiltrados.length === 0) {
            lista.innerHTML = this.generarEstadoVacio();
            return;
        }

        // Ordenar por fecha más reciente
        ingresosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        lista.innerHTML = ingresosFiltrados.map(ingreso => this.generarItemIngreso(ingreso)).join('');
    }

    /**
     * Actualizar eventos del calendario
     */
    actualizarCalendario() {
        if (!this.calendario) return;

        // Limpiar eventos existentes
        this.calendario.removeAllEvents();

        // Generar eventos para cada ingreso
        const eventos = this.generarEventosCalendario();

        // Agregar eventos al calendario
        eventos.forEach(evento => {
            this.calendario.addEvent(evento);
        });
    }

    /**
     * Generar eventos del calendario para ingresos
     */
    generarEventosCalendario() {
        const eventos = [];
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1); // Un mes atrás
        
        const fechaFin = new Date();
        fechaFin.setMonth(fechaFin.getMonth() + 12); // Un año adelante

        this.ingresos.forEach(ingreso => {
            if (ingreso.recurrente) {
                // Generar eventos recurrentes
                const fechasRecurrentes = this.generarFechasRecurrentes(ingreso, fechaInicio, fechaFin);
                fechasRecurrentes.forEach(fecha => {
                    eventos.push(this.crearEventoCalendario(ingreso, fecha));
                });
            } else {
                // Evento único
                const fechaIngreso = new Date(ingreso.fecha);
                if (fechaIngreso >= fechaInicio && fechaIngreso <= fechaFin) {
                    eventos.push(this.crearEventoCalendario(ingreso, ingreso.fecha));
                }
            }
        });

        return eventos;
    }

    /**
     * Generar fechas recurrentes para un ingreso
     */
    generarFechasRecurrentes(ingreso, fechaInicio, fechaFin) {
        const fechas = [];
        let fechaActual = new Date(ingreso.fecha);

        // Asegurar que empezamos desde la fecha de inicio del rango
        while (fechaActual < fechaInicio) {
            fechaActual = this.calcularSiguienteFecha(fechaActual, ingreso.frecuencia);
        }

        // Generar fechas hasta el final del rango
        while (fechaActual <= fechaFin) {
            fechas.push(fechaActual.toISOString().split('T')[0]);
            fechaActual = this.calcularSiguienteFecha(fechaActual, ingreso.frecuencia);
        }

        return fechas;
    }

    /**
     * Calcular siguiente fecha según frecuencia
     */
    calcularSiguienteFecha(fecha, frecuencia) {
        const nuevaFecha = new Date(fecha);

        switch (frecuencia) {
            case 'diario':
                nuevaFecha.setDate(nuevaFecha.getDate() + 1);
                break;
            case 'semanal':
                nuevaFecha.setDate(nuevaFecha.getDate() + 7);
                break;
            case 'quincenal':
                nuevaFecha.setDate(nuevaFecha.getDate() + 15);
                break;
            case 'mensual':
                nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
                break;
            default:
                nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
        }

        return nuevaFecha;
    }

    /**
     * Crear evento para el calendario
     */
    crearEventoCalendario(ingreso, fecha) {
        return {
            id: `${ingreso.id}-${fecha}`,
            title: `💰 ${ingreso.descripcion}`,
            start: fecha,
            backgroundColor: this.obtenerColorIngreso(ingreso),
            borderColor: this.obtenerColorIngreso(ingreso),
            textColor: '#ffffff',
            extendedProps: {
                ingresoId: ingreso.id,
                tipo: 'ingreso',
                monto: ingreso.monto,
                descripcion: ingreso.descripcion,
                tipoIngreso: ingreso.tipo,
                recurrente: ingreso.recurrente
            }
        };
    }

    /**
     * Obtener color según tipo de ingreso
     */
    obtenerColorIngreso(ingreso) {
        const colores = {
            'nomina': '#10b981',     // Verde
            'freelance': '#3b82f6',  // Azul
            'venta': '#f59e0b',      // Amarillo
            'inversion': '#8b5cf6',  // Púrpura
            'otro': '#6b7280'        // Gris
        };
        return colores[ingreso.tipo] || colores.otro;
    }

    /**
     * Generar HTML para un item de ingreso
     */
    generarItemIngreso(ingreso) {
        const ingresoObj = new Ingreso(ingreso);
        
        return `
            <div class="item" data-ingreso-id="${ingreso.id}">
                <div class="item-info">
                    <div class="item-title">
                        ${ingresoObj.getIcono()} ${ingreso.descripcion}
                    </div>
                    <div class="item-details">
                        ${this.formatearFecha(ingreso.fecha)} • 
                        ${this.formatearTipo(ingreso.tipo)}
                        ${ingreso.recurrente ? ` • ${this.formatearFrecuencia(ingreso.frecuencia)}` : ' • Único'}
                    </div>
                </div>
                <div class="item-amount">
                    ${this.formatearMonto(ingreso.monto)}
                </div>
                <div class="item-actions">
                    <button class="btn-small btn-edit" onclick="window.ventanaIngresos.editarIngreso('${ingreso.id}')">
                        ✏️
                    </button>
                    <button class="btn-small btn-delete" onclick="window.ventanaIngresos.eliminarIngreso('${ingreso.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generar estado vacío
     */
    generarEstadoVacio() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📈</div>
                <div class="empty-state-title">No hay ingresos registrados</div>
                <div class="empty-state-description">
                    Comienza agregando tu primer ingreso usando el botón "+ Nuevo Ingreso"
                </div>
            </div>
        `;
    }

    /**
     * Aplicar filtros a los datos
     */
    aplicarFiltrosADatos(ingresos) {
        return ingresos.filter(ingreso => {
            if (this.filtros.tipo && ingreso.tipo !== this.filtros.tipo) {
                return false;
            }
            
            if (this.filtros.recurrencia) {
                if (this.filtros.recurrencia === 'unico' && ingreso.recurrente) {
                    return false;
                } else if (this.filtros.recurrencia !== 'unico' && 
                          (!ingreso.recurrente || ingreso.frecuencia !== this.filtros.recurrencia)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    /**
     * Aplicar filtros y actualizar vista
     */
    aplicarFiltros() {
        this.actualizarLista();
        // Guardar filtros en localStorage
        if (window.localStorageManager) {
            window.localStorageManager.setFiltros('ingresos', this.filtros);
        }
    }

    /**
     * Editar ingreso
     */
    editarIngreso(ingresoId) {
        const ingreso = this.ingresos.find(i => i.id === ingresoId);
        if (!ingreso) {
            console.error('Ingreso no encontrado:', ingresoId);
            return;
        }

        if (window.gestorModales) {
            window.gestorModales.abrirModalIngreso(ingreso, (ingresoModificado, accion) => {
                this.cargarIngresos(); // Recargar lista
            });
        }
    }

    /**
     * Eliminar ingreso
     */
    async eliminarIngreso(ingresoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
            return;
        }

        try {
            if (window.indexedDBManager) {
                await window.indexedDBManager.delete('ingresos', ingresoId);
                await this.cargarIngresos(); // Recargar lista
                
                if (window.notificacionesManager) {
                    window.notificacionesManager.mostrar({
                        mensaje: 'Ingreso eliminado correctamente',
                        tipo: 'success'
                    });
                }
            }
        } catch (error) {
            console.error('Error eliminando ingreso:', error);
            this.mostrarError('Error al eliminar el ingreso');
        }
    }

    /**
     * Manejar click en evento del calendario
     */
    manejarClickEvento(info) {
        const ingresoId = info.event.extendedProps.ingresoId;
        if (ingresoId) {
            this.editarIngreso(ingresoId);
        }
    }

    /**
     * Manejar click en fecha del calendario
     */
    manejarClickFecha(info) {
        // Abrir modal para crear nuevo ingreso con la fecha seleccionada
        if (window.gestorModales) {
            const datosIniciales = {
                fecha: info.dateStr
            };
            window.gestorModales.abrirModalIngreso(datosIniciales, (ingreso, accion) => {
                this.cargarIngresos(); // Recargar lista
            });
        }
    }

    /**
     * Generar tooltip para evento
     */
    generarTooltipIngreso(evento) {
        const props = evento.extendedProps;
        return `${props.descripcion}
Monto: ${this.formatearMonto(props.monto)}
Tipo: ${this.formatearTipo(props.tipoIngreso)}
${props.recurrente ? 'Recurrente' : 'Único'}`;
    }    /**
     * Métodos de formato
     */
    formatearMonto(monto) {
        // Usar la configuración global si está disponible
        if (window.formatearMoneda) {
            return window.formatearMoneda(monto);
        }
        
        // Fallback por defecto
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(monto);
    }

    formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatearTipo(tipo) {
        const tipos = {
            'nomina': 'Nómina',
            'freelance': 'Freelance',
            'venta': 'Venta',
            'inversion': 'Inversión',
            'otro': 'Otro'
        };
        return tipos[tipo] || tipo;
    }

    formatearFrecuencia(frecuencia) {
        const frecuencias = {
            'diario': 'Diario',
            'semanal': 'Semanal',
            'quincenal': 'Quincenal',
            'mensual': 'Mensual'
        };
        return frecuencias[frecuencia] || frecuencia;
    }

    /**
     * Mostrar error
     */
    mostrarError(mensaje) {
        if (window.notificacionesManager) {
            window.notificacionesManager.mostrar({
                mensaje: mensaje,
                tipo: 'error'
            });
        } else {
            alert(mensaje);
        }
    }

    /**
     * Exportar ingresos
     */
    exportarIngresos() {
        try {
            const csv = this.generarCSV(this.ingresos);
            this.descargarCSV(csv, 'ingresos.csv');
        } catch (error) {
            console.error('Error exportando ingresos:', error);
            this.mostrarError('Error al exportar los ingresos');
        }
    }

    /**
     * Generar CSV
     */
    generarCSV(ingresos) {
        const headers = ['ID', 'Descripción', 'Tipo', 'Monto', 'Fecha', 'Recurrente', 'Frecuencia'];
        const rows = ingresos.map(ingreso => [
            ingreso.id,
            ingreso.descripcion,
            ingreso.tipo,
            ingreso.monto,
            ingreso.fecha,
            ingreso.recurrente ? 'Sí' : 'No',
            ingreso.frecuencia || 'N/A'
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    /**
     * Descargar CSV
     */
    descargarCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    /**
     * Obtener estadísticas de ingresos
     */
    obtenerEstadisticas() {
        const total = this.ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
        const recurrentes = this.ingresos.filter(i => i.recurrente).length;
        const porTipo = this.ingresos.reduce((acc, ingreso) => {
            acc[ingreso.tipo] = (acc[ingreso.tipo] || 0) + 1;
            return acc;
        }, {});

        return {
            total: this.ingresos.length,
            montoTotal: total,
            recurrentes: recurrentes,
            unicos: this.ingresos.length - recurrentes,
            porTipo: porTipo,
            promedioMonto: this.ingresos.length ? total / this.ingresos.length : 0
        };
    }
}

// Crear instancia global
window.ventanaIngresos = new VentanaIngresos();

// Configurar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Ventana de ingresos inicializada');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VentanaIngresos;
}

// Hacer disponible globalmente la clase
window.VentanaIngresos = VentanaIngresos;
