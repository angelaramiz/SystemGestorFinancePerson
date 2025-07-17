/**
 * Sistema de Logging para Gestor Financiero Personal
 * Solo activo en modo desarrollador
 */

class Logger {
    constructor() {
        // Solo activar logs si está en modo desarrollo
        this.isDevelopment = this.checkDevelopmentMode();
        this.isEnabled = this.isDevelopment;
    }

    checkDevelopmentMode() {
        // Detectar modo desarrollo
        const url = window.location.href;
        return url.includes('localhost') || 
               url.includes('127.0.0.1') || 
               url.includes('dev=true') ||
               url.includes('debug=true') ||
               localStorage.getItem('dev-mode') === 'true';
    }

    // Activar/Desactivar logs manualmente
    enable() { this.isEnabled = true; }
    disable() { this.isEnabled = false; }

    // Métodos de logging
    log(...args) {
        if (this.isEnabled) console.log(...args);
    }

    info(...args) {
        if (this.isEnabled) console.info(...args);
    }

    warn(...args) {
        if (this.isEnabled) console.warn(...args);
    }

    error(...args) {
        if (this.isEnabled) console.error(...args);
    }

    success(message) {
        if (this.isEnabled) console.log(`✅ ${message}`);
    }

    loading(message) {
        if (this.isEnabled) console.log(`⏳ ${message}`);
    }

    database(message) {
        if (this.isEnabled) console.log(`💾 ${message}`);
    }

    api(message) {
        if (this.isEnabled) console.log(`🔗 ${message}`);
    }

    // Comando secreto para activar logs
    enableDevMode() {
        localStorage.setItem('dev-mode', 'true');
        this.isEnabled = true;
        console.log('🔧 Modo desarrollador activado');
        console.log('💡 Para desactivar: logger.disableDevMode()');
    }

    disableDevMode() {
        localStorage.removeItem('dev-mode');
        this.isEnabled = false;
        console.log('✅ Modo desarrollador desactivado');
    }
}

// Instancia global
const logger = new Logger();

// Hacer disponible globalmente para debugging
window.logger = logger;
