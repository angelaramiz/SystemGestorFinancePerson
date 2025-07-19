/**
 * Gestor Financiero Personal v2.0.0 - México 🇲🇽
 * Aplicación adaptada para México con formato de pesos mexicanos
 */

// Logger temporal hasta que se cargue el logger principal
if (typeof window.logger === 'undefined') {
    window.logger = {
        success: (msg) => console.log(`✅ ${msg}`),
        warn: (msg) => console.warn(`⚠️ ${msg}`),
        error: (msg) => console.error(`❌ ${msg}`),
        info: (msg) => console.info(`ℹ️ ${msg}`)
    };
}

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

            // Inicializar tema
            this.inicializarTema();

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
            logger.info(`Estado de almacenamiento: ${JSON.stringify(estado)}`);
            
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
            // Asignar a variable global inmediatamente
            window.ModuloConsultas = this.consultas;

            // Inicializar gestores de modales con categorías mexicanas
            this.modals = new GestorModales(this.storage);
            // Asignar a variable global inmediatamente
            window.GestorModales = this.modals;
            // Iniciar manualmente
            await this.modals.init();

            // Inicializar calendarios con configuración mexicana
            this.calendarioIngresos = new CalendarioIngresos(this.storage, this.configuracion);
            // Asignar a variable global inmediatamente antes de inicializar
            window.CalendarioIngresos = this.calendarioIngresos;
            await this.calendarioIngresos.init();

            this.calendarioGastos = new CalendarioGastos(this.storage, this.configuracion);
            // Asignar a variable global inmediatamente antes de inicializar
            window.CalendarioGastos = this.calendarioGastos;
            await this.calendarioGastos.init();

            // Asignar el gestor de recurrencias al objeto global para acceso desde otros módulos
            this.recurrenceManager = window.RecurrenceManager;
            
            // Exponer el storageManager para acceso desde RecurrenceManager
            window.gestorApp.storageManager = this.storage;

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

        // Botón de cambio de tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTema());
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
        // Actualizar información del sistema
        this.actualizarInfoConfiguracion();
        
        // Mostrar modal
        const modal = document.getElementById('modal-configuracion');
        if (modal) {
            modal.classList.add('active');
            
            // Mostrar herramientas de desarrollador si está en modo dev
            const devTools = document.getElementById('dev-tools');
            if (devTools && logger.isDevelopment) {
                devTools.style.display = 'block';
            }
        } else {
            logger.error('Modal de configuración no encontrado');
        }
    }

    /**
     * Actualizar información en el modal de configuración
     */
    actualizarInfoConfiguracion() {
        try {
            // Versión
            const versionEl = document.getElementById('config-version');
            if (versionEl) versionEl.textContent = `v${this.version}`;

            // Estado de base de datos
            const dbStatusEl = document.getElementById('config-db-status');
            if (dbStatusEl) {
                const isConnected = this.storage?.getConnectionStatus()?.supabase;
                dbStatusEl.textContent = isConnected ? 'Conectado' : 'Desconectado';
                dbStatusEl.className = `status-badge ${isConnected ? 'success' : 'error'}`;
            }

            // Estado local
            const localStatusEl = document.getElementById('config-local-status');
            if (localStatusEl) {
                const isAvailable = typeof(Storage) !== "undefined";
                localStatusEl.textContent = isAvailable ? 'Disponible' : 'No disponible';
                localStatusEl.className = `status-badge ${isAvailable ? 'success' : 'error'}`;
            }

            // Estadísticas (si existen datos en consultas)
            if (this.consultas && this.consultas.currentData) {
                const data = this.consultas.currentData;
                
                const totalIngresos = data.ingresos?.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0) || 0;
                const totalGastos = data.gastos?.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0) || 0;
                const balance = totalIngresos - totalGastos;

                const totalIngresosEl = document.getElementById('config-total-ingresos');
                const totalGastosEl = document.getElementById('config-total-gastos');
                const balanceEl = document.getElementById('config-balance');

                if (totalIngresosEl) totalIngresosEl.textContent = `$${totalIngresos.toFixed(2)} MXN`;
                if (totalGastosEl) totalGastosEl.textContent = `$${totalGastos.toFixed(2)} MXN`;
                if (balanceEl) {
                    balanceEl.textContent = `$${balance.toFixed(2)} MXN`;
                    balanceEl.style.color = balance >= 0 ? 'var(--success-color)' : 'var(--error-color)';
                }
            }

        } catch (error) {
            logger.error('Error actualizando información de configuración:', error);
        }
    }

    /**
     * Alternar logs (para herramientas de desarrollador)
     */
    toggleLogs() {
        if (logger.isEnabled) {
            logger.disable();
            this.mostrarNotificacion('� Logs desactivados', 'info');
        } else {
            logger.enable();
            this.mostrarNotificacion('📝 Logs activados', 'info');
        }
    }

    /**
     * Exportar datos (para herramientas de desarrollador)
     */
    async exportarDatos() {
        try {
            const datos = {
                ingresos: await this.storage.getIngresos(),
                gastos: await this.storage.getGastos(),
                categorias: await this.storage.getCategorias(),
                version: this.version,
                fecha: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finanzas-mexico-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.mostrarNotificacion('📤 Datos exportados correctamente', 'success');
        } catch (error) {
            logger.error('Error exportando datos:', error);
            this.mostrarNotificacion('❌ Error al exportar datos', 'error');
        }
    }

    /**
     * Resetear datos (para herramientas de desarrollador)
     */
    async resetearDatos() {
        const confirmacion = await window.Alertas.confirmar(
            '⚠️ Resetear aplicación',
            'Esto eliminará todos los datos locales y recargará la aplicación. ¿Estás seguro?'
        );
        if (confirmacion.isConfirmed) {
            localStorage.clear();
            await window.Alertas.info('Datos limpiados', 'Recargando aplicación...');
            setTimeout(() => location.reload(), 1500);
        }
    }

    /**
     * Inicializar tema al cargar la aplicación
     */
    inicializarTema() {
        const temaGuardado = localStorage.getItem('tema-financiero') || 'auto';
        this.aplicarTema(temaGuardado);
        this.actualizarIndicadorTema(temaGuardado);
        
        // Escuchar cambios en la preferencia del sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (temaGuardado === 'auto') {
                    this.aplicarTema('auto');
                }
            });
        }
    }

    /**
     * Alternar entre modo claro y oscuro
     */
    toggleTema() {
        const temaActual = localStorage.getItem('tema-financiero') || 'auto';
        let nuevoTema;
        
        switch (temaActual) {
            case 'light':
                nuevoTema = 'dark';
                break;
            case 'dark':
                nuevoTema = 'auto';
                break;
            case 'auto':
            default:
                nuevoTema = 'light';
                break;
        }
        
        this.cambiarTema(nuevoTema);
    }

    /**
     * Cambiar tema
     */
    cambiarTema(tema) {
        this.aplicarTema(tema);
        localStorage.setItem('tema-financiero', tema);
        this.actualizarIndicadorTema(tema);
        
        // Mostrar notificación
        let temaTexto;
        if (tema === 'auto') {
            const esOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            temaTexto = `🔄 Automático (${esOscuro ? 'Oscuro' : 'Claro'})`;
        } else {
            temaTexto = tema === 'dark' ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
        }
        
        this.mostrarNotificacion(`🎨 ${temaTexto} activado`, 'info');
        logger.info(`🎨 Tema cambiado a: ${tema}`);
    }

    /**
     * Aplicar tema al documento
     */
    aplicarTema(tema) {
        let temaEfectivo = tema;
        
        // Si es automático, detectar preferencia del sistema
        if (tema === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                temaEfectivo = 'dark';
            } else {
                temaEfectivo = 'light';
            }
        }
        
        // Agregar animación de transición
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
        
        document.documentElement.setAttribute('data-theme', temaEfectivo);
        
        // Actualizar icono del botón según el tema efectivo
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            if (tema === 'auto') {
                themeToggle.innerHTML = '🔄';
                themeToggle.title = 'Tema automático (sigue preferencia del sistema)';
            } else {
                themeToggle.innerHTML = temaEfectivo === 'dark' ? '☀️' : '🌙';
                themeToggle.title = temaEfectivo === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
            }
        }
    }

    /**
     * Actualizar indicador de tema en configuración
     */
    actualizarIndicadorTema(tema) {
        const themeSelector = document.getElementById('theme-selector');
        const currentThemeDisplay = document.getElementById('current-theme-display');
        
        if (themeSelector) {
            themeSelector.value = tema;
        }
        
        if (currentThemeDisplay) {
            let temaTexto;
            if (tema === 'auto') {
                const esOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                temaTexto = `🔄 Automático (${esOscuro ? 'Oscuro' : 'Claro'})`;
            } else {
                temaTexto = tema === 'dark' ? '🌙 Oscuro' : '☀️ Claro';
            }
            currentThemeDisplay.textContent = temaTexto;
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
     * @param {string} mensaje - Mensaje a mostrar (puede incluir HTML)
     * @param {string} tipo - Tipo de notificación: 'info', 'success', 'warning', 'error'
     * @param {number} duracion - Duración en ms (0 para no auto-cerrar)
     */
    mostrarNotificacion(mensaje, tipo = 'info', duracion = 4000) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = mensaje; // Permitir HTML
        
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
            transition: 'transform 0.3s ease',
            maxWidth: '400px'
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

        // Botón de cerrar
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;cursor:pointer;font-size:16px;';
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        notification.appendChild(closeBtn);
        notification.style.position = 'relative';
        notification.style.paddingRight = '30px';

        // Auto-cerrar después del tiempo especificado (si no es 0)
        if (duracion !== 0) {
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duracion);
        }
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

    /**
     * Recargar todos los datos - usado por RecurrenceManager
     */
    async cargarTabla() {
        try {
            // Actualizar todos los componentes
            if (this.calendarioIngresos) await this.calendarioIngresos.refresh();
            if (this.calendarioGastos) await this.calendarioGastos.refresh();
            if (this.consultas) await this.consultas.refresh();
            
            logger.info('Datos recargados después de procesar ingresos recurrentes');
        } catch (error) {
            logger.error('Error al recargar datos:', error);
        }
    }

    /**
     * Mostrar el script SQL para actualizar la base de datos de Supabase
     */
    async mostrarScriptActualizacionBD() {
        try {
            // Leer el archivo SQL
            let scriptSQL = '';
            try {
                const response = await fetch('src/scripts/supabase-recurrencia-update.sql');
                if (response.ok) {
                    scriptSQL = await response.text();
                } else {
                    throw new Error('No se pudo cargar el archivo SQL');
                }
            } catch (fetchError) {
                logger.warn('No se pudo cargar el archivo SQL:', fetchError);
                // Script SQL embebido como fallback
                scriptSQL = `-- Script para actualizar la estructura de la base de datos para soportar recurrencia
-- Ejecutar este script en el panel SQL de Supabase

-- Tabla de ingresos: Agregar columnas para recurrencia
ALTER TABLE ingresos 
  ADD COLUMN IF NOT EXISTS es_recurrente BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS frecuencia_recurrencia VARCHAR(20) DEFAULT 'mensual',
  ADD COLUMN IF NOT EXISTS dia_recurrencia VARCHAR(10) DEFAULT '1',
  ADD COLUMN IF NOT EXISTS fecha_fin_recurrencia DATE,
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS proximo_pago DATE,
  ADD COLUMN IF NOT EXISTS numero_secuencia INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ingreso_padre_id UUID;

-- Tabla de gastos: Agregar columnas para recurrencia
ALTER TABLE gastos 
  ADD COLUMN IF NOT EXISTS es_recurrente BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS frecuencia_recurrencia VARCHAR(20) DEFAULT 'mensual',
  ADD COLUMN IF NOT EXISTS dia_recurrencia VARCHAR(10) DEFAULT '1',
  ADD COLUMN IF NOT EXISTS fecha_fin_recurrencia DATE,
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS proximo_pago DATE,
  ADD COLUMN IF NOT EXISTS numero_secuencia INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS gasto_padre_id UUID;

-- Crear índices para mejorar rendimiento en búsquedas
CREATE INDEX IF NOT EXISTS idx_ingresos_recurrentes ON ingresos(es_recurrente) WHERE es_recurrente = TRUE;
CREATE INDEX IF NOT EXISTS idx_gastos_recurrentes ON gastos(es_recurrente) WHERE es_recurrente = TRUE;`;
            }
            
            // Crear contenido formateado para el modal
            const contenidoHTML = `
                <div class="sql-instructions">
                    <p>Para habilitar la funcionalidad de recurrencia, necesita ejecutar el siguiente script SQL en su base de datos Supabase:</p>
                    <div class="code-container">
                        <pre><code class="language-sql">${scriptSQL}</code></pre>
                        <button id="btn-copiar-sql" class="btn btn-secondary">📋 Copiar SQL</button>
                    </div>
                    <p>Pasos para ejecutar el script:</p>
                    <ol>
                        <li>Inicie sesión en su <a href="https://supabase.com" target="_blank">panel de control de Supabase</a></li>
                        <li>Seleccione su proyecto</li>
                        <li>Vaya a "SQL Editor"</li>
                        <li>Pegue el script anterior</li>
                        <li>Ejecute el script haciendo clic en "Run"</li>
                    </ol>
                    <p>Una vez ejecutado, la funcionalidad de recurrencia estará disponible.</p>
                </div>
            `;
            
            // Mostrar modal con el script
            if (this.modals) {
                this.modals.mostrarModal('🔄 Actualización de Base de Datos', contenidoHTML);
                
                // Agregar funcionalidad para copiar el SQL
                setTimeout(() => {
                    const btnCopiarSQL = document.getElementById('btn-copiar-sql');
                    if (btnCopiarSQL) {
                        btnCopiarSQL.addEventListener('click', () => {
                            navigator.clipboard.writeText(scriptSQL)
                                .then(() => {
                                    btnCopiarSQL.textContent = '✅ Copiado!';
                                    setTimeout(() => {
                                        btnCopiarSQL.textContent = '📋 Copiar SQL';
                                    }, 2000);
                                })
                                .catch(err => {
                                    console.error('Error al copiar el SQL:', err);
                                    btnCopiarSQL.textContent = '❌ Error al copiar';
                                });
                        });
                    }
                }, 500);
            } else {
                console.error('No se pudo mostrar el modal - GestorModales no inicializado');
            }
            
        } catch (error) {
            logger.error('Error al mostrar script de actualización:', error);
            this.mostrarNotificacion('❌ Error al cargar el script de actualización', 'error');
        }
    }

    /**
     * Verificar si las columnas de recurrencia existen en la base de datos
     * (función auxiliar para desarrolladores)
     */
    async verificarColumnasRecurrencia() {
        if (!this.storage.useSupabase) {
            console.info('No se está utilizando Supabase, la verificación no es necesaria.');
            return true;
        }
        
        try {
            logger.info('🔍 Verificando estructura de base de datos para recurrencia...');
            
            if (window.SupabaseConfig && window.SupabaseConfig.client) {
                // Verificar tabla ingresos
                const { data: dataIngresos, error: errorIngresos } = await window.SupabaseConfig.client
                    .from('ingresos')
                    .select('es_recurrente')
                    .limit(1)
                    .maybeSingle();
                
                // Verificar tabla gastos
                const { data: dataGastos, error: errorGastos } = await window.SupabaseConfig.client
                    .from('gastos')
                    .select('es_recurrente')
                    .limit(1)
                    .maybeSingle();
                
                const ingresosOK = !errorIngresos || errorIngresos.code !== '42703';
                const gastosOK = !errorGastos || errorGastos.code !== '42703';
                
                const resultado = {
                    ingresosOK,
                    gastosOK,
                    actualizado: ingresosOK && gastosOK
                };
                
                logger.info('Resultado de verificación:', resultado);
                
                if (resultado.actualizado) {
                    this.mostrarNotificacion('✅ La estructura de la base de datos está actualizada para recurrencia', 'success');
                } else {
                    this.mostrarScriptActualizacionBD();
                }
                
                return resultado;
            } else {
                throw new Error('SupabaseConfig no está disponible');
            }
        } catch (error) {
            logger.error('Error verificando estructura de BD:', error);
            return false;
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new GestorFinanciero();
    app.init();
    
    // Hacer disponible globalmente para debugging y modal de configuración
    window.gestorFinanciero = app;
    window.gestorApp = app; // Alias para el modal
});

// Hacer clase disponible globalmente
window.GestorFinanciero = GestorFinanciero;
