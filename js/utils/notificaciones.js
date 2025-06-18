/**
 * Sistema de notificaciones para la aplicación
 * Maneja notificaciones en la UI y del navegador
 */

class NotificacionesManager {
    constructor() {
        this.notificaciones = [];
        this.contenedor = null;
        this.maxNotificaciones = 5;
        this.duracionDefecto = 5000;
        
        this.init();
    }

    init() {
        this.crearContenedor();
        this.configurarPermisos();
    }

    /**
     * Crear contenedor de notificaciones en el DOM
     */
    crearContenedor() {
        // Verificar si ya existe
        this.contenedor = document.getElementById('notificaciones-contenedor');
        
        if (!this.contenedor) {
            this.contenedor = document.createElement('div');
            this.contenedor.id = 'notificaciones-contenedor';
            this.contenedor.className = 'notificaciones-contenedor';
            this.contenedor.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(this.contenedor);
        }
    }

    /**
     * Configurar permisos de notificaciones del navegador
     */
    configurarPermisos() {
        if ('Notification' in window && Notification.permission === 'default') {
            // No solicitar permisos automáticamente, esperar acción del usuario
        }
    }

    /**
     * Mostrar notificación en la UI
     */
    mostrar(opciones) {
        const notificacion = {
            id: this.generarId(),
            mensaje: opciones.mensaje || 'Notificación',
            tipo: opciones.tipo || 'info', // success, error, warning, info
            duracion: opciones.duracion || this.duracionDefecto,
            acciones: opciones.acciones || [],
            icono: opciones.icono || this.obtenerIconoPorTipo(opciones.tipo),
            timestamp: Date.now()
        };

        // Agregar a la lista
        this.notificaciones.push(notificacion);

        // Mantener límite
        if (this.notificaciones.length > this.maxNotificaciones) {
            const notificacionAntigua = this.notificaciones.shift();
            this.eliminarElemento(notificacionAntigua.id);
        }

        // Crear elemento DOM
        this.crearElementoNotificacion(notificacion);

        // Auto-eliminar si tiene duración
        if (notificacion.duracion > 0) {
            setTimeout(() => {
                this.cerrar(notificacion.id);
            }, notificacion.duracion);
        }

        return notificacion.id;
    }

    /**
     * Crear elemento DOM para la notificación
     */
    crearElementoNotificacion(notificacion) {
        const elemento = document.createElement('div');
        elemento.id = `notificacion-${notificacion.id}`;
        elemento.className = `notificacion notificacion-${notificacion.tipo}`;
        elemento.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-left: 4px solid ${this.obtenerColorPorTipo(notificacion.tipo)};
            max-width: 400px;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            position: relative;
        `;

        // Contenido
        elemento.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 20px; flex-shrink: 0;">
                    ${notificacion.icono}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="
                        font-weight: 500;
                        color: #1f2937;
                        margin-bottom: 4px;
                        word-wrap: break-word;
                    ">
                        ${notificacion.mensaje}
                    </div>
                    ${notificacion.acciones.length > 0 ? this.crearAcciones(notificacion.acciones, notificacion.id) : ''}
                </div>
                <button 
                    onclick="window.notificacionesManager.cerrar('${notificacion.id}')"
                    style="
                        background: none;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 0;
                        color: #6b7280;
                        flex-shrink: 0;
                    "
                >
                    ×
                </button>
            </div>
        `;

        this.contenedor.appendChild(elemento);

        // Animación de entrada
        setTimeout(() => {
            elemento.style.transform = 'translateX(0)';
        }, 10);
    }

    /**
     * Crear botones de acciones
     */
    crearAcciones(acciones, notificacionId) {
        const botonesHTML = acciones.map(accion => `
            <button 
                onclick="window.notificacionesManager.ejecutarAccion('${notificacionId}', '${accion.id}')"
                style="
                    background: ${accion.color || '#3b82f6'};
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-right: 8px;
                    margin-top: 8px;
                "
            >
                ${accion.texto}
            </button>
        `).join('');

        return `<div style="margin-top: 8px;">${botonesHTML}</div>`;
    }

    /**
     * Ejecutar acción de notificación
     */
    ejecutarAccion(notificacionId, accionId) {
        const notificacion = this.notificaciones.find(n => n.id === notificacionId);
        if (!notificacion) return;

        const accion = notificacion.acciones.find(a => a.id === accionId);
        if (!accion) return;

        // Ejecutar callback
        if (accion.callback) {
            accion.callback();
        }

        // Cerrar notificación
        this.cerrar(notificacionId);
    }

    /**
     * Cerrar notificación
     */
    cerrar(id) {
        // Eliminar de la lista
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
        
        // Eliminar elemento DOM
        this.eliminarElemento(id);
    }

    /**
     * Eliminar elemento DOM con animación
     */
    eliminarElemento(id) {
        const elemento = document.getElementById(`notificacion-${id}`);
        if (!elemento) return;

        // Animación de salida
        elemento.style.transform = 'translateX(100%)';
        elemento.style.opacity = '0';

        setTimeout(() => {
            if (elemento.parentNode) {
                elemento.parentNode.removeChild(elemento);
            }
        }, 300);
    }

    /**
     * Limpiar todas las notificaciones
     */
    limpiarTodas() {
        this.notificaciones.forEach(notificacion => {
            this.eliminarElemento(notificacion.id);
        });
        this.notificaciones = [];
    }

    /**
     * Mostrar notificación del navegador
     */
    mostrarNotificacionNavegador(titulo, opciones = {}) {
        if (!('Notification' in window)) {
            console.warn('Las notificaciones del navegador no están soportadas');
            return false;
        }

        if (Notification.permission === 'granted') {
            const notificacion = new Notification(titulo, {
                body: opciones.mensaje || '',
                icon: opciones.icono || '/favicon.ico',
                tag: opciones.tag || 'sgfp-notificacion',
                requireInteraction: opciones.persistente || false,
                ...opciones
            });

            // Configurar eventos
            if (opciones.onClick) {
                notificacion.onclick = opciones.onClick;
            }

            return notificacion;
        } else if (Notification.permission === 'default') {
            // Solicitar permisos
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.mostrarNotificacionNavegador(titulo, opciones);
                }
            });
        }

        return false;
    }

    /**
     * Solicitar permisos de notificación
     */
    async solicitarPermisos() {
        if (!('Notification' in window)) {
            throw new Error('Las notificaciones no están soportadas');
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    /**
     * Mostrar notificación de vencimiento
     */
    notificarVencimiento(gasto) {
        const diasRestantes = this.calcularDiasRestantes(gasto.fechaVencimiento);
        let mensaje, tipo;

        if (diasRestantes <= 0) {
            mensaje = `¡VENCIDO! ${gasto.descripcion} - ${this.formatearMonto(gasto.monto)}`;
            tipo = 'error';
        } else if (diasRestantes <= 1) {
            mensaje = `¡Vence mañana! ${gasto.descripcion} - ${this.formatearMonto(gasto.monto)}`;
            tipo = 'warning';
        } else {
            mensaje = `Vence en ${diasRestantes} días: ${gasto.descripcion}`;
            tipo = 'warning';
        }

        // Notificación en la UI
        const notificacionId = this.mostrar({
            mensaje: mensaje,
            tipo: tipo,
            duracion: 10000,
            acciones: [
                {
                    id: 'marcar-pagado',
                    texto: 'Marcar como pagado',
                    color: '#10b981',
                    callback: () => this.marcarGastoPagado(gasto.id)
                },
                {
                    id: 'ver-gasto',
                    texto: 'Ver detalles',
                    color: '#3b82f6',
                    callback: () => this.verDetallesGasto(gasto.id)
                }
            ]
        });

        // Notificación del navegador para gastos críticos
        if (diasRestantes <= 1) {
            this.mostrarNotificacionNavegador('💸 Vencimiento próximo', {
                mensaje: mensaje,
                tag: `vencimiento-${gasto.id}`,
                requireInteraction: true,
                onClick: () => {
                    window.focus();
                    this.verDetallesGasto(gasto.id);
                }
            });
        }

        return notificacionId;
    }

    /**
     * Callbacks para acciones de notificaciones
     */
    marcarGastoPagado(gastoId) {
        if (window.ventanaGastos) {
            window.ventanaGastos.marcarComoPagado(gastoId);
        }
    }

    verDetallesGasto(gastoId) {
        if (window.gestorNavegacion) {
            window.gestorNavegacion.cambiarVentana('gastos');
        }
        if (window.ventanaGastos) {
            window.ventanaGastos.resaltarGasto(gastoId);
        }
    }

    /**
     * Utilidades
     */
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    obtenerIconoPorTipo(tipo) {
        const iconos = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return iconos[tipo] || iconos.info;
    }

    obtenerColorPorTipo(tipo) {
        const colores = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colores[tipo] || colores.info;
    }

    calcularDiasRestantes(fechaVencimiento) {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diferencia = vencimiento - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }

    formatearMonto(monto) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(monto);
    }

    /**
     * API de configuración
     */
    configurar(opciones) {
        if (opciones.maxNotificaciones) {
            this.maxNotificaciones = opciones.maxNotificaciones;
        }
        if (opciones.duracionDefecto) {
            this.duracionDefecto = opciones.duracionDefecto;
        }
    }

    /**
     * Obtener estadísticas
     */
    getEstadisticas() {
        return {
            activas: this.notificaciones.length,
            maxPermitidas: this.maxNotificaciones,
            permisoNavegador: Notification.permission
        };
    }
}

// Crear instancia global
window.notificacionesManager = new NotificacionesManager();

// Configurar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Manager de notificaciones inicializado');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificacionesManager;
}
