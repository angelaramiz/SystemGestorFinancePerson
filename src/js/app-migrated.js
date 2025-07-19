/**
 * 🔄 APLICACIÓN MIGRADA - Fase 1
 * ================================
 * 
 * Esta versión integra gradualmente los nuevos sistemas core:
 * - DependencyInjector para gestión de dependencias
 * - EventBus para comunicación entre componentes
 * - ValidationSystem para validación de datos
 * - MetricsSystem para monitoreo de rendimiento
 * - CacheSystem para optimización de rendimiento
 * 
 * @version 2.0.0-migrated
 * @author Sistema de Gestión Financiera Personal
 */

// 🏗️ IMPORTACIÓN DE SISTEMAS CORE
import { DependencyInjector } from './core/DependencyInjector.js';
import { EventBus } from './core/EventBus.js';
import { ValidationSystem } from './core/ValidationSystem.js';
import { MetricsSystem } from './core/MetricsSystem.js';
import { CacheSystem } from './core/CacheSystem.js';
import { Logger } from './modules/logger.js';

/**
 * 🎮 GESTOR FINANCIERO MIGRADO
 * ============================
 * 
 * Versión refactorizada que utiliza los nuevos sistemas core
 * manteniendo compatibilidad con la funcionalidad existente.
 */
class GestorFinancieroMigrado {
    constructor() {
        // 🔧 Inicialización de sistemas core
        this.di = new DependencyInjector();
        this.initializeCoreServices();
        
        // 📊 Estado de la aplicación
        this.state = {
            isInitialized: false,
            currentView: 'dashboard',
            userData: null,
            settings: {}
        };
        
        // 🎯 Configuración regional México
        this.regionConfig = {
            currency: 'MXN',
            locale: 'es-MX',
            timeZone: 'America/Mexico_City'
        };
    }

    /**
     * 🏗️ Inicializar servicios core en el contenedor DI
     */
    initializeCoreServices() {
        // 📡 EventBus - Sistema de eventos centralizado
        this.di.register('eventBus', () => new EventBus(), true);
        
        // 📝 Logger - Sistema de logging
        this.di.register('logger', () => new Logger(), true);
        
        // ✅ ValidationSystem - Validación de datos
        this.di.register('validation', () => new ValidationSystem(), true);
        
        // 📊 MetricsSystem - Métricas y rendimiento
        this.di.register('metrics', () => new MetricsSystem(), true);
        
        // 🗄️ CacheSystem - Sistema de caché
        this.di.register('cache', () => new CacheSystem(), true);
        
        // 💾 StorageManager - Gestor de almacenamiento (a migrar)
        this.di.register('storage', () => this.createStorageManager(), true);
        
        // 🎨 ModalManager - Gestor de modales (a migrar)
        this.di.register('modals', () => this.createModalManager(), true);
    }

    /**
     * 🚀 Inicialización principal de la aplicación
     */
    async init() {
        try {
            const logger = this.di.resolve('logger');
            const metrics = this.di.resolve('metrics');
            const eventBus = this.di.resolve('eventBus');
            
            logger.info('🚀 Iniciando Sistema de Gestión Financiera Personal - Versión Migrada');
            
            // 📊 Iniciar métricas
            metrics.recordMetric('app.initialization.started', 1);
            const startTime = performance.now();
            
            // 🔧 Configurar eventos globales
            this.setupGlobalEvents();
            
            // 🌍 Configurar localización México
            await this.configurarFormatoMexicano();
            
            // 📱 Inicializar componentes UI
            await this.inicializarComponentes();
            
            // 🔄 Cargar datos del usuario
            await this.cargarDatosUsuario();
            
            // ✅ Marcar como inicializado
            this.state.isInitialized = true;
            
            // 📊 Registrar métricas de inicialización
            const initTime = performance.now() - startTime;
            metrics.recordMetric('app.initialization.completed', 1);
            metrics.recordPerformance('app.initialization.time', initTime);
            
            // 🎯 Emitir evento de aplicación lista
            eventBus.emit('app:ready', {
                initTime,
                version: '2.0.0-migrated',
                region: this.regionConfig
            });
            
            logger.success(`✅ Aplicación inicializada correctamente en ${initTime.toFixed(2)}ms`);
            
        } catch (error) {
            const logger = this.di.resolve('logger');
            logger.error('❌ Error durante la inicialización:', error);
            throw error;
        }
    }

    /**
     * 🌍 Configurar formato y localización para México
     */
    async configurarFormatoMexicano() {
        const logger = this.di.resolve('logger');
        const cache = this.di.resolve('cache');
        
        try {
            // 💰 Verificar caché de configuración
            let config = await cache.get('locale.config.mx');
            
            if (!config) {
                // 🔧 Configurar formato de números y moneda
                config = {
                    currency: {
                        code: 'MXN',
                        symbol: '$',
                        format: 'currency',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    },
                    number: {
                        locale: 'es-MX',
                        groupSeparator: ',',
                        decimalSeparator: '.'
                    },
                    date: {
                        locale: 'es-MX',
                        timeZone: 'America/Mexico_City',
                        format: 'dd/MM/yyyy'
                    }
                };
                
                // 💾 Guardar en caché
                await cache.set('locale.config.mx', config, { ttl: 86400000 }); // 24h
            }
            
            // 🌍 Aplicar configuración global
            this.regionConfig = { ...this.regionConfig, ...config };
            
            // 🎯 Configurar formatters globales
            window.formatCurrency = (amount) => {
                return new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                }).format(amount);
            };
            
            window.formatNumber = (number) => {
                return new Intl.NumberFormat('es-MX').format(number);
            };
            
            window.formatDate = (date) => {
                return new Intl.DateTimeFormat('es-MX', {
                    timeZone: 'America/Mexico_City'
                }).format(new Date(date));
            };
            
            logger.info('🌍 Configuración regional México aplicada correctamente');
            
        } catch (error) {
            logger.error('❌ Error configurando formato México:', error);
            throw error;
        }
    }

    /**
     * 📱 Inicializar componentes de la interfaz
     */
    async inicializarComponentes() {
        const logger = this.di.resolve('logger');
        const eventBus = this.di.resolve('eventBus');
        const metrics = this.di.resolve('metrics');
        
        try {
            // 📊 Métricas de componentes
            const componentStartTime = performance.now();
            
            // 🎨 Inicializar gestores
            await this.initModals();
            await this.initCharts();
            await this.initCalendars();
            await this.initForms();
            
            // ⚡ Configurar eventos UI
            this.setupUIEvents();
            
            // 📊 Registrar tiempo de inicialización de componentes
            const componentTime = performance.now() - componentStartTime;
            metrics.recordPerformance('components.initialization.time', componentTime);
            
            // 🎯 Emitir evento de componentes listos
            eventBus.emit('components:ready', {
                initTime: componentTime,
                components: ['modals', 'charts', 'calendars', 'forms']
            });
            
            logger.info(`📱 Componentes UI inicializados en ${componentTime.toFixed(2)}ms`);
            
        } catch (error) {
            logger.error('❌ Error inicializando componentes:', error);
            throw error;
        }
    }

    /**
     * 🔄 Cargar datos del usuario desde almacenamiento
     */
    async cargarDatosUsuario() {
        const logger = this.di.resolve('logger');
        const cache = this.di.resolve('cache');
        const storage = this.di.resolve('storage');
        const validation = this.di.resolve('validation');
        
        try {
            // 💾 Verificar caché primero
            let userData = await cache.get('user.data');
            
            if (!userData) {
                // 📥 Cargar desde almacenamiento
                const ingresos = await storage.getIngresos();
                const gastos = await storage.getGastos();
                const configuracion = await storage.getConfiguracion();
                
                // ✅ Validar datos cargados
                const validatedIngresos = await this.validateDataArray(ingresos, 'ingreso');
                const validatedGastos = await this.validateDataArray(gastos, 'gasto');
                
                userData = {
                    ingresos: validatedIngresos,
                    gastos: validatedGastos,
                    configuracion: configuracion || {},
                    lastUpdate: new Date().toISOString()
                };
                
                // 💾 Guardar en caché
                await cache.set('user.data', userData, { ttl: 300000 }); // 5min
            }
            
            // 🎯 Actualizar estado
            this.state.userData = userData;
            
            logger.info(`📊 Datos de usuario cargados: ${userData.ingresos.length} ingresos, ${userData.gastos.length} gastos`);
            
        } catch (error) {
            logger.error('❌ Error cargando datos de usuario:', error);
            throw error;
        }
    }

    /**
     * ✅ Validar array de datos financieros
     */
    async validateDataArray(dataArray, type) {
        const validation = this.di.resolve('validation');
        const validatedData = [];
        
        for (const item of dataArray) {
            try {
                const validated = await validation.validateAndSanitize(item, type);
                validatedData.push(validated);
            } catch (error) {
                console.warn(`Dato ${type} inválido ignorado:`, item, error.message);
            }
        }
        
        return validatedData;
    }

    /**
     * 🔧 Configurar eventos globales
     */
    setupGlobalEvents() {
        const eventBus = this.di.resolve('eventBus');
        const logger = this.di.resolve('logger');
        
        // 🎯 Eventos de aplicación
        eventBus.on('app:error', (error) => {
            logger.error('🚨 Error de aplicación:', error);
            this.handleApplicationError(error);
        });
        
        eventBus.on('user:action', (action) => {
            const metrics = this.di.resolve('metrics');
            metrics.recordUserInteraction(action.type, action.details);
        });
        
        eventBus.on('data:updated', async (data) => {
            await this.handleDataUpdate(data);
        });
        
        // 🎨 Eventos de UI
        eventBus.on('modal:opened', (modalId) => {
            logger.debug(`🎨 Modal abierto: ${modalId}`);
        });
        
        eventBus.on('modal:closed', (modalId) => {
            logger.debug(`🎨 Modal cerrado: ${modalId}`);
        });
    }

    /**
     * 🎨 Configurar eventos de interfaz
     */
    setupUIEvents() {
        const eventBus = this.di.resolve('eventBus');
        
        // 📱 Eventos de navegación
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.dataset.action;
                eventBus.emit('user:action', {
                    type: 'click',
                    action: action,
                    element: e.target.tagName,
                    timestamp: Date.now()
                });
            }
        });
        
        // ⌨️ Eventos de formulario
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                eventBus.emit('user:action', {
                    type: 'form_submit',
                    form: e.target.id || 'unknown',
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * 🎨 Inicializar sistema de modales
     */
    async initModals() {
        // TODO: Migrar ModalManager existente
        const logger = this.di.resolve('logger');
        logger.info('🎨 Inicializando sistema de modales...');
    }

    /**
     * 📊 Inicializar gráficos
     */
    async initCharts() {
        const logger = this.di.resolve('logger');
        logger.info('📊 Inicializando sistema de gráficos...');
    }

    /**
     * 📅 Inicializar calendarios
     */
    async initCalendars() {
        const logger = this.di.resolve('logger');
        logger.info('📅 Inicializando sistema de calendarios...');
    }

    /**
     * 📝 Inicializar formularios
     */
    async initForms() {
        const logger = this.di.resolve('logger');
        logger.info('📝 Inicializando sistema de formularios...');
    }

    /**
     * 🚨 Manejar errores de aplicación
     */
    handleApplicationError(error) {
        const logger = this.di.resolve('logger');
        const metrics = this.di.resolve('metrics');
        
        // 📊 Registrar error en métricas
        metrics.recordMetric('app.errors', 1);
        
        // 🎯 Notificar al usuario si es necesario
        if (error.userFacing) {
            this.showErrorNotification(error.message);
        }
    }

    /**
     * 🔄 Manejar actualización de datos
     */
    async handleDataUpdate(data) {
        const cache = this.di.resolve('cache');
        const logger = this.di.resolve('logger');
        
        try {
            // 🗑️ Invalidar caché relacionado
            await cache.delete('user.data');
            
            // 🔄 Recargar datos
            await this.cargarDatosUsuario();
            
            logger.info('🔄 Datos actualizados correctamente');
            
        } catch (error) {
            logger.error('❌ Error actualizando datos:', error);
        }
    }

    /**
     * 📢 Mostrar notificación de error
     */
    showErrorNotification(message) {
        // TODO: Integrar con sistema de notificaciones
        console.error('🚨 Error:', message);
    }

    /**
     * 💾 Crear instancia del StorageManager (temporal)
     */
    createStorageManager() {
        // TODO: Migrar StorageManager existente
        return {
            getIngresos: async () => [],
            getGastos: async () => [],
            getConfiguracion: async () => ({})
        };
    }

    /**
     * 🎨 Crear instancia del ModalManager (temporal)
     */
    createModalManager() {
        // TODO: Migrar ModalManager existente
        return {
            open: (modalId) => console.log('Modal abierto:', modalId),
            close: (modalId) => console.log('Modal cerrado:', modalId)
        };
    }

    /**
     * 📊 Obtener métricas de la aplicación
     */
    getMetrics() {
        const metrics = this.di.resolve('metrics');
        return metrics.getSummary();
    }

    /**
     * 🎯 Obtener estado actual de la aplicación
     */
    getState() {
        return {
            ...this.state,
            metrics: this.getMetrics(),
            timestamp: new Date().toISOString()
        };
    }
}

// 🌍 Exportar para uso global
window.GestorFinancieroMigrado = GestorFinancieroMigrado;

// 🚀 Auto-inicialización si está en modo desarrollo
if (window.devMode && window.devMode.enabled) {
    window.gestorMigrado = new GestorFinancieroMigrado();
    console.log('🔧 Gestor Financiero Migrado disponible en window.gestorMigrado');
}

export default GestorFinancieroMigrado;
