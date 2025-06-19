/**
 * Archivo principal del Sistema de Gestión Financiera Personal
 * Inicializa todos los componentes y coordina la funcionalidad general
 */

class SistemaGestorFinanciero {
    constructor() {
        this.version = '1.0.0';
        this.inicializado = false;
        this.componentes = {};
        this.estado = {
            cargando: true,
            errores: [],
            ultimaActividad: null
        };
        
        console.log(`🚀 Iniciando Sistema Gestor Financiero Personal v${this.version}`);
    }

    /**
     * Inicialización principal del sistema
     */
    async init() {
        try {
            console.log('📋 Iniciando componentes del sistema...');
            
            // 1. Verificar requisitos previos
            await this.verificarRequisitos();
            
            // 2. Inicializar almacenamiento
            await this.inicializarAlmacenamiento();
            
            // 3. Cargar configuración
            await this.cargarConfiguracion();
            
            // 4. Inicializar componentes principales
            await this.inicializarComponentes();
            
            // 5. Configurar eventos globales
            this.configurarEventosGlobales();
            
            // 6. Cargar datos iniciales
            await this.cargarDatosIniciales();
            
            // 7. Inicializar interfaz
            await this.inicializarInterfaz();
            
            // 8. Configurar notificaciones
            this.configurarNotificaciones();
            
            // 9. Configurar auto-guardado
            this.configurarAutoGuardado();
            
            this.inicializado = true;
            this.estado.cargando = false;
            
            console.log('✅ Sistema inicializado correctamente');
            this.mostrarMensajeBienvenida();
            
        } catch (error) {
            console.error('❌ Error durante la inicialización:', error);
            this.manejarErrorInicializacion(error);
        }
    }

    /**
     * Verificar que el navegador soporte las tecnologías requeridas
     */
    async verificarRequisitos() {
        const requisitos = {
            'localStorage': () => typeof Storage !== 'undefined',
            'IndexedDB': () => 'indexedDB' in window,
            'Fetch API': () => typeof fetch !== 'undefined',
            'Promises': () => typeof Promise !== 'undefined',
            'ES6 Classes': () => typeof class {} === 'function'
        };

        const fallos = [];
        
        for (const [nombre, verificacion] of Object.entries(requisitos)) {
            try {
                if (!verificacion()) {
                    fallos.push(nombre);
                }
            } catch (error) {
                fallos.push(nombre);
            }
        }

        if (fallos.length > 0) {
            throw new Error(`Requisitos no cumplidos: ${fallos.join(', ')}`);
        }

        console.log('✅ Verificación de requisitos completada');
    }

    /**
     * Inicializar sistemas de almacenamiento
     */
    async inicializarAlmacenamiento() {
        try {
            // Inicializar localStorage
            if (window.localStorageManager) {
                console.log('📁 Inicializando localStorage...');
                window.localStorageManager.init();
            }

            // Inicializar IndexedDB
            if (window.indexedDBManager) {
                console.log('🗄️ Inicializando IndexedDB...');
                await window.indexedDBManager.init();
                
                // Sincronizar con localStorage
                await window.indexedDBManager.syncWithLocalStorage();
            }

            console.log('✅ Almacenamiento inicializado');
        } catch (error) {
            console.error('❌ Error inicializando almacenamiento:', error);
            throw error;
        }
    }

    /**
     * Cargar configuración del sistema
     */
    async cargarConfiguracion() {
        try {
            // Cargar configuración desde localStorage
            if (window.localStorageManager) {
                const config = window.localStorageManager.get('configuracion');
                if (config) {
                    this.componentes.configuracion = config;
                    console.log('⚙️ Configuración cargada desde localStorage');
                } else {
                    console.log('⚙️ Usando configuración por defecto');
                }
            }

            // Aplicar configuración a los componentes
            this.aplicarConfiguracion();

        } catch (error) {
            console.warn('⚠️ Error cargando configuración, usando valores por defecto:', error);
        }
    }    /**
     * Inicializar componentes principales
     */
    async inicializarComponentes() {        try {
            // Inicializar componentes base
            const componentesBase = [
                { nombre: 'gestorNavegacion', verificar: () => window.gestorNavegacion },
                { nombre: 'gestorModales', verificar: () => window.gestorModales },                { nombre: 'algoritmoPriorizacion', verificar: () => window.algoritmoPriorizacion },
                { nombre: 'notificaciones', verificar: () => window.notificacionesManager },
                { nombre: 'configuracion', verificar: () => window.ConfiguracionManager }
            ];

            for (const componente of componentesBase) {
                try {
                    if (componente.verificar()) {
                        this.componentes[componente.nombre] = componente.verificar();
                        console.log(`✅ ${componente.nombre} disponible`);
                        
                        // Inicializar configuración si está disponible
                        if (componente.nombre === 'configuracion') {
                            await this.componentes.configuracion.inicializar();
                        }
                    } else {
                        console.warn(`⚠️ ${componente.nombre} no disponible`);
                    }
                } catch (error) {
                    console.error(`❌ Error verificando ${componente.nombre}:`, error);
                }
            }

            // Inicializar ventanas
            await this.inicializarVentanas();

        } catch (error) {
            console.error('❌ Error inicializando componentes:', error);
            throw error;
        }
    }

    /**
     * Inicializar las ventanas del sistema
     */
    async inicializarVentanas() {
        try {
            console.log('🪟 Inicializando ventanas del sistema...');

            // Verificar que las clases de ventanas estén disponibles
            if (typeof VentanaIngresos !== 'undefined') {
                this.componentes.ventanaIngresos = new VentanaIngresos(
                    window.localStorageManager,
                    window.indexedDBManager,
                    this.componentes.notificaciones
                );
                console.log('✅ Ventana de Ingresos inicializada');
            }

            if (typeof VentanaGastos !== 'undefined') {
                this.componentes.ventanaGastos = new VentanaGastos(
                    window.localStorageManager,
                    window.indexedDBManager,
                    this.componentes.notificaciones
                );
                console.log('✅ Ventana de Gastos inicializada');
            }

            if (typeof VentanaGestion !== 'undefined') {
                this.componentes.ventanaGestion = new VentanaGestion(
                    window.localStorageManager,
                    window.indexedDBManager,
                    this.componentes.notificaciones,
                    this.componentes.algoritmoPriorizacion
                );
                console.log('✅ Ventana de Gestión inicializada');
            }

            if (typeof VentanaHojaCalculo !== 'undefined') {
                this.componentes.ventanaHojaCalculo = new VentanaHojaCalculo(
                    window.localStorageManager,
                    window.indexedDBManager,
                    this.componentes.notificaciones
                );
                console.log('✅ Ventana de Hoja de Cálculo inicializada');
            }

            // Configurar eventos específicos de las ventanas
            this.configurarEventosVentanas();

        } catch (error) {
            console.error('❌ Error inicializando ventanas:', error);
            throw error;
        }
    }

    /**
     * Configurar eventos específicos de las ventanas
     */
    configurarEventosVentanas() {
        // Eventos de la ventana de gastos
        document.addEventListener('editar-gasto', async (event) => {
            const gastoId = event.detail.gastoId;
            if (this.componentes.gestorModales) {
                this.componentes.gestorModales.abrirModalEditarGasto(gastoId);
            }
        });

        document.addEventListener('eliminar-gasto', async (event) => {
            const gastoId = event.detail.gastoId;
            if (this.componentes.ventanaGastos) {
                await this.componentes.ventanaGastos.eliminarGasto(gastoId);
                this.actualizarTodasLasVentanas();
            }
        });

        document.addEventListener('marcar-pagado', async (event) => {
            const gastoId = event.detail.gastoId;
            if (this.componentes.ventanaGastos) {
                await this.componentes.ventanaGastos.marcarComoPagado(gastoId);
                this.actualizarTodasLasVentanas();
            }
        });

        // Eventos de la ventana de gestión
        document.addEventListener('ejecutar-algoritmo-nodo', async () => {
            if (this.componentes.ventanaGestion) {
                await this.componentes.ventanaGestion.ejecutarAlgoritmo();
            }
        });

        // Eventos de la ventana de hoja de cálculo
        document.addEventListener('generar-proyeccion', async () => {
            if (this.componentes.ventanaHojaCalculo) {
                await this.componentes.ventanaHojaCalculo.generarNuevaProyeccion();
            }
        });

        // Evento global para actualización de datos
        document.addEventListener('datos-actualizados', () => {
            this.actualizarTodasLasVentanas();
        });

        console.log('🔗 Eventos de ventanas configurados');
    }

    /**
     * Actualizar todas las ventanas con datos nuevos
     */
    async actualizarTodasLasVentanas() {
        try {
            const promesas = [];

            if (this.componentes.ventanaIngresos && this.componentes.ventanaIngresos.actualizarVista) {
                promesas.push(this.componentes.ventanaIngresos.actualizarVista());
            }

            if (this.componentes.ventanaGastos && this.componentes.ventanaGastos.actualizarVista) {
                promesas.push(this.componentes.ventanaGastos.actualizarVista());
            }

            if (this.componentes.ventanaGestion && this.componentes.ventanaGestion.actualizarDiagrama) {
                promesas.push(this.componentes.ventanaGestion.actualizarDiagrama());
            }

            if (this.componentes.ventanaHojaCalculo && this.componentes.ventanaHojaCalculo.actualizarTodosLosDatos) {
                promesas.push(this.componentes.ventanaHojaCalculo.actualizarTodosLosDatos());
            }

            await Promise.all(promesas);
            console.log('🔄 Todas las ventanas actualizadas');

        } catch (error) {
            console.error('❌ Error actualizando ventanas:', error);
        }
    }

    /**
     * Configurar eventos globales del sistema
     */
    configurarEventosGlobales() {
        // Event listener para cambios de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.manejarPausaAplicacion();
            } else {
                this.manejarReanudarAplicacion();
            }
        });

        // Event listener para errores globales
        window.addEventListener('error', (error) => {
            this.manejarErrorGlobal(error);
        });

        // Event listener para errores de promesas no capturadas
        window.addEventListener('unhandledrejection', (event) => {
            this.manejarErrorPromesa(event);
        });

        // Event listener para antes de cerrar la página
        window.addEventListener('beforeunload', (event) => {
            this.manejarCierrePagina(event);
        });

        // Event listener para cambios de tamaño de ventana
        window.addEventListener('resize', this.debounce(() => {
            this.manejarCambioTamano();
        }, 300));

        // Event listener para cambios de estado online/offline
        window.addEventListener('online', () => {
            this.manejarConexionOnline();
        });

        window.addEventListener('offline', () => {
            this.manejarConexionOffline();
        });

        console.log('🔗 Eventos globales configurados');
    }

    /**
     * Cargar datos iniciales necesarios
     */
    async cargarDatosIniciales() {
        try {
            if (window.indexedDBManager) {
                // Cargar ingresos
                const ingresos = await window.indexedDBManager.obtenerIngresos();
                console.log(`📈 ${ingresos.length} ingresos cargados`);

                // Cargar gastos
                const gastos = await window.indexedDBManager.obtenerGastos();
                console.log(`💸 ${gastos.length} gastos cargados`);

                // Verificar gastos vencidos
                const gastosVencidos = await window.indexedDBManager.obtenerGastosVencidos();
                if (gastosVencidos.length > 0) {
                    console.warn(`⚠️ ${gastosVencidos.length} gastos vencidos encontrados`);
                    this.notificarGastosVencidos(gastosVencidos);
                }
            }
        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
        }
    }

    /**
     * Inicializar interfaz de usuario
     */
    async inicializarInterfaz() {
        try {
            // Configurar tema
            this.aplicarTema();

            // Configurar tooltips
            this.configurarTooltips();

            // Configurar atajos de teclado
            this.configurarAtajos();

            // Ocultar pantalla de carga si existe
            this.ocultarPantallaCarga();

            console.log('🎨 Interfaz inicializada');
        } catch (error) {
            console.error('❌ Error inicializando interfaz:', error);
        }
    }

    /**
     * Configurar sistema de notificaciones
     */
    configurarNotificaciones() {
        // Solicitar permisos de notificación si están disponibles
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log(`🔔 Permisos de notificación: ${permission}`);
            });
        }

        // Configurar notificaciones de vencimientos
        this.configurarNotificacionesVencimientos();
    }

    /**
     * Configurar auto-guardado
     */
    configurarAutoGuardado() {
        // Auto-guardado cada 5 minutos
        setInterval(() => {
            this.realizarAutoGuardado();
        }, 5 * 60 * 1000);

        console.log('💾 Auto-guardado configurado (cada 5 minutos)');
    }

    /**
     * Aplicar configuración a los componentes
     */
    aplicarConfiguracion() {
        const config = this.componentes.configuracion;
        if (!config) return;

        // Aplicar configuración de tema
        if (config.ui && config.ui.temaOscuro) {
            document.body.classList.add('tema-oscuro');
        }

        // Aplicar configuración de notificaciones
        if (config.notificaciones) {
            this.configurarNotificacionesConConfig(config.notificaciones);
        }
    }

    /**
     * Aplicar tema visual
     */
    aplicarTema() {
        const config = this.componentes.configuracion;
        const temaOscuro = config?.ui?.temaOscuro || false;
        
        if (temaOscuro) {
            document.body.classList.add('tema-oscuro');
        } else {
            document.body.classList.remove('tema-oscuro');
        }
    }

    /**
     * Configurar tooltips
     */
    configurarTooltips() {
        // Los tooltips ya están configurados en CSS
        // Aquí podríamos agregar funcionalidad adicional
    }

    /**
     * Configurar atajos de teclado globales
     */
    configurarAtajos() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para guardar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.guardarDatos();
            }

            // Ctrl + Z para deshacer (futuro)
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                // TODO: Implementar deshacer
            }

            // F5 para actualizar datos
            if (e.key === 'F5') {
                e.preventDefault();
                this.actualizarDatos();
            }
        });
    }

    /**
     * Ocultar pantalla de carga
     */
    ocultarPantallaCarga() {
        const pantallaCarga = document.getElementById('pantalla-carga');
        if (pantallaCarga) {
            pantallaCarga.style.opacity = '0';
            setTimeout(() => {
                pantallaCarga.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Configurar notificaciones de vencimientos
     */
    configurarNotificacionesVencimientos() {
        // Verificar vencimientos cada hora
        setInterval(async () => {
            await this.verificarVencimientosProximos();
        }, 60 * 60 * 1000);

        // Verificación inicial
        setTimeout(() => {
            this.verificarVencimientosProximos();
        }, 10000); // 10 segundos después del inicio
    }

    /**
     * Verificar vencimientos próximos
     */
    async verificarVencimientosProximos() {
        try {
            if (!window.indexedDBManager) return;

            const gastos = await window.indexedDBManager.obtenerGastos();
            const hoy = new Date();
            const proximosVencimientos = [];

            gastos.forEach(gasto => {
                if (gasto.estado === 'pagado' || gasto.estado === 'cancelado') return;

                const fechaVencimiento = new Date(gasto.fechaVencimiento);
                const diferenciaDias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

                if (diferenciaDias <= 3 && diferenciaDias >= 0) {
                    proximosVencimientos.push({
                        ...gasto,
                        diasRestantes: diferenciaDias
                    });
                }
            });

            if (proximosVencimientos.length > 0) {
                this.mostrarNotificacionVencimientos(proximosVencimientos);
            }

        } catch (error) {
            console.error('Error verificando vencimientos:', error);
        }
    }

    /**
     * Mostrar notificación de vencimientos
     */
    mostrarNotificacionVencimientos(vencimientos) {
        const config = this.componentes.configuracion?.notificaciones;
        if (!config?.habilitadas) return;

        vencimientos.forEach(gasto => {
            const mensaje = gasto.diasRestantes === 0 
                ? `¡Vence hoy! ${gasto.descripcion} - ${this.formatearMonto(gasto.monto)}`
                : `Vence en ${gasto.diasRestantes} día(s): ${gasto.descripcion}`;

            // Notificación del navegador
            if (Notification.permission === 'granted') {
                new Notification('💸 Vencimiento próximo', {
                    body: mensaje,
                    icon: '/favicon.ico',
                    tag: `vencimiento-${gasto.id}`
                });
            }

            // Notificación en la aplicación
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: mensaje,
                    tipo: gasto.diasRestantes === 0 ? 'error' : 'warning',
                    duracion: 10000
                });
            }
        });
    }

    /**
     * Realizar auto-guardado
     */
    async realizarAutoGuardado() {
        try {
            if (window.indexedDBManager && window.localStorageManager) {
                await window.indexedDBManager.syncWithLocalStorage();
                
                // Actualizar timestamp de último guardado
                window.localStorageManager.set('ultimoAutoGuardado', new Date().toISOString());
                
                console.log('💾 Auto-guardado realizado');
            }
        } catch (error) {
            console.error('Error en auto-guardado:', error);
        }
    }

    /**
     * Guardar datos manualmente
     */
    async guardarDatos() {
        try {
            await this.realizarAutoGuardado();
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Datos guardados correctamente',
                    tipo: 'success'
                });
            }
        } catch (error) {
            console.error('Error guardando datos:', error);
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Error al guardar datos',
                    tipo: 'error'
                });
            }
        }
    }

    /**
     * Actualizar datos
     */
    async actualizarDatos() {
        try {
            // Recargar datos desde IndexedDB
            if (window.ventanaIngresos) {
                await window.ventanaIngresos.cargarIngresos();
            }
            
            if (window.ventanaGastos) {
                await window.ventanaGastos.cargarGastos();
            }

            if (window.ventanaHojaCalculo) {
                await window.ventanaHojaCalculo.actualizarProyecciones();
            }

            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Datos actualizados',
                    tipo: 'info'
                });
            }
        } catch (error) {
            console.error('Error actualizando datos:', error);
        }
    }

    /**
     * Manejo de eventos del ciclo de vida de la aplicación
     */
    manejarPausaAplicacion() {
        console.log('⏸️ Aplicación pausada');
        this.realizarAutoGuardado();
    }

    manejarReanudarAplicacion() {
        console.log('▶️ Aplicación reanudada');
        this.verificarVencimientosProximos();
    }

    manejarCierrePagina(event) {
        // Guardar estado antes de cerrar
        this.realizarAutoGuardado();
        
        // Mostrar mensaje de confirmación si hay cambios sin guardar
        const mensaje = '¿Estás seguro de que quieres salir? Los cambios se guardarán automáticamente.';
        event.returnValue = mensaje;
        return mensaje;
    }

    manejarCambioTamano() {
        // Ajustar interfaz responsive
        if (window.ventanaGestion && window.ventanaGestion.ajustarTamano) {
            window.ventanaGestion.ajustarTamano();
        }
    }

    manejarConexionOnline() {
        console.log('🌐 Conexión restaurada');
        if (window.notificacionesManager) {
            window.notificacionesManager.mostrar({
                mensaje: 'Conexión a internet restaurada',
                tipo: 'success'
            });
        }
    }

    manejarConexionOffline() {
        console.log('📡 Sin conexión a internet');
        if (window.notificacionesManager) {
            window.notificacionesManager.mostrar({
                mensaje: 'Sin conexión a internet. Trabajando en modo offline',
                tipo: 'warning'
            });
        }
    }

    /**
     * Manejo de errores
     */
    manejarErrorGlobal(error) {
        console.error('Error global:', error);
        this.estado.errores.push({
            tipo: 'global',
            error: error.error,
            mensaje: error.message,
            timestamp: new Date().toISOString()
        });
    }

    manejarErrorPromesa(event) {
        console.error('Promesa rechazada:', event.reason);
        this.estado.errores.push({
            tipo: 'promesa',
            error: event.reason,
            timestamp: new Date().toISOString()
        });
        
        // Prevenir que aparezca en la consola
        event.preventDefault();
    }

    manejarErrorInicializacion(error) {
        this.estado.cargando = false;
        this.estado.errores.push({
            tipo: 'inicializacion',
            error: error,
            timestamp: new Date().toISOString()
        });

        // Mostrar error en la interfaz
        this.mostrarErrorInicializacion(error);
    }

    mostrarErrorInicializacion(error) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #f8fafc;
                font-family: 'Segoe UI', sans-serif;
                text-align: center;
                padding: 2rem;
            ">
                <div style="
                    background: white;
                    border-radius: 0.5rem;
                    padding: 3rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    max-width: 500px;
                ">
                    <h1 style="color: #ef4444; margin-bottom: 1rem;">❌ Error de Inicialización</h1>
                    <p style="color: #64748b; margin-bottom: 2rem;">
                        El sistema no pudo inicializarse correctamente.
                    </p>
                    <details style="text-align: left; margin-bottom: 2rem;">
                        <summary style="cursor: pointer; color: #3b82f6;">Ver detalles técnicos</summary>
                        <pre style="
                            background: #f1f5f9;
                            padding: 1rem;
                            border-radius: 0.25rem;
                            margin-top: 1rem;
                            overflow-x: auto;
                            font-size: 0.875rem;
                        ">${error.message}\n\n${error.stack}</pre>
                    </details>
                    <button onclick="location.reload()" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                    ">🔄 Reintentar</button>
                </div>
            </div>
        `;
    }

    /**
     * Mostrar mensaje de bienvenida
     */
    mostrarMensajeBienvenida() {
        if (window.notificacionesManager) {
            window.notificacionesManager.mostrar({
                mensaje: `¡Bienvenido al Sistema de Gestión Financiera Personal v${this.version}!`,
                tipo: 'success',
                duracion: 5000
            });
        }

        // Log de estadísticas de inicio
        this.mostrarEstadisticasInicio();
    }

    /**
     * Mostrar estadísticas de inicio
     */
    async mostrarEstadisticasInicio() {
        try {
            if (window.indexedDBManager) {
                const stats = await window.indexedDBManager.getStats();
                console.group('📊 Estadísticas del Sistema');
                console.log(`Ingresos registrados: ${stats.ingresos || 0}`);
                console.log(`Gastos registrados: ${stats.gastos || 0}`);
                console.log(`Conexiones creadas: ${stats.conexiones || 0}`);
                console.log(`Proyecciones guardadas: ${stats.proyecciones || 0}`);
                console.groupEnd();
            }
        } catch (error) {
            console.warn('No se pudieron cargar las estadísticas:', error);
        }
    }

    /**
     * Utilidades
     */
    formatearMonto(monto) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(monto);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * API pública para obtener información del sistema
     */
    getEstado() {
        return {
            version: this.version,
            inicializado: this.inicializado,
            estado: this.estado,
            componentes: Object.keys(this.componentes)
        };
    }

    getEstadisticas() {
        return this.estado;
    }
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.sistemaGestorFinanciero = new SistemaGestorFinanciero();
    await window.sistemaGestorFinanciero.init();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaGestorFinanciero;
}
