/**
 * Sistema de Inyección de Dependencias
 * Elimina el uso de variables globales y mejora el desacoplamiento
 */

class DependencyInjector {
    constructor() {
        this.dependencies = new Map();
        this.singletons = new Map();
    }

    /**
     * Registrar una dependencia
     */
    register(name, factory, options = {}) {
        this.dependencies.set(name, {
            factory,
            singleton: options.singleton || false
        });
    }

    /**
     * Resolver una dependencia
     */
    resolve(name) {
        if (!this.dependencies.has(name)) {
            throw new Error(`Dependencia '${name}' no encontrada`);
        }

        const dependency = this.dependencies.get(name);
        
        if (dependency.singleton) {
            if (!this.singletons.has(name)) {
                this.singletons.set(name, dependency.factory(this));
            }
            return this.singletons.get(name);
        }

        return dependency.factory(this);
    }

    /**
     * Inyectar dependencias en una clase
     */
    inject(target, dependencies) {
        for (const [key, depName] of Object.entries(dependencies)) {
            target[key] = this.resolve(depName);
        }
        return target;
    }
}

// Configuración de dependencias
const configureDependencies = (di) => {
    // Servicios básicos
    di.register('logger', () => new Logger(), { singleton: true });
    di.register('storage', (di) => new StorageManager(di.resolve('logger')), { singleton: true });
    di.register('alertas', () => new AlertasSweetAlert(), { singleton: true });
    
    // Configuración
    di.register('config', () => window.CONFIGURACION_MEXICO || {}, { singleton: true });
    
    // Módulos principales
    di.register('modals', (di) => new GestorModales(di.resolve('storage'), di.resolve('alertas')));
    di.register('consultas', (di) => new ModuloConsultas(di.resolve('storage')));
    di.register('calendarioIngresos', (di) => new CalendarioIngresos(di.resolve('storage'), di.resolve('config')));
    di.register('calendarioGastos', (di) => new CalendarioGastos(di.resolve('storage'), di.resolve('config')));
};

// Exportar instancia global
window.DI = new DependencyInjector();
configureDependencies(window.DI);
