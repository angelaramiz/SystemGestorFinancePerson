/**
 * Sistema de Métricas y Monitoreo de Performance
 * Recolecta datos sobre el rendimiento y uso de la aplicación
 */

class MetricsSystem {
    constructor() {
        this.metrics = new Map();
        this.performanceMarks = new Map();
        this.userInteractions = [];
        this.errorCount = 0;
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.setupPerformanceObserver();
        this.setupErrorTracking();
    }

    /**
     * Configurar observador de performance
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                // Observar navegación y carga de recursos
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordPerformanceEntry(entry);
                    }
                });

                observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
                
                // Observar First Paint y First Contentful Paint
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordMetric(`paint.${entry.name}`, entry.startTime);
                    }
                });

                paintObserver.observe({ entryTypes: ['paint'] });

            } catch (error) {
                console.warn('PerformanceObserver no soportado completamente:', error);
            }
        }
    }

    /**
     * Configurar tracking de errores
     */
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
        });
    }

    /**
     * Registrar una métrica
     */
    recordMetric(name, value, metadata = {}) {
        const timestamp = Date.now();
        const metric = {
            name,
            value,
            timestamp,
            sessionId: this.sessionId,
            metadata
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        this.metrics.get(name).push(metric);

        // Mantener solo las últimas 100 entradas por métrica
        const entries = this.metrics.get(name);
        if (entries.length > 100) {
            entries.shift();
        }

        // Emitir evento para sistemas de monitoreo externos
        window.EventBus?.emit('metrics:recorded', { metric });
    }

    /**
     * Registrar entrada de performance
     */
    recordPerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                this.recordNavigationMetrics(entry);
                break;
            case 'resource':
                this.recordResourceMetrics(entry);
                break;
            case 'measure':
                this.recordMeasureMetrics(entry);
                break;
        }
    }

    /**
     * Registrar métricas de navegación
     */
    recordNavigationMetrics(entry) {
        const metrics = {
            'navigation.dns': entry.domainLookupEnd - entry.domainLookupStart,
            'navigation.connect': entry.connectEnd - entry.connectStart,
            'navigation.request': entry.responseStart - entry.requestStart,
            'navigation.response': entry.responseEnd - entry.responseStart,
            'navigation.dom_content_loaded': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            'navigation.load_complete': entry.loadEventEnd - entry.loadEventStart,
            'navigation.total_time': entry.loadEventEnd - entry.navigationStart
        };

        for (const [name, value] of Object.entries(metrics)) {
            if (value >= 0) {
                this.recordMetric(name, value);
            }
        }
    }

    /**
     * Registrar métricas de recursos
     */
    recordResourceMetrics(entry) {
        const resourceType = this.categorizeResource(entry.name);
        
        this.recordMetric(`resource.${resourceType}.duration`, entry.duration, {
            url: entry.name,
            size: entry.transferSize
        });

        if (entry.transferSize) {
            this.recordMetric(`resource.${resourceType}.size`, entry.transferSize);
        }
    }

    /**
     * Registrar métricas de medidas personalizadas
     */
    recordMeasureMetrics(entry) {
        this.recordMetric(`measure.${entry.name}`, entry.duration, {
            detail: entry.detail
        });
    }

    /**
     * Categorizar tipo de recurso
     */
    categorizeResource(url) {
        if (url.includes('.js')) return 'script';
        if (url.includes('.css')) return 'style';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
        if (url.includes('font')) return 'font';
        return 'other';
    }

    /**
     * Iniciar medición de performance
     */
    startMeasure(name, detail = {}) {
        const markName = `${name}_start`;
        performance.mark(markName);
        
        this.performanceMarks.set(name, {
            startMark: markName,
            startTime: Date.now(),
            detail
        });

        return name;
    }

    /**
     * Finalizar medición de performance
     */
    endMeasure(name, additionalDetail = {}) {
        const measureData = this.performanceMarks.get(name);
        if (!measureData) {
            console.warn(`No se encontró medición iniciada para: ${name}`);
            return null;
        }

        const endMarkName = `${name}_end`;
        performance.mark(endMarkName);
        
        const measureName = `measure_${name}`;
        performance.measure(measureName, measureData.startMark, endMarkName);

        const duration = Date.now() - measureData.startTime;
        
        this.recordMetric(`performance.${name}`, duration, {
            ...measureData.detail,
            ...additionalDetail
        });

        this.performanceMarks.delete(name);
        
        return duration;
    }

    /**
     * Registrar interacción del usuario
     */
    recordUserInteraction(type, element, metadata = {}) {
        const interaction = {
            type,
            element: element?.tagName || 'unknown',
            elementId: element?.id,
            elementClass: element?.className,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            metadata
        };

        this.userInteractions.push(interaction);

        // Mantener solo las últimas 50 interacciones
        if (this.userInteractions.length > 50) {
            this.userInteractions.shift();
        }

        this.recordMetric(`interaction.${type}`, 1, metadata);
    }

    /**
     * Registrar error
     */
    recordError(errorInfo) {
        this.errorCount++;
        
        const error = {
            ...errorInfo,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            errorId: `error_${this.errorCount}_${Date.now()}`
        };

        this.recordMetric('error.count', 1, error);
        
        // Emitir evento para manejo de errores
        window.EventBus?.emit('metrics:error-recorded', { error });
    }

    /**
     * Obtener resumen de métricas
     */
    getMetricsSummary() {
        const summary = {
            session: {
                id: this.sessionId,
                duration: Date.now() - this.startTime,
                startTime: this.startTime
            },
            performance: {},
            userActivity: {
                totalInteractions: this.userInteractions.length,
                errorCount: this.errorCount,
                interactionTypes: this.getInteractionSummary()
            },
            resources: this.getResourceSummary()
        };

        // Agregar estadísticas de performance
        for (const [metricName, entries] of this.metrics.entries()) {
            if (metricName.startsWith('performance.') || metricName.startsWith('navigation.')) {
                const values = entries.map(e => e.value);
                summary.performance[metricName] = {
                    count: values.length,
                    average: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    latest: values[values.length - 1]
                };
            }
        }

        return summary;
    }

    /**
     * Obtener resumen de interacciones
     */
    getInteractionSummary() {
        const summary = {};
        
        for (const interaction of this.userInteractions) {
            if (!summary[interaction.type]) {
                summary[interaction.type] = 0;
            }
            summary[interaction.type]++;
        }
        
        return summary;
    }

    /**
     * Obtener resumen de recursos
     */
    getResourceSummary() {
        const summary = {
            totalResources: 0,
            totalSize: 0,
            byType: {}
        };

        for (const [metricName, entries] of this.metrics.entries()) {
            if (metricName.startsWith('resource.')) {
                const [, resourceType, metricType] = metricName.split('.');
                
                if (!summary.byType[resourceType]) {
                    summary.byType[resourceType] = { count: 0, totalSize: 0 };
                }

                if (metricType === 'duration') {
                    summary.byType[resourceType].count = entries.length;
                    summary.totalResources += entries.length;
                } else if (metricType === 'size') {
                    const totalSize = entries.reduce((sum, entry) => sum + entry.value, 0);
                    summary.byType[resourceType].totalSize = totalSize;
                    summary.totalSize += totalSize;
                }
            }
        }

        return summary;
    }

    /**
     * Exportar datos de métricas
     */
    exportMetrics() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            metrics: Object.fromEntries(this.metrics),
            userInteractions: this.userInteractions,
            summary: this.getMetricsSummary()
        };
    }

    /**
     * Generar ID de sesión único
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Limpiar métricas antiguas
     */
    clearOldMetrics(maxAge = 3600000) { // 1 hora por defecto
        const cutoff = Date.now() - maxAge;
        
        for (const [metricName, entries] of this.metrics.entries()) {
            const filteredEntries = entries.filter(entry => entry.timestamp > cutoff);
            this.metrics.set(metricName, filteredEntries);
        }

        this.userInteractions = this.userInteractions.filter(
            interaction => interaction.timestamp > cutoff
        );
    }
}

// Configurar tracking automático de interacciones comunes
const setupInteractionTracking = (metrics) => {
    // Clicks
    document.addEventListener('click', (event) => {
        metrics.recordUserInteraction('click', event.target, {
            x: event.clientX,
            y: event.clientY
        });
    });

    // Envío de formularios
    document.addEventListener('submit', (event) => {
        metrics.recordUserInteraction('form_submit', event.target, {
            formId: event.target.id
        });
    });

    // Cambios de navegación (si existe el router)
    window.EventBus?.on('ui:tab-changed', (data) => {
        metrics.recordUserInteraction('navigation', null, {
            from: data.from,
            to: data.to
        });
    });
};

// Crear instancia global
window.MetricsSystem = new MetricsSystem();

// Configurar tracking cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupInteractionTracking(window.MetricsSystem);
    });
} else {
    setupInteractionTracking(window.MetricsSystem);
}
