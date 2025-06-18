/**
 * Modelo de Ingreso según especificación del proyecto
 * Estructura de datos para ingresos recurrentes y únicos
 */

class Ingreso {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.tipo = data.tipo || 'nomina'; // nomina, freelance, venta, inversion, otro
        this.descripcion = data.descripcion || '';
        this.monto = parseFloat(data.monto) || 0;
        this.fecha = data.fecha || new Date().toISOString().split('T')[0];
        this.recurrente = Boolean(data.recurrente);
        this.frecuencia = data.frecuencia || 'mensual'; // diario, semanal, quincenal, mensual
        this.dia = data.dia || null; // Para recurrencias específicas (ej: cada jueves)
        this.estado = data.estado || 'activo'; // activo, pausado, finalizado
        this.fechaInicio = data.fechaInicio || this.fecha;
        this.fechaFin = data.fechaFin || null;
        this.categoria = data.categoria || this.getCategoriaByTipo();
        this.notas = data.notas || '';
        this.etiquetas = Array.isArray(data.etiquetas) ? data.etiquetas : [];
        
        // Metadatos
        this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
        this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
        this.usuarioCreacion = data.usuarioCreacion || 'sistema';

        // Validar datos
        this.validate();
    }

    generateId() {
        return 'ingreso-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCategoriaByTipo() {
        const categorias = {
            'nomina': 'Trabajo',
            'freelance': 'Trabajo',
            'venta': 'Negocio',
            'inversion': 'Inversiones',
            'otro': 'Varios'
        };
        return categorias[this.tipo] || 'Varios';
    }

    validate() {
        const errores = [];

        if (!this.descripcion.trim()) {
            errores.push('La descripción es obligatoria');
        }

        if (this.monto <= 0) {
            errores.push('El monto debe ser mayor a 0');
        }

        if (!this.fecha) {
            errores.push('La fecha es obligatoria');
        }

        const tiposValidos = ['nomina', 'freelance', 'venta', 'inversion', 'otro'];
        if (!tiposValidos.includes(this.tipo)) {
            errores.push('Tipo de ingreso no válido');
        }

        if (this.recurrente) {
            const frecuenciasValidas = ['diario', 'semanal', 'quincenal', 'mensual'];
            if (!frecuenciasValidas.includes(this.frecuencia)) {
                errores.push('Frecuencia de recurrencia no válida');
            }
        }

        if (errores.length > 0) {
            throw new Error('Datos de ingreso inválidos: ' + errores.join(', '));
        }
    }

    // Métodos de cálculo
    calcularMontoMensual() {
        if (!this.recurrente) {
            return this.monto;
        }

        switch (this.frecuencia) {
            case 'diario':
                return this.monto * 30; // Aproximado
            case 'semanal':
                return this.monto * 4.33; // Promedio de semanas por mes
            case 'quincenal':
                return this.monto * 2;
            case 'mensual':
                return this.monto;
            default:
                return this.monto;
        }
    }

    calcularMontoAnual() {
        return this.calcularMontoMensual() * 12;
    }

    // Generar próximas fechas de cobro
    generarProximasFechas(cantidad = 12) {
        if (!this.recurrente) {
            return [this.fecha];
        }

        const fechas = [];
        let fechaActual = new Date(this.fecha);
        
        for (let i = 0; i < cantidad; i++) {
            fechas.push(new Date(fechaActual).toISOString().split('T')[0]);
            
            switch (this.frecuencia) {
                case 'diario':
                    fechaActual.setDate(fechaActual.getDate() + 1);
                    break;
                case 'semanal':
                    fechaActual.setDate(fechaActual.getDate() + 7);
                    break;
                case 'quincenal':
                    fechaActual.setDate(fechaActual.getDate() + 15);
                    break;
                case 'mensual':
                    fechaActual.setMonth(fechaActual.getMonth() + 1);
                    break;
            }

            // Si hay fecha fin y la hemos superado, salir
            if (this.fechaFin && fechaActual > new Date(this.fechaFin)) {
                break;
            }
        }

        return fechas;
    }

    // Verificar si hay un ingreso en una fecha específica
    tieneIngresoEnFecha(fecha) {
        if (!this.recurrente) {
            return this.fecha === fecha;
        }

        const fechaIngreso = new Date(this.fecha);
        const fechaConsulta = new Date(fecha);
        
        if (fechaConsulta < fechaIngreso) {
            return false;
        }

        if (this.fechaFin && fechaConsulta > new Date(this.fechaFin)) {
            return false;
        }

        const diferenciaDias = Math.floor((fechaConsulta - fechaIngreso) / (1000 * 60 * 60 * 24));

        switch (this.frecuencia) {
            case 'diario':
                return true;
            case 'semanal':
                return diferenciaDias % 7 === 0;
            case 'quincenal':
                return diferenciaDias % 15 === 0;
            case 'mensual':
                return fechaIngreso.getDate() === fechaConsulta.getDate();
            default:
                return false;
        }
    }

    // Métodos de formato
    formatearMonto() {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(this.monto);
    }

    formatearFecha() {
        return new Date(this.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getIcono() {
        const iconos = {
            'nomina': '💼',
            'freelance': '👨‍💻',
            'venta': '💰',
            'inversion': '📈',
            'otro': '💵'
        };
        return iconos[this.tipo] || '💵';
    }

    getColor() {
        const colores = {
            'nomina': '#10b981',
            'freelance': '#3b82f6',
            'venta': '#f59e0b',
            'inversion': '#8b5cf6',
            'otro': '#6b7280'
        };
        return colores[this.tipo] || '#6b7280';
    }

    // Métodos para eventos de calendario
    toCalendarEvent() {
        return {
            id: this.id,
            title: `${this.getIcono()} ${this.descripcion} - ${this.formatearMonto()}`,
            start: this.fecha,
            backgroundColor: this.getColor(),
            borderColor: this.getColor(),
            textColor: '#ffffff',
            extendedProps: {
                tipo: 'ingreso',
                monto: this.monto,
                descripcion: this.descripcion,
                recurrente: this.recurrente,
                frecuencia: this.frecuencia
            }
        };
    }

    // Exportar a formato JSON limpio
    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            descripcion: this.descripcion,
            monto: this.monto,
            fecha: this.fecha,
            recurrente: this.recurrente,
            frecuencia: this.frecuencia,
            dia: this.dia,
            estado: this.estado,
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            categoria: this.categoria,
            notas: this.notas,
            etiquetas: this.etiquetas,
            fechaCreacion: this.fechaCreacion,
            fechaModificacion: this.fechaModificacion,
            usuarioCreacion: this.usuarioCreacion
        };
    }

    // Crear copia del ingreso
    clonar() {
        return new Ingreso(this.toJSON());
    }

    // Actualizar datos
    actualizar(nuevosDatos) {
        // Preserve ID and creation metadata
        const datosPreservados = {
            id: this.id,
            fechaCreacion: this.fechaCreacion,
            usuarioCreacion: this.usuarioCreacion
        };

        // Update with new data
        Object.assign(this, nuevosDatos, datosPreservados);
        this.fechaModificacion = new Date().toISOString();
        
        // Re-validate
        this.validate();
        
        return this;
    }

    // Métodos estáticos
    static fromJSON(json) {
        return new Ingreso(typeof json === 'string' ? JSON.parse(json) : json);
    }

    static crearRecurrente(datos) {
        return new Ingreso({
            ...datos,
            recurrente: true,
            frecuencia: datos.frecuencia || 'mensual'
        });
    }

    static crearUnico(datos) {
        return new Ingreso({
            ...datos,
            recurrente: false
        });
    }

    // Validaciones estáticas
    static validarMonto(monto) {
        const numero = parseFloat(monto);
        return !isNaN(numero) && numero > 0;
    }

    static validarFecha(fecha) {
        const fechaObj = new Date(fecha);
        return fechaObj instanceof Date && !isNaN(fechaObj);
    }

    static obtenerTiposValidos() {
        return [
            { value: 'nomina', label: 'Nómina', icono: '💼' },
            { value: 'freelance', label: 'Freelance', icono: '👨‍💻' },
            { value: 'venta', label: 'Venta', icono: '💰' },
            { value: 'inversion', label: 'Inversión', icono: '📈' },
            { value: 'otro', label: 'Otro', icono: '💵' }
        ];
    }

    static obtenerFrecuenciasValidas() {
        return [
            { value: 'diario', label: 'Diario' },
            { value: 'semanal', label: 'Semanal' },
            { value: 'quincenal', label: 'Quincenal' },
            { value: 'mensual', label: 'Mensual' }
        ];
    }
}

// Exportar para uso global
window.Ingreso = Ingreso;

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ingreso;
}
