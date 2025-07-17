/**
 * Gestión de modales
 * Maneja la apertura, cierre y envío de formularios de los modales
 */

class GestorModales {
    constructor(storageManager) {
        this.storage = storageManager;
        this.init();
    }

    init() {
        this.configurarEventosGlobales();
        this.configurarFormularios();
    }

    configurarEventosGlobales() {
        // Cerrar modales al hacer clic en el fondo
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModal(e.target);
            }
        });

        // Cerrar modales con la tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modalActivo = document.querySelector('.modal.active');
                if (modalActivo) {
                    this.cerrarModal(modalActivo);
                }
            }
        });

        // Botones de cerrar modales
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.cerrarModal(modal);
                }
            });
        });
    }

    configurarFormularios() {
        // Formulario de ingresos
        const formIngreso = document.getElementById('form-ingreso');
        if (formIngreso) {
            formIngreso.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.manejarEnvioIngreso(formIngreso);
            });
        }

        // Formulario de gastos
        const formGasto = document.getElementById('form-gasto');
        if (formGasto) {
            formGasto.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.manejarEnvioGasto(formGasto);
            });
        }
    }

    async manejarEnvioIngreso(form) {
        try {
            const formData = new FormData(form);
            const ingreso = {
                tipo: formData.get('ingreso-tipo') || document.getElementById('ingreso-tipo').value,
                descripcion: formData.get('ingreso-descripcion') || document.getElementById('ingreso-descripcion').value,
                monto: formData.get('ingreso-monto') || document.getElementById('ingreso-monto').value,
                fecha: formData.get('ingreso-fecha') || document.getElementById('ingreso-fecha').value,
                categoria: formData.get('ingreso-categoria') || document.getElementById('ingreso-categoria').value,
                notas: ''
            };

            // Validaciones
            if (!ingreso.tipo || !ingreso.descripcion || !ingreso.monto || !ingreso.fecha) {
                alert('Por favor, completa todos los campos obligatorios');
                return;
            }

            if (parseFloat(ingreso.monto) <= 0) {
                alert('El monto debe ser mayor que 0');
                return;
            }

            // Mostrar loading
            this.mostrarLoading(form, true);

            // Guardar en storage
            const nuevoIngreso = await this.storage.saveIngreso(ingreso);

            // Notificar a otros componentes
            if (window.CalendarioIngresos) {
                await window.CalendarioIngresos.onIngresoGuardado(nuevoIngreso);
            }

            // Actualizar consultas si está activa esa pestaña
            if (window.ModuloConsultas && this.isTabActive('consultas')) {
                await window.ModuloConsultas.cargarDatosIniciales();
            }

            // Cerrar modal y limpiar formulario
            const modal = form.closest('.modal');
            this.cerrarModal(modal);
            form.reset();

            this.mostrarNotificacion('✅ Ingreso guardado correctamente', 'success');
            console.log('✅ Ingreso guardado:', nuevoIngreso);

        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            this.mostrarNotificacion('❌ Error al guardar el ingreso', 'error');
        } finally {
            this.mostrarLoading(form, false);
        }
    }

    async manejarEnvioGasto(form) {
        try {
            const formData = new FormData(form);
            const gasto = {
                tipo: formData.get('gasto-tipo') || document.getElementById('gasto-tipo').value,
                descripcion: formData.get('gasto-descripcion') || document.getElementById('gasto-descripcion').value,
                monto: formData.get('gasto-monto') || document.getElementById('gasto-monto').value,
                fecha: formData.get('gasto-fecha') || document.getElementById('gasto-fecha').value,
                categoria: formData.get('gasto-categoria') || document.getElementById('gasto-categoria').value,
                notas: ''
            };

            // Validaciones
            if (!gasto.tipo || !gasto.descripcion || !gasto.monto || !gasto.fecha) {
                alert('Por favor, completa todos los campos obligatorios');
                return;
            }

            if (parseFloat(gasto.monto) <= 0) {
                alert('El monto debe ser mayor que 0');
                return;
            }

            // Mostrar loading
            this.mostrarLoading(form, true);

            // Guardar en storage
            const nuevoGasto = await this.storage.saveGasto(gasto);

            // Notificar a otros componentes
            if (window.CalendarioGastos) {
                await window.CalendarioGastos.onGastoGuardado(nuevoGasto);
            }

            // Actualizar consultas si está activa esa pestaña
            if (window.ModuloConsultas && this.isTabActive('consultas')) {
                await window.ModuloConsultas.cargarDatosIniciales();
            }

            // Cerrar modal y limpiar formulario
            const modal = form.closest('.modal');
            this.cerrarModal(modal);
            form.reset();

            this.mostrarNotificacion('✅ Gasto guardado correctamente', 'success');
            console.log('✅ Gasto guardado:', nuevoGasto);

        } catch (error) {
            console.error('Error al guardar gasto:', error);
            this.mostrarNotificacion('❌ Error al guardar el gasto', 'error');
        } finally {
            this.mostrarLoading(form, false);
        }
    }

    cerrarModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            
            // Limpiar formulario si existe
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                this.mostrarLoading(form, false);
            }
        }
    }

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            // Enfocar primer input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    mostrarModal(titulo, contenido) {
        // Crear modal temporal para mostrar detalles
        const existingModal = document.querySelector('.temp-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal temp-modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${titulo}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem;">
                        ${contenido}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    mostrarLoading(form, mostrar) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, select, textarea, button');
        
        if (mostrar) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '⏳ Guardando...';
            }
            inputs.forEach(input => input.disabled = true);
        } else {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Guardar';
            }
            inputs.forEach(input => input.disabled = false);
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación temporal
        const notificacion = document.createElement('div');
        notificacion.className = `notification notification-${tipo}`;
        notificacion.innerHTML = `
            <div class="notification-content">
                ${mensaje}
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Estilos inline para la notificación
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;

        // Agregar estilos de animación si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    opacity: 0.8;
                }
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notificacion);

        // Cerrar automáticamente después de 4 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        notificacion.remove();
                    }
                }, 300);
            }
        }, 4000);

        // Cerrar al hacer clic en X
        const closeBtn = notificacion.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notificacion.remove();
            });
        }
    }

    isTabActive(tabName) {
        const tabContent = document.getElementById(`tab-${tabName}`);
        return tabContent && tabContent.classList.contains('active');
    }

    // Métodos públicos para usar desde otros módulos
    static cerrarModal(modal) {
        if (window.GestorModales) {
            window.GestorModales.cerrarModal(modal);
        }
    }

    static abrirModal(modalId) {
        if (window.GestorModales) {
            window.GestorModales.abrirModal(modalId);
        }
    }

    static mostrarNotificacion(mensaje, tipo) {
        if (window.GestorModales) {
            window.GestorModales.mostrarNotificacion(mensaje, tipo);
        }
    }
}

// Crear instancia global
window.GestorModales = null;
