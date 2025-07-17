/**
 * Aplicación principal - Gestor Financiero Personal v2.0
 * Coordina todos los módulos y gestiona el estado global
 */

class GestorFinancieroApp {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.components = {};
        this.currentTab = 'ingresos';
        
        console.log(`🚀 Iniciando Gestor Financiero Personal v${this.version}`);
    }

    /**
     * Inicialización principal de la aplicación
     */
    async init() {
        try {
            console.log('📋 Iniciando aplicación...');
            
            // 1. Verificar requisitos
            this.verificarRequisitos();
            
            // 2. Inicializar almacenamiento
            await this.inicializarAlmacenamiento();
            
            // 3. Inicializar componentes
            await this.inicializarComponentes();
            
            // 4. Configurar navegación
            this.configurarNavegacion();
            
            // 5. Configurar eventos globales
            this.configurarEventosGlobales();
            
            // 6. Finalizar inicialización
            this.finalizarInicializacion();
            
        } catch (error) {
            console.error('❌ Error durante la inicialización:', error);
            this.mostrarError('Error al inicializar la aplicación');
        }
    }

    verificarRequisitos() {
        const requisitos = [
            () => typeof Storage !== 'undefined',
            () => typeof fetch !== 'undefined',
            () => typeof Promise !== 'undefined',
            () => window.FullCalendar !== undefined,
            () => window.Chart !== undefined
        ];

        const fallos = requisitos.filter(req => {
            try {
                return !req();
            } catch {
                return true;
            }
        });

        if (fallos.length > 0) {
            throw new Error('Requisitos del navegador no cumplidos');
        }

        console.log('✅ Verificación de requisitos completada');
    }

    async inicializarAlmacenamiento() {
        console.log('💾 Inicializando sistema de almacenamiento...');
        
        if (!window.StorageManager) {
            throw new Error('StorageManager no disponible');
        }
        
        const success = await window.StorageManager.init();
        if (!success) {
            console.warn('⚠️ Problemas al inicializar almacenamiento, usando fallback');
        }
        
        // Mostrar estado de conexión
        const status = window.StorageManager.getConnectionStatus();
        console.log('📊 Estado de almacenamiento:', status);
        
        this.components.storage = window.StorageManager;
    }

    async inicializarComponentes() {
        console.log('🔧 Inicializando componentes...');
        
        try {
            // Inicializar gestor de modales
            this.components.modales = new GestorModales(this.components.storage);
            window.GestorModales = this.components.modales;
            
            // Inicializar calendarios
            this.components.calendarioIngresos = new CalendarioIngresos(this.components.storage);
            window.CalendarioIngresos = this.components.calendarioIngresos;
            
            this.components.calendarioGastos = new CalendarioGastos(this.components.storage);
            window.CalendarioGastos = this.components.calendarioGastos;
            
            // Inicializar módulo de consultas
            this.components.consultas = new ModuloConsultas(this.components.storage);
            window.ModuloConsultas = this.components.consultas;
            
            console.log('✅ Componentes inicializados correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar componentes:', error);
            throw error;
        }
    }

    configurarNavegacion() {
        console.log('🧭 Configurando navegación...');
        
        // Obtener todos los tabs de navegación
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.cambiarTab(targetTab, navTabs, tabContents);
            });
        });
        
        // Establecer tab inicial
        this.cambiarTab(this.currentTab, navTabs, tabContents);
    }

    cambiarTab(targetTab, navTabs, tabContents) {
        // Actualizar estado
        this.currentTab = targetTab;
        
        // Actualizar navegación visual
        navTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        const activeTab = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(`tab-${targetTab}`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        // Ejecutar callbacks específicos del tab
        this.onTabChange(targetTab);
        
        console.log(`📱 Cambiado a tab: ${targetTab}`);
    }

    onTabChange(tabName) {
        switch (tabName) {
            case 'ingresos':
                // Refrescar calendario de ingresos si es necesario
                if (this.components.calendarioIngresos?.calendar) {
                    this.components.calendarioIngresos.calendar.updateSize();
                }
                break;
                
            case 'gastos':
                // Refrescar calendario de gastos si es necesario
                if (this.components.calendarioGastos?.calendar) {
                    this.components.calendarioGastos.calendar.updateSize();
                }
                break;
                
            case 'consultas':
                // Refrescar datos de consultas
                if (this.components.consultas) {
                    // Los datos se cargan automáticamente en el init
                }
                break;
        }
    }

    configurarEventosGlobales() {
        console.log('🎯 Configurando eventos globales...');
        
        // Botón de sincronización
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                await this.sincronizarDatos();
            });
        }
        
        // Botón de configuración
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.mostrarConfiguracion();
            });
        }
        
        // Manejar visibilidad de la página para optimización
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.onAppVisible();
            }
        });
        
        // Manejar errores globales
        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
        });

        // Manejar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada:', event.reason);
        });
    }

    async sincronizarDatos() {
        console.log('🔄 Iniciando sincronización...');
        
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.disabled = true;
            syncBtn.innerHTML = '⏳ Sincronizando...';
        }
        
        try {
            // Si Supabase está disponible, intentar sincronizar
            if (this.components.storage.useSupabase) {
                await this.components.storage.syncWithSupabase();
                
                // Refrescar todos los componentes
                await this.refrescarTodosLosComponentes();
                
                this.components.modales.mostrarNotificacion('✅ Sincronización completada', 'success');
            } else {
                this.components.modales.mostrarNotificacion('⚠️ Supabase no configurado', 'warning');
            }
            
        } catch (error) {
            console.error('Error en sincronización:', error);
            this.components.modales.mostrarNotificacion('❌ Error en sincronización', 'error');
        } finally {
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = '🔄 Sync';
            }
        }
    }

    async refrescarTodosLosComponentes() {
        try {
            if (this.components.calendarioIngresos) {
                await this.components.calendarioIngresos.refrescarCalendario();
            }
            
            if (this.components.calendarioGastos) {
                await this.components.calendarioGastos.refrescarCalendario();
            }
            
            if (this.components.consultas) {
                await this.components.consultas.cargarDatosIniciales();
            }
        } catch (error) {
            console.error('Error al refrescar componentes:', error);
        }
    }

    mostrarConfiguracion() {
        const configHTML = `
            <div class="config-panel">
                <h4>⚙️ Configuración</h4>
                <div class="config-section">
                    <h5>🔗 Estado de Conexión</h5>
                    <div class="status-item">
                        <span>Supabase:</span>
                        <span class="${this.components.storage.useSupabase ? 'text-success' : 'text-warning'}">
                            ${this.components.storage.useSupabase ? '✅ Conectado' : '⚠️ No configurado'}
                        </span>
                    </div>
                    <div class="status-item">
                        <span>LocalStorage:</span>
                        <span class="text-success">✅ Disponible</span>
                    </div>
                </div>
                
                <div class="config-section">
                    <h5>📊 Información de la App</h5>
                    <div class="info-item">
                        <span>Versión:</span>
                        <span>${this.version}</span>
                    </div>
                    <div class="info-item">
                        <span>Última inicialización:</span>
                        <span>${new Date().toLocaleString('es-ES')}</span>
                    </div>
                </div>
                
                ${!this.components.storage.useSupabase ? `
                <div class="config-section">
                    <h5>🛠️ Configurar Supabase</h5>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        Para habilitar la sincronización en la nube, edita el archivo 
                        <code>src/js/modules/supabase-config.js</code> con tus credenciales de Supabase.
                    </p>
                    <button onclick="window.open('https://supabase.com', '_blank')" class="btn btn-primary">
                        🌐 Ir a Supabase
                    </button>
                </div>
                ` : ''}
                
                <div class="config-actions">
                    <button onclick="window.GestorFinancieroApp.exportarConfiguracion()" class="btn btn-secondary">
                        📤 Exportar Datos
                    </button>
                    <button onclick="document.querySelector('.temp-modal').remove()" class="btn btn-secondary">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        this.components.modales.mostrarModal('Configuración', configHTML);
    }

    async exportarConfiguracion() {
        try {
            const datos = await this.components.storage.exportData();
            const blob = new Blob([JSON.stringify(datos, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gestor-financiero-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.components.modales.mostrarNotificacion('✅ Datos exportados correctamente', 'success');
        } catch (error) {
            console.error('Error al exportar:', error);
            this.components.modales.mostrarNotificacion('❌ Error al exportar datos', 'error');
        }
    }

    onAppVisible() {
        // Ejecutar cuando la app vuelve a ser visible
        console.log('👁️ Aplicación visible, verificando actualizaciones...');
        
        // Aquí podrías implementar lógica para refrescar datos
        // si la app ha estado en segundo plano por mucho tiempo
    }

    finalizarInicializacion() {
        // Ocultar loader
        const loader = document.getElementById('app-loader');
        const app = document.getElementById('app');
        
        if (loader) loader.style.display = 'none';
        if (app) app.style.display = 'block';
        
        this.initialized = true;
        console.log('✅ Aplicación inicializada correctamente');
        
        // Mostrar mensaje de bienvenida
        setTimeout(() => {
            this.components.modales.mostrarNotificacion(
                '🎉 ¡Bienvenido al Gestor Financiero Personal!',
                'success'
            );
        }, 500);
    }

    mostrarError(mensaje) {
        // Mostrar error en caso de fallo crítico
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.innerHTML = `
                <div class="loader-content">
                    <div style="color: var(--danger-color); font-size: 3rem;">❌</div>
                    <h3 style="color: var(--danger-color);">Error de Inicialización</h3>
                    <p>${mensaje}</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        🔄 Recargar Aplicación
                    </button>
                </div>
            `;
        }
    }

    // Método para acceso global
    static async exportarConfiguracion() {
        if (window.GestorFinancieroApp?.components?.storage) {
            try {
                const datos = await window.GestorFinancieroApp.components.storage.exportData();
                const blob = new Blob([JSON.stringify(datos, null, 2)], {
                    type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gestor-financiero-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                window.GestorModales?.mostrarNotificacion('✅ Datos exportados', 'success');
            } catch (error) {
                console.error('Error al exportar:', error);
                window.GestorModales?.mostrarNotificacion('❌ Error al exportar', 'error');
            }
        }
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.GestorFinancieroApp = new GestorFinancieroApp();
    await window.GestorFinancieroApp.init();
});
