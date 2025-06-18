/**
 * Gestión de modales para el sistema de gestión financiera
 * Controla la apertura, cierre y funcionalidad de todos los modales
 */

class GestorModales {
    constructor() {
        this.modalActivo = null;
        this.callback = null;
        this.datosEdicion = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.configurarFormularios();
    }

    setupEventListeners() {
        // Event listeners para botones de apertura de modales
        this.configurarBotonesApertura();
        
        // Event listeners para cierre de modales
        this.configurarBotonesCierre();
        
        // Event listener para cerrar al hacer clic fuera del modal
        this.configurarCierreFuera();
        
        // Event listener para tecla Escape
        this.configurarTeclaEscape();
    }

    configurarBotonesApertura() {
        // Botón para agregar ingreso
        document.getElementById('agregar-ingreso')?.addEventListener('click', () => {
            this.abrirModalIngreso();
        });

        // Botón para agregar gasto
        document.getElementById('agregar-gasto')?.addEventListener('click', () => {
            this.abrirModalGasto();
        });
    }

    configurarBotonesCierre() {
        // Botones con clase modal-close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.cerrarModal();
            }
        });
    }

    configurarCierreFuera() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal();
            }
        });
    }

    configurarTeclaEscape() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalActivo) {
                this.cerrarModal();
            }
        });
    }

    configurarFormularios() {
        this.configurarFormularioIngreso();
        this.configurarFormularioGasto();
    }

    /**
     * Configurar formulario de ingresos
     */
    configurarFormularioIngreso() {
        const form = document.getElementById('form-ingreso');
        const checkboxRecurrente = document.getElementById('ingreso-recurrente');
        const opcionesRecurrencia = document.getElementById('recurrencia-options');

        // Mostrar/ocultar opciones de recurrencia
        if (checkboxRecurrente && opcionesRecurrencia) {
            checkboxRecurrente.addEventListener('change', () => {
                opcionesRecurrencia.style.display = checkboxRecurrente.checked ? 'block' : 'none';
            });
        }

        // Manejo del envío del formulario
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.manejarEnvioIngreso();
            });
        }
    }

    /**
     * Configurar formulario de gastos
     */
    configurarFormularioGasto() {
        const form = document.getElementById('form-gasto');
        const checkboxRecurrente = document.getElementById('gasto-recurrente');
        const opcionesRecurrencia = document.getElementById('gasto-recurrencia-options');

        // Mostrar/ocultar opciones de recurrencia
        if (checkboxRecurrente && opcionesRecurrencia) {
            checkboxRecurrente.addEventListener('change', () => {
                opcionesRecurrencia.style.display = checkboxRecurrente.checked ? 'block' : 'none';
            });
        }

        // Manejo del envío del formulario
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.manejarEnvioGasto();
            });
        }
    }

    /**
     * Abrir modal de ingreso
     */
    abrirModalIngreso(datosIngreso = null, callback = null) {
        const modal = document.getElementById('modal-ingreso');
        const titulo = document.getElementById('modal-ingreso-titulo');
        
        if (!modal) {
            console.error('Modal de ingreso no encontrado');
            return;
        }

        // Configurar título y datos
        if (datosIngreso) {
            titulo.textContent = 'Editar Ingreso';
            this.datosEdicion = datosIngreso;
            this.cargarDatosIngreso(datosIngreso);
        } else {
            titulo.textContent = 'Nuevo Ingreso';
            this.datosEdicion = null;
            this.limpiarFormularioIngreso();
        }

        // Configurar callback
        this.callback = callback;
        
        // Mostrar modal
        this.mostrarModal(modal);
        this.modalActivo = 'ingreso';

        // Focus en el primer campo
        setTimeout(() => {
            const primerCampo = modal.querySelector('input:not([type="hidden"]), select');
            if (primerCampo) primerCampo.focus();
        }, 100);
    }

    /**
     * Abrir modal de gasto
     */
    abrirModalGasto(datosGasto = null, callback = null) {
        const modal = document.getElementById('modal-gasto');
        const titulo = document.getElementById('modal-gasto-titulo');
        
        if (!modal) {
            console.error('Modal de gasto no encontrado');
            return;
        }

        // Configurar título y datos
        if (datosGasto) {
            titulo.textContent = 'Editar Gasto';
            this.datosEdicion = datosGasto;
            this.cargarDatosGasto(datosGasto);
        } else {
            titulo.textContent = 'Nuevo Gasto';
            this.datosEdicion = null;
            this.limpiarFormularioGasto();
        }

        // Configurar callback
        this.callback = callback;
        
        // Mostrar modal
        this.mostrarModal(modal);
        this.modalActivo = 'gasto';

        // Focus en el primer campo
        setTimeout(() => {
            const primerCampo = modal.querySelector('input:not([type="hidden"]), select');
            if (primerCampo) primerCampo.focus();
        }, 100);
    }

    /**
     * Mostrar modal con animación
     */
    mostrarModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cerrar modal activo
     */
    cerrarModal() {
        if (!this.modalActivo) return;

        const modal = document.getElementById(`modal-${this.modalActivo}`);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        // Restaurar scroll del body
        document.body.style.overflow = '';

        // Limpiar estado
        this.modalActivo = null;
        this.callback = null;
        this.datosEdicion = null;
    }

    /**
     * Cargar datos en el formulario de ingreso
     */
    cargarDatosIngreso(datos) {
        const campos = {
            'ingreso-tipo': datos.tipo,
            'ingreso-descripcion': datos.descripcion,
            'ingreso-monto': datos.monto,
            'ingreso-fecha': datos.fecha,
            'ingreso-recurrente': datos.recurrente,
            'ingreso-frecuencia': datos.frecuencia
        };

        for (const [id, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.type === 'checkbox') {
                    elemento.checked = Boolean(valor);
                    // Disparar evento change para mostrar/ocultar opciones
                    elemento.dispatchEvent(new Event('change'));
                } else {
                    elemento.value = valor || '';
                }
            }
        }
    }

    /**
     * Cargar datos en el formulario de gasto
     */
    cargarDatosGasto(datos) {
        const campos = {
            'gasto-tipo': datos.tipo,
            'gasto-descripcion': datos.descripcion,
            'gasto-monto': datos.monto,
            'gasto-fecha': datos.fechaVencimiento,
            'gasto-prioridad': datos.prioridad,
            'gasto-recurrente': datos.recurrente,
            'gasto-frecuencia': datos.frecuencia
        };

        for (const [id, valor] of Object.entries(campos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.type === 'checkbox') {
                    elemento.checked = Boolean(valor);
                    // Disparar evento change para mostrar/ocultar opciones
                    elemento.dispatchEvent(new Event('change'));
                } else {
                    elemento.value = valor || '';
                }
            }
        }
    }

    /**
     * Limpiar formulario de ingreso
     */
    limpiarFormularioIngreso() {
        const form = document.getElementById('form-ingreso');
        if (form) {
            form.reset();
            
            // Ocultar opciones de recurrencia
            const opcionesRecurrencia = document.getElementById('recurrencia-options');
            if (opcionesRecurrencia) {
                opcionesRecurrencia.style.display = 'none';
            }

            // Establecer fecha actual por defecto
            const campoFecha = document.getElementById('ingreso-fecha');
            if (campoFecha) {
                campoFecha.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    /**
     * Limpiar formulario de gasto
     */
    limpiarFormularioGasto() {
        const form = document.getElementById('form-gasto');
        if (form) {
            form.reset();
            
            // Ocultar opciones de recurrencia
            const opcionesRecurrencia = document.getElementById('gasto-recurrencia-options');
            if (opcionesRecurrencia) {
                opcionesRecurrencia.style.display = 'none';
            }

            // Establecer fecha actual por defecto
            const campoFecha = document.getElementById('gasto-fecha');
            if (campoFecha) {
                campoFecha.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    /**
     * Manejar envío del formulario de ingreso
     */
    async manejarEnvioIngreso() {
        try {
            const datos = this.recogerDatosIngreso();
            
            // Validar datos
            if (!this.validarDatosIngreso(datos)) {
                return;
            }

            // Crear o actualizar ingreso
            let ingreso;
            if (this.datosEdicion) {
                // Editar ingreso existente
                ingreso = new Ingreso({ ...this.datosEdicion, ...datos });
            } else {
                // Crear nuevo ingreso
                ingreso = new Ingreso(datos);
            }

            // Guardar en IndexedDB
            if (window.indexedDBManager) {
                if (this.datosEdicion) {
                    await window.indexedDBManager.update('ingresos', ingreso.toJSON());
                } else {
                    await window.indexedDBManager.add('ingresos', ingreso.toJSON());
                }
            }

            // Ejecutar callback si existe
            if (this.callback) {
                this.callback(ingreso, this.datosEdicion ? 'editado' : 'creado');
            }

            // Mostrar notificación
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: `Ingreso ${this.datosEdicion ? 'actualizado' : 'creado'} exitosamente`,
                    tipo: 'success'
                });
            }

            // Cerrar modal
            this.cerrarModal();

            // Actualizar ventana de ingresos si está activa
            if (window.ventanaIngresos && window.gestorNavegacion.ventanaActual === 'ingresos') {
                window.ventanaIngresos.cargarIngresos();
            }

        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Error al guardar el ingreso: ' + error.message,
                    tipo: 'error'
                });
            }
        }
    }

    /**
     * Manejar envío del formulario de gasto
     */
    async manejarEnvioGasto() {
        try {
            const datos = this.recogerDatosGasto();
            
            // Validar datos
            if (!this.validarDatosGasto(datos)) {
                return;
            }

            // Crear o actualizar gasto
            let gasto;
            if (this.datosEdicion) {
                // Editar gasto existente
                gasto = new Gasto({ ...this.datosEdicion, ...datos });
            } else {
                // Crear nuevo gasto
                gasto = new Gasto(datos);
            }

            // Guardar en IndexedDB
            if (window.indexedDBManager) {
                if (this.datosEdicion) {
                    await window.indexedDBManager.update('gastos', gasto.toJSON());
                } else {
                    await window.indexedDBManager.add('gastos', gasto.toJSON());
                }
            }

            // Ejecutar callback si existe
            if (this.callback) {
                this.callback(gasto, this.datosEdicion ? 'editado' : 'creado');
            }

            // Mostrar notificación
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: `Gasto ${this.datosEdicion ? 'actualizado' : 'creado'} exitosamente`,
                    tipo: 'success'
                });
            }

            // Cerrar modal
            this.cerrarModal();

            // Actualizar ventana de gastos si está activa
            if (window.ventanaGastos && window.gestorNavegacion.ventanaActual === 'gastos') {
                window.ventanaGastos.cargarGastos();
            }

        } catch (error) {
            console.error('Error al guardar gasto:', error);
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Error al guardar el gasto: ' + error.message,
                    tipo: 'error'
                });
            }
        }
    }

    /**
     * Recoger datos del formulario de ingreso
     */
    recogerDatosIngreso() {
        return {
            tipo: document.getElementById('ingreso-tipo').value,
            descripcion: document.getElementById('ingreso-descripcion').value.trim(),
            monto: parseFloat(document.getElementById('ingreso-monto').value),
            fecha: document.getElementById('ingreso-fecha').value,
            recurrente: document.getElementById('ingreso-recurrente').checked,
            frecuencia: document.getElementById('ingreso-frecuencia').value
        };
    }

    /**
     * Recoger datos del formulario de gasto
     */
    recogerDatosGasto() {
        return {
            tipo: document.getElementById('gasto-tipo').value,
            descripcion: document.getElementById('gasto-descripcion').value.trim(),
            monto: parseFloat(document.getElementById('gasto-monto').value),
            fechaVencimiento: document.getElementById('gasto-fecha').value,
            prioridad: document.getElementById('gasto-prioridad').value,
            recurrente: document.getElementById('gasto-recurrente').checked,
            frecuencia: document.getElementById('gasto-frecuencia').value
        };
    }

    /**
     * Validar datos de ingreso
     */
    validarDatosIngreso(datos) {
        const errores = [];

        if (!datos.descripcion) {
            errores.push('La descripción es obligatoria');
        }

        if (!datos.monto || datos.monto <= 0) {
            errores.push('El monto debe ser mayor a 0');
        }

        if (!datos.fecha) {
            errores.push('La fecha es obligatoria');
        }

        if (errores.length > 0) {
            this.mostrarErroresValidacion(errores);
            return false;
        }

        return true;
    }

    /**
     * Validar datos de gasto
     */
    validarDatosGasto(datos) {
        const errores = [];

        if (!datos.descripcion) {
            errores.push('La descripción es obligatoria');
        }

        if (!datos.monto || datos.monto <= 0) {
            errores.push('El monto debe ser mayor a 0');
        }

        if (!datos.fechaVencimiento) {
            errores.push('La fecha de vencimiento es obligatoria');
        }

        if (errores.length > 0) {
            this.mostrarErroresValidacion(errores);
            return false;
        }

        return true;
    }

    /**
     * Mostrar errores de validación
     */
    mostrarErroresValidacion(errores) {
        if (window.notificacionesManager) {
            errores.forEach(error => {
                window.notificacionesManager.mostrar({
                    mensaje: error,
                    tipo: 'error',
                    duracion: 3000
                });
            });
        } else {
            alert('Errores de validación:\n' + errores.join('\n'));
        }
    }

    /**
     * Obtener estado actual de los modales
     */
    getEstado() {
        return {
            modalActivo: this.modalActivo,
            editando: this.datosEdicion !== null,
            datosEdicion: this.datosEdicion
        };
    }
}

// Crear instancia global
window.gestorModales = new GestorModales();

// Configurar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Gestor de modales inicializado');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestorModales;
}
