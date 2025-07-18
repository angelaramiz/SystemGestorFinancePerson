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
            
            // Agregar campos de recurrencia si están presentes
            if (ingreso.es_recurrente !== undefined) {
                nuevoIngreso.es_recurrente = ingreso.es_recurrente;
                
                // Nuevos campos de recurrencia
                if (ingreso.frecuencia_recurrencia !== undefined) {
                    nuevoIngreso.frecuencia_recurrencia = ingreso.frecuencia_recurrencia;
                } else if (ingreso.frecuencia !== undefined) {
                    // Compatibilidad con el sistema anterior
                    nuevoIngreso.frecuencia_recurrencia = ingreso.frecuencia;
                }
                
                if (ingreso.dia_recurrencia !== undefined) {
                    nuevoIngreso.dia_recurrencia = ingreso.dia_recurrencia;
                }
                
                if (ingreso.fecha_fin_recurrencia !== undefined) {
                    nuevoIngreso.fecha_fin_recurrencia = ingreso.fecha_fin_recurrencia;
                } else if (ingreso.fecha_fin !== undefined) {
                    // Compatibilidad con el sistema anterior
                    nuevoIngreso.fecha_fin_recurrencia = ingreso.fecha_fin;
                }
                
                nuevoIngreso.activo = ingreso.activo !== undefined ? ingreso.activo : true;
                nuevoIngreso.proximo_pago = ingreso.proximo_pago;
                nuevoIngreso.numero_secuencia = ingreso.numero_secuencia || 1;
                
                // Campos del sistema anterior para compatibilidad
                if (ingreso.intervalo_dias !== undefined) {
                    nuevoIngreso.intervalo_dias = ingreso.intervalo_dias;
                }
                
                if (ingreso.ingreso_padre_id) {
                    nuevoIngreso.ingreso_padre_id = ingreso.ingreso_padre_id;
                }
            }

            if (this.useSupabase) {
                try {
                    const dataForSupabase = this.mapFrontendToSupabase(nuevoIngreso, 'ingreso');
                    const result = await window.SupabaseConfig.utils.insert('ingresos', dataForSupabase);
                    return this.mapSupabaseToFrontend(result[0], 'ingreso');
                } catch (supabaseError) {
                    // Verificar si el error es por campos de recurrencia que no existen
                    if (supabaseError && supabaseError.code === '42703' && ingreso.es_recurrente) {
                        console.warn('⚠️ La BD no está actualizada para ingresos recurrentes. Guardando sin recurrencia.');
                        
                        // Eliminar campos de recurrencia para guardar el ingreso básico
                        const dataBasico = {
                            titulo: nuevoIngreso.descripcion,
                            cantidad: nuevoIngreso.monto,
                            categoria: nuevoIngreso.categoria,
                            fecha: nuevoIngreso.fecha,
                            descripcion: nuevoIngreso.notas || ''
                        };
                        
                        const result = await window.SupabaseConfig.utils.insert('ingresos', dataBasico);
                        
                        // Mostrar notificación al usuario
                        if (window.gestorApp && window.gestorApp.mostrarNotificacion) {
                            window.gestorApp.mostrarNotificacion(
                                '⚠️ El ingreso se guardó sin recurrencia. Actualice la base de datos con el script supabase-recurrencia-update.sql', 
                                'warning'
                            );
                        }
                        
                        return this.mapSupabaseToFrontend(result[0], 'ingreso');
                    }
                    
                    throw supabaseError;
                }
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
                try {
                    const data = await window.SupabaseConfig.utils.select('ingresos', filters);
                    return data.map(item => this.mapSupabaseToFrontend(item, 'ingreso'));
                } catch (supabaseError) {
                    // Verificar si es un error de estructura de columna
                    if (supabaseError && supabaseError.code === '42703') {
                        // Si el error es por un campo de recurrencia, eliminamos esos filtros
                        // y hacemos una nueva consulta sin ellos
                        if (filters.es_recurrente !== undefined || filters.activo !== undefined) {
                            const filtrosBasicos = {...filters};
                            delete filtrosBasicos.es_recurrente;
                            delete filtrosBasicos.activo;
                            
                            console.warn('⚠️ Eliminando filtros de recurrencia por falta de estructura en la BD');
                            const dataBasica = await window.SupabaseConfig.utils.select('ingresos', filtrosBasicos);
                            return dataBasica.map(item => this.mapSupabaseToFrontend(item, 'ingreso'));
                        }
                    }
                    throw supabaseError;
                }
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
                
                // Filtros de recurrencia
                if (filters.es_recurrente !== undefined) {
                    ingresos = ingresos.filter(i => i.es_recurrente === filters.es_recurrente);
                }
                if (filters.activo !== undefined) {
                    ingresos = ingresos.filter(i => i.activo === filters.activo);
                }
                
                return ingresos;
            }
        } catch (error) {
            console.error('Error al obtener ingresos:', error);
            return [];
        }
    }

    /**
     * INGRESOS - Actualizar ingreso existente
     */
    async updateIngreso(ingresoId, datosActualizados) {
        try {
            // Preparar datos actualizados
            const ingresoActualizado = {
                ...datosActualizados,
                id: ingresoId,
                monto: parseFloat(datosActualizados.monto),
                updated_at: new Date().toISOString()
            };

            // Agregar campos de recurrencia si están presentes
            if (datosActualizados.es_recurrente !== undefined) {
                ingresoActualizado.es_recurrente = datosActualizados.es_recurrente;
                
                if (datosActualizados.frecuencia_recurrencia !== undefined) {
                    ingresoActualizado.frecuencia_recurrencia = datosActualizados.frecuencia_recurrencia;
                }
                
                if (datosActualizados.dia_recurrencia !== undefined) {
                    ingresoActualizado.dia_recurrencia = datosActualizados.dia_recurrencia;
                }
                
                if (datosActualizados.fecha_fin_recurrencia !== undefined) {
                    ingresoActualizado.fecha_fin_recurrencia = datosActualizados.fecha_fin_recurrencia;
                }
                
                if (datosActualizados.proximo_pago !== undefined) {
                    ingresoActualizado.proximo_pago = datosActualizados.proximo_pago;
                }
                
                if (datosActualizados.numero_secuencia !== undefined) {
                    ingresoActualizado.numero_secuencia = datosActualizados.numero_secuencia;
                }
                
                ingresoActualizado.activo = datosActualizados.activo !== undefined ? datosActualizados.activo : true;
            }

            if (this.useSupabase) {
                try {
                    const dataForSupabase = this.mapFrontendToSupabase(ingresoActualizado, 'ingreso');
                    const result = await window.SupabaseConfig.utils.update('ingresos', ingresoId, dataForSupabase);
                    return this.mapSupabaseToFrontend(result[0], 'ingreso');
                } catch (supabaseError) {
                    // Verificar si el error es por campos de recurrencia que no existen
                    if (supabaseError && supabaseError.code === '42703' && ingresoActualizado.es_recurrente) {
                        console.warn('⚠️ La BD no está actualizada para ingresos recurrentes. Actualizando sin recurrencia.');
                        
                        // Eliminar campos de recurrencia para actualizar el ingreso básico
                        const dataBasico = {
                            titulo: ingresoActualizado.descripcion,
                            cantidad: ingresoActualizado.monto,
                            categoria: ingresoActualizado.categoria,
                            fecha: ingresoActualizado.fecha,
                            descripcion: ingresoActualizado.notas || '',
                            updated_at: ingresoActualizado.updated_at
                        };
                        
                        const result = await window.SupabaseConfig.utils.update('ingresos', ingresoId, dataBasico);
                        
                        // Mostrar notificación al usuario
                        if (window.gestorApp && window.gestorApp.mostrarNotificacion) {
                            window.gestorApp.mostrarNotificacion(
                                '⚠️ El ingreso se actualizó sin recurrencia. Actualice la base de datos con el script supabase-recurrencia-update.sql', 
                                'warning'
                            );
                        }
                        
                        return this.mapSupabaseToFrontend(result[0], 'ingreso');
                    }
                    
                    throw supabaseError;
                }
            } else {
                const ingresos = this.getFromLocalStorage('ingresos') || [];
                const index = ingresos.findIndex(i => i.id === ingresoId);
                
                if (index !== -1) {
                    ingresos[index] = ingresoActualizado;
                    this.saveToLocalStorage('ingresos', ingresos);
                    return ingresoActualizado;
                } else {
                    throw new Error('Ingreso no encontrado');
                }
            }
        } catch (error) {
            console.error('Error al actualizar ingreso:', error);
            throw error;
        }
    }

    /**
     * GASTOS - Guardar nuevo gasto o actualizar existente
     */
    async saveGasto(gasto) {
        try {
            // Verificar si ya existe (tiene ID y existe en la BD)
            const esActualizacion = gasto.id ? true : false;
            
            const nuevoGasto = {
                id: gasto.id || this.generateId(),
                tipo: gasto.tipo,
                descripcion: gasto.descripcion,
                monto: parseFloat(gasto.monto),
                fecha: gasto.fecha,
                categoria: gasto.categoria || 'Otros',
                notas: gasto.notas || '',
                estado: gasto.estado || 'pendiente',
                created_at: gasto.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Agregar campos de recurrencia si están presentes
            if (gasto.es_recurrente !== undefined) {
                nuevoGasto.es_recurrente = gasto.es_recurrente;
                
                // Nuevos campos de recurrencia
                if (gasto.frecuencia_recurrencia !== undefined) {
                    nuevoGasto.frecuencia_recurrencia = gasto.frecuencia_recurrencia;
                } else if (gasto.frecuencia !== undefined) {
                    // Compatibilidad con el sistema anterior
                    nuevoGasto.frecuencia_recurrencia = gasto.frecuencia;
                }
                
                if (gasto.dia_recurrencia !== undefined) {
                    nuevoGasto.dia_recurrencia = gasto.dia_recurrencia;
                }
                
                if (gasto.fecha_fin_recurrencia !== undefined) {
                    nuevoGasto.fecha_fin_recurrencia = gasto.fecha_fin_recurrencia;
                } else if (gasto.fecha_fin !== undefined) {
                    // Compatibilidad con el sistema anterior
                    nuevoGasto.fecha_fin_recurrencia = gasto.fecha_fin;
                }
                
                nuevoGasto.activo = gasto.activo !== undefined ? gasto.activo : true;
                nuevoGasto.proximo_pago = gasto.proximo_pago;
                nuevoGasto.numero_secuencia = gasto.numero_secuencia || 1;
                
                // Campos del sistema anterior para compatibilidad
                if (gasto.intervalo_dias !== undefined) {
                    nuevoGasto.intervalo_dias = gasto.intervalo_dias;
                }
                
                if (gasto.gasto_padre_id) {
                    nuevoGasto.gasto_padre_id = gasto.gasto_padre_id;
                }
            }

            if (this.useSupabase) {
                try {
                    const dataForSupabase = this.mapFrontendToSupabase(nuevoGasto, 'gasto');
                    let result;
                    
                    // Si es actualización, usar update en lugar de insert
                    if (esActualizacion) {
                        result = await window.SupabaseConfig.utils.update('gastos', nuevoGasto.id, dataForSupabase);
                        console.log('✅ Gasto actualizado en Supabase:', nuevoGasto.id);
                    } else {
                        result = await window.SupabaseConfig.utils.insert('gastos', dataForSupabase);
                        console.log('✅ Nuevo gasto insertado en Supabase');
                    }
                    
                    return this.mapSupabaseToFrontend(result[0], 'gasto');
                } catch (supabaseError) {
                    // Verificar si el error es por campos de recurrencia que no existen
                    if (supabaseError && supabaseError.code === '42703' && gasto.es_recurrente) {
                        console.warn('⚠️ La BD no está actualizada para gastos recurrentes. Guardando sin recurrencia.');
                        
                        // Eliminar campos de recurrencia para guardar el gasto básico
                        const dataBasico = {
                            titulo: nuevoGasto.descripcion,
                            cantidad: nuevoGasto.monto,
                            categoria: nuevoGasto.categoria,
                            fecha: nuevoGasto.fecha,
                            descripcion: nuevoGasto.notas || ''
                        };
                        
                        const result = await window.SupabaseConfig.utils.insert('gastos', dataBasico);
                        
                        // Mostrar notificación al usuario
                        if (window.gestorApp && window.gestorApp.mostrarNotificacion) {
                            window.gestorApp.mostrarNotificacion(
                                '⚠️ El gasto se guardó sin recurrencia. Actualice la base de datos con el script supabase-recurrencia-update.sql', 
                                'warning'
                            );
                        }
                        
                        return this.mapSupabaseToFrontend(result[0], 'gasto');
                    }
                    
                    throw supabaseError;
                }
            } else {
                // Para localStorage, actualizar si existe o agregar si es nuevo
                const gastos = this.getFromLocalStorage('gastos') || [];
                
                if (esActualizacion) {
                    // Actualizar el existente
                    const index = gastos.findIndex(g => g.id === nuevoGasto.id);
                    if (index !== -1) {
                        gastos[index] = nuevoGasto;
                        console.log('✅ Gasto actualizado en localStorage:', nuevoGasto.id);
                    } else {
                        gastos.push(nuevoGasto);
                        console.log('⚠️ No se encontró el gasto para actualizar, agregado como nuevo');
                    }
                } else {
                    // Agregar nuevo
                    gastos.push(nuevoGasto);
                    console.log('✅ Nuevo gasto agregado a localStorage');
                }
                
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
                try {
                    const data = await window.SupabaseConfig.utils.select('gastos', filters);
                    return data.map(item => this.mapSupabaseToFrontend(item, 'gasto'));
                } catch (supabaseError) {
                    // Verificar si es un error de estructura de columna
                    if (supabaseError && supabaseError.code === '42703') {
                        // Si el error es por un campo de recurrencia, eliminamos esos filtros
                        // y hacemos una nueva consulta sin ellos
                        if (filters.es_recurrente !== undefined || filters.activo !== undefined) {
                            const filtrosBasicos = {...filters};
                            delete filtrosBasicos.es_recurrente;
                            delete filtrosBasicos.activo;
                            
                            console.warn('⚠️ Eliminando filtros de recurrencia por falta de estructura en la BD');
                            const dataBasica = await window.SupabaseConfig.utils.select('gastos', filtrosBasicos);
                            return dataBasica.map(item => this.mapSupabaseToFrontend(item, 'gasto'));
                        }
                    }
                    throw supabaseError;
                }
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
                
                // Filtros de recurrencia (si existen)
                if (filters.es_recurrente !== undefined) {
                    gastos = gastos.filter(g => g.es_recurrente === filters.es_recurrente);
                }
                if (filters.activo !== undefined) {
                    gastos = gastos.filter(g => g.activo === filters.activo);
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

    /**
     * Mapear datos de Supabase al formato del frontend
     */
    mapSupabaseToFrontend(item, type) {
        const baseData = {
            id: item.id,
            tipo: item.titulo || '', // Mapear titulo a tipo para compatibilidad
            descripcion: item.titulo || '',
            monto: item.cantidad || 0,
            categoria: item.categoria || '',
            fecha: item.fecha || '',
            notas: item.descripcion || '',
            estado: item.estado || 'pendiente', // Mapear el estado real
            created_at: item.created_at,
            updated_at: item.updated_at
        };

        // Agregar campos de recurrencia si existen
        if (item.es_recurrente !== undefined) {
            baseData.es_recurrente = item.es_recurrente;
            baseData.frecuencia = item.frecuencia;
            baseData.intervalo_dias = item.intervalo_dias;
            baseData.fecha_fin = item.fecha_fin;
            baseData.activo = item.activo;
            baseData.proximo_pago = item.proximo_pago;
            baseData.numero_secuencia = item.numero_secuencia;
            
            if (type === 'ingreso' && item.ingreso_padre_id) {
                baseData.ingreso_padre_id = item.ingreso_padre_id;
            } else if (type === 'gasto' && item.gasto_padre_id) {
                baseData.gasto_padre_id = item.gasto_padre_id;
            }
        }

        return baseData;
    }

    /**
     * Mapear datos del frontend al formato de Supabase
     */
    mapFrontendToSupabase(item, type) {
        const baseData = {
            titulo: item.descripcion || item.titulo || '',
            cantidad: parseFloat(item.monto || item.cantidad || 0),
            categoria: item.categoria || '',
            fecha: item.fecha || '',
            descripcion: item.notas || item.descripcion || '',
            estado: item.estado || 'pendiente'
        };
        
        // Agregar campos de recurrencia si existen
        if (item.es_recurrente !== undefined) {
            baseData.es_recurrente = item.es_recurrente;
            baseData.frecuencia = item.frecuencia || null;
            baseData.intervalo_dias = item.intervalo_dias || null;
            baseData.fecha_fin = item.fecha_fin || null;
            baseData.activo = item.activo !== undefined ? item.activo : true;
            baseData.proximo_pago = item.proximo_pago || null;
            baseData.numero_secuencia = item.numero_secuencia || 1;
            
            if (type === 'ingreso' && item.ingreso_padre_id) {
                baseData.ingreso_padre_id = item.ingreso_padre_id;
            } else if (type === 'gasto' && item.gasto_padre_id) {
                baseData.gasto_padre_id = item.gasto_padre_id;
            }
        }
        
        return baseData;
    }

    /**
     * Añadir un nuevo ingreso (usado para recurrencia)
     */
    async addIngreso(ingreso) {
        return await this.saveIngreso(ingreso);
    }
}

// Crear instancia global
window.StorageManager = new StorageManager();
