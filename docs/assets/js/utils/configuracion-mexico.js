/**
 * Configuración regional para México
 * Moneda, formato de fechas, idioma, etc.
 */

const CONFIGURACION_MEXICO = {
    // Configuración de moneda
    moneda: {
        codigo: 'MXN',
        simbolo: '$',
        nombre: 'Peso Mexicano',
        decimales: 2
    },

    // Configuración de formato
    formato: {
        // Formato de números en México: 1,234.56
        numero: {
            locale: 'es-MX',
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        
        // Formato de fechas en México: dd/mm/aaaa
        fecha: {
            locale: 'es-MX',
            options: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            },
            separator: '/'
        },

        // Formato de fecha y hora
        fechaHora: {
            locale: 'es-MX',
            options: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }
        }
    },

    // Configuración de idioma
    idioma: {
        codigo: 'es-MX',
        nombre: 'Español (México)',
        textos: {
            // Títulos principales
            appTitle: 'Gestor Financiero Personal',
            tabIngresos: 'Calendario de Ingresos',
            tabGastos: 'Calendario de Gastos',
            tabConsultas: 'Consultas y Análisis',

            // Botones comunes
            guardar: 'Guardar',
            cancelar: 'Cancelar',
            eliminar: 'Eliminar',
            editar: 'Editar',
            nuevo: 'Nuevo',
            exportar: 'Exportar',
            sincronizar: 'Sincronizar',

            // Categorías de ingresos (México)
            categoriasIngresos: [
                { nombre: 'Sueldo', icono: '💼', color: '#22c55e' },
                { nombre: 'Aguinaldo', icono: '🎁', color: '#f59e0b' },
                { nombre: 'Prima Vacacional', icono: '🏖️', color: '#06b6d4' },
                { nombre: 'Bonos', icono: '💰', color: '#8b5cf6' },
                { nombre: 'Freelance', icono: '💻', color: '#3b82f6' },
                { nombre: 'Negocio Propio', icono: '🏪', color: '#10b981' },
                { nombre: 'Inversiones', icono: '📈', color: '#f97316' },
                { nombre: 'Remesas', icono: '💸', color: '#ec4899' },
                { nombre: 'Otros Ingresos', icono: '📋', color: '#6b7280' }
            ],

            // Categorías de gastos (México)
            categoriasGastos: [
                { nombre: 'Comida', icono: '🍽️', color: '#ef4444' },
                { nombre: 'Transporte', icono: '🚌', color: '#f97316' },
                { nombre: 'Renta/Hipoteca', icono: '🏠', color: '#eab308' },
                { nombre: 'Servicios (CFE, Telmex)', icono: '⚡', color: '#06b6d4' },
                { nombre: 'Gas', icono: '🔥', color: '#f59e0b' },
                { nombre: 'Gasolina', icono: '⛽', color: '#dc2626' },
                { nombre: 'Salud/IMSS', icono: '⚕️', color: '#22c55e' },
                { nombre: 'Educación', icono: '📚', color: '#3b82f6' },
                { nombre: 'Entretenimiento', icono: '🎮', color: '#a855f7' },
                { nombre: 'Ropa', icono: '👕', color: '#ec4899' },
                { nombre: 'Farmacia', icono: '💊', color: '#059669' },
                { nombre: 'Supermercado', icono: '🛒', color: '#d97706' },
                { nombre: 'Restaurantes', icono: '🍕', color: '#db2777' },
                { nombre: 'Otros Gastos', icono: '📝', color: '#6b7280' }
            ],

            // Tipos de transacciones específicos para México
            tiposIngreso: [
                { valor: 'sueldo', texto: 'Sueldo Fijo (Quincenal/Mensual)' },
                { valor: 'aguinaldo', texto: 'Aguinaldo' },
                { valor: 'prima', texto: 'Prima Vacacional' },
                { valor: 'bonos', texto: 'Bonos y Comisiones' },
                { valor: 'freelance', texto: 'Trabajo Independiente' },
                { valor: 'negocio', texto: 'Negocio Propio' },
                { valor: 'otros', texto: 'Otros Ingresos' }
            ],

            tiposGasto: [
                { valor: 'diario', texto: 'Gasto Diario' },
                { valor: 'semanal', texto: 'Gasto Semanal' },
                { valor: 'quincenal', texto: 'Gasto Quincenal' },
                { valor: 'mensual', texto: 'Gasto Mensual' },
                { valor: 'imprevisto', texto: 'Gasto Imprevisto' },
                { valor: 'emergencia', texto: 'Emergencia' }
            ]
        }
    },

    // Configuración específica de México
    mexico: {
        // Horario comercial común en México
        horarioComercial: {
            inicio: '09:00',
            fin: '18:00'
        },

        // Días de pago comunes en México
        diasPago: {
            quincena1: 15,
            quincena2: 30, // o último día del mes
            mensual: 30
        },

        // Impuestos en México (para referencia)
        impuestos: {
            iva: 0.16, // 16%
            isr: {
                // Tarifas simplificadas del ISR
                escalas: [
                    { desde: 0, hasta: 8952, tarifa: 0.0192 },
                    { desde: 8952, hasta: 75984, tarifa: 0.064 },
                    // ... más escalas según SAT
                ]
            }
        },

        // Bancos populares en México
        bancos: [
            'BBVA México',
            'Banamex',
            'Santander',
            'Banorte',
            'HSBC',
            'Scotiabank',
            'Inbursa',
            'Azteca',
            'Otros'
        ]
    }
};

/**
 * Funciones de utilidad para formato mexicano
 */
class FormatoMexico {
    /**
     * Formatear cantidad en pesos mexicanos
     */
    static formatearMoneda(cantidad) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(cantidad);
    }

    /**
     * Formatear fecha al formato mexicano (dd/mm/aaaa)
     */
    static formatearFecha(fecha) {
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(fecha));
    }

    /**
     * Formatear fecha y hora al formato mexicano
     */
    static formatearFechaHora(fecha) {
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(fecha));
    }

    /**
     * Parsear cantidad desde texto mexicano
     */
    static parsearMoneda(texto) {
        // Remover símbolos de moneda y espacios
        const numeroLimpio = texto.replace(/[$,\s]/g, '');
        return parseFloat(numeroLimpio) || 0;
    }

    /**
     * Formatear número sin símbolo de moneda
     */
    static formatearNumero(numero) {
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numero);
    }

    /**
     * Obtener mes en español
     */
    static obtenerMesEspanol(numeroMes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[numeroMes - 1] || '';
    }

    /**
     * Obtener día de la semana en español
     */
    static obtenerDiaSemanaEspanol(fecha) {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return dias[new Date(fecha).getDay()];
    }
}

// Hacer disponible globalmente
window.CONFIGURACION_MEXICO = CONFIGURACION_MEXICO;
window.FormatoMexico = FormatoMexico;
