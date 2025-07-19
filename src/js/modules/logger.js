/**
 * Sistema de Logging Profesional
 * Solo activo en modo desarrollador
 */

class Logger {
    constructor() {
        // Detectar modo desarrollador
        this.isDev = this.isDevMode();
        this.isVerbose = this.isVerboseMode();
        
        // Configuración de colores para console
        this.colors = {
            success: '#22c55e',
            error: '#ef4444', 
            warning: '#f59e0b',
            info: '#3b82f6',
            debug: '#6b7280'
        };
        
        if (this.isDev) {
            console.log('%c🛠️ Modo Desarrollador Activo', `color: ${this.colors.info}; font-weight: bold;`);
        }
    }
    
    /**
     * Detectar si estamos en modo desarrollador
     */
    isDevMode() {
        // Detectar por URL, localStorage o parámetro
        const urlParams = new URLSearchParams(window.location.search);
        const devMode = urlParams.get('dev') === 'true' || 
                       localStorage.getItem('dev-mode') === 'true' ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
        return devMode;
    }
    
    /**
     * Detectar modo verbose (logs detallados)
     */
    isVerboseMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('verbose') === 'true' || 
               localStorage.getItem('verbose-logs') === 'true';
    }
    
    /**
     * Log de éxito
     */
    success(message, ...args) {
        if (this.isDev) {
            console.log(`%c✅ ${message}`, `color: ${this.colors.success}`, ...args);
        }
    }
    
    /**
     * Log de error (siempre visible)
     */
    error(message, ...args) {
        console.error(`❌ ${message}`, ...args);
    }
    
    /**
     * Log de advertencia
     */
    warn(message, ...args) {
        if (this.isDev) {
            console.warn(`⚠️ ${message}`, ...args);
        }
    }
    
    /**
     * Log de información
     */
    info(message, ...args) {
        if (this.isDev) {
            console.log(`%c📋 ${message}`, `color: ${this.colors.info}`, ...args);
        }
    }
    
    /**
     * Log de debug (solo en modo verbose)
     */
    debug(message, ...args) {
        if (this.isDev && this.isVerbose) {
            console.log(`%c🔍 ${message}`, `color: ${this.colors.debug}`, ...args);
        }
    }
    
    /**
     * Log de inicio de sección
     */
    section(title) {
        if (this.isDev) {
            console.group(`%c🚀 ${title}`, `color: ${this.colors.info}; font-weight: bold;`);
        }
    }
    
    /**
     * Fin de sección
     */
    sectionEnd() {
        if (this.isDev) {
            console.groupEnd();
        }
    }
    
    /**
     * Log de inicialización
     */
    init(appName, version) {
        if (this.isDev) {
            console.log(
                `%c🚀 ${appName} v${version}`, 
                `color: ${this.colors.success}; font-size: 16px; font-weight: bold;`
            );
        }
    }
    
    /**
     * Activar/desactivar modo desarrollador
     */
    static toggleDevMode() {
        const currentMode = localStorage.getItem('dev-mode') === 'true';
        localStorage.setItem('dev-mode', (!currentMode).toString());
        window.location.reload();
    }
    
    /**
     * Activar/desactivar modo verbose
     */
    static toggleVerboseMode() {
        const currentMode = localStorage.getItem('verbose-logs') === 'true';
        localStorage.setItem('verbose-logs', (!currentMode).toString());
        window.location.reload();
    }
}

// Crear instancia global única
if (!window.logger) {
    window.logger = new Logger();
    window.Logger = Logger; // Clase para métodos estáticos
    
    // Comandos de consola para desarrolladores
    if (window.logger.isDev) {
        window.devMode = {
            enable: () => Logger.toggleDevMode(),
            disable: () => Logger.toggleDevMode(),
            verbose: () => Logger.toggleVerboseMode(),
            help: () => {
                console.log(`
%c🛠️ Comandos de Desarrollador:
%cdevMode.enable()   - Activar logs de desarrollo
%cdevMode.disable()  - Desactivar logs
%cdevMode.verbose()  - Toggle logs detallados
%cdevMode.help()     - Mostrar esta ayuda

%c🔗 URLs útiles:
%c?dev=true         - Activar modo dev por URL
%c?verbose=true     - Activar logs detallados
                `, 
                'color: #3b82f6; font-weight: bold;',
                'color: #22c55e;',
                'color: #22c55e;', 
                'color: #22c55e;',
                'color: #22c55e;',
                'color: #f59e0b; font-weight: bold;',
                'color: #6b7280;',
                'color: #6b7280;'
                );
            }
        };
        
        // Mostrar ayuda automáticamente
        setTimeout(() => {
            console.log('%cEscribe devMode.help() para ver comandos disponibles', 'color: #6b7280;');
        }, 1000);
    }
}

// 🌍 Hacer Logger disponible globalmente
window.Logger = Logger;

// 📤 Export para módulos ES6 (si se necesita)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
