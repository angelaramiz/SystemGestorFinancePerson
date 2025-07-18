/**
 * Gestión de modales
 * Maneja la apertura, cierre y envío de formularios de los modales
 */

class GestorModales {
    constructor(storageManager) {
        this.storage = storageManager;
        // No iniciar automáticamente, se hará desde app.js
        console.log('🚀 GestorModales instanciado, esperando inicialización externa...');
    }

    init() {
        this.configurarEventosGlobales();
        this.configurarFormularios();
        this.configurarRecurrencia();
        // Cargar categorías dinámicamente
        this.cargarCategorias();
    }
    
    /**
     * Convertir frecuencia de recurrencia a días
     */
    calcularIntervaloDias(frecuencia) {
        const intervalos = {
            'semanal': 7,
            'quincenal': 15,
            'mensual': 30,
            'bimestral': 60,
            'trimestral': 90,
            'semestral': 180,
            'anual': 365
        };
        return intervalos[frecuencia] || 30; // Por defecto mensual
    }

    configurarRecurrencia() {
        // Configurar paneles de recurrencia para ingresos
        const checkIngresoRecurrente = document.getElementById('ingreso-es-recurrente');
        const panelIngresoRecurrencia = checkIngresoRecurrente?.closest('.panel-recurrencia');
        
        if (checkIngresoRecurrente && panelIngresoRecurrencia) {
            checkIngresoRecurrente.addEventListener('change', (e) => {
                if (e.target.checked) {
                    panelIngresoRecurrencia.classList.add('activo');
                } else {
                    panelIngresoRecurrencia.classList.remove('activo');
                }
            });
        }
        
        // Configurar paneles de recurrencia para gastos
        const checkGastoRecurrente = document.getElementById('gasto-es-recurrente');
        const panelGastoRecurrencia = checkGastoRecurrente?.closest('.panel-recurrencia');
        
        if (checkGastoRecurrente && panelGastoRecurrencia) {
            checkGastoRecurrente.addEventListener('change', (e) => {
                if (e.target.checked) {
                    panelGastoRecurrencia.classList.add('activo');
                } else {
                    panelGastoRecurrencia.classList.remove('activo');
                }
            });
        }
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

        // Configurar eventos para botones de abrir modal
        const btnAbrirModalIngreso = document.getElementById('add-ingreso-btn');
        if (btnAbrirModalIngreso) {
            btnAbrirModalIngreso.addEventListener('click', () => {
                this.abrirModalNuevoIngreso();
            });
        }
    }

    abrirModalNuevoIngreso() {
        const modal = document.getElementById('modal-ingreso');
        const form = document.getElementById('form-ingreso');
        
        if (modal && form) {
            // Limpiar formulario
            form.reset();
            
            // Limpiar campo ID oculto
            document.getElementById('ingreso-id').value = '';
            
            // Establecer fecha actual por defecto
            const fechaInput = document.getElementById('ingreso-fecha');
            if (fechaInput) {
                fechaInput.value = new Date().toISOString().split('T')[0];
            }
            
            // Cambiar título del modal
            const modalTitle = document.querySelector('#modal-ingreso-title');
            if (modalTitle) {
                modalTitle.textContent = '➕ Nuevo Ingreso';
            }
            
            // Ocultar campos de recurrencia
            const panelRecurrencia = document.querySelector('.panel-recurrencia');
            if (panelRecurrencia) {
                panelRecurrencia.classList.remove('activo');
            }
            
            // Desmarcar checkbox de recurrencia
            const checkboxRecurrencia = document.getElementById('ingreso-es-recurrente');
            if (checkboxRecurrencia) {
                checkboxRecurrencia.checked = false;
            }
            
            // Mostrar modal
            this.mostrarModal(modal);
        }
    }

    async manejarEnvioIngreso(form) {
        try {
            const formData = new FormData(form);
            const ingresoId = document.getElementById('ingreso-id').value;
            const ingreso = {
                tipo: formData.get('ingreso-tipo') || document.getElementById('ingreso-tipo').value,
                descripcion: formData.get('ingreso-descripcion') || document.getElementById('ingreso-descripcion').value,
                monto: formData.get('ingreso-monto') || document.getElementById('ingreso-monto').value,
                fecha: formData.get('ingreso-fecha') || document.getElementById('ingreso-fecha').value,
                categoria: formData.get('ingreso-categoria') || document.getElementById('ingreso-categoria').value,
                notas: ''
            };

            // Si estamos editando, incluir el ID
            if (ingresoId) {
                ingreso.id = ingresoId;
            }

            // Validaciones
            if (!ingreso.tipo || !ingreso.descripcion || !ingreso.monto || !ingreso.fecha) {
                await window.Alertas.validacionFormulario(['Por favor, completa todos los campos obligatorios']);
                return;
            }

            if (parseFloat(ingreso.monto) <= 0) {
                await window.Alertas.advertencia('Monto inválido', 'El monto debe ser mayor que 0');
                return;
            }

            // Obtener datos de recurrencia 
            const esRecurrente = document.getElementById('ingreso-es-recurrente').checked;
            
            if (esRecurrente) {
                ingreso.es_recurrente = true;
                ingreso.frecuencia_recurrencia = document.getElementById('ingreso-frecuencia-recurrencia').value;
                ingreso.dia_recurrencia = document.getElementById('ingreso-dia-recurrencia').value;
                ingreso.fecha_fin_recurrencia = document.getElementById('ingreso-fecha-fin-recurrencia').value || null;
                ingreso.activo = true;
                
                // Si tenemos RecurrenceManager disponible, usar para calcular próximo pago
                if (window.RecurrenceManager) {
                    // Calcular intervalo de días basado en la frecuencia
                    const intervaloDias = this.calcularIntervaloDias(ingreso.frecuencia_recurrencia);
                    const proximoPago = window.RecurrenceManager.calcularProximoPago(
                        ingreso.fecha,
                        intervaloDias
                    );
                    ingreso.proximo_pago = proximoPago;
                    ingreso.numero_secuencia = 1;
                    ingreso.ingreso_padre_id = null;
                    ingreso.intervalo_dias = intervaloDias;
                }
            }

            // Obtener datos de recurrencia del anterior sistema si existe
            if (window.RecurrenceManager && !esRecurrente) {
                const datosRecurrencia = window.RecurrenceManager.obtenerDatosRecurrencia();
                Object.assign(ingreso, datosRecurrencia);
            }

            // Mostrar loading
            this.mostrarLoading(form, true);

            // Guardar en storage - usar updateIngreso si estamos editando
            let resultado;
            if (ingresoId) {
                resultado = await this.storage.updateIngreso(ingresoId, ingreso);
                await window.Alertas.exito('Ingreso actualizado', 'Los cambios se guardaron correctamente');
            } else {
                resultado = await this.storage.saveIngreso(ingreso);
                await window.Alertas.exito('Ingreso guardado', 'El ingreso se guardó correctamente');
            }

            // Notificar a otros componentes
            if (window.CalendarioIngresos) {
                if (ingresoId) {
                    await window.CalendarioIngresos.refrescarCalendario();
                } else {
                    await window.CalendarioIngresos.onIngresoGuardado(resultado);
                }
            }

            // Actualizar consultas si está activa esa pestaña
            if (window.ModuloConsultas && this.isTabActive('consultas')) {
                await window.ModuloConsultas.cargarDatosIniciales();
            }

            // Cerrar modal y limpiar formulario
            const modal = form.closest('.modal');
            this.cerrarModal(modal);
            form.reset();

            await window.Alertas.exito('Ingreso guardado', 'El ingreso se ha guardado correctamente');
            console.log('✅ Ingreso guardado:', nuevoIngreso);

        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            await window.Alertas.error('Error al guardar', 'No se pudo guardar el ingreso');
        } finally {
            this.mostrarLoading(form, false);
        }
    }

    async manejarEnvioGasto(form) {
        try {
            const formData = new FormData(form);
            const gasto = {
                id: formData.get('gasto-id') || document.getElementById('gasto-id').value || null,
                tipo: formData.get('gasto-tipo') || document.getElementById('gasto-tipo').value,
                descripcion: formData.get('gasto-descripcion') || document.getElementById('gasto-descripcion').value,
                monto: formData.get('gasto-monto') || document.getElementById('gasto-monto').value,
                fecha: formData.get('gasto-fecha') || document.getElementById('gasto-fecha').value,
                categoria: formData.get('gasto-categoria') || document.getElementById('gasto-categoria').value,
                notas: formData.get('gasto-notas') || document.getElementById('gasto-notas')?.value || ''
            };

            // Validaciones
            if (!gasto.tipo || !gasto.descripcion || !gasto.monto || !gasto.fecha) {
                await window.Alertas.validacionFormulario(['Por favor, completa todos los campos obligatorios']);
                return;
            }

            if (parseFloat(gasto.monto) <= 0) {
                await window.Alertas.advertencia('Monto inválido', 'El monto debe ser mayor que 0');
                return;
            }
            
            // Obtener datos de recurrencia
            const esRecurrente = document.getElementById('gasto-es-recurrente').checked;
            
            if (esRecurrente) {
                gasto.es_recurrente = true;
                gasto.frecuencia_recurrencia = document.getElementById('gasto-frecuencia-recurrencia').value;
                gasto.dia_recurrencia = document.getElementById('gasto-dia-recurrencia').value;
                gasto.fecha_fin_recurrencia = document.getElementById('gasto-fecha-fin-recurrencia').value || null;
                gasto.activo = true;
                
                // Si tenemos RecurrenceManager disponible, usar para calcular próximo pago
                if (window.RecurrenceManager) {
                    const intervaloDias = this.calcularIntervaloDias(gasto.frecuencia_recurrencia);
                    const proximoPago = window.RecurrenceManager.calcularProximoPago(
                        gasto.fecha,
                        intervaloDias
                    );
                    gasto.proximo_pago = proximoPago;
                    gasto.numero_secuencia = 1;
                    gasto.gasto_padre_id = null;
                    gasto.intervalo_dias = intervaloDias;
                }
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

            await window.Alertas.exito('Gasto guardado', 'El gasto se ha guardado correctamente');
            console.log('✅ Gasto guardado:', nuevoGasto);

        } catch (error) {
            console.error('Error al guardar gasto:', error);
            await window.Alertas.error('Error al guardar', 'No se pudo guardar el gasto');
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
                
                // Restablecer paneles de recurrencia
                const panelesRecurrencia = modal.querySelectorAll('.panel-recurrencia');
                panelesRecurrencia.forEach(panel => {
                    panel.classList.remove('activo');
                });
                
                // Desmarcar checkbox de recurrencia
                const checkboxesRecurrencia = modal.querySelectorAll('#ingreso-es-recurrente, #gasto-es-recurrente');
                checkboxesRecurrencia.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Ocultar campos de recurrencia si existen del antiguo sistema
                const camposRecurrencia = modal.querySelector('#campos-recurrencia');
                if (camposRecurrencia) {
                    camposRecurrencia.style.display = 'none';
                }
                
                // Limpiar campos de recurrencia usando RecurrenceManager
                if (window.RecurrenceManager) {
                    try {
                        // Detectar tipo basado en el ID del modal
                        const tipo = modal.id.includes('ingreso') ? 'ingreso' : 'gasto';
                        window.RecurrenceManager.limpiarCamposRecurrencia(tipo);
                    } catch (error) {
                        console.warn('Error al limpiar campos de recurrencia:', error);
                    }
                }
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
                .btn-link {
                    background: rgba(255,255,255,0.3);
                    border: none;
                    color: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    margin-left: 0.5rem;
                    display: inline-block;
                    text-decoration: none;
                }
                .btn-link:hover {
                    background: rgba(255,255,255,0.5);
                }
                .sql-instructions {
                    max-height: 70vh;
                    overflow-y: auto;
                }
                .code-container {
                    background: #1e293b;
                    color: #e2e8f0;
                    border-radius: 6px;
                    padding: 1rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                    max-height: 300px;
                    font-family: monospace;
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

    /**
     * Cargar categorías dinámicamente en los selectores
     */
    async cargarCategorias() {
        try {
            // Obtener categorías desde el storage
            const categorias = await this.storage.getCategorias();
            
            if (categorias && categorias.length > 0) {
                this.poblarSelectorCategorias('ingreso-categoria', categorias, 'ingreso');
                this.poblarSelectorCategorias('gasto-categoria', categorias, 'gasto');
                console.log(`📋 Cargadas ${categorias.length} categorías en selectores`);
            } else {
                console.log('📋 Usando categorías estáticas predefinidas');
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
            console.log('📋 Usando categorías estáticas como fallback');
        }
    }

    /**
     * Poblar selector de categorías con datos dinámicos
     */
    poblarSelectorCategorias(selectorId, categorias, tipo) {
        const selector = document.getElementById(selectorId);
        if (!selector) return;

        // Limpiar opciones existentes excepto la primera (placeholder)
        const placeholder = selector.querySelector('option[value=""]');
        selector.innerHTML = '';
        if (placeholder) {
            selector.appendChild(placeholder);
        } else {
            selector.innerHTML = '<option value="">Selecciona una categoría...</option>';
        }

        // Filtrar categorías por tipo
        const categoriasFiltradas = categorias.filter(cat => 
            cat.tipo === tipo || cat.tipo === 'ambos'
        );

        // Agregar categorías dinámicas
        categoriasFiltradas.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nombre;
            option.textContent = `${categoria.icono || '📋'} ${categoria.nombre}`;
            selector.appendChild(option);
        });
    }

    static mostrarNotificacion(mensaje, tipo) {
        if (window.GestorModales) {
            window.GestorModales.mostrarNotificacion(mensaje, tipo);
        }
    }
}

// La instancia global se creará en app.js
