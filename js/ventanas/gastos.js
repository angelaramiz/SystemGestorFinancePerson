/**
 * Gestión de la ventana de gastos
 * Maneja la visualización de gastos en formato de burbujas, calendario y lista
 */

class VentanaGastos {
    constructor(storageManager, indexedDBManager, notificaciones) {
        this.storageManager = storageManager;
        this.indexedDB = indexedDBManager;
        this.notificaciones = notificaciones;
        
        this.gastos = [];
        this.calendar = null;
        this.filtroActual = 'todos';
        this.vistaActual = 'burbujas'; // burbujas, calendario, lista
        
        this.inicializar();
    }

    async inicializar() {
        this.configurarEventos();
        await this.cargarGastos();
        this.inicializarVista();
    }

    configurarEventos() {
        // Filtros de gastos
        document.getElementById('filtro-gastos').addEventListener('change', (e) => {
            this.filtroActual = e.target.value;
            this.aplicarFiltros();
        });

        // Cambio de vista
        const botonesVista = document.querySelectorAll('.vista-gastos-btn');
        botonesVista.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vista = e.target.dataset.vista;
                this.cambiarVista(vista);
            });
        });

        // Búsqueda
        const busquedaInput = document.getElementById('busqueda-gastos');
        if (busquedaInput) {
            busquedaInput.addEventListener('input', (e) => {
                this.buscarGastos(e.target.value);
            });
        }

        // Ordenamiento
        const selectOrden = document.getElementById('orden-gastos');
        if (selectOrden) {
            selectOrden.addEventListener('change', (e) => {
                this.ordenarGastos(e.target.value);
            });
        }
    }

    async cargarGastos() {
        try {
            this.gastos = await this.indexedDB.obtenerTodos('gastos');
            this.actualizarContadores();
        } catch (error) {
            console.error('Error al cargar gastos:', error);
            this.notificaciones.mostrar('Error al cargar los gastos', 'error');
        }
    }

    inicializarVista() {
        // Determinar vista inicial desde storage o por defecto
        const vistaGuardada = this.storageManager.obtener('vista_gastos_actual');
        this.vistaActual = vistaGuardada || 'burbujas';
        
        this.cambiarVista(this.vistaActual);
    }

    cambiarVista(vista) {
        this.vistaActual = vista;
        this.storageManager.guardar('vista_gastos_actual', vista);

        // Actualizar botones activos
        document.querySelectorAll('.vista-gastos-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-vista="${vista}"]`).classList.add('active');

        // Ocultar todas las vistas
        document.querySelectorAll('.vista-gastos').forEach(elemento => {
            elemento.style.display = 'none';
        });

        // Mostrar vista seleccionada
        const vistaElemento = document.getElementById(`vista-gastos-${vista}`);
        if (vistaElemento) {
            vistaElemento.style.display = 'block';
        }

        // Renderizar contenido según la vista
        switch (vista) {
            case 'burbujas':
                this.renderizarVistaBurbujas();
                break;
            case 'calendario':
                this.renderizarVistaCalendario();
                break;
            case 'lista':
                this.renderizarVistaLista();
                break;
        }
    }

    renderizarVistaBurbujas() {
        const contenedor = document.getElementById('gastos-burbujas');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        const gastosFiltrados = this.obtenerGastosFiltrados();
        
        // Crear burbujas para cada gasto
        gastosFiltrados.forEach(gasto => {
            const burbuja = this.crearBurbuja(gasto);
            contenedor.appendChild(burbuja);
        });

        // Aplicar animaciones y posicionamiento
        this.aplicarAnimacionesBurbujas();
    }

    crearBurbuja(gasto) {
        const burbuja = document.createElement('div');
        burbuja.className = `burbuja-gasto prioridad-${gasto.prioridad} ${gasto.estado}`;
        burbuja.dataset.gastoId = gasto.id;

        // Calcular tamaño de burbuja basado en el monto
        const montoMax = Math.max(...this.gastos.map(g => g.monto));
        const tamaño = Math.max(60, Math.min(150, (gasto.monto / montoMax) * 120 + 60));
        
        burbuja.style.width = `${tamaño}px`;
        burbuja.style.height = `${tamaño}px`;

        // Calcular días hasta vencimiento para color
        const diasVencimiento = this.calcularDiasVencimiento(gasto.fechaVencimiento);
        const urgencia = this.calcularUrgencia(diasVencimiento, gasto.prioridad);
        
        burbuja.classList.add(`urgencia-${urgencia}`);

        burbuja.innerHTML = `
            <div class="burbuja-contenido">
                <div class="burbuja-nombre">${gasto.nombre}</div>
                <div class="burbuja-monto">$${gasto.monto.toLocaleString()}</div>
                <div class="burbuja-vencimiento">${this.formatearFechaVencimiento(diasVencimiento)}</div>
                <div class="burbuja-estado">${this.obtenerTextoEstado(gasto.estado)}</div>
            </div>
            <div class="burbuja-acciones">
                <button class="btn-editar" onclick="editarGasto('${gasto.id}')">✏️</button>
                <button class="btn-pagar" onclick="marcarComoPagado('${gasto.id}')">✓</button>
                <button class="btn-eliminar" onclick="eliminarGasto('${gasto.id}')">🗑️</button>
            </div>
        `;

        // Eventos de interacción
        burbuja.addEventListener('click', () => this.mostrarDetalleGasto(gasto));
        burbuja.addEventListener('mouseenter', () => this.mostrarTooltipGasto(gasto, burbuja));
        burbuja.addEventListener('mouseleave', () => this.ocultarTooltip());

        return burbuja;
    }

    aplicarAnimacionesBurbujas() {
        const contenedor = document.getElementById('gastos-burbujas');
        const burbujas = contenedor.querySelectorAll('.burbuja-gasto');
        
        // Aplicar posicionamiento aleatorio pero organizado
        burbujas.forEach((burbuja, index) => {
            const delay = index * 100;
            
            setTimeout(() => {
                const x = Math.random() * (contenedor.offsetWidth - burbuja.offsetWidth);
                const y = Math.random() * (contenedor.offsetHeight - burbuja.offsetHeight);
                
                burbuja.style.left = `${x}px`;
                burbuja.style.top = `${y}px`;
                burbuja.style.opacity = '1';
                burbuja.style.transform = 'scale(1)';
            }, delay);
        });

        // Prevenir superposición de burbujas
        setTimeout(() => {
            this.evitarSuperposicionBurbujas();
        }, burbujas.length * 100 + 500);
    }

    evitarSuperposicionBurbujas() {
        const burbujas = document.querySelectorAll('.burbuja-gasto');
        const positions = [];

        burbujas.forEach(burbuja => {
            const rect = burbuja.getBoundingClientRect();
            const contenedorRect = burbuja.parentElement.getBoundingClientRect();
            
            const pos = {
                element: burbuja,
                x: rect.left - contenedorRect.left,
                y: rect.top - contenedorRect.top,
                width: rect.width,
                height: rect.height
            };

            // Verificar colisiones con burbujas ya posicionadas
            let colision = true;
            let intentos = 0;
            
            while (colision && intentos < 50) {
                colision = false;
                
                for (let otherPos of positions) {
                    if (this.hayColision(pos, otherPos)) {
                        colision = true;
                        // Mover a nueva posición
                        pos.x = Math.random() * (burbuja.parentElement.offsetWidth - pos.width);
                        pos.y = Math.random() * (burbuja.parentElement.offsetHeight - pos.height);
                        break;
                    }
                }
                intentos++;
            }

            // Aplicar posición final
            burbuja.style.left = `${pos.x}px`;
            burbuja.style.top = `${pos.y}px`;
            
            positions.push(pos);
        });
    }

    hayColision(pos1, pos2) {
        const margen = 10; // Espacio mínimo entre burbujas
        
        return !(pos1.x + pos1.width + margen < pos2.x ||
                pos2.x + pos2.width + margen < pos1.x ||
                pos1.y + pos1.height + margen < pos2.y ||
                pos2.y + pos2.height + margen < pos1.y);
    }

    renderizarVistaCalendario() {
        const contenedor = document.getElementById('calendario-gastos');
        if (!contenedor) return;

        // Inicializar FullCalendar si no existe
        if (!this.calendar) {
            this.calendar = new FullCalendar.Calendar(contenedor, {
                initialView: 'dayGridMonth',
                locale: 'es',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,listWeek'
                },
                events: this.obtenerEventosCalendario(),
                eventClick: (info) => {
                    const gastoId = info.event.extendedProps.gastoId;
                    const gasto = this.gastos.find(g => g.id === gastoId);
                    if (gasto) {
                        this.mostrarDetalleGasto(gasto);
                    }
                },
                eventDidMount: (info) => {
                    // Personalizar apariencia de eventos según prioridad y estado
                    const gasto = this.gastos.find(g => g.id === info.event.extendedProps.gastoId);
                    if (gasto) {
                        info.el.classList.add(`prioridad-${gasto.prioridad}`);
                        info.el.classList.add(`estado-${gasto.estado}`);
                    }
                }
            });
        }

        this.calendar.render();
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(this.obtenerEventosCalendario());
    }

    obtenerEventosCalendario() {
        const gastosFiltrados = this.obtenerGastosFiltrados();
        
        return gastosFiltrados.map(gasto => {
            const diasVencimiento = this.calcularDiasVencimiento(gasto.fechaVencimiento);
            const urgencia = this.calcularUrgencia(diasVencimiento, gasto.prioridad);
            
            return {
                id: gasto.id,
                title: `${gasto.nombre} - $${gasto.monto.toLocaleString()}`,
                start: gasto.fechaVencimiento,
                backgroundColor: this.obtenerColorUrgencia(urgencia),
                borderColor: this.obtenerColorPrioridad(gasto.prioridad),
                textColor: '#ffffff',
                extendedProps: {
                    gastoId: gasto.id,
                    prioridad: gasto.prioridad,
                    estado: gasto.estado,
                    monto: gasto.monto
                }
            };
        });
    }

    renderizarVistaLista() {
        const contenedor = document.getElementById('lista-gastos');
        if (!contenedor) return;

        const gastosFiltrados = this.obtenerGastosFiltrados();
        
        if (gastosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="lista-vacia">
                    <p>No hay gastos que coincidan con los filtros seleccionados.</p>
                </div>
            `;
            return;
        }

        const tabla = document.createElement('table');
        tabla.className = 'tabla-gastos';
        
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Monto</th>
                    <th>Prioridad</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${gastosFiltrados.map(gasto => this.crearFilaGasto(gasto)).join('')}
            </tbody>
        `;

        contenedor.innerHTML = '';
        contenedor.appendChild(tabla);
    }

    crearFilaGasto(gasto) {
        const diasVencimiento = this.calcularDiasVencimiento(gasto.fechaVencimiento);
        const urgencia = this.calcularUrgencia(diasVencimiento, gasto.prioridad);
        
        return `
            <tr class="fila-gasto prioridad-${gasto.prioridad} urgencia-${urgencia}" data-gasto-id="${gasto.id}">
                <td class="nombre-gasto">${gasto.nombre}</td>
                <td class="monto-gasto">$${gasto.monto.toLocaleString()}</td>
                <td class="prioridad-gasto">
                    <span class="badge prioridad-${gasto.prioridad}">
                        ${this.obtenerTextoPrioridad(gasto.prioridad)}
                    </span>
                </td>
                <td class="vencimiento-gasto">
                    ${this.formatearFechaVencimiento(diasVencimiento)}
                    <span class="dias-restantes">(${diasVencimiento > 0 ? diasVencimiento + ' días' : 'Vencido'})</span>
                </td>
                <td class="estado-gasto">
                    <span class="badge estado-${gasto.estado}">
                        ${this.obtenerTextoEstado(gasto.estado)}
                    </span>
                </td>
                <td class="acciones-gasto">
                    <button class="btn btn-sm btn-primary" onclick="editarGasto('${gasto.id}')">Editar</button>
                    <button class="btn btn-sm btn-success" onclick="marcarComoPagado('${gasto.id}')">Pagar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarGasto('${gasto.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    }

    obtenerGastosFiltrados() {
        let gastosFiltrados = [...this.gastos];

        // Aplicar filtro por estado/prioridad
        if (this.filtroActual !== 'todos') {
            if (['pendiente', 'pagado', 'vencido'].includes(this.filtroActual)) {
                gastosFiltrados = gastosFiltrados.filter(g => g.estado === this.filtroActual);
            } else if (['alta', 'media', 'baja'].includes(this.filtroActual)) {
                gastosFiltrados = gastosFiltrados.filter(g => g.prioridad === this.filtroActual);
            }
        }

        return gastosFiltrados;
    }

    aplicarFiltros() {
        // Re-renderizar la vista actual con los filtros aplicados
        this.cambiarVista(this.vistaActual);
        this.actualizarContadores();
    }

    buscarGastos(termino) {
        const gastos = document.querySelectorAll('.burbuja-gasto, .fila-gasto');
        
        gastos.forEach(elemento => {
            const nombre = elemento.querySelector('.burbuja-nombre, .nombre-gasto')?.textContent.toLowerCase();
            const visible = !termino || nombre?.includes(termino.toLowerCase());
            
            elemento.style.display = visible ? 'block' : 'none';
        });
    }

    ordenarGastos(criterio) {
        switch (criterio) {
            case 'nombre':
                this.gastos.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'monto':
                this.gastos.sort((a, b) => b.monto - a.monto);
                break;
            case 'vencimiento':
                this.gastos.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
                break;
            case 'prioridad':
                const prioridadOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
                this.gastos.sort((a, b) => prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad]);
                break;
        }

        this.cambiarVista(this.vistaActual);
    }

    // Métodos de utilidad
    calcularDiasVencimiento(fechaVencimiento) {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diferencia = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diferencia;
    }

    calcularUrgencia(diasVencimiento, prioridad) {
        if (diasVencimiento <= 0) return 'critica';
        if (diasVencimiento <= 3 && prioridad === 'alta') return 'alta';
        if (diasVencimiento <= 7 && ['alta', 'media'].includes(prioridad)) return 'media';
        return 'baja';
    }

    formatearFechaVencimiento(diasVencimiento) {
        if (diasVencimiento < 0) return 'Vencido';
        if (diasVencimiento === 0) return 'Hoy';
        if (diasVencimiento === 1) return 'Mañana';
        return `En ${diasVencimiento} días`;
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'pagado': 'Pagado',
            'vencido': 'Vencido'
        };
        return estados[estado] || estado;
    }

    obtenerTextoPrioridad(prioridad) {
        const prioridades = {
            'alta': 'Alta',
            'media': 'Media',
            'baja': 'Baja'
        };
        return prioridades[prioridad] || prioridad;
    }

    obtenerColorUrgencia(urgencia) {
        const colores = {
            'critica': '#dc3545',
            'alta': '#fd7e14',
            'media': '#ffc107',
            'baja': '#28a745'
        };
        return colores[urgencia] || '#6c757d';
    }

    obtenerColorPrioridad(prioridad) {
        const colores = {
            'alta': '#dc3545',
            'media': '#ffc107',
            'baja': '#28a745'
        };
        return colores[prioridad] || '#6c757d';
    }

    actualizarContadores() {
        const contadores = {
            total: this.gastos.length,
            pendientes: this.gastos.filter(g => g.estado === 'pendiente').length,
            pagados: this.gastos.filter(g => g.estado === 'pagado').length,
            vencidos: this.gastos.filter(g => g.estado === 'vencido').length
        };

        // Actualizar elementos de contador en la UI
        Object.keys(contadores).forEach(tipo => {
            const elemento = document.getElementById(`contador-gastos-${tipo}`);
            if (elemento) {
                elemento.textContent = contadores[tipo];
            }
        });
    }

    mostrarDetalleGasto(gasto) {
        // Implementar modal de detalle de gasto
        console.log('Mostrar detalle de gasto:', gasto);
        // TODO: Abrir modal con detalles completos del gasto
    }

    mostrarTooltipGasto(gasto, elemento) {
        // Implementar tooltip con información adicional
        console.log('Mostrar tooltip para gasto:', gasto);
        // TODO: Crear y mostrar tooltip
    }

    ocultarTooltip() {
        // Implementar ocultación de tooltip
        const tooltips = document.querySelectorAll('.tooltip-gasto');
        tooltips.forEach(tooltip => tooltip.remove());
    }

    // Métodos públicos para interacción externa
    async actualizarVista() {
        await this.cargarGastos();
        this.cambiarVista(this.vistaActual);
    }

    async eliminarGasto(gastoId) {
        try {
            await this.indexedDB.eliminar('gastos', gastoId);
            await this.actualizarVista();
            this.notificaciones.mostrar('Gasto eliminado correctamente', 'success');
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            this.notificaciones.mostrar('Error al eliminar el gasto', 'error');
        }
    }

    async marcarComoPagado(gastoId) {
        try {
            const gasto = this.gastos.find(g => g.id === gastoId);
            if (gasto) {
                gasto.estado = 'pagado';
                gasto.fechaPago = new Date().toISOString();
                await this.indexedDB.actualizar('gastos', gasto);
                await this.actualizarVista();
                this.notificaciones.mostrar('Gasto marcado como pagado', 'success');
            }
        } catch (error) {
            console.error('Error al marcar gasto como pagado:', error);
            this.notificaciones.mostrar('Error al actualizar el gasto', 'error');
        }
    }
}

// Funciones globales para eventos desde HTML
window.editarGasto = function(gastoId) {
    // Abrir modal de edición de gasto
    const modal = document.getElementById('modal-gasto');
    if (modal) {
        const event = new CustomEvent('editar-gasto', { detail: { gastoId } });
        document.dispatchEvent(event);
    }
};

window.eliminarGasto = function(gastoId) {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        const event = new CustomEvent('eliminar-gasto', { detail: { gastoId } });
        document.dispatchEvent(event);
    }
};

window.marcarComoPagado = function(gastoId) {
    const event = new CustomEvent('marcar-pagado', { detail: { gastoId } });
    document.dispatchEvent(event);
};

// Hacer disponible globalmente
window.VentanaGastos = VentanaGastos;
