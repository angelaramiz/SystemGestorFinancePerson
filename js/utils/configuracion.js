/**
 * Sistema de Configuración - Gestor Financiero Personal
 * Maneja todas las configuraciones del sistema incluyendo moneda, interfaz, datos, etc.
 */

class ConfiguracionManager {
    constructor() {
        this.configuracionPorDefecto = {
            // General
            idioma: 'es',
            formatoFecha: 'DD/MM/YYYY',
            zonaHoraria: 'America/Mexico_City',
            
            // Moneda
            monedaPrincipal: 'MXN',
            simboloMoneda: '$',
            decimales: 2,
            separadorMiles: ',',
            
            // Notificaciones
            notificacionesHabilitadas: true,
            anticipacionVencimientos: 3,
            sonidoNotificaciones: true,
            notificacionesBrowser: true,
            
            // Interfaz
            tema: 'claro',
            colorPrimario: '#2563eb',
            animaciones: 'todas',
            
            // Datos
            autoguardado: true,
            intervaloAutoguardado: 5,
            backup: 'semanal'
        };

        this.simbolosMoneda = {
            'MXN': '$',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CAD': 'C$',
            'AUD': 'A$',
            'BRL': 'R$',
            'ARS': '$',
            'COP': '$',
            'CLP': '$'
        };

        this.configuracionActual = { ...this.configuracionPorDefecto };
        this.modal = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa el sistema de configuración
     */
    async inicializar() {
        if (this.isInitialized) return;

        console.log('🔧 Inicializando sistema de configuración...');
        
        try {
            // Cargar configuración guardada
            await this.cargarConfiguracion();
            
            // Configurar eventos del modal
            this.configurarEventos();
            
            // Aplicar configuración inicial
            this.aplicarConfiguracion();
            
            this.isInitialized = true;
            console.log('✅ Sistema de configuración inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar configuración:', error);
            // Usar configuración por defecto en caso de error
            this.configuracionActual = { ...this.configuracionPorDefecto };
        }
    }

    /**
     * Configura todos los eventos del modal de configuración
     */
    configurarEventos() {
        this.modal = document.getElementById('modal-configuracion');
        
        if (!this.modal) {
            console.error('❌ Modal de configuración no encontrado');
            return;
        }

        // Botón para abrir configuración
        const btnConfiguracion = document.getElementById('configuracion');
        if (btnConfiguracion) {
            btnConfiguracion.addEventListener('click', () => this.abrirModal());
        }

        // Botones para cerrar modal
        const botonesClose = this.modal.querySelectorAll('.modal-close');
        botonesClose.forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModal());
        });

        // Cerrar modal haciendo clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.cerrarModal();
            }
        });

        // Pestañas de configuración
        const pestanas = document.querySelectorAll('.config-tab');
        pestanas.forEach(pestana => {
            pestana.addEventListener('click', () => {
                const tabId = pestana.dataset.tab;
                this.cambiarPestana(tabId);
            });
        });

        // Botón guardar configuración
        const btnGuardar = document.getElementById('guardar-configuracion');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarConfiguracion());
        }

        // Eventos específicos
        this.configurarEventosMoneda();
        this.configurarEventosBotones();
        this.configurarEventosFormularios();
    }

    /**
     * Configura eventos específicos para la configuración de moneda
     */
    configurarEventosMoneda() {
        // Cambio de moneda principal
        const selectMoneda = document.getElementById('config-moneda-principal');
        if (selectMoneda) {
            selectMoneda.addEventListener('change', (e) => {
                const moneda = e.target.value;
                const simbolo = this.simbolosMoneda[moneda] || '$';
                
                const inputSimbolo = document.getElementById('config-simbolo-moneda');
                if (inputSimbolo) {
                    inputSimbolo.value = simbolo;
                }
                
                this.actualizarVistaPrevia();
            });
        }

        // Cambios en campos de formato de moneda
        const camposMoneda = [
            'config-simbolo-moneda',
            'config-decimales',
            'config-separador-miles'
        ];

        camposMoneda.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.addEventListener('change', () => this.actualizarVistaPrevia());
                elemento.addEventListener('input', () => this.actualizarVistaPrevia());
            }
        });
    }

    /**
     * Configura eventos para botones de acciones de datos
     */
    configurarEventosBotones() {
        // Limpiar cache
        const btnLimpiarCache = document.getElementById('btn-limpiar-cache');
        if (btnLimpiarCache) {
            btnLimpiarCache.addEventListener('click', () => this.limpiarCache());
        }

        // Restaurar configuración
        const btnResetConfig = document.getElementById('btn-reset-config');
        if (btnResetConfig) {
            btnResetConfig.addEventListener('click', () => this.restaurarConfiguracion());
        }

        // Borrar todos los datos
        const btnBorrarDatos = document.getElementById('btn-borrar-datos');
        if (btnBorrarDatos) {
            btnBorrarDatos.addEventListener('click', () => this.borrarTodosLosDatos());
        }
    }

    /**
     * Configura eventos para formularios
     */
    configurarEventosFormularios() {
        // Prevenir envío de formularios
        const forms = this.modal.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => e.preventDefault());
        });
    }

    /**
     * Abre el modal de configuración
     */
    abrirModal() {
        if (!this.modal) return;

        console.log('🔧 Abriendo modal de configuración');
        
        // Cargar valores actuales en el formulario
        this.cargarValoresEnFormulario();
        
        // Mostrar modal
        this.modal.style.display = 'flex';
        
        // Actualizar vista previa de moneda
        this.actualizarVistaPrevia();
        
        // Notificación
        if (window.NotificacionesManager) {
            window.NotificacionesManager.mostrar('Configuración abierta', 'info');
        }
    }

    /**
     * Cierra el modal de configuración
     */
    cerrarModal() {
        if (!this.modal) return;
        
        console.log('🔧 Cerrando modal de configuración');
        this.modal.style.display = 'none';
    }

    /**
     * Cambia entre pestañas del modal
     */
    cambiarPestana(tabId) {
        // Desactivar todas las pestañas
        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Ocultar todos los paneles
        document.querySelectorAll('.config-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Activar pestaña seleccionada
        const tabActiva = document.querySelector(`[data-tab="${tabId}"]`);
        if (tabActiva) {
            tabActiva.classList.add('active');
        }
        
        // Mostrar panel correspondiente
        const panelActivo = document.getElementById(`config-${tabId}`);
        if (panelActivo) {
            panelActivo.classList.add('active');
        }

        console.log(`🔧 Pestaña cambiada a: ${tabId}`);
    }

    /**
     * Carga la configuración desde localStorage
     */
    async cargarConfiguracion() {
        try {
            const manager = window.localStorageManager || window.LocalStorageManager;
            if (!manager) {
                throw new Error('LocalStorageManager no disponible');
            }

            const configuracionGuardada = await manager.obtener('configuracion-sistema');
            
            if (configuracionGuardada) {
                this.configuracionActual = { 
                    ...this.configuracionPorDefecto, 
                    ...configuracionGuardada 
                };
                console.log('📖 Configuración cargada desde localStorage');
            } else {
                console.log('📖 Usando configuración por defecto');
            }
        } catch (error) {
            console.error('❌ Error al cargar configuración:', error);
            this.configuracionActual = { ...this.configuracionPorDefecto };
        }
    }

    /**
     * Guarda la configuración actual
     */
    async guardarConfiguracion() {
        try {
            console.log('💾 Guardando configuración...');
            
            // Recoger valores del formulario
            this.recogerValoresDelFormulario();
            
            // Guardar en localStorage
            const manager = window.localStorageManager || window.LocalStorageManager;
            if (manager) {
                await manager.guardar('configuracion-sistema', this.configuracionActual);
                console.log('✅ Configuración guardada correctamente');
            }
              // Aplicar nueva configuración
            this.aplicarConfiguracion();
            
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('configuracion-guardada', {
                detail: this.configuracionActual
            }));
            
            // Cerrar modal
            this.cerrarModal();
            
            // Notificación de éxito
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Configuración guardada correctamente', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error al guardar configuración:', error);
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Error al guardar configuración', 'error');
            }
        }
    }

    /**
     * Carga los valores actuales en el formulario
     */
    cargarValoresEnFormulario() {
        const config = this.configuracionActual;
        
        // General
        this.setValueById('config-idioma', config.idioma);
        this.setValueById('config-formato-fecha', config.formatoFecha);
        this.setValueById('config-zona-horaria', config.zonaHoraria);
        
        // Moneda
        this.setValueById('config-moneda-principal', config.monedaPrincipal);
        this.setValueById('config-simbolo-moneda', config.simboloMoneda);
        this.setValueById('config-decimales', config.decimales);
        this.setValueById('config-separador-miles', config.separadorMiles);
        
        // Notificaciones
        this.setCheckedById('config-notif-habilitadas', config.notificacionesHabilitadas);
        this.setValueById('config-notif-anticipacion', config.anticipacionVencimientos);
        this.setCheckedById('config-notif-sonido', config.sonidoNotificaciones);
        this.setCheckedById('config-notif-browser', config.notificacionesBrowser);
        
        // Interfaz
        this.setValueById('config-tema', config.tema);
        this.setRadioValue('color-primario', config.colorPrimario);
        this.setValueById('config-animaciones', config.animaciones);
        
        // Datos
        this.setCheckedById('config-autosave', config.autoguardado);
        this.setValueById('config-autosave-intervalo', config.intervaloAutoguardado);
        this.setValueById('config-backup', config.backup);
    }

    /**
     * Recoge los valores del formulario y actualiza la configuración
     */
    recogerValoresDelFormulario() {
        // General
        this.configuracionActual.idioma = this.getValueById('config-idioma');
        this.configuracionActual.formatoFecha = this.getValueById('config-formato-fecha');
        this.configuracionActual.zonaHoraria = this.getValueById('config-zona-horaria');
        
        // Moneda
        this.configuracionActual.monedaPrincipal = this.getValueById('config-moneda-principal');
        this.configuracionActual.simboloMoneda = this.getValueById('config-simbolo-moneda');
        this.configuracionActual.decimales = parseInt(this.getValueById('config-decimales'));
        this.configuracionActual.separadorMiles = this.getValueById('config-separador-miles');
        
        // Notificaciones
        this.configuracionActual.notificacionesHabilitadas = this.getCheckedById('config-notif-habilitadas');
        this.configuracionActual.anticipacionVencimientos = parseInt(this.getValueById('config-notif-anticipacion'));
        this.configuracionActual.sonidoNotificaciones = this.getCheckedById('config-notif-sonido');
        this.configuracionActual.notificacionesBrowser = this.getCheckedById('config-notif-browser');
        
        // Interfaz
        this.configuracionActual.tema = this.getValueById('config-tema');
        this.configuracionActual.colorPrimario = this.getRadioValue('color-primario');
        this.configuracionActual.animaciones = this.getValueById('config-animaciones');
        
        // Datos
        this.configuracionActual.autoguardado = this.getCheckedById('config-autosave');
        this.configuracionActual.intervaloAutoguardado = parseInt(this.getValueById('config-autosave-intervalo'));
        this.configuracionActual.backup = this.getValueById('config-backup');
    }

    /**
     * Aplica la configuración actual al sistema
     */
    aplicarConfiguracion() {
        console.log('🔧 Aplicando configuración al sistema...');
        
        try {
            // Aplicar configuración de interfaz
            this.aplicarConfiguracionInterfaz();
            
            // Aplicar configuración de moneda
            this.aplicarConfiguracionMoneda();
            
            // Aplicar configuración de notificaciones
            this.aplicarConfiguracionNotificaciones();
            
            console.log('✅ Configuración aplicada correctamente');
        } catch (error) {
            console.error('❌ Error al aplicar configuración:', error);
        }
    }

    /**
     * Aplica configuración de interfaz (tema, colores, etc.)
     */
    aplicarConfiguracionInterfaz() {
        const config = this.configuracionActual;
        
        // Aplicar tema
        document.body.className = document.body.className.replace(/tema-\w+/g, '');
        document.body.classList.add(`tema-${config.tema}`);
        
        // Aplicar color primario
        document.documentElement.style.setProperty('--color-primario', config.colorPrimario);
        
        // Aplicar configuración de animaciones
        if (config.animaciones === 'ninguna') {
            document.body.classList.add('sin-animaciones');
        } else {
            document.body.classList.remove('sin-animaciones');
        }
    }

    /**
     * Aplica configuración de moneda
     */
    aplicarConfiguracionMoneda() {
        // La configuración de moneda se usa en las funciones de formato
        // Se aplica automáticamente cuando se llama a formatearMoneda()
        console.log('💰 Configuración de moneda aplicada:', {
            moneda: this.configuracionActual.monedaPrincipal,
            simbolo: this.configuracionActual.simboloMoneda,
            decimales: this.configuracionActual.decimales
        });
    }    /**
     * Aplica configuración de notificaciones
     */
    aplicarConfiguracionNotificaciones() {
        if (window.notificacionesManager && typeof window.notificacionesManager.configurar === 'function') {
            window.notificacionesManager.configurar({
                habilitadas: this.configuracionActual.notificacionesHabilitadas,
                sonido: this.configuracionActual.sonidoNotificaciones,
                browser: this.configuracionActual.notificacionesBrowser
            });
            console.log('🔔 Configuración de notificaciones aplicada');
        } else {
            console.warn('⚠️ Sistema de notificaciones no disponible para configurar');
        }
    }

    /**
     * Actualiza la vista previa del formato de moneda
     */
    actualizarVistaPrevia() {
        const simbolo = this.getValueById('config-simbolo-moneda') || '$';
        const decimales = parseInt(this.getValueById('config-decimales')) || 2;
        const separadorMiles = this.getValueById('config-separador-miles') || ',';
        
        const montoEjemplo = 1234.56;
        const montoFormateado = this.formatearMonto(montoEjemplo, simbolo, decimales, separadorMiles);
        
        const preview = document.getElementById('preview-monto');
        if (preview) {
            preview.textContent = montoFormateado;
        }
    }    /**
     * Formatea un monto según la configuración
     */
    formatearMonto(monto, simbolo = null, decimales = null, separadorMiles = null) {
        const config = this.configuracionActual;
        
        // Asegurar que los valores no sean null/undefined
        simbolo = simbolo !== null ? simbolo : (config.simboloMoneda || '$');
        decimales = decimales !== null ? decimales : (config.decimales || 2);
        separadorMiles = separadorMiles !== null ? separadorMiles : config.separadorMiles;
        
        // Validar que monto sea un número
        if (isNaN(monto) || monto === null || monto === undefined) {
            return `${simbolo}0${decimales > 0 ? '.' + '0'.repeat(decimales) : ''}`;
        }
        
        // Formatear número
        let numeroFormateado = Number(monto).toFixed(decimales);
        
        // Agregar separador de miles
        if (separadorMiles) {
            const partes = numeroFormateado.split('.');
            partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);
            numeroFormateado = partes.join('.');
        }
        
        return `${simbolo}${numeroFormateado}`;
    }

    /**
     * Obtiene la configuración de moneda para uso externo
     */
    obtenerConfiguracionMoneda() {
        return {
            moneda: this.configuracionActual.monedaPrincipal,
            simbolo: this.configuracionActual.simboloMoneda,
            decimales: this.configuracionActual.decimales,
            separadorMiles: this.configuracionActual.separadorMiles
        };
    }

    /**
     * Limpiar cache del sistema
     */
    async limpiarCache() {
        if (!confirm('¿Está seguro de que desea limpiar el cache? Esto puede mejorar el rendimiento pero eliminará datos temporales.')) {
            return;
        }

        try {
            // Limpiar sessionStorage
            sessionStorage.clear();
            
            // Limpiar cache de IndexedDB si existe
            if (window.indexedDBManager) {
                // Implementar limpieza de cache específica si es necesario
            }
            
            console.log('🗑️ Cache limpiado correctamente');
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Cache limpiado correctamente', 'success');
            }
        } catch (error) {
            console.error('❌ Error al limpiar cache:', error);
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Error al limpiar cache', 'error');
            }
        }
    }

    /**
     * Restaurar configuración por defecto
     */
    async restaurarConfiguracion() {
        if (!confirm('¿Está seguro de que desea restaurar la configuración por defecto? Se perderán todas las configuraciones personalizadas.')) {
            return;
        }

        try {
            this.configuracionActual = { ...this.configuracionPorDefecto };
            
            // Guardar configuración restaurada
            const manager = window.localStorageManager || window.LocalStorageManager;
            if (manager) {
                await manager.guardar('configuracion-sistema', this.configuracionActual);
            }
            
            // Aplicar configuración
            this.aplicarConfiguracion();
            
            // Actualizar formulario
            this.cargarValoresEnFormulario();
            this.actualizarVistaPrevia();
            
            console.log('🔄 Configuración restaurada por defecto');
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Configuración restaurada correctamente', 'success');
            }
        } catch (error) {
            console.error('❌ Error al restaurar configuración:', error);
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Error al restaurar configuración', 'error');
            }
        }
    }

    /**
     * Borrar todos los datos del sistema
     */
    async borrarTodosLosDatos() {
        const confirmacion = prompt('Esta acción eliminará TODOS los datos del sistema incluyendo ingresos, gastos y configuraciones.\n\nEscriba "BORRAR TODO" para confirmar:');
        
        if (confirmacion !== 'BORRAR TODO') {
            return;
        }

        try {
            // Limpiar localStorage
            if (window.localStorageManager) {
                await window.localStorageManager.limpiar();
            }
            
            // Limpiar IndexedDB
            if (window.indexedDBManager) {
                await window.indexedDBManager.limpiarTodo();
            }
            
            // Limpiar sessionStorage
            sessionStorage.clear();
            
            // Restaurar configuración por defecto
            this.configuracionActual = { ...this.configuracionPorDefecto };
            this.aplicarConfiguracion();
            
            console.log('🗑️ Todos los datos han sido eliminados');
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Todos los datos han sido eliminados', 'warning');
            }
            
            // Cerrar modal y recargar página
            this.cerrarModal();
            setTimeout(() => {
                location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error al borrar datos:', error);
            
            if (window.NotificacionesManager) {
                window.NotificacionesManager.mostrar('Error al borrar datos', 'error');
            }
        }
    }

    // Métodos auxiliares para trabajar con el DOM
    setValueById(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    getValueById(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    setCheckedById(id, checked) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    }

    getCheckedById(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    setRadioValue(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
        }
    }

    getRadioValue(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? radio.value : '';
    }
}

// Función global para formatear moneda
window.formatearMoneda = function(monto) {
    if (window.ConfiguracionManager && window.ConfiguracionManager.isInitialized) {
        return window.ConfiguracionManager.formatearMonto(monto);
    }
    
    // Formato por defecto si no hay configuración
    return `$${monto.toFixed(2)}`;
};

// Función global para obtener configuración de moneda
window.obtenerConfiguracionMoneda = function() {
    if (window.ConfiguracionManager && window.ConfiguracionManager.isInitialized) {
        return window.ConfiguracionManager.obtenerConfiguracionMoneda();
    }
    
    // Configuración por defecto
    return {
        moneda: 'MXN',
        simbolo: '$',
        decimales: 2,
        separadorMiles: ','
    };
};

// Crear instancia global
window.ConfiguracionManager = new ConfiguracionManager();
console.log('🔧 ConfiguracionManager cargado y disponible globalmente');
