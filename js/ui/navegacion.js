/**
 * Gestión de navegación entre ventanas del sistema
 * Controla el cambio entre las 4 ventanas principales y maneja el estado de la UI
 */

class GestorNavegacion {
    constructor() {
        this.ventanaActual = 'ingresos';
        this.ventanas = ['ingresos', 'gestion', 'gastos', 'hoja-calculo'];
        this.historialNavegacion = [];
        this.callbacks = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.cargarEstadoGuardado();
        this.mostrarVentanaInicial();
    }

    setupEventListeners() {
        // Pestañas de navegación
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const ventana = e.target.dataset.window;
                if (ventana) {
                    this.cambiarVentana(ventana);
                }
            });
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl + 1-4 para cambiar ventanas
            if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (this.ventanas[index]) {
                    this.cambiarVentana(this.ventanas[index]);
                }
            }

            // Alt + ← para volver
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.volverAnterior();
            }
        });

        // Manejo del historial del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.ventana) {
                this.cambiarVentana(e.state.ventana, false);
            }
        });

        // Guardar estado al salir
        window.addEventListener('beforeunload', () => {
            this.guardarEstado();
        });
    }

    /**
     * Cambiar a una ventana específica
     */
    cambiarVentana(nuevaVentana, actualizarHistorial = true) {
        if (!this.ventanas.includes(nuevaVentana)) {
            console.warn(`Ventana '${nuevaVentana}' no existe`);
            return false;
        }

        if (nuevaVentana === this.ventanaActual) {
            return true; // Ya estamos en esta ventana
        }

        console.log(`🔄 Cambiando de ${this.ventanaActual} a ${nuevaVentana}`);

        // Ejecutar callback de salida de la ventana actual
        this.ejecutarCallback('beforeLeave', this.ventanaActual);

        // Ocultar ventana actual
        this.ocultarVentana(this.ventanaActual);

        // Actualizar historial si es necesario
        if (actualizarHistorial) {
            this.historialNavegacion.push(this.ventanaActual);
            // Mantener historial limitado
            if (this.historialNavegacion.length > 10) {
                this.historialNavegacion = this.historialNavegacion.slice(-10);
            }

            // Actualizar URL sin recargar
            const url = new URL(window.location);
            url.searchParams.set('ventana', nuevaVentana);
            window.history.pushState({ ventana: nuevaVentana }, '', url);
        }

        // Cambiar ventana
        const ventanaAnterior = this.ventanaActual;
        this.ventanaActual = nuevaVentana;

        // Mostrar nueva ventana
        this.mostrarVentana(nuevaVentana);

        // Actualizar navegación visual
        this.actualizarNavegacionVisual();

        // Ejecutar callbacks
        this.ejecutarCallback('afterLeave', ventanaAnterior);
        this.ejecutarCallback('beforeEnter', nuevaVentana);
        this.ejecutarCallback('afterEnter', nuevaVentana);

        // Guardar estado
        this.guardarEstado();

        return true;
    }

    /**
     * Ocultar una ventana
     */
    ocultarVentana(ventana) {
        const elemento = document.getElementById(`ventana-${ventana}`);
        if (elemento) {
            elemento.classList.remove('active');
            elemento.style.display = 'none';
        }
    }

    /**
     * Mostrar una ventana
     */
    mostrarVentana(ventana) {
        const elemento = document.getElementById(`ventana-${ventana}`);
        if (elemento) {
            elemento.style.display = 'block';
            
            // Pequeño delay para la animación
            setTimeout(() => {
                elemento.classList.add('active');
                this.ajustarContenido(ventana);
            }, 10);
        }
    }

    /**
     * Actualizar la navegación visual (tabs activos)
     */
    actualizarNavegacionVisual() {
        // Actualizar tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.window === this.ventanaActual) {
                tab.classList.add('active');
            }
        });

        // Actualizar título de la página
        this.actualizarTituloPagina();
    }

    /**
     * Actualizar el título de la página
     */
    actualizarTituloPagina() {
        const titulos = {
            'ingresos': '📈 Ingresos - Gestor Financiero',
            'gestion': '🔗 Gestión - Gestor Financiero',
            'gastos': '💸 Gastos - Gestor Financiero',
            'hoja-calculo': '📊 Proyecciones - Gestor Financiero'
        };

        document.title = titulos[this.ventanaActual] || 'Gestor Financiero Personal';
    }

    /**
     * Ajustar contenido específico de cada ventana
     */
    ajustarContenido(ventana) {
        switch (ventana) {
            case 'ingresos':
                this.ajustarVentanaIngresos();
                break;
            case 'gestion':
                this.ajustarVentanaGestion();
                break;
            case 'gastos':
                this.ajustarVentanaGastos();
                break;
            case 'hoja-calculo':
                this.ajustarVentanaHojaCalculo();
                break;
        }
    }

    /**
     * Ajustes específicos para ventana de ingresos
     */
    ajustarVentanaIngresos() {
        // Refrescar calendario si existe
        if (window.calendarioIngresos) {
            setTimeout(() => {
                window.calendarioIngresos.render();
            }, 100);
        }

        // Cargar lista de ingresos
        if (window.ventanaIngresos && window.ventanaIngresos.cargarIngresos) {
            window.ventanaIngresos.cargarIngresos();
        }
    }

    /**
     * Ajustes específicos para ventana de gestión
     */
    ajustarVentanaGestion() {
        // Refrescar diagrama de flujo
        if (window.ventanaGestion && window.ventanaGestion.refrescarDiagrama) {
            setTimeout(() => {
                window.ventanaGestion.refrescarDiagrama();
            }, 100);
        }
    }

    /**
     * Ajustes específicos para ventana de gastos
     */
    ajustarVentanaGastos() {
        // Refrescar calendario y burbujas
        if (window.calendarioGastos) {
            setTimeout(() => {
                window.calendarioGastos.render();
            }, 100);
        }

        if (window.ventanaGastos && window.ventanaGastos.cargarGastos) {
            window.ventanaGastos.cargarGastos();
        }
    }

    /**
     * Ajustes específicos para ventana de hoja de cálculo
     */
    ajustarVentanaHojaCalculo() {
        // Refrescar gráficos y tablas
        if (window.ventanaHojaCalculo) {
            setTimeout(() => {
                if (window.ventanaHojaCalculo.actualizarProyecciones) {
                    window.ventanaHojaCalculo.actualizarProyecciones();
                }
                if (window.ventanaHojaCalculo.refrescarGraficos) {
                    window.ventanaHojaCalculo.refrescarGraficos();
                }
            }, 100);
        }
    }

    /**
     * Volver a la ventana anterior
     */
    volverAnterior() {
        if (this.historialNavegacion.length > 0) {
            const ventanaAnterior = this.historialNavegacion.pop();
            this.cambiarVentana(ventanaAnterior, false);
            return true;
        }
        return false;
    }

    /**
     * Ir a la siguiente ventana en orden
     */
    siguienteVentana() {
        const indiceActual = this.ventanas.indexOf(this.ventanaActual);
        const siguienteIndice = (indiceActual + 1) % this.ventanas.length;
        this.cambiarVentana(this.ventanas[siguienteIndice]);
    }

    /**
     * Ir a la ventana anterior en orden
     */
    ventanaAnteriorEnOrden() {
        const indiceActual = this.ventanas.indexOf(this.ventanaActual);
        const anteriorIndice = indiceActual === 0 ? this.ventanas.length - 1 : indiceActual - 1;
        this.cambiarVentana(this.ventanas[anteriorIndice]);
    }

    /**
     * Registrar callback para eventos de navegación
     */
    onNavegacion(evento, ventana, callback) {
        const eventos = ['beforeLeave', 'afterLeave', 'beforeEnter', 'afterEnter'];
        if (!eventos.includes(evento)) {
            console.warn(`Evento '${evento}' no válido`);
            return;
        }

        if (!this.callbacks[evento]) {
            this.callbacks[evento] = {};
        }

        this.callbacks[evento][ventana] = callback;
    }

    /**
     * Ejecutar callback si existe
     */
    ejecutarCallback(evento, ventana) {
        if (this.callbacks[evento] && this.callbacks[evento][ventana]) {
            try {
                this.callbacks[evento][ventana](ventana);
            } catch (error) {
                console.error(`Error ejecutando callback ${evento} para ${ventana}:`, error);
            }
        }
    }

    /**
     * Guardar estado actual en localStorage
     */
    guardarEstado() {
        if (window.localStorageManager) {
            window.localStorageManager.setVentanaActiva(this.ventanaActual);
        }
    }

    /**
     * Cargar estado guardado
     */
    cargarEstadoGuardado() {
        if (window.localStorageManager) {
            const ventanaGuardada = window.localStorageManager.getVentanaActiva();
            if (ventanaGuardada && this.ventanas.includes(ventanaGuardada)) {
                this.ventanaActual = ventanaGuardada;
            }
        }

        // Verificar URL
        const urlParams = new URLSearchParams(window.location.search);
        const ventanaUrl = urlParams.get('ventana');
        if (ventanaUrl && this.ventanas.includes(ventanaUrl)) {
            this.ventanaActual = ventanaUrl;
        }
    }

    /**
     * Mostrar ventana inicial
     */
    mostrarVentanaInicial() {
        this.mostrarVentana(this.ventanaActual);
        this.actualizarNavegacionVisual();
    }

    /**
     * Obtener información de navegación
     */
    getEstado() {
        return {
            ventanaActual: this.ventanaActual,
            historial: [...this.historialNavegacion],
            ventanasDisponibles: [...this.ventanas]
        };
    }

    /**
     * Verificar si una ventana está disponible
     */
    estaDisponible(ventana) {
        return this.ventanas.includes(ventana);
    }

    /**
     * Añadir indicador de carga a una ventana
     */
    mostrarCarga(ventana) {
        const elemento = document.getElementById(`ventana-${ventana}`);
        if (elemento) {
            elemento.classList.add('loading');
        }
    }

    /**
     * Quitar indicador de carga
     */
    ocultarCarga(ventana) {
        const elemento = document.getElementById(`ventana-${ventana}`);
        if (elemento) {
            elemento.classList.remove('loading');
        }
    }

    /**
     * Mostrar notificación de cambio de ventana
     */
    mostrarNotificacionCambio(ventana) {
        const nombres = {
            'ingresos': 'Ingresos',
            'gestion': 'Gestión y Priorización',
            'gastos': 'Gastos',
            'hoja-calculo': 'Proyecciones'
        };

        if (window.notificacionesManager) {
            window.notificacionesManager.mostrar({
                mensaje: `Navegando a: ${nombres[ventana]}`,
                tipo: 'info',
                duracion: 2000
            });
        }
    }

    /**
     * Configurar navegación automática para tours/tutoriales
     */
    iniciarTour() {
        let pasoActual = 0;
        const pasos = this.ventanas;

        const siguientePaso = () => {
            if (pasoActual < pasos.length) {
                this.cambiarVentana(pasos[pasoActual]);
                this.mostrarNotificacionCambio(pasos[pasoActual]);
                pasoActual++;
                
                setTimeout(siguientePaso, 3000);
            }
        };

        siguientePaso();
    }
}

// Crear instancia global
window.gestorNavegacion = new GestorNavegacion();

// Configurar eventos específicos al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Configurar tooltips para las pestañas
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const ventana = tab.dataset.window;
        const tooltips = {
            'ingresos': 'Gestionar fuentes de ingresos (Ctrl+1)',
            'gestion': 'Conectar ingresos con gastos (Ctrl+2)',
            'gastos': 'Gestionar gastos y prioridades (Ctrl+3)',
            'hoja-calculo': 'Ver proyecciones y análisis (Ctrl+4)'
        };
        
        if (tooltips[ventana]) {
            tab.setAttribute('data-tooltip', tooltips[ventana]);
            tab.classList.add('tooltip');
        }
    });

    console.log('✅ Gestor de navegación inicializado');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestorNavegacion;
}
