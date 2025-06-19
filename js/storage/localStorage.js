/**
 * Gestión de localStorage para datos temporales y configuraciones
 * Según la especificación: almacenar configuraciones temporales, estado de UI, recordatorios
 */

class LocalStorageManager {
    constructor() {
        this.PREFIX = 'sgfp_'; // Sistema Gestor Financiero Personal
        this.init();
    }

    init() {
        // Verificar disponibilidad de localStorage
        if (!this.isAvailable()) {
            console.warn('localStorage no está disponible');
            return false;
        }

        // Inicializar configuraciones por defecto si no existen
        this.initDefaultSettings();
        return true;
    }

    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    initDefaultSettings() {
        const defaultSettings = {
            ui: {
                ventanaActiva: 'ingresos',
                temaOscuro: false,
                columnasVisibles: {
                    hojaCalculo: ['periodo', 'ingresos', 'gastos', 'balance', 'acumulado']
                },
                filtrosActivos: {
                    ingresos: { tipo: '', recurrencia: '' },
                    gastos: { prioridad: '', tipo: '' }
                }
            },
            notificaciones: {
                habilitadas: true,
                anticipacionDias: 3,
                recordatoriosVencimientos: true
            },
            proyecciones: {
                periodoDefecto: 6, // meses
                incluirInflacion: false,
                tasaInflacion: 0.03
            },
            respaldos: {
                automatico: true,
                frecuenciaHoras: 24,
                ultimoRespaldo: null
            }
        };

        if (!this.get('configuracion')) {
            this.set('configuracion', defaultSettings);
        }
    }

    // Métodos principales
    set(key, value) {
        try {
            const fullKey = this.PREFIX + key;
            const data = {
                value: value,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error al guardar en localStorage:', e);
            return false;
        }
    }

    get(key) {
        try {
            const fullKey = this.PREFIX + key;
            const item = localStorage.getItem(fullKey);
            if (!item) return null;

            const data = JSON.parse(item);
            return data.value;
        } catch (e) {
            console.error('Error al leer de localStorage:', e);
            return null;
        }
    }

    remove(key) {
        try {
            const fullKey = this.PREFIX + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error('Error al eliminar de localStorage:', e);
            return false;
        }
    }

    clear() {
        try {
            // Solo eliminar claves que empiecen con nuestro prefijo
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.error('Error al limpiar localStorage:', e);
            return false;
        }
    }

    // Métodos específicos para configuración de UI
    setUIState(state) {
        const config = this.get('configuracion') || {};
        config.ui = { ...config.ui, ...state };
        return this.set('configuracion', config);
    }

    getUIState() {
        const config = this.get('configuracion') || {};
        return config.ui || {};
    }

    setVentanaActiva(ventana) {
        return this.setUIState({ ventanaActiva: ventana });
    }

    getVentanaActiva() {
        const ui = this.getUIState();
        return ui.ventanaActiva || 'ingresos';
    }

    // Métodos para filtros
    setFiltros(tipo, filtros) {
        const ui = this.getUIState();
        ui.filtrosActivos = ui.filtrosActivos || {};
        ui.filtrosActivos[tipo] = filtros;
        return this.setUIState(ui);
    }

    getFiltros(tipo) {
        const ui = this.getUIState();
        return ui.filtrosActivos?.[tipo] || {};
    }

    // Métodos para recordatorios temporales
    setRecordatorio(id, recordatorio) {
        const recordatorios = this.get('recordatorios') || {};
        recordatorios[id] = {
            ...recordatorio,
            fechaCreacion: Date.now()
        };
        return this.set('recordatorios', recordatorios);
    }

    getRecordatorios() {
        return this.get('recordatorios') || {};
    }

    eliminarRecordatorio(id) {
        const recordatorios = this.getRecordatorios();
        delete recordatorios[id];
        return this.set('recordatorios', recordatorios);
    }

    // Métodos para configuración de notificaciones
    setConfigNotificaciones(config) {
        const configuracion = this.get('configuracion') || {};
        configuracion.notificaciones = { ...configuracion.notificaciones, ...config };
        return this.set('configuracion', configuracion);
    }

    getConfigNotificaciones() {
        const config = this.get('configuracion') || {};
        return config.notificaciones || {};
    }

    // Métodos para sesión temporal
    setSesion(data) {
        return this.set('sesion', {
            ...data,
            inicioSesion: Date.now()
        });
    }

    getSesion() {
        return this.get('sesion');
    }

    limpiarSesion() {
        return this.remove('sesion');
    }

    // Métodos para estado de sincronización
    setSincronizacion(estado) {
        return this.set('sincronizacion', {
            ultimaSincronizacion: Date.now(),
            estado: estado, // 'sincronizado', 'pendiente', 'error'
            intentos: 0
        });
    }

    getSincronizacion() {
        return this.get('sincronizacion') || { estado: 'nunca' };
    }

    // Métodos de utilidad
    getSize() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.PREFIX)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    getSizeFormatted() {
        const bytes = this.getSize();
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    export() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.PREFIX)) {
                data[key] = localStorage.getItem(key);
            }
        }
        return JSON.stringify(data, null, 2);
    }

    import(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            for (const key in data) {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.setItem(key, data[key]);
                }
            }
            return true;
        } catch (e) {
            console.error('Error al importar datos a localStorage:', e);
            return false;
        }
    }

    // Programar auto-limpieza de datos temporales
    limpiarDatosExpirados() {
        const ahora = Date.now();
        const unDia = 24 * 60 * 60 * 1000;
        
        // Limpiar recordatorios antiguos (más de 30 días)
        const recordatorios = this.getRecordatorios();
        let recordatoriosLimpiados = false;
        
        for (const id in recordatorios) {
            const recordatorio = recordatorios[id];
            if (recordatorio.fechaCreacion && (ahora - recordatorio.fechaCreacion) > (30 * unDia)) {
                delete recordatorios[id];
                recordatoriosLimpiados = true;
            }
        }
        
        if (recordatoriosLimpiados) {
            this.set('recordatorios', recordatorios);
        }

        // Limpiar datos de sesión antiguos
        const sesion = this.getSesion();
        if (sesion && sesion.inicioSesion && (ahora - sesion.inicioSesion) > (7 * unDia)) {
            this.limpiarSesion();
        }
    }

    // Método para debug
    debug() {
        console.group('LocalStorage Debug Info');
        console.log('Tamaño:', this.getSizeFormatted());
        console.log('Configuración:', this.get('configuracion'));
        console.log('UI State:', this.getUIState());
        console.log('Recordatorios:', Object.keys(this.getRecordatorios()).length);
        console.log('Sincronización:', this.getSincronizacion());
        console.groupEnd();
    }

    // Métodos alias para compatibilidad
    obtener(key) {
        return this.get(key);
    }

    guardar(key, value) {
        return this.set(key, value);
    }
}

// Crear instancia global
window.localStorageManager = new LocalStorageManager();

// Auto-limpieza al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    window.localStorageManager.limpiarDatosExpirados();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalStorageManager;
}
