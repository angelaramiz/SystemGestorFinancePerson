/**
 * Sistema de Eventos Centralizado
 * Implementa el patrón Observer para comunicación entre componentes
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.middleware = [];
        this.logger = window.logger;
    }

    /**
     * Agregar middleware para interceptar eventos
     */
    addMiddleware(middlewareFn) {
        this.middleware.push(middlewareFn);
    }

    /**
     * Registrar un listener para un evento
     */
    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: this._generateId()
        };

        const listeners = this.events.get(eventName);
        listeners.push(listener);
        
        // Ordenar por prioridad (mayor prioridad primero)
        listeners.sort((a, b) => b.priority - a.priority);

        this.logger?.debug(`📡 Listener registrado para evento '${eventName}'`);
        
        // Retornar función para desregistrar
        return () => this.off(eventName, listener.id);
    }

    /**
     * Registrar un listener que se ejecuta solo una vez
     */
    once(eventName, callback, options = {}) {
        return this.on(eventName, callback, { ...options, once: true });
    }

    /**
     * Desregistrar un listener
     */
    off(eventName, listenerId) {
        if (!this.events.has(eventName)) return false;

        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(listener => listener.id === listenerId);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            this.logger?.debug(`📡 Listener removido del evento '${eventName}'`);
            return true;
        }
        
        return false;
    }

    /**
     * Emitir un evento
     */
    async emit(eventName, data = {}, options = {}) {
        const startTime = performance.now();
        
        try {
            // Ejecutar middleware
            for (const middlewareFn of this.middleware) {
                const result = await middlewareFn(eventName, data);
                if (result === false) {
                    this.logger?.warn(`🚫 Evento '${eventName}' cancelado por middleware`);
                    return false;
                }
            }

            if (!this.events.has(eventName)) {
                this.logger?.debug(`📡 No hay listeners para evento '${eventName}'`);
                return true;
            }

            const listeners = this.events.get(eventName);
            const results = [];

            for (const listener of listeners) {
                try {
                    const result = await listener.callback(data, eventName);
                    results.push(result);

                    // Remover listener si es de tipo "once"
                    if (listener.once) {
                        this.off(eventName, listener.id);
                    }

                } catch (error) {
                    this.logger?.error(`❌ Error en listener de evento '${eventName}':`, error);
                    
                    if (options.stopOnError) {
                        throw error;
                    }
                }
            }

            const duration = performance.now() - startTime;
            this.logger?.debug(`📡 Evento '${eventName}' procesado en ${duration.toFixed(2)}ms`);
            
            return results;

        } catch (error) {
            this.logger?.error(`💥 Error crítico al emitir evento '${eventName}':`, error);
            throw error;
        }
    }

    /**
     * Emitir evento de forma síncrona (no recomendado para operaciones pesadas)
     */
    emitSync(eventName, data = {}) {
        if (!this.events.has(eventName)) return true;

        const listeners = this.events.get(eventName);
        
        for (const listener of listeners) {
            try {
                listener.callback(data, eventName);
                
                if (listener.once) {
                    this.off(eventName, listener.id);
                }
            } catch (error) {
                this.logger?.error(`❌ Error en listener síncrono de evento '${eventName}':`, error);
            }
        }
        
        return true;
    }

    /**
     * Obtener estadísticas de eventos
     */
    getStats() {
        const stats = {
            totalEvents: this.events.size,
            totalListeners: 0,
            eventDetails: {}
        };

        for (const [eventName, listeners] of this.events.entries()) {
            stats.totalListeners += listeners.length;
            stats.eventDetails[eventName] = {
                listenerCount: listeners.length,
                hasOnceListeners: listeners.some(l => l.once)
            };
        }

        return stats;
    }

    /**
     * Limpiar todos los eventos
     */
    clear() {
        this.events.clear();
        this.logger?.info('🧹 Todos los eventos han sido limpiados');
    }

    /**
     * Generar ID único para listeners
     */
    _generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Eventos estándar del sistema
const SYSTEM_EVENTS = {
    // Datos
    INGRESO_CREATED: 'ingreso:created',
    INGRESO_UPDATED: 'ingreso:updated',
    INGRESO_DELETED: 'ingreso:deleted',
    GASTO_CREATED: 'gasto:created',
    GASTO_UPDATED: 'gasto:updated',
    GASTO_DELETED: 'gasto:deleted',
    
    // UI
    TAB_CHANGED: 'ui:tab-changed',
    MODAL_OPENED: 'ui:modal-opened',
    MODAL_CLOSED: 'ui:modal-closed',
    THEME_CHANGED: 'ui:theme-changed',
    
    // Sistema
    APP_READY: 'system:app-ready',
    DATA_SYNCED: 'system:data-synced',
    ERROR_OCCURRED: 'system:error-occurred'
};

// Middleware de logging para desarrollo
const loggingMiddleware = (eventName, data) => {
    if (window.logger?.isDevelopment) {
        console.log(`🎯 Evento: ${eventName}`, data);
    }
    return true;
};

// Crear instancia global
window.EventBus = new EventBus();
window.EVENTS = SYSTEM_EVENTS;

// Agregar middleware de desarrollo
if (window.logger?.isDevelopment) {
    window.EventBus.addMiddleware(loggingMiddleware);
}

window.EventBus.logger = window.logger;
