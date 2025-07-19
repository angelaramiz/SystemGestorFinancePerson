/**
 * Módulo de consultas y análisis
 * Maneja la pestaña de consultas, tablas y gráficos
 */

class ModuloConsultas {
    constructor(storageManager) {
        this.storage = storageManager;
        this.chart = null;
        this.currentData = {
            ingresos: [],
            gastos: []
        };
        
        this.init();
    }

    async init() {
        this.configurarEventos();
        await this.cargarDatosIniciales();
    }

    async cargarDatosIniciales() {
        try {
            // Cargar datos del último mes por defecto
            const hoy = new Date();
            const hace30Dias = new Date(hoy);
            hace30Dias.setDate(hoy.getDate() - 30);
            
            await this.ejecutarConsulta(
                hace30Dias.toISOString().split('T')[0],
                hoy.toISOString().split('T')[0],
                'resumen'
            );
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
        }
    }

    configurarEventos() {
        // Establecer fechas por defecto
        const hoy = new Date().toISOString().split('T')[0];
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        const fechaDesde = document.getElementById('fecha-desde');
        const fechaHasta = document.getElementById('fecha-hasta');
        
        if (fechaDesde) fechaDesde.value = hace30Dias.toISOString().split('T')[0];
        if (fechaHasta) fechaHasta.value = hoy;

        // Botón aplicar filtros
        const aplicarBtn = document.getElementById('aplicar-filtros-btn');
        if (aplicarBtn) {
            aplicarBtn.addEventListener('click', async () => {
                const desde = document.getElementById('fecha-desde')?.value;
                const hasta = document.getElementById('fecha-hasta')?.value;
                const tipo = document.getElementById('tipo-consulta')?.value || 'resumen';
                
                // Validar que se hayan seleccionado fechas válidas
                if (!desde || !hasta) {
                    await window.Alertas.advertencia('Fechas requeridas', 'Por favor, selecciona las fechas de inicio y fin');
                    return;
                }
                
                if (new Date(desde) > new Date(hasta)) {
                    await window.Alertas.advertencia('Fechas inválidas', 'La fecha de inicio no puede ser posterior a la fecha de fin');
                    return;
                }
                
                await this.ejecutarConsulta(desde, hasta, tipo);
            });
        }

        // Botón refrescar
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.cargarDatosIniciales();
            });
        }

        // Botón exportar
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportarDatos();
            });
        }
    }

    async ejecutarConsulta(fechaDesde, fechaHasta, tipoConsulta) {
        try {
            console.log(`🔍 Ejecutando consulta: ${tipoConsulta} del ${fechaDesde} al ${fechaHasta}`);
            
            // Mostrar loading
            this.mostrarLoading(true);
            
            // Obtener datos filtrados
            const filtros = {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
            };
            
            let ingresos = [];
            let gastos = [];
            
            switch (tipoConsulta) {
                case 'ingresos':
                    ingresos = await this.storage.getIngresos(filtros);
                    break;
                case 'gastos':
                    gastos = await this.storage.getGastos(filtros);
                    break;
                default: // 'resumen' o 'comparacion'
                    ingresos = await this.storage.getIngresos(filtros);
                    gastos = await this.storage.getGastos(filtros);
            }
            
            // Almacenar datos actuales
            this.currentData = { ingresos, gastos };
            
            // Actualizar interfaz
            this.actualizarResumen(ingresos, gastos);
            this.actualizarGrafico(ingresos, gastos, tipoConsulta);
            this.actualizarTabla(ingresos, gastos, tipoConsulta);
            
            this.mostrarLoading(false);
            
        } catch (error) {
            console.error('Error en consulta:', error);
            this.mostrarLoading(false);
            await window.Alertas.error('Error en la consulta', 'No se pudo ejecutar la consulta');
        }
    }

    actualizarResumen(ingresos, gastos) {
        const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
        const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        const balance = totalIngresos - totalGastos;
        
        // Actualizar elementos del DOM
        const totalIngresosEl = document.getElementById('total-ingresos');
        const totalGastosEl = document.getElementById('total-gastos');
        const balanceEl = document.getElementById('balance-total');
        
        if (totalIngresosEl) totalIngresosEl.textContent = `$${totalIngresos.toFixed(2)} MXN`;
        if (totalGastosEl) totalGastosEl.textContent = `$${totalGastos.toFixed(2)} MXN`;
        
        if (balanceEl) {
            balanceEl.textContent = `$${balance.toFixed(2)} MXN`;
            balanceEl.className = `amount ${balance >= 0 ? 'positive' : 'negative'}`;
        }
    }

    actualizarGrafico(ingresos, gastos, tipoConsulta) {
        const ctx = document.getElementById('main-chart');
        if (!ctx) return;

        // Destruir gráfico anterior si existe
        if (this.chart) {
            this.chart.destroy();
        }

        let chartData;
        let chartOptions;

        switch (tipoConsulta) {
            case 'ingresos':
                chartData = this.prepararDatosIngresos(ingresos);
                break;
            case 'gastos':
                chartData = this.prepararDatosGastos(gastos);
                break;
            default:
                chartData = this.prepararDatosComparacion(ingresos, gastos);
        }

        chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: this.getTituloGrafico(tipoConsulta)
                },
                legend: {
                    position: 'top'
                }
            }
        };

        this.chart = new Chart(ctx, {
            type: this.getTipoGrafico(tipoConsulta),
            data: chartData,
            options: chartOptions
        });
    }

    prepararDatosIngresos(ingresos) {
        const tiposIngresos = {};
        ingresos.forEach(ingreso => {
            const tipo = ingreso.tipo || 'otros';
            tiposIngresos[tipo] = (tiposIngresos[tipo] || 0) + parseFloat(ingreso.monto);
        });

        return {
            labels: Object.keys(tiposIngresos).map(t => this.formatTipo(t)),
            datasets: [{
                label: 'Ingresos por Tipo',
                data: Object.values(tiposIngresos),
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#8b5cf6',
                    '#f59e0b'
                ]
            }]
        };
    }

    prepararDatosGastos(gastos) {
        const tiposGastos = {};
        gastos.forEach(gasto => {
            const tipo = gasto.tipo || 'otros';
            tiposGastos[tipo] = (tiposGastos[tipo] || 0) + parseFloat(gasto.monto);
        });

        return {
            labels: Object.keys(tiposGastos).map(t => this.formatTipo(t)),
            datasets: [{
                label: 'Gastos por Tipo',
                data: Object.values(tiposGastos),
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#3b82f6',
                    '#6b7280'
                ]
            }]
        };
    }

    prepararDatosComparacion(ingresos, gastos) {
        const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
        const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

        return {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                label: 'Comparación Ingresos vs Gastos',
                data: [totalIngresos, totalGastos],
                backgroundColor: ['#10b981', '#ef4444']
            }]
        };
    }

    getTipoGrafico(tipoConsulta) {
        switch (tipoConsulta) {
            case 'comparacion':
                return 'bar';
            default:
                return 'doughnut';
        }
    }

    getTituloGrafico(tipoConsulta) {
        const titulos = {
            'ingresos': 'Distribución de Ingresos por Tipo',
            'gastos': 'Distribución de Gastos por Tipo',
            'comparacion': 'Comparación Ingresos vs Gastos',
            'resumen': 'Resumen Financiero'
        };
        return titulos[tipoConsulta] || 'Análisis Financiero';
    }

    actualizarTabla(ingresos, gastos, tipoConsulta) {
        const tbody = document.querySelector('#data-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        let datos = [];
        
        switch (tipoConsulta) {
            case 'ingresos':
                datos = ingresos.map(i => ({...i, tipoTransaccion: 'ingreso'}));
                break;
            case 'gastos':
                datos = gastos.map(g => ({...g, tipoTransaccion: 'gasto'}));
                break;
            default:
                datos = [
                    ...ingresos.map(i => ({...i, tipoTransaccion: 'ingreso'})),
                    ...gastos.map(g => ({...g, tipoTransaccion: 'gasto'}))
                ];
        }

        // Ordenar por fecha
        datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        datos.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatFecha(item.fecha)}</td>
                <td>
                    <span class="badge badge-${item.tipoTransaccion}">
                        ${item.tipoTransaccion === 'ingreso' ? '📈' : '💸'} 
                        ${this.formatTipo(item.tipo)}
                    </span>
                </td>
                <td>${item.descripcion}</td>
                <td>${item.categoria || item.categoria_custom || 'Sin categoría'}</td>
                <td>
                    <span class="amount ${item.tipoTransaccion === 'ingreso' ? 'positive' : 'negative'}">
                        $${parseFloat(item.monto).toFixed(2)} MXN
                    </span>
                </td>
                <td>
                    <button onclick="window.ModuloConsultas?.verDetalle('${item.tipoTransaccion || 'ingreso'}', '${item.id || ''}')" 
                            class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                        👁️ Ver
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    formatTipo(tipo) {
        const tipos = {
            // Ingresos
            'nominal': 'Nominal',
            'recurrente': 'Recurrente',
            'repentino': 'Repentino',
            // Gastos
            'futuro': 'Futuro',
            'imprevisto': 'Imprevisto'
        };
        return tipos[tipo] || tipo;
    }

    formatFecha(fecha) {
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES');
    }

    async verDetalle(tipoTransaccion, id) {
        try {
            if (!tipoTransaccion || !id) {
                console.warn('⚠️ Parámetros inválidos para verDetalle:', { tipoTransaccion, id });
                return;
            }

            if (!this.storage) {
                console.warn('⚠️ StorageManager no disponible');
                return;
            }

            // Buscar el item directamente en el storage para obtener datos frescos
            let item = null;
            
            if (tipoTransaccion === 'ingreso') {
                const ingresos = await this.storage.getIngresos();
                item = ingresos.find(i => i.id === id);
            } else {
                const gastos = await this.storage.getGastos();
                item = gastos.find(g => g.id === id);
            }
                
            if (item) {
                if (tipoTransaccion === 'ingreso' && window.CalendarioIngresos) {
                    window.CalendarioIngresos.mostrarDetallesIngreso(item);
                } else if (tipoTransaccion === 'gasto' && window.CalendarioGastos) {
                    window.CalendarioGastos.mostrarDetallesGasto(item);
                } else {
                    console.warn(`⚠️ Calendario no disponible para tipo: ${tipoTransaccion}`);
                }
            } else {
                console.warn(`⚠️ Item no encontrado: ${tipoTransaccion} con ID ${id}`);
            }
        } catch (error) {
            console.error('Error al mostrar detalle:', error);
        }
    }

    async exportarDatos() {
        try {
            const datosExport = await this.storage.exportData();
            const blob = new Blob([JSON.stringify(datosExport, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gestor-financiero-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Datos exportados correctamente');
        } catch (error) {
            console.error('Error al exportar datos:', error);
            await window.Alertas.error('Error al exportar', 'No se pudieron exportar los datos');
        }
    }

    mostrarLoading(mostrar) {
        const container = document.querySelector('.results-container');
        if (container) {
            if (mostrar) {
                container.classList.add('loading');
            } else {
                container.classList.remove('loading');
            }
        }
    }

    // Alias para compatibilidad
    async refresh() {
        // Ejecutar la consulta actual con los parámetros existentes
        const fechaDesde = document.getElementById('fecha-desde')?.value;
        const fechaHasta = document.getElementById('fecha-hasta')?.value;
        const tipoConsulta = document.getElementById('tipo-consulta')?.value || 'resumen';
        
        if (fechaDesde && fechaHasta) {
            await this.ejecutarConsulta(fechaDesde, fechaHasta, tipoConsulta);
        } else {
            // Usar fechas por defecto si no hay fechas especificadas
            const ahora = new Date();
            const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
            await this.ejecutarConsulta(
                unMesAtras.toISOString().split('T')[0],
                ahora.toISOString().split('T')[0],
                tipoConsulta
            );
        }
    }
}

// Crear instancia global (será inicializada por la aplicación principal)
window.ModuloConsultas = null;
