/**
 * Sistema de almacenamiento híbrido
 * Maneja datos tanto en Supabase como en localStorage
 */

class StorageManager {
    constructor() {
        this.useSupabase = false;
        this.localStorageKeys = {
            ingresos: 'gestor_ingresos',
            gastos: 'gestor_gastos',
            categorias: 'gestor_categorias',
            config: 'gestor_config'
        };
        
        // Categorías por defecto
        this.defaultCategories = {
            ingresos: [
                { id: 'cat_ing_1', nombre: 'Salario', color: '#10b981' },
                { id: 'cat_ing_2', nombre: 'Freelance', color: '#3b82f6' },
                { id: 'cat_ing_3', nombre: 'Inversiones', color: '#8b5cf6' },
                { id: 'cat_ing_4', nombre: 'Otros', color: '#6b7280' }
            ],
            gastos: [
                { id: 'cat_gas_1', nombre: 'Vivienda', color: '#ef4444' },
                { id: 'cat_gas_2', nombre: 'Alimentación', color: '#f59e0b' },
                { id: 'cat_gas_3', nombre: 'Transporte', color: '#06b6d4' },
                { id: 'cat_gas_4', nombre: 'Salud', color: '#ec4899' },
                { id: 'cat_gas_5', nombre: 'Entretenimiento', color: '#84cc16' },
                { id: 'cat_gas_6', nombre: 'Otros', color: '#6b7280' }
            ]
        };
    }

    /**
     * Inicializar el sistema de almacenamiento
     */
    async init() {
        try {
            // Verificar que SupabaseConfig esté disponible
            if (typeof window.SupabaseConfig === 'undefined') {
                console.warn('⚠️ SupabaseConfig no disponible - usando localStorage');
                this.useSupabase = false;
                this.initLocalStorage();
                return true;
            }
            
            // Intentar inicializar Supabase con reintentos
            this.useSupabase = window.SupabaseConfig.initWithRetry ? 
                window.SupabaseConfig.initWithRetry() : 
                window.SupabaseConfig.init();
            
            if (this.useSupabase) {
                console.log('🔗 Usando Supabase como almacenamiento principal');
                await this.syncWithSupabase();
            } else {
                console.log('💾 Usando localStorage como almacenamiento');
                this.initLocalStorage();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar almacenamiento:', error);
            // Fallback a localStorage
            this.useSupabase = false;
            this.initLocalStorage();
            return false;
        }
    }

    /**
     * Inicializar localStorage con datos por defecto
     */
    initLocalStorage() {
        // Inicializar categorías si no existen
        if (!localStorage.getItem(this.localStorageKeys.categorias)) {
            this.saveToLocalStorage('categorias', this.defaultCategories);
        }
        
        // Inicializar arrays vacíos si no existen
        if (!localStorage.getItem(this.localStorageKeys.ingresos)) {
            this.saveToLocalStorage('ingresos', []);
        }
        
        if (!localStorage.getItem(this.localStorageKeys.gastos)) {
            this.saveToLocalStorage('gastos', []);
        }
        
        // Configuración por defecto
        if (!localStorage.getItem(this.localStorageKeys.config)) {
            this.saveToLocalStorage('config', {
                version: '2.0.0',
                lastSync: null,
                currency: 'EUR'
            });
        }
    }

    /**
     * Sincronizar con Supabase
     */
    async syncWithSupabase() {
        try {
            console.log('🔄 Sincronizando con Supabase...');
            
            // Aquí podrías implementar lógica de sincronización más compleja
            // Por ahora, simplemente verificamos la conexión
            
            const categorias = await window.SupabaseConfig.utils.select('categorias');
            console.log(`✅ Encontradas ${categorias.length} categorías en Supabase`);
            
        } catch (error) {
            console.error('❌ Error al sincronizar con Supabase:', error);
            throw error;
        }
    }

    /**
     * Generar ID único
     */
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Guardar en localStorage
     */
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(this.localStorageKeys[key], JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    }

    /**
     * Obtener de localStorage
     */
    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(this.localStorageKeys[key]);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al obtener de localStorage:', error);
            return null;
        }
    }

    /**
     * INGRESOS - Guardar nuevo ingreso
     */
    async saveIngreso(ingreso) {
        try {
            const nuevoIngreso = {
                id: ingreso.id || this.generateId(),
                tipo: ingreso.tipo,
                descripcion: ingreso.descripcion,
                monto: parseFloat(ingreso.monto),
                fecha: ingreso.fecha,
                categoria: ingreso.categoria || 'Otros',
                notas: ingreso.notas || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (this.useSupabase) {
                const result = await window.SupabaseConfig.utils.insert('ingresos', {
                    tipo: nuevoIngreso.tipo,
                    descripcion: nuevoIngreso.descripcion,
                    monto: nuevoIngreso.monto,
                    fecha: nuevoIngreso.fecha,
                    categoria_custom: nuevoIngreso.categoria,
                    notas: nuevoIngreso.notas
                });
                return result[0];
            } else {
                const ingresos = this.getFromLocalStorage('ingresos') || [];
                ingresos.push(nuevoIngreso);
                this.saveToLocalStorage('ingresos', ingresos);
                return nuevoIngreso;
            }
        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            throw error;
        }
    }

    /**
     * INGRESOS - Obtener todos los ingresos
     */
    async getIngresos(filters = {}) {
        try {
            if (this.useSupabase) {
                return await window.SupabaseConfig.utils.select('ingresos', filters);
            } else {
                let ingresos = this.getFromLocalStorage('ingresos') || [];
                
                // Aplicar filtros básicos
                if (filters.tipo) {
                    ingresos = ingresos.filter(i => i.tipo === filters.tipo);
                }
                if (filters.fecha_desde && filters.fecha_hasta) {
                    ingresos = ingresos.filter(i => 
                        i.fecha >= filters.fecha_desde && i.fecha <= filters.fecha_hasta
                    );
                }
                
                return ingresos;
            }
        } catch (error) {
            console.error('Error al obtener ingresos:', error);
            return [];
        }
    }

    /**
     * GASTOS - Guardar nuevo gasto
     */
    async saveGasto(gasto) {
        try {
            const nuevoGasto = {
                id: gasto.id || this.generateId(),
                tipo: gasto.tipo,
                descripcion: gasto.descripcion,
                monto: parseFloat(gasto.monto),
                fecha: gasto.fecha,
                categoria: gasto.categoria || 'Otros',
                notas: gasto.notas || '',
                estado: 'pendiente',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (this.useSupabase) {
                const result = await window.SupabaseConfig.utils.insert('gastos', {
                    tipo: nuevoGasto.tipo,
                    descripcion: nuevoGasto.descripcion,
                    monto: nuevoGasto.monto,
                    fecha: nuevoGasto.fecha,
                    categoria_custom: nuevoGasto.categoria,
                    notas: nuevoGasto.notas,
                    estado: nuevoGasto.estado
                });
                return result[0];
            } else {
                const gastos = this.getFromLocalStorage('gastos') || [];
                gastos.push(nuevoGasto);
                this.saveToLocalStorage('gastos', gastos);
                return nuevoGasto;
            }
        } catch (error) {
            console.error('Error al guardar gasto:', error);
            throw error;
        }
    }

    /**
     * GASTOS - Obtener todos los gastos
     */
    async getGastos(filters = {}) {
        try {
            if (this.useSupabase) {
                return await window.SupabaseConfig.utils.select('gastos', filters);
            } else {
                let gastos = this.getFromLocalStorage('gastos') || [];
                
                // Aplicar filtros básicos
                if (filters.tipo) {
                    gastos = gastos.filter(g => g.tipo === filters.tipo);
                }
                if (filters.fecha_desde && filters.fecha_hasta) {
                    gastos = gastos.filter(g => 
                        g.fecha >= filters.fecha_desde && g.fecha <= filters.fecha_hasta
                    );
                }
                
                return gastos;
            }
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            return [];
        }
    }

    /**
     * Obtener categorías
     */
    async getCategorias(tipo = null) {
        try {
            if (this.useSupabase) {
                const filters = tipo ? { tipo } : {};
                return await window.SupabaseConfig.utils.select('categorias', filters);
            } else {
                const categorias = this.getFromLocalStorage('categorias') || this.defaultCategories;
                return tipo ? categorias[tipo] || [] : categorias;
            }
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return tipo ? this.defaultCategories[tipo] || [] : this.defaultCategories;
        }
    }

    /**
     * Eliminar elemento
     */
    async deleteItem(tipo, id) {
        try {
            if (this.useSupabase) {
                const table = tipo === 'ingreso' ? 'ingresos' : 'gastos';
                return await window.SupabaseConfig.utils.delete(table, id);
            } else {
                const key = tipo === 'ingreso' ? 'ingresos' : 'gastos';
                const items = this.getFromLocalStorage(key) || [];
                const filtered = items.filter(item => item.id !== id);
                this.saveToLocalStorage(key, filtered);
                return true;
            }
        } catch (error) {
            console.error('Error al eliminar elemento:', error);
            throw error;
        }
    }

    /**
     * Exportar todos los datos
     */
    async exportData() {
        try {
            const ingresos = await this.getIngresos();
            const gastos = await this.getGastos();
            const categorias = await this.getCategorias();
            
            return {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                data: {
                    ingresos,
                    gastos,
                    categorias
                }
            };
        } catch (error) {
            console.error('Error al exportar datos:', error);
            throw error;
        }
    }

    /**
     * Verificar estado de conexión
     */
    getConnectionStatus() {
        const status = {
            supabase: this.useSupabase && window.SupabaseConfig.isAvailable(),
            localStorage: typeof Storage !== 'undefined'
        };
        
        console.log('📊 Estado de conexión detallado:', {
            supabaseIntended: this.useSupabase,
            supabaseAvailable: window.SupabaseConfig?.isAvailable() || false,
            localStorageAvailable: status.localStorage
        });
        
        return status;
    }
    
    /**
     * Forzar reinicialización de Supabase
     */
    async forceSupabaseInit() {
        console.log('🔄 Forzando reinicialización de Supabase...');
        
        // Verificar que SupabaseConfig esté disponible
        if (typeof window.SupabaseConfig === 'undefined') {
            console.log('❌ SupabaseConfig no está disponible');
            return false;
        }
        
        // Intentar inicializar con el método disponible
        this.useSupabase = window.SupabaseConfig.initWithRetry ? 
            window.SupabaseConfig.initWithRetry() : 
            window.SupabaseConfig.init();
        
        if (this.useSupabase) {
            console.log('✅ Supabase inicializado correctamente tras forzar');
            try {
                await this.syncWithSupabase();
            } catch (error) {
                console.warn('⚠️ Error en sync inicial:', error);
            }
        } else {
            console.log('❌ No se pudo inicializar Supabase tras forzar');
        }
        
        return this.useSupabase;
    }
}

// Crear instancia global
window.StorageManager = new StorageManager();
