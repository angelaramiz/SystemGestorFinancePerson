/**
 * MÓDULO DE ALERTAS ESTÉTICAS CON SWEETALERT2
 * Sistema de alertas reutilizable para la aplicación
 */

class AlertasSweetAlert {
    constructor() {
        this.configurarTemas();
    }

    /**
     * Configurar temas y estilos personalizados
     */
    configurarTemas() {
        this.temaEspañol = {
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            denyButtonText: 'No',
            customClass: {
                popup: 'swal-popup-mx',
                title: 'swal-title-mx',
                content: 'swal-content-mx',
                confirmButton: 'swal-confirm-mx',
                cancelButton: 'swal-cancel-mx',
                denyButton: 'swal-deny-mx'
            }
        };

        this.coloresMexico = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            question: '#8b5cf6'
        };
    }

    /**
     * Alerta de éxito
     */
    async exito(titulo, mensaje = '', opciones = {}) {
        return await Swal.fire({
            icon: 'success',
            title: titulo,
            text: mensaje,
            timer: opciones.timer || 3000,
            timerProgressBar: true,
            showConfirmButton: opciones.showConfirmButton || false,
            toast: opciones.toast || true,
            position: opciones.position || 'top-end',
            ...this.temaEspañol,
            iconColor: this.coloresMexico.success
        });
    }

    /**
     * Alerta de error
     */
    async error(titulo, mensaje = '', opciones = {}) {
        return await Swal.fire({
            icon: 'error',
            title: titulo,
            text: mensaje,
            timer: opciones.timer || 5000,
            timerProgressBar: true,
            showConfirmButton: opciones.showConfirmButton !== false,
            toast: opciones.toast || false,
            position: opciones.position || 'center',
            ...this.temaEspañol,
            iconColor: this.coloresMexico.error
        });
    }

    /**
     * Alerta de advertencia
     */
    async advertencia(titulo, mensaje = '', opciones = {}) {
        return await Swal.fire({
            icon: 'warning',
            title: titulo,
            text: mensaje,
            timer: opciones.timer || 4000,
            timerProgressBar: true,
            showConfirmButton: opciones.showConfirmButton !== false,
            toast: opciones.toast || false,
            position: opciones.position || 'center',
            ...this.temaEspañol,
            iconColor: this.coloresMexico.warning
        });
    }

    /**
     * Alerta informativa
     */
    async info(titulo, mensaje = '', opciones = {}) {
        return await Swal.fire({
            icon: 'info',
            title: titulo,
            text: mensaje,
            timer: opciones.timer || 4000,
            timerProgressBar: true,
            showConfirmButton: opciones.showConfirmButton !== false,
            toast: opciones.toast || false,
            position: opciones.position || 'center',
            ...this.temaEspañol,
            iconColor: this.coloresMexico.info
        });
    }

    /**
     * Confirmación simple (Sí/No)
     */
    async confirmar(titulo, mensaje = '', opciones = {}) {
        return await Swal.fire({
            icon: 'question',
            title: titulo,
            text: mensaje,
            showCancelButton: true,
            showConfirmButton: true,
            focusCancel: true,
            reverseButtons: true,
            ...this.temaEspañol,
            iconColor: this.coloresMexico.question,
            ...opciones
        });
    }

    /**
     * Confirmación de eliminación (más específica)
     */
    async confirmarEliminacion(elemento, mensaje = '') {
        return await Swal.fire({
            icon: 'warning',
            title: `¿Eliminar ${elemento}?`,
            text: mensaje || `Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este ${elemento}?`,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            focusCancel: true,
            reverseButtons: true,
            confirmButtonColor: this.coloresMexico.error,
            iconColor: this.coloresMexico.warning,
            customClass: {
                confirmButton: 'swal-confirm-danger',
                ...this.temaEspañol.customClass
            }
        });
    }

    /**
     * Alerta de carga/procesamiento
     */
    async cargando(titulo = 'Procesando...', mensaje = '') {
        return Swal.fire({
            title: titulo,
            text: mensaje,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            },
            ...this.temaEspañol
        });
    }

    /**
     * Cerrar alerta de carga
     */
    cerrarCargando() {
        Swal.close();
    }

    /**
     * Formulario de entrada simple
     */
    async entrada(titulo, inputPlaceholder = '', opciones = {}) {
        return await Swal.fire({
            title: titulo,
            input: opciones.inputType || 'text',
            inputPlaceholder: inputPlaceholder,
            inputValue: opciones.inputValue || '',
            showCancelButton: true,
            inputValidator: opciones.validator || ((value) => {
                if (!value) {
                    return 'Este campo es obligatorio';
                }
            }),
            ...this.temaEspañol,
            ...opciones
        });
    }

    /**
     * Alerta de validación para formularios
     */
    async validacionFormulario(errores = []) {
        const listaErrores = errores.map(error => `• ${error}`).join('<br>');
        return await Swal.fire({
            icon: 'error',
            title: 'Errores en el formulario',
            html: `<div style="text-align: left; margin: 10px 0;">${listaErrores}</div>`,
            showConfirmButton: true,
            confirmButtonText: 'Entendido',
            iconColor: this.coloresMexico.error,
            ...this.temaEspañol
        });
    }

    /**
     * Notificación toast para acciones rápidas
     */
    async toast(tipo, mensaje, opciones = {}) {
        const iconos = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        return await Swal.fire({
            icon: iconos[tipo] || 'info',
            title: mensaje,
            toast: true,
            position: opciones.position || 'top-end',
            timer: opciones.timer || 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            iconColor: this.coloresMexico[tipo] || this.coloresMexico.info
        });
    }

    /**
     * Alerta con HTML personalizado
     */
    async htmlPersonalizado(html, opciones = {}) {
        return await Swal.fire({
            html: html,
            showCloseButton: true,
            showConfirmButton: opciones.showConfirmButton !== false,
            focusConfirm: false,
            ...this.temaEspañol,
            ...opciones
        });
    }

    /**
     * Alerta con botones personalizados
     */
    async botonesPersonalizados(titulo, mensaje, botones = []) {
        const buttonsStyling = false;
        const showCancelButton = botones.length > 1;
        
        return await Swal.fire({
            title: titulo,
            text: mensaje,
            showCancelButton: showCancelButton,
            confirmButtonText: botones[0] || 'Confirmar',
            cancelButtonText: botones[1] || 'Cancelar',
            buttonsStyling: buttonsStyling,
            ...this.temaEspañol
        });
    }
}

// Crear instancia global
window.Alertas = new AlertasSweetAlert();

// Exportar para compatibilidad
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertasSweetAlert;
}
