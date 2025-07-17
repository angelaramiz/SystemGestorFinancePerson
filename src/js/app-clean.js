/**
 * Aplicación principal LIMPIA - Gestor Financiero Personal v2.1
 * Coordina todos los módulos y gestiona el estado global
 */

class GestorFinancieroApp {
    constructor() {
        this.version = '2.1.0';
        this.initialized = false;
        this.components = {};
        this.currentTab = 'ingresos';
        
        // Inicializar logger
        if (window.Logger) {
            window.Logger.init('Gestor Financiero Personal', this.version);
        }
    }

    /**
     * Inicialización principal de la aplicación
     */
    async init() {
        try {
            window.Logger?.section('Inicialización de Aplicación');
            
            // 1. Verificar requisitos
            this.verificarRequisitos();
            
            // 2. Verificar y cargar librerías
            await this.verificarYCargarLibrerias();
            
            // 3. Inicializar almacenamiento
            await this.inicializarAlmacenamiento();
            
            // 4. Inicializar componentes
            await this.inicializarComponentes();
            
            // 5. Configurar navegación
            this.configurarNavegacion();
            
            // 6. Configurar eventos globales
            this.configurarEventosGlobales();
            
            // 7. Finalizar inicialización
            this.finalizarInicializacion();
            
            window.Logger?.success('Aplicación inicializada correctamente');
            window.Logger?.sectionEnd();
            
        } catch (error) {
            window.Logger?.error('Error durante la inicialización:', error);
            this.mostrarError('Error al inicializar la aplicación');
        }
    }

    /**
     * Verificar requisitos del navegador
     */
    verificarRequisitos() {
        window.Logger?.section('Verificación de Requisitos');
        
        const requisitos = [
            { name: 'Storage', check: () => typeof Storage !== 'undefined' },
            { name: 'fetch', check: () => typeof fetch !== 'undefined' },
            { name: 'Promise', check: () => typeof Promise !== 'undefined' },
            { name: 'FullCalendar', check: () => window.FullCalendar !== undefined },
            { name: 'Chart.js', check: () => window.Chart !== undefined }
        ];

        const fallos = [];
        requisitos.forEach(req => {
            try {
                const resultado = req.check();
                if (!resultado) {
                    fallos.push(req.name);
                }
                window.Logger?.info(`${req.name}: ${resultado ? '✅' : '❌'}`);
            } catch (error) {
                fallos.push(req.name);
                window.Logger?.warn(`${req.name}: ❌ (Error: ${error.message})`);
            }
        });

        // Solo fallar por requisitos críticos (no por librerías externas)
        const requisitosCriticos = ['Storage', 'fetch', 'Promise'];
        const fallosCriticos = fallos.filter(f => requisitosCriticos.includes(f));

        if (fallosCriticos.length > 0) {
            throw new Error(`Requisitos críticos no cumplidos: ${fallosCriticos.join(', ')}`);
        }

        // Advertir sobre librerías externas pero continuar
        const fallosExternos = fallos.filter(f => !requisitosCriticos.includes(f));
        if (fallosExternos.length > 0) {
            window.Logger?.warn(`Librerías externas no disponibles: ${fallosExternos.join(', ')}`);
            window.Logger?.warn('La aplicación funcionará con funcionalidad limitada');
        }

        window.Logger?.success('Verificación de requisitos completada');
        window.Logger?.sectionEnd();
    }
    
    async verificarYCargarLibrerias() {
        window.Logger?.section('Verificación de Librerías');
        
        // Verificar FullCalendar
        if (!window.FullCalendar) {
            window.Logger?.warn('FullCalendar no disponible - los calendarios tendrán funcionalidad limitada');
        } else {
            window.Logger?.success('FullCalendar disponible');
        }

        // Verificar Chart.js  
        if (!window.Chart) {
            window.Logger?.warn('Chart.js no disponible - los gráficos tendrán funcionalidad limitada');
        } else {
            window.Logger?.success('Chart.js disponible');
        }

        // Esperar a que las librerías se carguen completamente
        window.Logger?.debug('Esperando librerías externas...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar nuevamente después de espera
        if (window.FullCalendar) {
            window.Logger?.success('FullCalendar cargado tras espera');
        }
        if (window.Chart) {
            window.Logger?.success('Chart.js cargado tras espera');
        }
        
        window.Logger?.sectionEnd();
    }

    async inicializarAlmacenamiento() {
        window.Logger?.section('Inicialización de Almacenamiento');
        
        try {
            await window.StorageManager.init();
            const status = window.StorageManager.getConnectionStatus();
            window.Logger?.info('Estado de almacenamiento:', status);
        } catch (error) {
            window.Logger?.warn('Problemas al inicializar almacenamiento, usando fallback');
        }
        
        window.Logger?.sectionEnd();
    }

    async inicializarComponentes() {
        window.Logger?.section('Inicialización de Componentes');
        
        try {
            // Importar módulos dinámicamente si es necesario
            if (!window.CalendarioIngresos) {
                await import('./modules/calendar-ingresos.js');
            }
            if (!window.CalendarioGastos) {
                await import('./modules/calendar-gastos.js');
            }
            if (!window.ModuloConsultas) {
                await import('./modules/consultas.js');
            }

            // Inicializar componentes
            this.components.ingresos = new window.CalendarioIngresos();
            await this.components.ingresos.init();

            this.components.gastos = new window.CalendarioGastos();
            await this.components.gastos.init();

            this.components.consultas = new window.ModuloConsultas();
            await this.components.consultas.init();

            window.Logger?.success('Componentes inicializados correctamente');
            
        } catch (error) {
            window.Logger?.error('Error al inicializar componentes:', error);
            throw error;
        }
        
        window.Logger?.sectionEnd();
    }

    configurarNavegacion() {
        window.Logger?.debug('Configurando navegación...');
        
        // Configurar eventos de navegación
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.dataset.tab;
                this.cambiarTab(targetTab);
            });
        });

        // Configurar tab inicial
        this.cambiarTab(this.currentTab);
    }

    cambiarTab(targetTab) {
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });

        // Remover clase activa de todas las pestañas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Mostrar contenido objetivo
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }

        // Activar pestaña objetivo
        const targetTabElement = document.querySelector(`[data-tab="${targetTab}"]`);
        if (targetTabElement) {
            targetTabElement.classList.add('active');
        }

        this.currentTab = targetTab;
        window.Logger?.debug(`Cambiado a tab: ${targetTab}`);

        // Notificar cambio a componentes
        if (this.components[targetTab] && this.components[targetTab].onTabShow) {
            this.components[targetTab].onTabShow();
        }
    }

    configurarEventosGlobales() {
        window.Logger?.debug('Configurando eventos globales...');
        
        // Configurar botón de sincronización
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                await this.sincronizar();
            });
        }

        // Configurar botón de configuración
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.mostrarConfiguracion();
            });
        }

        // Configurar eventos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S para guardar/sincronizar
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.sincronizar();
            }
        });

        // Configurar detección de errores globales
        window.addEventListener('unhandledrejection', (event) => {
            window.Logger?.error('Promesa rechazada:', event.reason);
        });

        window.addEventListener('error', (event) => {
            window.Logger?.error('Error global:', event.error);
        });
    }

    async sincronizar() {
        try {
            window.Logger?.info('Iniciando sincronización...');
            
            if (window.StorageManager && window.StorageManager.sync) {
                await window.StorageManager.sync();
                this.mostrarNotificacion('Sincronización completada', 'success');
                window.Logger?.success('Sincronización completada');
            } else {
                throw new Error('Sistema de sincronización no disponible');
            }
        } catch (error) {
            window.Logger?.error('Error durante la sincronización:', error);
            this.mostrarNotificacion('Error en la sincronización', 'error');
        }
    }

    mostrarConfiguracion() {
        // Implementar modal de configuración
        window.Logger?.debug('Mostrando configuración...');
        // TODO: Implementar modal de configuración
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.textContent = mensaje;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    finalizarInicializacion() {
        // Ocultar loader
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'none';
        }

        // Mostrar aplicación
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
        }

        this.initialized = true;
    }

    mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-container';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>⚠️ Error de Aplicación</h2>
                <p>${mensaje}</p>
                <button onclick="window.location.reload()">Recargar Aplicación</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    // Métodos estáticos de utilidad
    static async exportarConfiguracion() {
        try {
            const config = {
                version: window.app?.version || '2.1.0',
                timestamp: new Date().toISOString(),
                storage: window.StorageManager?.getConnectionStatus(),
                configuracion: localStorage.getItem('app-config')
            };
            
            const blob = new Blob([JSON.stringify(config, null, 2)], 
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gestor-financiero-config.json';
            a.click();
            
            URL.revokeObjectURL(url);
            window.Logger?.success('Configuración exportada');
        } catch (error) {
            window.Logger?.error('Error al exportar configuración:', error);
        }
    }

    static async reiniciarSupabase() {
        try {
            window.Logger?.info('Reiniciando conexión Supabase...');
            if (window.SupabaseConfig && window.SupabaseConfig.reinitialize) {
                await window.SupabaseConfig.reinitialize();
                window.Logger?.success('Supabase reiniciado correctamente');
            }
        } catch (error) {
            window.Logger?.error('Error al reiniciar Supabase:', error);
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cargar logger primero
        if (!window.Logger) {
            await import('./modules/logger.js');
        }
        
        // Crear y inicializar aplicación
        window.app = new GestorFinancieroApp();
        await window.app.init();
        
    } catch (error) {
        console.error('❌ Error crítico al inicializar:', error);
        document.body.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <h2>⚠️ Error Crítico</h2>
                <p>No se pudo inicializar la aplicación</p>
                <button onclick="window.location.reload()">Recargar</button>
            </div>
        `;
    }
});

// Exponer funciones globales para desarrolladores
window.GestorFinancieroApp = GestorFinancieroApp;
