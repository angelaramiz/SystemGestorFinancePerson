/**
 * Gestión de la ventana de gestión (diagrama de flujo)
 * Maneja la visualización y conexión de ingresos y gastos usando Drawflow
 */

class VentanaGestion {
    constructor(storageManager, indexedDBManager, notificaciones, algoritmoPriorizacion) {
        this.storageManager = storageManager;
        this.indexedDB = indexedDBManager;
        this.notificaciones = notificaciones;
        this.algoritmoPriorizacion = algoritmoPriorizacion;
        
        this.drawflow = null;
        this.ingresos = [];
        this.gastos = [];
        this.conexiones = [];
        
        this.modoEdicion = false;
        this.elementoSeleccionado = null;
        
        this.inicializar();
    }

    async inicializar() {
        await this.cargarDatos();
        this.inicializarDrawflow();
        this.configurarEventos();
        this.cargarDiagramaGuardado();
    }

    async cargarDatos() {
        try {
            this.ingresos = await this.indexedDB.obtenerTodos('ingresos');
            this.gastos = await this.indexedDB.obtenerTodos('gastos');
            this.conexiones = await this.indexedDB.obtenerTodos('conexiones') || [];
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.notificaciones.mostrar('Error al cargar los datos', 'error');
        }
    }

    inicializarDrawflow() {
        const contenedor = document.getElementById('drawflow-container');
        if (!contenedor) {
            console.error('Contenedor de Drawflow no encontrado');
            return;
        }

        this.drawflow = new Drawflow(contenedor);
        this.drawflow.reroute = true;
        this.drawflow.reroute_fix_curvature = true;
        this.drawflow.force_first_input = false;
        
        // Configurar editor
        this.drawflow.start();
        
        // Personalizar estilos
        this.configurarEstilosDrawflow();
        
        // Eventos de Drawflow
        this.drawflow.on('nodeCreated', (id) => {
            console.log('Nodo creado:', id);
        });

        this.drawflow.on('nodeRemoved', (id) => {
            this.eliminarConexionesNodo(id);
        });

        this.drawflow.on('connectionCreated', (connection) => {
            this.crearConexion(connection);
        });

        this.drawflow.on('connectionRemoved', (connection) => {
            this.eliminarConexion(connection);
        });

        this.drawflow.on('nodeSelected', (id) => {
            this.seleccionarElemento(id);
        });
    }

    configurarEstilosDrawflow() {
        // Inyectar estilos personalizados para Drawflow
        const estilo = document.createElement('style');
        estilo.textContent = `
            .drawflow .drawflow-node {
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border: 2px solid #e0e0e0;
                background: white;
                min-width: 150px;
                min-height: 80px;
            }
            
            .drawflow .drawflow-node.selected {
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
            }
            
            .drawflow .drawflow-node.ingreso {
                border-color: #28a745;
                background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
            }
            
            .drawflow .drawflow-node.gasto {
                border-color: #dc3545;
                background: linear-gradient(135deg, #fde8e8 0%, #fff0f0 100%);
            }
            
            .drawflow .drawflow-node.algoritmo {
                border-color: #ffc107;
                background: linear-gradient(135deg, #fffacd 0%, #ffffe0 100%);
            }
            
            .drawflow .connection .main-path {
                stroke-width: 3px;
                stroke: #6c757d;
            }
            
            .drawflow .connection.connection-selected .main-path {
                stroke: #007bff;
                stroke-width: 4px;
            }
            
            .drawflow .connection.conexion-activa .main-path {
                stroke: #28a745;
                stroke-width: 4px;
                animation: flujo 2s infinite;
            }
            
            @keyframes flujo {
                0% { stroke-dasharray: 5, 10; stroke-dashoffset: 0; }
                100% { stroke-dasharray: 5, 10; stroke-dashoffset: -15; }
            }
            
            .nodo-contenido {
                padding: 8px;
                text-align: center;
            }
            
            .nodo-titulo {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 4px;
                color: #333;
            }
            
            .nodo-monto {
                font-size: 14px;
                font-weight: bold;
                color: #007bff;
            }
            
            .nodo-info {
                font-size: 10px;
                color: #666;
                margin-top: 2px;
            }
            
            .nodo-estado {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                font-weight: bold;
                color: white;
                margin-top: 4px;
            }
            
            .estado-pendiente { background-color: #ffc107; }
            .estado-pagado { background-color: #28a745; }
            .estado-vencido { background-color: #dc3545; }
            .estado-activo { background-color: #17a2b8; }
            .estado-inactivo { background-color: #6c757d; }
        `;
        document.head.appendChild(estilo);
    }

    configurarEventos() {
        // Botones de la barra de herramientas
        document.getElementById('btn-agregar-ingresos')?.addEventListener('click', () => {
            this.agregarNodosIngresos();
        });

        document.getElementById('btn-agregar-gastos')?.addEventListener('click', () => {
            this.agregarNodosGastos();
        });

        document.getElementById('btn-algoritmo')?.addEventListener('click', () => {
            this.agregarNodoAlgoritmo();
        });

        document.getElementById('btn-ejecutar-algoritmo')?.addEventListener('click', () => {
            this.ejecutarAlgoritmo();
        });

        document.getElementById('btn-limpiar-diagrama')?.addEventListener('click', () => {
            this.limpiarDiagrama();
        });

        document.getElementById('btn-guardar-diagrama')?.addEventListener('click', () => {
            this.guardarDiagrama();
        });

        document.getElementById('btn-cargar-diagrama')?.addEventListener('click', () => {
            this.cargarDiagrama();
        });

        document.getElementById('btn-exportar-diagrama')?.addEventListener('click', () => {
            this.exportarDiagrama();
        });

        // Modo edición
        document.getElementById('toggle-edicion')?.addEventListener('change', (e) => {
            this.toggleModoEdicion(e.target.checked);
        });

        // Zoom y navegación
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
            this.drawflow.zoom_in();
        });

        document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
            this.drawflow.zoom_out();
        });

        document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
            this.drawflow.zoom_reset();
        });

        // Eventos personalizados
        document.addEventListener('datos-actualizados', () => {
            this.actualizarDiagrama();
        });
    }

    agregarNodosIngresos() {
        this.ingresos.forEach((ingreso, index) => {
            const posX = 50 + (index % 3) * 200;
            const posY = 100 + Math.floor(index / 3) * 150;
            
            this.crearNodoIngreso(ingreso, posX, posY);
        });
        
        this.notificaciones.mostrar(`${this.ingresos.length} nodos de ingresos agregados`, 'success');
    }

    agregarNodosGastos() {
        this.gastos.forEach((gasto, index) => {
            const posX = 500 + (index % 3) * 200;
            const posY = 100 + Math.floor(index / 3) * 150;
            
            this.crearNodoGasto(gasto, posX, posY);
        });
        
        this.notificaciones.mostrar(`${this.gastos.length} nodos de gastos agregados`, 'success');
    }

    crearNodoIngreso(ingreso, posX, posY) {
        const contenido = `
            <div class="nodo-contenido">
                <div class="nodo-titulo">${ingreso.fuente}</div>
                <div class="nodo-monto">${window.formatearMoneda ? window.formatearMoneda(ingreso.monto) : `$${ingreso.monto.toLocaleString()}`}</div>
                <div class="nodo-info">${ingreso.recurrente ? 'Recurrente' : 'Único'}</div>
                <div class="nodo-info">${new Date(ingreso.fecha).toLocaleDateString()}</div>
                <div class="nodo-estado estado-${ingreso.estado || 'activo'}">${ingreso.estado || 'Activo'}</div>
            </div>
        `;

        const nodeId = this.drawflow.addNode('ingreso', 0, 1, posX, posY, 'ingreso', {
            tipo: 'ingreso',
            datos: ingreso
        }, contenido);

        return nodeId;
    }

    crearNodoGasto(gasto, posX, posY) {
        const diasVencimiento = this.calcularDiasVencimiento(gasto.fechaVencimiento);
        const urgencia = diasVencimiento <= 0 ? 'vencido' : 
                        diasVencimiento <= 3 ? 'urgente' : 'normal';

        const contenido = `
            <div class="nodo-contenido">
                <div class="nodo-titulo">${gasto.nombre}</div>
                <div class="nodo-monto">${window.formatearMoneda ? window.formatearMoneda(gasto.monto) : `$${gasto.monto.toLocaleString()}`}</div>
                <div class="nodo-info">Prioridad: ${gasto.prioridad}</div>
                <div class="nodo-info">${this.formatearFechaVencimiento(diasVencimiento)}</div>
                <div class="nodo-estado estado-${gasto.estado}">${this.obtenerTextoEstado(gasto.estado)}</div>
            </div>
        `;

        const nodeId = this.drawflow.addNode('gasto', 1, 0, posX, posY, 'gasto', {
            tipo: 'gasto',
            datos: gasto,
            urgencia: urgencia
        }, contenido);

        return nodeId;
    }

    agregarNodoAlgoritmo() {
        const contenido = `
            <div class="nodo-contenido">
                <div class="nodo-titulo">Algoritmo de Priorización</div>
                <div class="nodo-info">Conecta ingresos con gastos</div>
                <div class="nodo-info">según prioridad y fechas</div>
                <button class="btn btn-sm btn-primary" onclick="ejecutarAlgoritmoDesdeNodo()">Ejecutar</button>
            </div>
        `;

        const nodeId = this.drawflow.addNode('algoritmo', 3, 3, 400, 300, 'algoritmo', {
            tipo: 'algoritmo'
        }, contenido);

        this.notificaciones.mostrar('Nodo del algoritmo agregado', 'info');
        return nodeId;
    }

    async ejecutarAlgoritmo() {
        try {
            this.notificaciones.mostrar('Ejecutando algoritmo de priorización...', 'info');
            
            // Obtener datos actualizados
            await this.cargarDatos();
            
            // Ejecutar algoritmo
            const resultado = this.algoritmoPriorizacion.procesarPriorizacion(this.ingresos, this.gastos);
            
            // Visualizar resultados en el diagrama
            this.visualizarResultadoAlgoritmo(resultado);
            
            // Guardar conexiones generadas
            await this.guardarConexiones(resultado.conexiones);
            
            this.notificaciones.mostrar('Algoritmo ejecutado correctamente', 'success');
            
            // Mostrar resumen de resultados
            this.mostrarResumenResultados(resultado);
            
        } catch (error) {
            console.error('Error al ejecutar algoritmo:', error);
            this.notificaciones.mostrar('Error al ejecutar el algoritmo', 'error');
        }
    }

    visualizarResultadoAlgoritmo(resultado) {
        // Limpiar conexiones existentes
        this.limpiarConexiones();
        
        // Crear conexiones según el resultado del algoritmo
        resultado.conexiones.forEach(conexion => {
            const nodoIngreso = this.encontrarNodoPorDatos('ingreso', conexion.ingresoId);
            const nodoGasto = this.encontrarNodoPorDatos('gasto', conexion.gastoId);
            
            if (nodoIngreso && nodoGasto) {
                // Crear conexión visual
                this.drawflow.addConnection(nodoIngreso, nodoGasto, 'output_1', 'input_1');
                
                // Marcar como conexión activa
                setTimeout(() => {
                    const conexionElemento = document.querySelector(`[data-connection="${nodoIngreso}-${nodoGasto}"]`);
                    if (conexionElemento) {
                        conexionElemento.classList.add('conexion-activa');
                    }
                }, 100);
            }
        });

        // Actualizar estado de nodos
        this.actualizarEstadoNodos(resultado);
    }

    actualizarEstadoNodos(resultado) {
        // Actualizar nodos de gastos según cobertura
        resultado.gastosCubiertos.forEach(gastoInfo => {
            const nodo = this.encontrarNodoPorDatos('gasto', gastoInfo.gastoId);
            if (nodo) {
                const nodoElement = document.querySelector(`[data-node="${nodo}"]`);
                if (nodoElement) {
                    nodoElement.classList.add('cubierto');
                    
                    // Actualizar información de cobertura
                    const infoElement = nodoElement.querySelector('.nodo-info');
                    if (infoElement) {
                        infoElement.innerHTML += `<br><small>Cubierto: ${window.formatearMoneda ? window.formatearMoneda(gastoInfo.montoCubierto) : `$${gastoInfo.montoCubierto.toLocaleString()}`}</small>`;
                    }
                }
            }
        });

        // Marcar gastos no cubiertos
        resultado.gastosNoCubiertos.forEach(gasto => {
            const nodo = this.encontrarNodoPorDatos('gasto', gasto.id);
            if (nodo) {
                const nodoElement = document.querySelector(`[data-node="${nodo}"]`);
                if (nodoElement) {
                    nodoElement.classList.add('no-cubierto');
                }
            }
        });
    }

    encontrarNodoPorDatos(tipo, id) {
        const datos = this.drawflow.export();
        
        for (let nodeId in datos.drawflow.Home.data) {
            const node = datos.drawflow.Home.data[nodeId];
            if (node.data.tipo === tipo && node.data.datos && node.data.datos.id === id) {
                return parseInt(nodeId);
            }
        }
        
        return null;
    }

    mostrarResumenResultados(resultado) {
        const resumen = document.getElementById('resumen-algoritmo');
        if (!resumen) return;

        const totalIngresos = resultado.totalIngresos;
        const totalGastos = resultado.totalGastos;
        const totalCubierto = resultado.totalCubierto;
        const balance = totalIngresos - totalGastos;

        resumen.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>Resumen de Priorización</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-card ingreso">
                                <div class="stat-value">${window.formatearMoneda ? window.formatearMoneda(totalIngresos) : `$${totalIngresos.toLocaleString()}`}</div>
                                <div class="stat-label">Total Ingresos</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card gasto">
                                <div class="stat-value">${window.formatearMoneda ? window.formatearMoneda(totalGastos) : `$${totalGastos.toLocaleString()}`}</div>
                                <div class="stat-label">Total Gastos</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card cubierto">
                                <div class="stat-value">${window.formatearMoneda ? window.formatearMoneda(totalCubierto) : `$${totalCubierto.toLocaleString()}`}</div>
                                <div class="stat-label">Gastos Cubiertos</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-card ${balance >= 0 ? 'positivo' : 'negativo'}">
                                <div class="stat-value">${window.formatearMoneda ? window.formatearMoneda(balance) : `$${balance.toLocaleString()}`}</div>
                                <div class="stat-label">Balance</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <h6>Gastos por Prioridad:</h6>
                        <div class="prioridad-stats">
                            ${resultado.estadisticasPrioridad.map(stat => `
                                <div class="prioridad-item">
                                    <span class="badge prioridad-${stat.prioridad}">${stat.prioridad}</span>
                                    <span>${stat.cantidad} gastos</span>
                                    <span>${window.formatearMoneda ? window.formatearMoneda(stat.total) : `$${stat.total.toLocaleString()}`}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        resumen.style.display = 'block';
    }

    crearConexion(connection) {
        const conexion = {
            id: `${connection.output_id}_${connection.input_id}`,
            nodoOrigen: connection.output_id,
            nodoDestino: connection.input_id,
            fechaCreacion: new Date().toISOString()
        };

        this.conexiones.push(conexion);
        this.guardarConexiones([conexion]);
    }

    eliminarConexion(connection) {
        const conexionId = `${connection.output_id}_${connection.input_id}`;
        this.conexiones = this.conexiones.filter(c => c.id !== conexionId);
        this.guardarConexiones(this.conexiones);
    }

    async guardarConexiones(conexiones) {
        try {
            for (let conexion of conexiones) {
                await this.indexedDB.guardar('conexiones', conexion);
            }
        } catch (error) {
            console.error('Error al guardar conexiones:', error);
        }
    }

    eliminarConexionesNodo(nodeId) {
        this.conexiones = this.conexiones.filter(c => 
            c.nodoOrigen !== nodeId && c.nodoDestino !== nodeId
        );
    }

    limpiarConexiones() {
        // Eliminar todas las conexiones visuales
        const conexiones = document.querySelectorAll('.connection');
        conexiones.forEach(conexion => {
            this.drawflow.removeSingleConnection(
                conexion.dataset.outputId,
                conexion.dataset.inputId,
                conexion.dataset.outputClass,
                conexion.dataset.inputClass
            );
        });
    }

    limpiarDiagrama() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el diagrama?')) {
            this.drawflow.clear();
            this.conexiones = [];
            this.notificaciones.mostrar('Diagrama limpiado', 'info');
        }
    }

    async guardarDiagrama() {
        try {
            const diagramaData = {
                id: 'diagrama_principal',
                nombre: 'Diagrama Principal',
                datos: this.drawflow.export(),
                conexiones: this.conexiones,
                fechaGuardado: new Date().toISOString()
            };

            await this.indexedDB.guardar('diagramas', diagramaData);
            this.notificaciones.mostrar('Diagrama guardado correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar diagrama:', error);
            this.notificaciones.mostrar('Error al guardar el diagrama', 'error');
        }
    }

    async cargarDiagrama() {
        try {
            const diagrama = await this.indexedDB.obtener('diagramas', 'diagrama_principal');
            if (diagrama) {
                this.drawflow.import(diagrama.datos);
                this.conexiones = diagrama.conexiones || [];
                this.notificaciones.mostrar('Diagrama cargado correctamente', 'success');
            } else {
                this.notificaciones.mostrar('No hay diagrama guardado', 'info');
            }
        } catch (error) {
            console.error('Error al cargar diagrama:', error);
            this.notificaciones.mostrar('Error al cargar el diagrama', 'error');
        }
    }

    async cargarDiagramaGuardado() {
        // Cargar automáticamente el diagrama guardado al inicializar
        await this.cargarDiagrama();
    }

    exportarDiagrama() {
        const diagramaData = {
            datos: this.drawflow.export(),
            conexiones: this.conexiones,
            ingresos: this.ingresos,
            gastos: this.gastos,
            fechaExportacion: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(diagramaData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagrama_financiero_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.notificaciones.mostrar('Diagrama exportado', 'success');
    }

    toggleModoEdicion(habilitado) {
        this.modoEdicion = habilitado;
        this.drawflow.editor_mode = habilitado;
        
        const herramientas = document.querySelector('.herramientas-diagrama');
        if (herramientas) {
            herramientas.style.display = habilitado ? 'block' : 'none';
        }
        
        this.notificaciones.mostrar(
            `Modo edición ${habilitado ? 'activado' : 'desactivado'}`, 
            'info'
        );
    }

    seleccionarElemento(nodeId) {
        this.elementoSeleccionado = nodeId;
        
        // Mostrar propiedades del elemento seleccionado
        this.mostrarPropiedadesElemento(nodeId);
    }

    mostrarPropiedadesElemento(nodeId) {
        const panelPropiedades = document.getElementById('panel-propiedades');
        if (!panelPropiedades) return;

        const datos = this.drawflow.export();
        const nodo = datos.drawflow.Home.data[nodeId];
        
        if (nodo) {
            panelPropiedades.innerHTML = `
                <h6>Propiedades del Nodo</h6>
                <div class="propiedad">
                    <label>Tipo:</label>
                    <span>${nodo.data.tipo}</span>
                </div>
                <div class="propiedad">
                    <label>Posición:</label>
                    <span>X: ${nodo.pos_x}, Y: ${nodo.pos_y}</span>
                </div>
                ${nodo.data.datos ? `
                    <div class="propiedad">
                        <label>Datos:</label>
                        <pre>${JSON.stringify(nodo.data.datos, null, 2)}</pre>
                    </div>
                ` : ''}
            `;
            
            panelPropiedades.style.display = 'block';
        }
    }

    async actualizarDiagrama() {
        await this.cargarDatos();
        // Re-renderizar nodos con datos actualizados
        const datos = this.drawflow.export();
        
        for (let nodeId in datos.drawflow.Home.data) {
            const nodo = datos.drawflow.Home.data[nodeId];
            if (nodo.data.tipo === 'ingreso' || nodo.data.tipo === 'gasto') {
                this.actualizarNodo(nodeId, nodo);
            }
        }
    }

    actualizarNodo(nodeId, nodo) {
        // Buscar datos actualizados
        let datosActualizados = null;
        
        if (nodo.data.tipo === 'ingreso') {
            datosActualizados = this.ingresos.find(i => i.id === nodo.data.datos.id);
        } else if (nodo.data.tipo === 'gasto') {
            datosActualizados = this.gastos.find(g => g.id === nodo.data.datos.id);
        }

        if (datosActualizados) {
            // Actualizar contenido del nodo
            const nuevoContenido = nodo.data.tipo === 'ingreso' 
                ? this.generarContenidoIngreso(datosActualizados)
                : this.generarContenidoGasto(datosActualizados);
                
            this.drawflow.updateNodeContent(nodeId, nuevoContenido);
        }
    }

    // Métodos de utilidad
    calcularDiasVencimiento(fechaVencimiento) {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        return Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    }

    formatearFechaVencimiento(dias) {
        if (dias < 0) return 'Vencido';
        if (dias === 0) return 'Hoy';
        if (dias === 1) return 'Mañana';
        return `En ${dias} días`;
    }

    obtenerTextoEstado(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'pagado': 'Pagado',
            'vencido': 'Vencido'
        };
        return estados[estado] || estado;
    }
}

// Funciones globales para eventos desde el diagrama
window.ejecutarAlgoritmoDesdeNodo = function() {    const event = new CustomEvent('ejecutar-algoritmo-nodo');
    document.dispatchEvent(event);
};

// Hacer disponible globalmente
window.VentanaGestion = VentanaGestion;
