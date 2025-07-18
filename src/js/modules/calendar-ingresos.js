/**
 * Gestión del calendario de ingresos
 * Maneja la visualización y eventos del calendario usando FullCalendar
 */

class CalendarioIngresos {
    constructor(storageManager) {
        this.storage = storageManager;
        this.calendar = null;
        this.currentFilter = 'todos';
        this.ingresos = [];
        
        // No iniciar automáticamente, se hará desde app.js
        console.log('🚀 CalendarioIngresos instanciado, esperando inicialización externa...');
    }

    async init() {
        console.log('🚀 Iniciando CalendarioIngresos...');
        await this.cargarIngresos();
        this.initCalendar();
        this.configurarEventos();
        console.log('✅ CalendarioIngresos inicializado completamente');
    }

    async cargarIngresos() {
        try {
            this.ingresos = await this.storage.getIngresos();
            console.log(`📊 Cargados ${this.ingresos.length} ingresos`);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
            this.ingresos = [];
        }
    }

    initCalendar() {
        const calendarEl = document.getElementById('calendar-ingresos');
        if (!calendarEl) {
            console.error('❌ Elemento calendar-ingresos no encontrado');
            return;
        }

        if (typeof FullCalendar === 'undefined') {
            console.error('❌ FullCalendar no está disponible');
            return;
        }

        console.log('📅 Inicializando calendario de ingresos...');

        try {
            this.calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'es',
                height: 'auto',
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
                events: this.getEventosParaCalendario(),
                eventClick: this.onEventClick.bind(this),
                dateClick: this.onDateClick.bind(this),
                eventDidMount: this.onEventDidMount.bind(this)
            });

            this.calendar.render();
            console.log('✅ Calendario de ingresos renderizado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar calendario de ingresos:', error);
        }
    }

    getEventosParaCalendario() {
        return this.ingresos
            .filter(ingreso => {
                if (this.currentFilter === 'todos') return true;
                return ingreso.tipo === this.currentFilter;
            })
            .map(ingreso => ({
                id: ingreso.id,
                title: `$${ingreso.monto} MXN - ${ingreso.descripcion}`,
                start: ingreso.fecha,
                backgroundColor: this.getColorByTipo(ingreso.tipo),
                borderColor: this.getColorByTipo(ingreso.tipo),
                extendedProps: {
                    tipo: ingreso.tipo,
                    monto: ingreso.monto,
                    descripcion: ingreso.descripcion,
                    categoria: ingreso.categoria || ingreso.categoria_custom,
                    notas: ingreso.notas
                }
            }));
    }

    getColorByTipo(tipo) {
        const colores = {
            'nominal': '#10b981',      // Verde - Ingresos fijos
            'recurrente': '#3b82f6',   // Azul - Ingresos recurrentes
            'repentino': '#8b5cf6'     // Púrpura - Ingresos inesperados
        };
        return colores[tipo] || '#6b7280';
    }

    onEventClick(info) {
        const ingreso = this.ingresos.find(i => i.id === info.event.id);
        if (ingreso) {
            this.mostrarDetallesIngreso(ingreso);
        }
    }

    onDateClick(info) {
        // Abrir modal para crear nuevo ingreso con la fecha seleccionada
        const modal = document.getElementById('modal-ingreso');
        const fechaInput = document.getElementById('ingreso-fecha');
        
        if (modal && fechaInput) {
            fechaInput.value = info.dateStr;
            modal.classList.add('active');
        }
    }

    onEventDidMount(info) {
        // Personalizar la apariencia del evento
        const el = info.el;
        el.style.cursor = 'pointer';
        
        // Tooltip básico
        el.title = `${info.event.extendedProps.descripcion}\nTipo: ${info.event.extendedProps.tipo}\nMonto: $${info.event.extendedProps.monto} MXN`;
    }

    mostrarDetallesIngreso(ingreso) {
        // Crear y mostrar un modal con los detalles del ingreso
        const detallesHTML = `
            <div class="ingreso-details">
                <h4>📈 Detalle del Ingreso</h4>
                <div class="detail-row">
                    <strong>Tipo:</strong> 
                    <span class="badge badge-${ingreso.tipo}">${this.formatTipo(ingreso.tipo)}</span>
                </div>
                <div class="detail-row">
                    <strong>Descripción:</strong> ${ingreso.descripcion}
                </div>
                <div class="detail-row">
                    <strong>Monto:</strong> 
                    <span class="amount positive">$${ingreso.monto} MXN</span>
                </div>
                <div class="detail-row">
                    <strong>Fecha:</strong> ${this.formatFecha(ingreso.fecha)}
                </div>
                <div class="detail-row">
                    <strong>Categoría:</strong> ${ingreso.categoria || ingreso.categoria_custom || 'Sin categoría'}
                </div>
                ${ingreso.notas ? `
                <div class="detail-row">
                    <strong>Notas:</strong> ${ingreso.notas}
                </div>
                ` : ''}
                <div class="detail-actions">
                    <button onclick="window.CalendarioIngresos.editarIngreso('${ingreso.id}')" class="btn btn-secondary">
                        ✏️ Editar
                    </button>
                    <button onclick="window.CalendarioIngresos.eliminarIngreso('${ingreso.id}')" class="btn btn-danger">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;

        this.mostrarModal('Detalles del Ingreso', detallesHTML);
    }

    formatTipo(tipo) {
        const tipos = {
            'nominal': 'Nominal',
            'recurrente': 'Recurrente',
            'repentino': 'Repentino'
        };
        return tipos[tipo] || tipo;
    }

    formatFecha(fecha) {
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    mostrarModal(tituloOElemento, contenido) {
        // Si es un elemento DOM, mostrar ese modal
        if (tituloOElemento instanceof HTMLElement) {
            tituloOElemento.classList.add('active');
            return;
        }
        
        // Si son strings, crear modal temporal
        const titulo = tituloOElemento;
        
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
                    <div class="modal-body">
                        ${contenido}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async editarIngreso(id) {
        try {
            // Implementar edición de ingreso
            console.log('Editar ingreso:', id);
            
            // Buscar el ingreso en la lista
            const ingreso = this.ingresos.find(i => i.id === id);
            if (!ingreso) {
                console.error('No se encontró el ingreso con ID:', id);
                return;
            }
            
            // Abrir modal de edición con datos prellenados
            const modal = document.getElementById('modal-ingreso');
            if (!modal) return;
            
            // Prellenar formulario
            const form = document.getElementById('form-ingreso');
            if (form) {
                // Llenar campos usando getElementById para evitar errores
                document.getElementById('ingreso-id').value = ingreso.id || '';
                document.getElementById('ingreso-tipo').value = ingreso.tipo || '';
                document.getElementById('ingreso-descripcion').value = ingreso.descripcion || '';
                document.getElementById('ingreso-monto').value = ingreso.monto || '';
                document.getElementById('ingreso-fecha').value = ingreso.fecha || '';
                document.getElementById('ingreso-categoria').value = ingreso.categoria || '';
                
                // Si tiene campos de recurrencia, llenarlos
                if (ingreso.es_recurrente) {
                    const esRecurrenteCheck = document.getElementById('ingreso-es-recurrente');
                    if (esRecurrenteCheck) {
                        esRecurrenteCheck.checked = true;
                        
                        // Mostrar campos de recurrencia
                        const camposRecurrencia = document.querySelector('.campos-recurrencia');
                        if (camposRecurrencia) {
                            camposRecurrencia.style.display = 'block';
                        }
                        
                        // Llenar campos de recurrencia
                        const frecuenciaSelect = document.getElementById('ingreso-frecuencia-recurrencia');
                        const diaInput = document.getElementById('ingreso-dia-recurrencia');
                        const fechaFinInput = document.getElementById('ingreso-fecha-fin-recurrencia');
                        
                        if (frecuenciaSelect) frecuenciaSelect.value = ingreso.frecuencia_recurrencia || 'mensual';
                        if (diaInput) diaInput.value = ingreso.dia_recurrencia || '1';
                        if (fechaFinInput && ingreso.fecha_fin_recurrencia) {
                            fechaFinInput.value = ingreso.fecha_fin_recurrencia;
                        }
                    }
                }
                
                // Mostrar modal
                this.mostrarModal(modal);
                
                // Cambiar título del modal para indicar edición
                const modalTitle = document.querySelector('#modal-ingreso-title');
                if (modalTitle) {
                    modalTitle.textContent = '✏️ Editar Ingreso';
                }
                
                // Cerrar modal temporal
                const tempModal = document.querySelector('.temp-modal');
                if (tempModal) tempModal.remove();
            }
        } catch (error) {
            console.error('Error al editar ingreso:', error);
            await window.Alertas.error('Error al editar', 'No se pudo abrir el formulario de edición');
        }
    }

    async eliminarIngreso(id) {
        const confirmacion = await window.Alertas.confirmarEliminacion('ingreso');
        if (confirmacion.isConfirmed) {
            try {
                await this.storage.deleteItem('ingreso', id);
                await this.refrescarCalendario();
                
                // Cerrar modal temporal
                const tempModal = document.querySelector('.temp-modal');
                if (tempModal) tempModal.remove();
                
                console.log('✅ Ingreso eliminado');
            } catch (error) {
                console.error('Error al eliminar ingreso:', error);
                await window.Alertas.error('Error al eliminar', 'No se pudo eliminar el ingreso');
            }
        }
    }

    configurarEventos() {
        // Filtro de tipos de ingreso
        const filterSelect = document.getElementById('filter-ingresos');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.refrescarEventos();
            });
        }

        // Botón de agregar ingreso
        const addBtn = document.getElementById('add-ingreso-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const modal = document.getElementById('modal-ingreso');
                if (modal) {
                    // Limpiar formulario
                    const form = document.getElementById('form-ingreso');
                    if (form) form.reset();
                    
                    // Establecer fecha actual por defecto
                    const fechaInput = document.getElementById('ingreso-fecha');
                    if (fechaInput) {
                        fechaInput.value = new Date().toISOString().split('T')[0];
                    }
                    
                    modal.classList.add('active');
                }
            });
        }
    }

    refrescarEventos() {
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getEventosParaCalendario());
        }
    }

    async refrescarCalendario() {
        await this.cargarIngresos();
        this.refrescarEventos();
    }

    // Alias para compatibilidad
    async refresh() {
        return await this.refrescarCalendario();
    }

    async onIngresoGuardado(nuevoIngreso) {
        // Callback cuando se guarda un nuevo ingreso
        this.ingresos.push(nuevoIngreso);
        this.refrescarEventos();
    }
}

// La instancia global se creará en app.js
