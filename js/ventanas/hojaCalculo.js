/**
 * Gestión de la ventana de hoja de cálculo
 * Maneja proyecciones financieras, tablas de datos y gráficos interactivos
 */

class VentanaHojaCalculo {
    constructor(storageManager, indexedDBManager, notificaciones) {
        this.storageManager = storageManager;
        this.indexedDB = indexedDBManager;
        this.notificaciones = notificaciones;
        
        this.ingresos = [];
        this.gastos = [];
        this.proyecciones = [];
        this.graficos = {};
        
        this.periodoProyeccion = 12; // meses por defecto
        this.fechaInicio = new Date();
        this.monedaLocal = 'USD';
        
        this.inicializar();
    }

    async inicializar() {
        await this.cargarDatos();
        this.configurarEventos();
        this.inicializarVistas();
        this.generarProyeccionInicial();
    }

    async cargarDatos() {
        try {
            this.ingresos = await this.indexedDB.obtenerTodos('ingresos');
            this.gastos = await this.indexedDB.obtenerTodos('gastos');
            this.proyecciones = await this.indexedDB.obtenerTodos('proyecciones') || [];
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.notificaciones.mostrar('Error al cargar los datos', 'error');
        }
    }

    configurarEventos() {
        // Controles de periodo de proyección
        document.getElementById('periodo-proyeccion')?.addEventListener('change', (e) => {
            this.periodoProyeccion = parseInt(e.target.value);
            this.regenerarProyecciones();
        });

        document.getElementById('fecha-inicio-proyeccion')?.addEventListener('change', (e) => {
            this.fechaInicio = new Date(e.target.value);
            this.regenerarProyecciones();
        });

        // Botones de acción
        document.getElementById('btn-generar-proyeccion')?.addEventListener('click', () => {
            this.generarNuevaProyeccion();
        });

        document.getElementById('btn-exportar-hoja')?.addEventListener('click', () => {
            this.exportarHojaCalculo();
        });

        document.getElementById('btn-guardar-proyeccion')?.addEventListener('click', () => {
            this.guardarProyeccion();
        });

        // Pestañas de vista
        document.querySelectorAll('.tab-hoja-calculo').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const vista = e.target.dataset.vista;
                this.cambiarVista(vista);
            });
        });

        // Filtros y configuración
        document.getElementById('filtro-datos')?.addEventListener('change', (e) => {
            this.aplicarFiltros(e.target.value);
        });

        document.getElementById('tipo-grafico')?.addEventListener('change', (e) => {
            this.cambiarTipoGrafico(e.target.value);
        });

        // Eventos personalizados
        document.addEventListener('datos-actualizados', () => {
            this.actualizarTodosLosDatos();
        });
    }

    inicializarVistas() {
        // Configurar vista inicial
        this.cambiarVista('tabla');
        
        // Configurar controles con valores por defecto
        const periodoSelect = document.getElementById('periodo-proyeccion');
        if (periodoSelect) {
            periodoSelect.value = this.periodoProyeccion;
        }

        const fechaInput = document.getElementById('fecha-inicio-proyeccion');
        if (fechaInput) {
            fechaInput.value = this.fechaInicio.toISOString().slice(0, 10);
        }
    }

    cambiarVista(vista) {
        // Actualizar pestañas activas
        document.querySelectorAll('.tab-hoja-calculo').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-vista="${vista}"]`)?.classList.add('active');

        // Mostrar/ocultar contenido
        document.querySelectorAll('.vista-hoja-calculo').forEach(contenido => {
            contenido.style.display = 'none';
        });
        
        const vistaElemento = document.getElementById(`vista-${vista}`);
        if (vistaElemento) {
            vistaElemento.style.display = 'block';
        }

        // Renderizar contenido específico
        switch (vista) {
            case 'tabla':
                this.renderizarTablaProyecciones();
                break;
            case 'graficos':
                this.renderizarGraficos();
                break;
            case 'resumen':
                this.renderizarResumen();
                break;
            case 'comparacion':
                this.renderizarComparacion();
                break;
        }
    }

    async generarNuevaProyeccion() {
        try {
            this.notificaciones.mostrar('Generando proyección financiera...', 'info');
            
            const proyeccion = await this.calcularProyeccion();
            this.proyecciones.push(proyeccion);
            
            await this.guardarProyeccion(proyeccion);
            this.actualizarVistas();
            
            this.notificaciones.mostrar('Proyección generada correctamente', 'success');
        } catch (error) {
            console.error('Error al generar proyección:', error);
            this.notificaciones.mostrar('Error al generar la proyección', 'error');
        }
    }

    async generarProyeccionInicial() {
        if (this.proyecciones.length === 0) {
            await this.generarNuevaProyeccion();
        } else {
            this.actualizarVistas();
        }
    }

    async calcularProyeccion() {
        const proyeccion = {
            id: `proyeccion_${Date.now()}`,
            nombre: `Proyección ${new Date().toLocaleDateString()}`,
            fechaCreacion: new Date().toISOString(),
            fechaInicio: this.fechaInicio.toISOString(),
            periodoMeses: this.periodoProyeccion,
            datos: []
        };

        // Generar datos para cada mes
        for (let mes = 0; mes < this.periodoProyeccion; mes++) {
            const fechaMes = new Date(this.fechaInicio);
            fechaMes.setMonth(fechaMes.getMonth() + mes);
            
            const datosMes = await this.calcularDatosMes(fechaMes);
            proyeccion.datos.push(datosMes);
        }

        // Calcular totales y métricas
        proyeccion.resumen = this.calcularResumenProyeccion(proyeccion.datos);
        
        return proyeccion;
    }

    async calcularDatosMes(fecha) {
        const mes = fecha.getMonth();
        const año = fecha.getFullYear();
        
        // Calcular ingresos del mes
        const ingresosDelMes = this.calcularIngresosDelMes(fecha);
        
        // Calcular gastos del mes
        const gastosDelMes = this.calcularGastosDelMes(fecha);
        
        // Calcular balance
        const totalIngresos = ingresosDelMes.reduce((sum, i) => sum + i.monto, 0);
        const totalGastos = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);
        const balance = totalIngresos - totalGastos;
        
        return {
            fecha: fecha.toISOString(),
            mes: mes + 1,
            año: año,
            ingresos: ingresosDelMes,
            gastos: gastosDelMes,
            totalIngresos: totalIngresos,
            totalGastos: totalGastos,
            balance: balance,
            balanceAcumulado: 0 // Se calculará después
        };
    }

    calcularIngresosDelMes(fecha) {
        return this.ingresos.filter(ingreso => {
            if (ingreso.recurrente) {
                // Para ingresos recurrentes, verificar si aplica en este mes
                const fechaIngreso = new Date(ingreso.fecha);
                return fechaIngreso <= fecha;
            } else {
                // Para ingresos únicos, verificar si corresponde exactamente a este mes
                const fechaIngreso = new Date(ingreso.fecha);
                return fechaIngreso.getMonth() === fecha.getMonth() && 
                       fechaIngreso.getFullYear() === fecha.getFullYear();
            }
        }).map(ingreso => ({
            ...ingreso,
            monto: ingreso.recurrente ? this.calcularMontoRecurrente(ingreso, fecha) : ingreso.monto
        }));
    }

    calcularGastosDelMes(fecha) {
        return this.gastos.filter(gasto => {
            const fechaVencimiento = new Date(gasto.fechaVencimiento);
            return fechaVencimiento.getMonth() === fecha.getMonth() && 
                   fechaVencimiento.getFullYear() === fecha.getFullYear();
        });
    }

    calcularMontoRecurrente(ingreso, fecha) {
        // Aplicar variaciones o crecimiento si está configurado
        const mesesDesdeInicio = this.calcularMesesEntre(new Date(ingreso.fecha), fecha);
        const tasaCrecimiento = ingreso.tasaCrecimiento || 0;
        
        return ingreso.monto * Math.pow(1 + tasaCrecimiento / 100, mesesDesdeInicio);
    }

    calcularMesesEntre(fechaInicio, fechaFin) {
        return (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + 
               (fechaFin.getMonth() - fechaInicio.getMonth());
    }

    calcularResumenProyeccion(datos) {
        let balanceAcumulado = 0;
        
        // Calcular balance acumulado para cada mes
        datos.forEach(mes => {
            balanceAcumulado += mes.balance;
            mes.balanceAcumulado = balanceAcumulado;
        });

        const totalIngresos = datos.reduce((sum, mes) => sum + mes.totalIngresos, 0);
        const totalGastos = datos.reduce((sum, mes) => sum + mes.totalGastos, 0);
        const balanceFinal = totalIngresos - totalGastos;

        const promedioIngresosmensuales = totalIngresos / datos.length;
        const promedioGastosMensuales = totalGastos / datos.length;

        // Identificar mejores y peores meses
        const mejorMes = datos.reduce((mejor, mes) => 
            mes.balance > mejor.balance ? mes : mejor, datos[0]);
        const peorMes = datos.reduce((peor, mes) => 
            mes.balance < peor.balance ? mes : peor, datos[0]);

        return {
            totalIngresos,
            totalGastos,
            balanceFinal,
            promedioIngresosMensuales: promedioIngresosmensuales,
            promedioGastosMensuales: promedioGastosMensuales,
            mejorMes: {
                fecha: mejorMes.fecha,
                balance: mejorMes.balance
            },
            peorMes: {
                fecha: peorMes.fecha,
                balance: peorMes.balance
            },
            tendencia: this.calcularTendencia(datos),
            riesgo: this.evaluarRiesgo(datos)
        };
    }

    calcularTendencia(datos) {
        // Calcular tendencia usando regresión lineal simple
        const n = datos.length;
        let sumaX = 0, sumaY = 0, sumaXY = 0, sumaX2 = 0;

        datos.forEach((mes, index) => {
            const x = index;
            const y = mes.balance;
            
            sumaX += x;
            sumaY += y;
            sumaXY += x * y;
            sumaX2 += x * x;
        });

        const pendiente = (n * sumaXY - sumaX * sumaY) / (n * sumaX2 - sumaX * sumaX);
        
        return {
            direccion: pendiente > 0 ? 'positiva' : 'negativa',
            magnitud: Math.abs(pendiente),
            confianza: this.calcularConfianzaTendencia(datos, pendiente)
        };
    }

    calcularConfianzaTendencia(datos, pendiente) {
        // Simplificado: basado en consistencia de la tendencia
        let consistente = 0;
        
        for (let i = 1; i < datos.length; i++) {
            const cambio = datos[i].balance - datos[i-1].balance;
            if ((pendiente > 0 && cambio > 0) || (pendiente < 0 && cambio < 0)) {
                consistente++;
            }
        }
        
        return (consistente / (datos.length - 1)) * 100;
    }

    evaluarRiesgo(datos) {
        const balances = datos.map(mes => mes.balance);
        const mesesNegativos = balances.filter(b => b < 0).length;
        const porcentajeRiesgo = (mesesNegativos / datos.length) * 100;
        
        let nivelRiesgo = 'bajo';
        if (porcentajeRiesgo > 50) nivelRiesgo = 'alto';
        else if (porcentajeRiesgo > 25) nivelRiesgo = 'medio';
        
        return {
            nivel: nivelRiesgo,
            porcentaje: porcentajeRiesgo,
            mesesNegativs: mesesNegativos,
            recomendaciones: this.generarRecomendaciones(nivelRiesgo, datos)
        };
    }

    generarRecomendaciones(nivelRiesgo, datos) {
        const recomendaciones = [];
        
        if (nivelRiesgo === 'alto') {
            recomendaciones.push('Considere reducir gastos no esenciales');
            recomendaciones.push('Busque fuentes adicionales de ingresos');
            recomendaciones.push('Revise y reprioritice sus gastos');
        } else if (nivelRiesgo === 'medio') {
            recomendaciones.push('Mantenga un fondo de emergencia');
            recomendaciones.push('Revise periódicamente sus gastos');
        } else {
            recomendaciones.push('Considere opciones de inversión para sus excedentes');
            recomendaciones.push('Mantenga sus buenos hábitos financieros');
        }
        
        return recomendaciones;
    }

    renderizarTablaProyecciones() {
        const contenedor = document.getElementById('tabla-proyecciones');
        if (!contenedor || this.proyecciones.length === 0) return;

        const proyeccionActual = this.proyecciones[this.proyecciones.length - 1];
        
        const tabla = document.createElement('table');
        tabla.className = 'table table-striped table-hover';
        
        tabla.innerHTML = `
            <thead class="table-dark">
                <tr>
                    <th>Mes</th>
                    <th>Ingresos</th>
                    <th>Gastos</th>
                    <th>Balance</th>
                    <th>Balance Acumulado</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${proyeccionActual.datos.map(mes => this.crearFilaMes(mes)).join('')}
            </tbody>
            <tfoot class="table-secondary">
                <tr>
                    <th>TOTAL</th>
                    <th>$${proyeccionActual.resumen.totalIngresos.toLocaleString()}</th>
                    <th>$${proyeccionActual.resumen.totalGastos.toLocaleString()}</th>
                    <th>$${proyeccionActual.resumen.balanceFinal.toLocaleString()}</th>
                    <th>-</th>
                    <th>${proyeccionActual.resumen.balanceFinal >= 0 ? 'Positivo' : 'Negativo'}</th>
                </tr>
            </tfoot>
        `;

        contenedor.innerHTML = '';
        contenedor.appendChild(tabla);

        // Agregar controles adicionales
        this.agregarControlesTabla(contenedor);
    }

    crearFilaMes(mes) {
        const fecha = new Date(mes.fecha);
        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const estado = mes.balance >= 0 ? 'positivo' : 'negativo';
        
        return `
            <tr class="mes-${estado}" data-mes="${mes.mes}" data-año="${mes.año}">
                <td class="nombre-mes">${nombreMes}</td>
                <td class="ingresos">
                    <span class="monto">$${mes.totalIngresos.toLocaleString()}</span>
                    <small class="count">(${mes.ingresos.length})</small>
                </td>
                <td class="gastos">
                    <span class="monto">$${mes.totalGastos.toLocaleString()}</span>
                    <small class="count">(${mes.gastos.length})</small>
                </td>
                <td class="balance ${estado}">
                    <strong>$${mes.balance.toLocaleString()}</strong>
                </td>
                <td class="balance-acumulado ${mes.balanceAcumulado >= 0 ? 'positivo' : 'negativo'}">
                    $${mes.balanceAcumulado.toLocaleString()}
                </td>
                <td class="estado">
                    <span class="badge ${estado}">${estado === 'positivo' ? 'Superávit' : 'Déficit'}</span>
                </td>
            </tr>
        `;
    }

    agregarControlesTabla(contenedor) {
        const controles = document.createElement('div');
        controles.className = 'controles-tabla mt-3';
        controles.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <button class="btn btn-info btn-sm" onclick="expandirDetallesMeses()">
                        Ver Detalles por Mes
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="exportarTablaCSV()">
                        Exportar CSV
                    </button>
                </div>
                <div class="col-md-6 text-end">
                    <small class="text-muted">
                        Proyección generada: ${new Date().toLocaleString()}
                    </small>
                </div>
            </div>
        `;
        
        contenedor.appendChild(controles);
    }

    renderizarGraficos() {
        this.crearGraficoBalance();
        this.crearGraficoIngresosVsGastos();
        this.crearGraficoTendencia();
        this.crearGraficoPorPrioridad();
    }

    crearGraficoBalance() {
        const ctx = document.getElementById('grafico-balance')?.getContext('2d');
        if (!ctx || this.proyecciones.length === 0) return;

        const proyeccion = this.proyecciones[this.proyecciones.length - 1];
        
        // Destruir gráfico existente si existe
        if (this.graficos.balance) {
            this.graficos.balance.destroy();
        }

        this.graficos.balance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: proyeccion.datos.map(mes => {
                    const fecha = new Date(mes.fecha);
                    return fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
                }),
                datasets: [{
                    label: 'Balance Mensual',
                    data: proyeccion.datos.map(mes => mes.balance),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }, {
                    label: 'Balance Acumulado',
                    data: proyeccion.datos.map(mes => mes.balanceAcumulado),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución del Balance'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    crearGraficoIngresosVsGastos() {
        const ctx = document.getElementById('grafico-ingresos-gastos')?.getContext('2d');
        if (!ctx || this.proyecciones.length === 0) return;

        const proyeccion = this.proyecciones[this.proyecciones.length - 1];

        if (this.graficos.ingresosGastos) {
            this.graficos.ingresosGastos.destroy();
        }

        this.graficos.ingresosGastos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: proyeccion.datos.map(mes => {
                    const fecha = new Date(mes.fecha);
                    return fecha.toLocaleDateString('es-ES', { month: 'short' });
                }),
                datasets: [{
                    label: 'Ingresos',
                    data: proyeccion.datos.map(mes => mes.totalIngresos),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }, {
                    label: 'Gastos',
                    data: proyeccion.datos.map(mes => mes.totalGastos),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ingresos vs Gastos por Mes'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    crearGraficoTendencia() {
        const ctx = document.getElementById('grafico-tendencia')?.getContext('2d');
        if (!ctx || this.proyecciones.length === 0) return;

        const proyeccion = this.proyecciones[this.proyecciones.length - 1];

        if (this.graficos.tendencia) {
            this.graficos.tendencia.destroy();
        }

        // Calcular línea de tendencia
        const datos = proyeccion.datos.map((mes, index) => ({ x: index, y: mes.balance }));
        const lineaTendencia = this.calcularLineaTendencia(datos);

        this.graficos.tendencia = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Balance Real',
                    data: datos,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgb(54, 162, 235)'
                }, {
                    label: 'Tendencia',
                    data: lineaTendencia,
                    type: 'line',
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    tension: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Tendencia'
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Mes'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Balance ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    calcularLineaTendencia(datos) {
        const n = datos.length;
        let sumaX = 0, sumaY = 0, sumaXY = 0, sumaX2 = 0;

        datos.forEach(punto => {
            sumaX += punto.x;
            sumaY += punto.y;
            sumaXY += punto.x * punto.y;
            sumaX2 += punto.x * punto.x;
        });

        const pendiente = (n * sumaXY - sumaX * sumaY) / (n * sumaX2 - sumaX * sumaX);
        const intercepto = (sumaY - pendiente * sumaX) / n;

        return datos.map(punto => ({
            x: punto.x,
            y: pendiente * punto.x + intercepto
        }));
    }

    crearGraficoPorPrioridad() {
        const ctx = document.getElementById('grafico-prioridad')?.getContext('2d');
        if (!ctx || this.gastos.length === 0) return;

        if (this.graficos.prioridad) {
            this.graficos.prioridad.destroy();
        }

        // Agrupar gastos por prioridad
        const gastosPorPrioridad = this.gastos.reduce((acc, gasto) => {
            acc[gasto.prioridad] = (acc[gasto.prioridad] || 0) + gasto.monto;
            return acc;
        }, {});

        this.graficos.prioridad = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(gastosPorPrioridad).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                datasets: [{
                    data: Object.values(gastosPorPrioridad),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',   // Alta
                        'rgba(255, 205, 86, 0.8)',   // Media
                        'rgba(75, 192, 192, 0.8)'    // Baja
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Gastos por Prioridad'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderizarResumen() {
        const contenedor = document.getElementById('resumen-proyeccion');
        if (!contenedor || this.proyecciones.length === 0) return;

        const proyeccion = this.proyecciones[this.proyecciones.length - 1];
        const resumen = proyeccion.resumen;

        contenedor.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card resumen-card">
                        <div class="card-header">
                            <h5>Resumen Financiero</h5>
                        </div>
                        <div class="card-body">
                            <div class="resumen-item">
                                <span class="label">Total Ingresos:</span>
                                <span class="valor ingreso">$${resumen.totalIngresos.toLocaleString()}</span>
                            </div>
                            <div class="resumen-item">
                                <span class="label">Total Gastos:</span>
                                <span class="valor gasto">$${resumen.totalGastos.toLocaleString()}</span>
                            </div>
                            <div class="resumen-item balance-final">
                                <span class="label">Balance Final:</span>
                                <span class="valor ${resumen.balanceFinal >= 0 ? 'positivo' : 'negativo'}">
                                    $${resumen.balanceFinal.toLocaleString()}
                                </span>
                            </div>
                            <hr>
                            <div class="resumen-item">
                                <span class="label">Promedio Ingresos/Mes:</span>
                                <span class="valor">$${resumen.promedioIngresosMensuales.toLocaleString()}</span>
                            </div>
                            <div class="resumen-item">
                                <span class="label">Promedio Gastos/Mes:</span>
                                <span class="valor">$${resumen.promedioGastosMensuales.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card tendencia-card">
                        <div class="card-header">
                            <h5>Análisis de Tendencia</h5>
                        </div>
                        <div class="card-body">
                            <div class="tendencia-info">
                                <div class="tendencia-direccion ${resumen.tendencia.direccion}">
                                    <i class="fas fa-arrow-${resumen.tendencia.direccion === 'positiva' ? 'up' : 'down'}"></i>
                                    Tendencia ${resumen.tendencia.direccion}
                                </div>
                                <div class="tendencia-confianza">
                                    Confianza: ${resumen.tendencia.confianza.toFixed(1)}%
                                </div>
                            </div>
                            
                            <div class="mejores-peores">
                                <div class="mejor-mes">
                                    <strong>Mejor mes:</strong>
                                    ${new Date(resumen.mejorMes.fecha).toLocaleDateString('es-ES', { month: 'long' })}
                                    ($${resumen.mejorMes.balance.toLocaleString()})
                                </div>
                                <div class="peor-mes">
                                    <strong>Peor mes:</strong>
                                    ${new Date(resumen.peorMes.fecha).toLocaleDateString('es-ES', { month: 'long' })}
                                    ($${resumen.peorMes.balance.toLocaleString()})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card riesgo-card">
                        <div class="card-header">
                            <h5>Evaluación de Riesgo</h5>
                        </div>
                        <div class="card-body">
                            <div class="riesgo-nivel nivel-${resumen.riesgo.nivel}">
                                Nivel de Riesgo: <strong>${resumen.riesgo.nivel.toUpperCase()}</strong>
                                (${resumen.riesgo.porcentaje.toFixed(1)}% de meses con balance negativo)
                            </div>
                            
                            <div class="recomendaciones mt-3">
                                <h6>Recomendaciones:</h6>
                                <ul>
                                    ${resumen.riesgo.recomendaciones.map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderizarComparacion() {
        const contenedor = document.getElementById('comparacion-proyecciones');
        if (!contenedor) return;

        if (this.proyecciones.length < 2) {
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    <h5>Comparación de Proyecciones</h5>
                    <p>Necesitas al menos 2 proyecciones para realizar comparaciones.</p>
                    <button class="btn btn-primary" onclick="generarNuevaProyeccion()">
                        Generar Nueva Proyección
                    </button>
                </div>
            `;
            return;
        }

        // Mostrar tabla comparativa de las últimas proyecciones
        this.crearTablaComparacion(contenedor);
    }

    crearTablaComparacion(contenedor) {
        const ultimasProyecciones = this.proyecciones.slice(-3); // Últimas 3 proyecciones
        
        const tabla = document.createElement('table');
        tabla.className = 'table table-bordered';
        
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Métrica</th>
                    ${ultimasProyecciones.map((p, i) => `
                        <th>Proyección ${i + 1}
                            <br><small>${new Date(p.fechaCreacion).toLocaleDateString()}</small>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Total Ingresos</strong></td>
                    ${ultimasProyecciones.map(p => `<td>$${p.resumen.totalIngresos.toLocaleString()}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Total Gastos</strong></td>
                    ${ultimasProyecciones.map(p => `<td>$${p.resumen.totalGastos.toLocaleString()}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Balance Final</strong></td>
                    ${ultimasProyecciones.map(p => `
                        <td class="${p.resumen.balanceFinal >= 0 ? 'text-success' : 'text-danger'}">
                            $${p.resumen.balanceFinal.toLocaleString()}
                        </td>
                    `).join('')}
                </tr>
                <tr>
                    <td><strong>Nivel de Riesgo</strong></td>
                    ${ultimasProyecciones.map(p => `
                        <td class="riesgo-${p.resumen.riesgo.nivel}">
                            ${p.resumen.riesgo.nivel.toUpperCase()}
                        </td>
                    `).join('')}
                </tr>
                <tr>
                    <td><strong>Tendencia</strong></td>
                    ${ultimasProyecciones.map(p => `
                        <td class="${p.resumen.tendencia.direccion}">
                            ${p.resumen.tendencia.direccion} 
                            (${p.resumen.tendencia.confianza.toFixed(1)}%)
                        </td>
                    `).join('')}
                </tr>
            </tbody>
        `;
        
        contenedor.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>Comparación de Proyecciones</h5>
                </div>
                <div class="card-body">
                    ${tabla.outerHTML}
                </div>
            </div>
        `;
    }

    async guardarProyeccion(proyeccion = null) {
        try {
            if (proyeccion) {
                await this.indexedDB.guardar('proyecciones', proyeccion);
            } else {
                // Guardar todas las proyecciones
                for (let proj of this.proyecciones) {
                    await this.indexedDB.guardar('proyecciones', proj);
                }
            }
            this.notificaciones.mostrar('Proyección guardada correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar proyección:', error);
            this.notificaciones.mostrar('Error al guardar la proyección', 'error');
        }
    }

    exportarHojaCalculo() {
        const proyeccion = this.proyecciones[this.proyecciones.length - 1];
        if (!proyeccion) return;

        // Crear datos para exportar
        const datosExport = {
            proyeccion: proyeccion,
            metadatos: {
                fechaExportacion: new Date().toISOString(),
                version: '1.0',
                periodo: this.periodoProyeccion + ' meses'
            }
        };

        // Exportar como JSON
        const blob = new Blob([JSON.stringify(datosExport, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `proyeccion_financiera_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.notificaciones.mostrar('Hoja de cálculo exportada', 'success');
    }

    regenerarProyecciones() {
        this.notificaciones.mostrar('Regenerando proyecciones...', 'info');
        this.generarNuevaProyeccion();
    }

    aplicarFiltros(filtro) {
        // Implementar filtros para las vistas
        console.log('Aplicando filtro:', filtro);
    }

    cambiarTipoGrafico(tipo) {
        // Implementar cambio de tipo de gráfico
        console.log('Cambiando tipo de gráfico:', tipo);
    }

    async actualizarTodosLosDatos() {
        await this.cargarDatos();
        this.actualizarVistas();
    }

    actualizarVistas() {
        // Re-renderizar todas las vistas
        this.renderizarTablaProyecciones();
        this.renderizarGraficos();
        this.renderizarResumen();
        this.renderizarComparacion();
    }
}

// Funciones globales para eventos desde HTML
window.expandirDetallesMeses = function() {
    console.log('Expandir detalles de meses');
    // TODO: Implementar vista expandida de detalles por mes
};

window.exportarTablaCSV = function() {
    console.log('Exportar tabla a CSV');
    // TODO: Implementar exportación de tabla a CSV
};

window.generarNuevaProyeccion = function() {
    const event = new CustomEvent('generar-proyeccion');
    document.dispatchEvent(event);
};

export default VentanaHojaCalculo;
