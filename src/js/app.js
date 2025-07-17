/**
 * Gestor Financiero Personal v2.0.0 - México 🇲🇽
 * Aplicación adaptada para México con formato de pesos mexicanos
 */

class GestorFinanciero {
    constructor() {
        this.version = '2.0.0-MX';
        this.storage = null;
        this.calendarioIngresos = null;
        this.calendarioGastos = null;
        this.consultas = null;
        this.modals = null;
        this.currentTab = 'ingresos';
        
        // Verificar y asignar configuración mexicana
        if (typeof CONFIGURACION_MEXICO !== 'undefined') {
            this.configuracion = CONFIGURACION_MEXICO;
        } else {
            logger.warn('CONFIGURACION_MEXICO no encontrada, usando configuración por defecto');
            this.configuracion = {
                moneda: { codigo: 'MXN', simbolo: '$', nombre: 'Peso Mexicano' },
                idioma: { textos: { appTitle: 'Gestor Financiero Personal - México' } }
            };
        }
    }

    /**
     * Inicializar aplicación
     */
    async init() {
        try {
            logger.success(`🇲🇽 Iniciando Gestor Financiero Personal v${this.version}`);
            
            // Verificar requisitos básicos
            if (!this.verificarRequisitos()) {
                throw new Error('Requisitos no cumplidos');
            }

            // Configurar formato mexicano
            this.configurarFormatoMexicano();

            // Verificar librerías externas
            await this.verificarYCargarLibrerias();

            // Inicializar almacenamiento
            await this.inicializarAlmacenamiento();

            // Inicializar componentes
            await this.inicializarComponentes();

            // Configurar navegación
            this.configurarNavegacion();

            // Configurar eventos globales
            this.configurarEventos();

            // Mostrar aplicación
            this.mostrarAplicacion();

            logger.success('Aplicación inicializada correctamente para México 🇲🇽');
            
        } catch (error) {
            logger.error('Error al inicializar aplicación:', error);
            this.mostrarError('Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    /**
     * Configurar formato mexicano en toda la aplicación
     */
    configurarFormatoMexicano() {
        try {
            // Verificar que la configuración mexicana esté disponible
            if (!this.configuracion) {
                logger.warn('Configuración mexicana no disponible, usando valores por defecto');
                this.configuracion = {
                    idioma: {
                        textos: {
                            appTitle: 'Gestor Financiero Personal - México'
                        }
                    }
                };
            }

            // Actualizar títulos con configuración mexicana
            if (this.configuracion.idioma && this.configuracion.idioma.textos) {
                document.title = this.configuracion.idioma.textos.appTitle;
            }
            
            // Configurar FullCalendar en español mexicano (si está disponible)
            if (typeof FullCalendar !== 'undefined' && FullCalendar.globalDefaults) {
                FullCalendar.globalDefaults.locale = 'es';
                FullCalendar.globalDefaults.firstDay = 1; // Lunes como primer día
                FullCalendar.globalDefaults.timeZone = 'America/Mexico_City';
            }

            // Actualizar elementos de la interfaz
            this.actualizarTextosMexicanos();
            
            logger.success('Formato mexicano configurado: MXN, es-MX, GMT-6');
        } catch (error) {
            logger.error('Error configurando formato mexicano:', error);
            // Continuar sin configuración mexicana específica
        }
    }

    /**
     * Actualizar textos de la interfaz para México
     */
    actualizarTextosMexicanos() {
        try {
            // Verificar que la configuración y textos estén disponibles
            if (!this.configuracion || !this.configuracion.idioma || !this.configuracion.idioma.textos) {
                logger.warn('Textos mexicanos no disponibles, saltando actualización');
                return;
            }

            const textos = this.configuracion.idioma.textos;
            
            // Actualizar tabs si existen
            const tabIngresos = document.querySelector('[data-tab="ingresos"]');
            if (tabIngresos) {
                const textElement = tabIngresos.querySelector('.tab-text');
                if (textElement) textElement.textContent = textos.tabIngresos;
            }

            const tabGastos = document.querySelector('[data-tab="gastos"]');
            if (tabGastos) {
                const textElement = tabGastos.querySelector('.tab-text');
                if (textElement) textElement.textContent = textos.tabGastos;
            }

            const tabConsultas = document.querySelector('[data-tab="consultas"]');
            if (tabConsultas) {
                const textElement = tabConsultas.querySelector('.tab-text');
                if (textElement) textElement.textContent = textos.tabConsultas;
            }

            // Actualizar placeholders de moneda a pesos mexicanos
            const montoInputs = document.querySelectorAll('input[type="number"][step="0.01"]');
            montoInputs.forEach(input => {
                if (input.id && input.id.includes('monto')) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        label.textContent = label.textContent.replace('€', '$MXN').replace('(€)', '($MXN)');
                    }
                }
            });
        } catch (error) {
            logger.error('Error actualizando textos mexicanos:', error);
        }
    }

    /**
     * Verificar requisitos básicos del navegador
     */
    verificarRequisitos() {
        const requisitos = {
            Storage: 'localStorage' in window,
            fetch: 'fetch' in window,
            Promise: 'Promise' in window,
            FullCalendar: typeof FullCalendar !== 'undefined',
            Chart: typeof Chart !== 'undefined',
            Intl: 'Intl' in window // Para formateo de moneda mexicana
        };

        const faltantes = Object.entries(requisitos)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (faltantes.length > 0) {
            logger.warn('Librerías no disponibles:', faltantes.join(', '));
            return false;
        }

        return true;
    }

    /**
     * Verificar y cargar librerías externas
     */
    async verificarYCargarLibrerias() {
        // Verificar FullCalendar
        if (typeof FullCalendar === 'undefined') {
            logger.warn('FullCalendar no disponible - calendarios con funcionalidad limitada');
            return;
        }

        // Verificar Chart.js
        if (typeof Chart !== 'undefined') {
            // Configurar Chart.js para formato mexicano
            Chart.defaults.plugins.tooltip.callbacks.label = (context) => {
                return `${context.dataset.label}: ${FormatoMexico.formatearMoneda(context.parsed.y)}`;
            };
            logger.success('Chart.js configurado para México');
        }

        // Esperar carga completa
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Inicializar sistema de almacenamiento
     */
    async inicializarAlmacenamiento() {
        try {
            this.storage = new StorageManager();
            await this.storage.init();
            
            const estado = this.storage.getConnectionStatus();
            logger.database(`Estado de almacenamiento: ${JSON.stringify(estado)}`);
            
        } catch (error) {
            logger.warn('Problemas al inicializar almacenamiento, usando fallback local');
            // Continuar con localStorage como fallback
        }
    }

    /**
     * Inicializar componentes de la aplicación
     */
    async inicializarComponentes() {
        try {
            // Inicializar consultas (primero porque otros dependen de él)
            this.consultas = new ModuloConsultas(this.storage);
            await this.consultas.init();

            // Inicializar calendarios con configuración mexicana
            this.calendarioIngresos = new CalendarioIngresos(this.storage, this.configuracion);
            await this.calendarioIngresos.init();

            this.calendarioGastos = new CalendarioGastos(this.storage, this.configuracion);
            await this.calendarioGastos.init();

            // Inicializar modales con categorías mexicanas
            this.modals = new GestorModales(this.storage);

            // Configurar callbacks entre componentes
            this.configurarCallbacks();

        } catch (error) {
            logger.error('Error al inicializar componentes:', error);
            throw error;
        }
    }

    /**
     * Configurar navegación entre pestañas
     */
    configurarNavegacion() {
        const navTabs = document.querySelectorAll('.nav-tab');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.cambiarTab(targetTab);
            });
        });
    }

    /**
     * Cambiar a una pestaña específica
     */
    cambiarTab(tabName) {
        // Actualizar navegación
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });

        this.currentTab = tabName;
        logger.info(`Cambiado a pestaña: ${tabName}`);

        // Refrescar calendario si es necesario
        if (tabName === 'ingresos' && this.calendarioIngresos) {
            setTimeout(() => this.calendarioIngresos.refresh(), 100);
        } else if (tabName === 'gastos' && this.calendarioGastos) {
            setTimeout(() => this.calendarioGastos.refresh(), 100);
        }
    }

    /**
     * Configurar eventos globales
     */
    configurarEventos() {
        // Botón de sincronización
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.sincronizarDatos());
        }

        // Botón de configuración
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.mostrarConfiguracion());
        }

        // Manejar errores globales
        window.addEventListener('error', (event) => {
            logger.error('Error global:', event.error);
        });

        // Manejar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            logger.error('Promesa rechazada:', event.reason);
            event.preventDefault();
        });
    }

    /**
     * Configurar callbacks entre componentes
     */
    configurarCallbacks() {
        // Cuando se agrega/edita un ingreso, actualizar consultas
        if (this.modals && this.consultas) {
            this.modals.onIngresoSaved = () => {
                this.consultas.refresh();
                if (this.calendarioIngresos) {
                    this.calendarioIngresos.refresh();
                }
            };

            this.modals.onGastoSaved = () => {
                this.consultas.refresh();
                if (this.calendarioGastos) {
                    this.calendarioGastos.refresh();
                }
            };
        }
    }

    /**
     * Sincronizar datos con el servidor
     */
    async sincronizarDatos() {
        try {
            const syncBtn = document.getElementById('sync-btn');
            if (syncBtn) {
                syncBtn.disabled = true;
                syncBtn.innerHTML = '🔄 Sincronizando...';
            }

            await this.storage.syncWithSupabase();
            
            // Actualizar todos los componentes
            if (this.calendarioIngresos) await this.calendarioIngresos.refresh();
            if (this.calendarioGastos) await this.calendarioGastos.refresh();
            if (this.consultas) await this.consultas.refresh();

            this.mostrarNotificacion('✅ Datos sincronizados correctamente', 'success');

        } catch (error) {
            logger.error('Error al sincronizar:', error);
            this.mostrarNotificacion('❌ Error al sincronizar datos', 'error');
        } finally {
            const syncBtn = document.getElementById('sync-btn');
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = '🔄 Sync';
            }
        }
    }

    /**
     * Mostrar panel de configuración
     */
    mostrarConfiguracion() {
        // Mostrar info de debugging para México
        const info = {
            version: this.version,
            pais: 'México 🇲🇽',
            moneda: 'MXN (Pesos Mexicanos)',
            formato: 'es-MX',
            zonaHoraria: 'America/Mexico_City',
            storage: this.storage?.getConnectionStatus(),
            components: {
                calendarioIngresos: !!this.calendarioIngresos,
                calendarioGastos: !!this.calendarioGastos,
                consultas: !!this.consultas,
                modals: !!this.modals
            },
            currentTab: this.currentTab
        };

        logger.info('Estado de la aplicación (México):', info);
        
        // Panel de configuración para desarrollador
        const isDevMode = logger.isDevelopment;
        if (isDevMode) {
            const config = prompt(
                '🇲🇽 Panel de Desarrollador - México\n\n' +
                'Opciones:\n' +
                '1. logs - Activar/desactivar logs\n' +
                '2. sync - Forzar sincronización\n' +
                '3. reset - Limpiar datos locales\n' +
                '4. info - Mostrar información del sistema\n' +
                '5. moneda - Probar formateo de moneda\n\n' +
                'Ingresa una opción:'
            );

            switch(config) {
                case 'logs':
                    logger.isEnabled ? logger.disable() : logger.enable();
                    this.mostrarNotificacion(`🔧 Logs ${logger.isEnabled ? 'activados' : 'desactivados'}`, 'info');
                    break;
                case 'sync':
                    this.sincronizarDatos();
                    break;
                case 'reset':
                    if (confirm('⚠️ ¿Limpiar todos los datos locales?')) {
                        localStorage.clear();
                        location.reload();
                    }
                    break;
                case 'info':
                    alert(JSON.stringify(info, null, 2));
                    break;
                case 'moneda':
                    const test = FormatoMexico.formatearMoneda(1234.56);
                    this.mostrarNotificacion(`💰 Formato mexicano: ${test}`, 'info');
                    break;
                default:
                    this.mostrarNotificacion('🇲🇽 Panel de configuración próximamente', 'info');
            }
        } else {
            this.mostrarNotificacion('🇲🇽 Panel de configuración próximamente', 'info');
        }
    }

    /**
     * Mostrar aplicación (ocultar loader)
     */
    mostrarAplicacion() {
        const loader = document.getElementById('app-loader');
        const app = document.getElementById('app');

        if (loader) loader.style.display = 'none';
        if (app) app.style.display = 'block';
    }

    /**
     * Mostrar error crítico
     */
    mostrarError(mensaje) {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="error-icon">❌</div>
                    <p style="color: #dc2626;">${mensaje}</p>
                    <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                        Recargar página
                    </button>
                </div>
            `;
        }
    }

    /**
     * Mostrar notificación temporal
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.textContent = mensaje;
        
        // Estilos básicos
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Colores según tipo
        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#2563eb'
        };
        notification.style.backgroundColor = colors[tipo] || colors.info;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Métodos estáticos para configuración
     */
    static exportarConfiguracion() {
        logger.info('Exportar configuración solicitado');
    }

    static reiniciarSupabase() {
        if (window.SupabaseConfig) {
            return window.SupabaseConfig.reiniciar();
        }
        return Promise.reject(new Error('SupabaseConfig no disponible'));
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new GestorFinanciero();
    app.init();
    
    // Hacer disponible globalmente para debugging
    window.gestorFinanciero = app;
});

// Hacer clase disponible globalmente
window.GestorFinanciero = GestorFinanciero;
