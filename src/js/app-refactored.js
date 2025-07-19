/**
 * Gestor Financiero Personal v2.1.0 - México 🇲🇽
 * Versión refactorizada con arquitectura mejorada
 */

class GestorFinanciero {
    constructor(dependencyInjector) {
        this.version = '2.1.0-MX';
        this.di = dependencyInjector;
        this.currentTab = 'ingresos';
        this.componentes = new Map();
        
        // Inyectar dependencias principales
        this.logger = this.di.resolve('logger');
        this.config = this.di.resolve('config');
        this.storage = this.di.resolve('storage');
    }

    /**
     * Inicializar aplicación con patrón de inicialización secuencial
     */
    async init() {
        try {
            this.logger.success(`🇲🇽 Iniciando Gestor Financiero Personal v${this.version}`);
            
            const initSteps = [
                { name: 'Verificar requisitos', method: this.verificarRequisitos },
                { name: 'Configurar formato mexicano', method: this.configurarFormatoMexicano },
                { name: 'Cargar librerías externas', method: this.verificarYCargarLibrerias },
                { name: 'Inicializar almacenamiento', method: this.inicializarAlmacenamiento },
                { name: 'Inicializar componentes', method: this.inicializarComponentes },
                { name: 'Configurar navegación', method: this.configurarNavegacion },
                { name: 'Configurar eventos', method: this.configurarEventos },
                { name: 'Inicializar tema', method: this.inicializarTema },
                { name: 'Mostrar aplicación', method: this.mostrarAplicacion }
            ];

            for (const step of initSteps) {
                this.logger.info(`Ejecutando: ${step.name}`);
                await step.method.call(this);
                this.logger.success(`✅ ${step.name} completado`);
            }

            this.logger.success('🎉 Aplicación inicializada correctamente para México 🇲🇽');
            
        } catch (error) {
            this.logger.error('💥 Error al inicializar aplicación:', error);
            await this.mostrarError(`Error al cargar la aplicación: ${error.message}`);
        }
    }

    /**
     * Inicializar componentes usando el inyector de dependencias
     */
    async inicializarComponentes() {
        const componenteConfig = [
            { name: 'consultas', key: 'consultas' },
            { name: 'modals', key: 'modals' },
            { name: 'calendarioIngresos', key: 'calendarioIngresos' },
            { name: 'calendarioGastos', key: 'calendarioGastos' }
        ];

        for (const config of componenteConfig) {
            try {
                const componente = this.di.resolve(config.name);
                
                if (componente.init) {
                    await componente.init();
                }
                
                this.componentes.set(config.key, componente);
                this.logger.success(`✅ Componente ${config.name} inicializado`);
                
            } catch (error) {
                this.logger.error(`❌ Error al inicializar ${config.name}:`, error);
                throw error;
            }
        }

        // Configurar callbacks entre componentes
        this.configurarCallbacks();
    }

    /**
     * Configurar comunicación entre componentes usando el patrón Observer
     */
    configurarCallbacks() {
        const modals = this.componentes.get('modals');
        const consultas = this.componentes.get('consultas');
        const calendarioIngresos = this.componentes.get('calendarioIngresos');
        const calendarioGastos = this.componentes.get('calendarioGastos');

        if (modals && consultas) {
            // Usar patrón Observer en lugar de callbacks directos
            modals.on('ingresoSaved', () => {
                consultas.refresh();
                calendarioIngresos?.refresh();
            });

            modals.on('gastoSaved', () => {
                consultas.refresh();
                calendarioGastos?.refresh();
            });
        }
    }

    /**
     * Obtener componente por nombre
     */
    getComponent(name) {
        return this.componentes.get(name);
    }

    /**
     * Método mejorado para manejo de errores
     */
    async mostrarError(mensaje, detalles = null) {
        const alertas = this.di.resolve('alertas');
        
        if (detalles) {
            this.logger.error('Detalles del error:', detalles);
        }
        
        await alertas.error('Error', mensaje);
    }

    /**
     * Verificar requisitos del sistema
     */
    verificarRequisitos() {
        const requisitos = [
            {
                name: 'localStorage',
                check: () => typeof Storage !== 'undefined',
                error: 'LocalStorage no está disponible'
            },
            {
                name: 'Promises',
                check: () => typeof Promise !== 'undefined',
                error: 'Promises no están disponibles'
            },
            {
                name: 'Fetch API',
                check: () => typeof fetch !== 'undefined',
                error: 'Fetch API no está disponible'
            }
        ];

        for (const requisito of requisitos) {
            if (!requisito.check()) {
                throw new Error(requisito.error);
            }
        }

        return true;
    }

    // ... resto de métodos manteniendo la funcionalidad existente
    // pero refactorizados para usar la nueva arquitectura
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Asegurar que el DI esté disponible
        if (typeof window.DI === 'undefined') {
            throw new Error('Sistema de inyección de dependencias no disponible');
        }
        
        const app = new GestorFinanciero(window.DI);
        window.gestorApp = app; // Solo para compatibilidad con código existente
        await app.init();
        
    } catch (error) {
        console.error('❌ Error crítico al inicializar la aplicación:', error);
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #ef4444;">
                <h2>Error al cargar la aplicación</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()">Recargar</button>
            </div>
        `;
    }
});
