/**
 * Gestión del calendario de gastos
 * Maneja la visualización y eventos del calendario de gastos usando FullCalendar
 */

class CalendarioGastos {
    constructor(storageManager) {
        this.storage = storageManager;
        this.calendar = null;
        this.currentFilter = 'todos';
        this.gastos = [];
        
        // No iniciar automáticamente, se hará desde app.js
        console.log('🚀 CalendarioGastos instanciado, esperando inicialización externa...');
    }

    async init() {
        console.log('🚀 Iniciando CalendarioGastos...');
        await this.cargarGastos();
        this.initCalendar();
        this.configurarEventos();
        console.log('✅ CalendarioGastos inicializado completamente');
    }

    async cargarGastos() {
        try {
            this.gastos = await this.storage.getGastos();
            console.log(`📋 Cargados ${this.gastos.length} gastos`);
        } catch (error) {
            console.error('Error al cargar gastos:', error);
            this.gastos = [];
        }
    }

    initCalendar() {
        const calendarEl = document.getElementById('calendar-gastos');
        if (!calendarEl) {
            console.error('❌ Elemento calendar-gastos no encontrado');
            return;
        }

        if (typeof FullCalendar === 'undefined') {
            console.error('❌ FullCalendar no está disponible');
            return;
        }

        console.log('📅 Inicializando calendario de gastos...');

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
            console.log('✅ Calendario de gastos renderizado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar calendario de gastos:', error);
        }
    }

    getEventosParaCalendario() {
        return this.gastos
            .filter(gasto => {
                if (this.currentFilter === 'todos') return true;
                return gasto.tipo === this.currentFilter;
            })
            .map(gasto => ({
                id: gasto.id,
                title: `$${gasto.monto} MXN - ${gasto.descripcion}`,
                start: gasto.fecha,
                backgroundColor: this.getColorByTipo(gasto.tipo),
                borderColor: this.getColorByTipo(gasto.tipo),
                textColor: '#ffffff',
                extendedProps: {
                    tipo: gasto.tipo,
                    monto: gasto.monto,
                    descripcion: gasto.descripcion,
                    categoria: gasto.categoria || gasto.categoria_custom,
                    notas: gasto.notas,
                    estado: gasto.estado || 'pendiente'
                }
            }));
    }

    getColorByTipo(tipo) {
        const colores = {
            'futuro': '#3b82f6',       // Azul - Gastos futuros planificados
            'recurrente': '#f59e0b',   // Naranja - Gastos recurrentes
            'imprevisto': '#ef4444'    // Rojo - Gastos imprevistos
        };
        return colores[tipo] || '#6b7280';
    }

    onEventClick(info) {
        const gasto = this.gastos.find(g => g.id === info.event.id);
        if (gasto) {
            this.mostrarDetallesGasto(gasto);
        }
    }

    onDateClick(info) {
        // Abrir modal para crear nuevo gasto con la fecha seleccionada
        const modal = document.getElementById('modal-gasto');
        const fechaInput = document.getElementById('gasto-fecha');
        
        if (modal && fechaInput) {
            fechaInput.value = info.dateStr;
            modal.classList.add('active');
        }
    }

    onEventDidMount(info) {
        // Personalizar la apariencia del evento
        const el = info.el;
        el.style.cursor = 'pointer';
        
        // Agregar clase según el estado
        const estado = info.event.extendedProps.estado;
        if (estado === 'pagado') {
            el.style.opacity = '0.7';
            el.style.textDecoration = 'line-through';
        }
        
        // Tooltip básico
        el.title = `${info.event.extendedProps.descripcion}\nTipo: ${info.event.extendedProps.tipo}\nMonto: $${info.event.extendedProps.monto} MXN\nEstado: ${estado}`;
    }

    mostrarDetallesGasto(gasto) {
        const estadoBadge = this.getEstadoBadge(gasto.estado || 'pendiente');
        
        const detallesHTML = `
            <div class="gasto-details">
                <h4>💸 Detalle del Gasto</h4>
                <div class="detail-row">
                    <strong>Tipo:</strong> 
                    <span class="badge badge-${gasto.tipo}">${this.formatTipo(gasto.tipo)}</span>
                </div>
                <div class="detail-row">
                    <strong>Estado:</strong> 
                    ${estadoBadge}
                </div>
                <div class="detail-row">
                    <strong>Descripción:</strong> ${gasto.descripcion}
                </div>
                <div class="detail-row">
                    <strong>Monto:</strong> 
                    <span class="amount negative">$${gasto.monto} MXN</span>
                </div>
                <div class="detail-row">
                    <strong>Fecha:</strong> ${this.formatFecha(gasto.fecha)}
                </div>
                <div class="detail-row">
                    <strong>Categoría:</strong> ${gasto.categoria || gasto.categoria_custom || 'Sin categoría'}
                </div>
                ${gasto.notas ? `
                <div class="detail-row">
                    <strong>Notas:</strong> ${gasto.notas}
                </div>
                ` : ''}
                <div class="detail-actions">
                    ${gasto.estado !== 'pagado' ? `
                        <button onclick="window.CalendarioGastos.marcarComoPagado('${gasto.id}')" class="btn btn-success">
                            ✅ Marcar como Pagado
                        </button>
                    ` : ''}
                    <button onclick="window.CalendarioGastos.editarGasto('${gasto.id}')" class="btn btn-secondary">
                        ✏️ Editar
                    </button>
                    <button onclick="window.CalendarioGastos.eliminarGasto('${gasto.id}')" class="btn btn-danger">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;

        this.mostrarModal('Detalles del Gasto', detallesHTML);
    }

    getEstadoBadge(estado) {
        const badges = {
            'pendiente': '<span class="badge badge-warning">⏳ Pendiente</span>',
            'pagado': '<span class="badge badge-success">✅ Pagado</span>',
            'cancelado': '<span class="badge badge-danger">❌ Cancelado</span>'
        };
        return badges[estado] || badges['pendiente'];
    }

    formatTipo(tipo) {
        const tipos = {
            'futuro': 'Futuro',
            'recurrente': 'Recurrente',
            'imprevisto': 'Imprevisto'
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

    async marcarComoPagado(id) {
        try {
            // Encontrar el gasto
            const gasto = this.gastos.find(g => g.id === id);
            if (!gasto) return;

            // Actualizar estado
            gasto.estado = 'pagado';
            gasto.updated_at = new Date().toISOString();
            
            // Guardar en almacenamiento
            await this.storage.saveGasto(gasto);
            
            // Refrescar calendario
            await this.refrescarCalendario();
            
            // Cerrar modal temporal
            const tempModal = document.querySelector('.temp-modal');
            if (tempModal) tempModal.remove();
            
            console.log('✅ Gasto marcado como pagado');
        } catch (error) {
            console.error('Error al marcar gasto como pagado:', error);
            alert('Error al actualizar el gasto');
        }
    }

    async editarGasto(id) {
        try {
            console.log('Editar gasto:', id);
            
            // Buscar el gasto en la lista
            const gasto = this.gastos.find(g => g.id === id);
            if (!gasto) {
                console.error('No se encontró el gasto con ID:', id);
                return;
            }
            
            // Abrir modal de edición con datos prellenados
            const modal = document.getElementById('modal-gasto');
            if (!modal) return;
            
            // Prellenar formulario
            const form = document.getElementById('form-gasto');
            if (form) {
                // Llenar campos
                form.elements['gasto-id'].value = gasto.id;
                form.elements['gasto-tipo'].value = gasto.tipo;
                form.elements['gasto-descripcion'].value = gasto.descripcion;
                form.elements['gasto-monto'].value = gasto.monto;
                form.elements['gasto-fecha'].value = gasto.fecha;
                form.elements['gasto-categoria'].value = gasto.categoria;
                form.elements['gasto-notas'].value = gasto.notas || '';
                
                // Mostrar modal
                this.mostrarModal(modal);
                
                // Cerrar modal temporal
                const tempModal = document.querySelector('.temp-modal');
                if (tempModal) tempModal.remove();
            }
        } catch (error) {
            console.error('Error al editar gasto:', error);
            alert('Error al abrir el formulario de edición');
        }
    }

    async eliminarGasto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            try {
                await this.storage.deleteItem('gasto', id);
                await this.refrescarCalendario();
                
                // Cerrar modal temporal
                const tempModal = document.querySelector('.temp-modal');
                if (tempModal) tempModal.remove();
                
                console.log('✅ Gasto eliminado');
            } catch (error) {
                console.error('Error al eliminar gasto:', error);
                alert('Error al eliminar el gasto');
            }
        }
    }

    configurarEventos() {
        // Filtro de tipos de gasto
        const filterSelect = document.getElementById('filter-gastos');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.refrescarEventos();
            });
        }

        // Botón de agregar gasto
        const addBtn = document.getElementById('add-gasto-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const modal = document.getElementById('modal-gasto');
                if (modal) {
                    // Limpiar formulario
                    const form = document.getElementById('form-gasto');
                    if (form) form.reset();
                    
                    // Establecer fecha actual por defecto
                    const fechaInput = document.getElementById('gasto-fecha');
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
        await this.cargarGastos();
        this.refrescarEventos();
    }

    // Alias para compatibilidad
    async refresh() {
        return await this.refrescarCalendario();
    }

    async onGastoGuardado(nuevoGasto) {
        // Callback cuando se guarda un nuevo gasto
        this.gastos.push(nuevoGasto);
        this.refrescarEventos();
    }
}

// La instancia global se creará en app.js
