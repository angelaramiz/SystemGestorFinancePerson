/**
 * Modelo de Gasto según especificación del proyecto
 * Estructura de datos para gastos con priorización y fechas de vencimiento
 */

class Gasto {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.tipo = data.tipo || 'otro'; // hipoteca, alquiler, servicios, alimentacion, etc.
        this.descripcion = data.descripcion || '';
        this.monto = parseFloat(data.monto) || 0;
        this.fechaVencimiento = data.fechaVencimiento || new Date().toISOString().split('T')[0];
        this.prioridad = data.prioridad || 'media'; // alta, media, baja
        this.recurrente = Boolean(data.recurrente);
        this.frecuencia = data.frecuencia || 'mensual'; // semanal, quincenal, mensual, anual
        this.estado = data.estado || 'pendiente'; // pendiente, pagado, vencido, cancelado
        this.fechaPago = data.fechaPago || null;
        this.montoPagado = parseFloat(data.montoPagado) || 0;
        this.categoria = data.categoria || this.getCategoriaByTipo();
        this.notas = data.notas || '';
        this.etiquetas = Array.isArray(data.etiquetas) ? data.etiquetas : [];
        
        // Campos específicos para deudas
        this.esDeuda = Boolean(data.esDeuda);
        this.cuotasTotal = parseInt(data.cuotasTotal) || null;
        this.cuotasPagadas = parseInt(data.cuotasPagadas) || 0;
        this.tasaInteres = parseFloat(data.tasaInteres) || 0;
        
        // Campos para gastos variables
        this.esVariable = Boolean(data.esVariable);
        this.montoMinimo = parseFloat(data.montoMinimo) || 0;
        this.montoMaximo = parseFloat(data.montoMaximo) || 0;
        this.montoPromedio = parseFloat(data.montoPromedio) || this.monto;

        // Metadatos
        this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
        this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
        this.usuarioCreacion = data.usuarioCreacion || 'sistema';

        // Validar datos
        this.validate();
    }

    generateId() {
        return 'gasto-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCategoriaByTipo() {
        const categorias = {
            'hipoteca': 'Vivienda',
            'alquiler': 'Vivienda',
            'servicios': 'Servicios Básicos',
            'alimentacion': 'Alimentación',
            'transporte': 'Transporte',
            'salud': 'Salud',
            'educacion': 'Educación',
            'entretenimiento': 'Entretenimiento',
            'deuda': 'Deudas',
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

        if (!this.fechaVencimiento) {
            errores.push('La fecha de vencimiento es obligatoria');
        }

        const tiposValidos = [
            'hipoteca', 'alquiler', 'servicios', 'alimentacion', 
            'transporte', 'salud', 'educacion', 'entretenimiento', 
            'deuda', 'otro'
        ];
        if (!tiposValidos.includes(this.tipo)) {
            errores.push('Tipo de gasto no válido');
        }

        const prioridadesValidas = ['alta', 'media', 'baja'];
        if (!prioridadesValidas.includes(this.prioridad)) {
            errores.push('Prioridad no válida');
        }

        if (this.recurrente) {
            const frecuenciasValidas = ['semanal', 'quincenal', 'mensual', 'anual'];
            if (!frecuenciasValidas.includes(this.frecuencia)) {
                errores.push('Frecuencia de recurrencia no válida');
            }
        }

        if (this.esDeuda && this.cuotasTotal && this.cuotasPagadas > this.cuotasTotal) {
            errores.push('Las cuotas pagadas no pueden ser mayores al total');
        }

        if (this.esVariable) {
            if (this.montoMinimo > this.montoMaximo) {
                errores.push('El monto mínimo no puede ser mayor al máximo');
            }
        }

        if (errores.length > 0) {
            throw new Error('Datos de gasto inválidos: ' + errores.join(', '));
        }
    }

    // Métodos de estado
    marcarComoPagado(fechaPago = null, montoPagado = null) {
        this.estado = 'pagado';
        this.fechaPago = fechaPago || new Date().toISOString().split('T')[0];
        this.montoPagado = montoPagado || this.monto;
        
        if (this.esDeuda && this.cuotasTotal) {
            this.cuotasPagadas = Math.min(this.cuotasPagadas + 1, this.cuotasTotal);
        }
        
        this.fechaModificacion = new Date().toISOString();
        return this;
    }

    marcarComoPendiente() {
        this.estado = 'pendiente';
        this.fechaPago = null;
        this.montoPagado = 0;
        this.fechaModificacion = new Date().toISOString();
        return this;
    }

    verificarVencimiento() {
        const hoy = new Date().toISOString().split('T')[0];
        if (this.fechaVencimiento < hoy && this.estado === 'pendiente') {
            this.estado = 'vencido';
            this.fechaModificacion = new Date().toISOString();
        }
        return this.estado === 'vencido';
    }

    // Métodos de cálculo
    calcularMontoMensual() {
        if (!this.recurrente) {
            return this.esVariable ? this.montoPromedio : this.monto;
        }

        const montoBase = this.esVariable ? this.montoPromedio : this.monto;

        switch (this.frecuencia) {
            case 'semanal':
                return montoBase * 4.33; // Promedio de semanas por mes
            case 'quincenal':
                return montoBase * 2;
            case 'mensual':
                return montoBase;
            case 'anual':
                return montoBase / 12;
            default:
                return montoBase;
        }
    }

    calcularMontoAnual() {
        return this.calcularMontoMensual() * 12;
    }

    calcularDiasParaVencimiento() {
        const hoy = new Date();
        const fechaVenc = new Date(this.fechaVencimiento);
        const diferencia = fechaVenc - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }

    calcularPorcentajeDeuda() {
        if (!this.esDeuda || !this.cuotasTotal) {
            return 100;
        }
        return (this.cuotasPagadas / this.cuotasTotal) * 100;
    }

    calcularMontoRestanteDeuda() {
        if (!this.esDeuda || !this.cuotasTotal) {
            return 0;
        }
        const cuotasRestantes = this.cuotasTotal - this.cuotasPagadas;
        return cuotasRestantes * this.monto;
    }

    // Generar próximas fechas de vencimiento
    generarProximasFechas(cantidad = 12) {
        if (!this.recurrente) {
            return [this.fechaVencimiento];
        }

        const fechas = [];
        let fechaActual = new Date(this.fechaVencimiento);
        
        for (let i = 0; i < cantidad; i++) {
            fechas.push(new Date(fechaActual).toISOString().split('T')[0]);
            
            switch (this.frecuencia) {
                case 'semanal':
                    fechaActual.setDate(fechaActual.getDate() + 7);
                    break;
                case 'quincenal':
                    fechaActual.setDate(fechaActual.getDate() + 15);
                    break;
                case 'mensual':
                    fechaActual.setMonth(fechaActual.getMonth() + 1);
                    break;
                case 'anual':
                    fechaActual.setFullYear(fechaActual.getFullYear() + 1);
                    break;
            }

            // Si es una deuda con cuotas limitadas
            if (this.esDeuda && this.cuotasTotal && i >= (this.cuotasTotal - this.cuotasPagadas - 1)) {
                break;
            }
        }

        return fechas;
    }

    // Métodos de priorización
    calcularPuntajePrioridad() {
        let puntaje = 0;

        // Base por prioridad
        switch (this.prioridad) {
            case 'alta': puntaje += 100; break;
            case 'media': puntaje += 50; break;
            case 'baja': puntaje += 10; break;
        }

        // Penalización por días hasta vencimiento
        const diasVencimiento = this.calcularDiasParaVencimiento();
        if (diasVencimiento <= 0) {
            puntaje += 50; // Ya vencido
        } else if (diasVencimiento <= 3) {
            puntaje += 30; // Muy urgente
        } else if (diasVencimiento <= 7) {
            puntaje += 20; // Urgente
        } else if (diasVencimiento <= 15) {
            puntaje += 10; // Moderado
        }

        // Bonus por tipo crítico
        const tiposCriticos = ['hipoteca', 'alquiler', 'servicios', 'salud'];
        if (tiposCriticos.includes(this.tipo)) {
            puntaje += 25;
        }

        return puntaje;
    }

    // Métodos de formato
    formatearMonto() {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(this.monto);
    }

    formatearFechaVencimiento() {
        return new Date(this.fechaVencimiento).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getIcono() {
        const iconos = {
            'hipoteca': '🏠',
            'alquiler': '🏘️',
            'servicios': '⚡',
            'alimentacion': '🍽️',
            'transporte': '🚗',
            'salud': '🏥',
            'educacion': '📚',
            'entretenimiento': '🎬',
            'deuda': '💳',
            'otro': '💸'
        };
        return iconos[this.tipo] || '💸';
    }

    getColor() {
        // Color base por prioridad
        switch (this.prioridad) {
            case 'alta': return '#ef4444';
            case 'media': return '#f59e0b';
            case 'baja': return '#10b981';
            default: return '#6b7280';
        }
    }

    getColorEstado() {
        switch (this.estado) {
            case 'pagado': return '#10b981';
            case 'pendiente': return '#f59e0b';
            case 'vencido': return '#ef4444';
            case 'cancelado': return '#6b7280';
            default: return '#6b7280';
        }
    }

    getTextoEstado() {
        const estados = {
            'pendiente': 'Pendiente',
            'pagado': 'Pagado',
            'vencido': 'Vencido',
            'cancelado': 'Cancelado'
        };
        return estados[this.estado] || 'Desconocido';
    }

    // Métodos para eventos de calendario
    toCalendarEvent() {
        const diasVencimiento = this.calcularDiasParaVencimiento();
        let title = `${this.getIcono()} ${this.descripcion} - ${this.formatearMonto()}`;
        
        if (diasVencimiento <= 0) {
            title = `⚠️ ${title} (VENCIDO)`;
        } else if (diasVencimiento <= 3) {
            title = `🔥 ${title} (${diasVencimiento}d)`;
        }

        return {
            id: this.id,
            title: title,
            start: this.fechaVencimiento,
            backgroundColor: this.getColor(),
            borderColor: this.getColorEstado(),
            textColor: '#ffffff',
            extendedProps: {
                tipo: 'gasto',
                monto: this.monto,
                descripcion: this.descripcion,
                prioridad: this.prioridad,
                estado: this.estado,
                diasVencimiento: diasVencimiento
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
            fechaVencimiento: this.fechaVencimiento,
            prioridad: this.prioridad,
            recurrente: this.recurrente,
            frecuencia: this.frecuencia,
            estado: this.estado,
            fechaPago: this.fechaPago,
            montoPagado: this.montoPagado,
            categoria: this.categoria,
            notas: this.notas,
            etiquetas: this.etiquetas,
            esDeuda: this.esDeuda,
            cuotasTotal: this.cuotasTotal,
            cuotasPagadas: this.cuotasPagadas,
            tasaInteres: this.tasaInteres,
            esVariable: this.esVariable,
            montoMinimo: this.montoMinimo,
            montoMaximo: this.montoMaximo,
            montoPromedio: this.montoPromedio,
            fechaCreacion: this.fechaCreacion,
            fechaModificacion: this.fechaModificacion,
            usuarioCreacion: this.usuarioCreacion
        };
    }

    // Crear copia del gasto
    clonar() {
        return new Gasto(this.toJSON());
    }

    // Actualizar datos
    actualizar(nuevosDatos) {
        const datosPreservados = {
            id: this.id,
            fechaCreacion: this.fechaCreacion,
            usuarioCreacion: this.usuarioCreacion
        };

        Object.assign(this, nuevosDatos, datosPreservados);
        this.fechaModificacion = new Date().toISOString();
        
        this.validate();
        
        return this;
    }

    // Métodos estáticos
    static fromJSON(json) {
        return new Gasto(typeof json === 'string' ? JSON.parse(json) : json);
    }

    static crearDeuda(datos) {
        return new Gasto({
            ...datos,
            esDeuda: true,
            prioridad: datos.prioridad || 'alta'
        });
    }

    static crearGastoFijo(datos) {
        return new Gasto({
            ...datos,
            recurrente: true,
            frecuencia: datos.frecuencia || 'mensual',
            prioridad: datos.prioridad || 'alta'
        });
    }

    static crearGastoVariable(datos) {
        return new Gasto({
            ...datos,
            esVariable: true,
            montoPromedio: datos.montoPromedio || datos.monto
        });
    }

    static obtenerTiposValidos() {
        return [
            { value: 'hipoteca', label: 'Hipoteca', icono: '🏠', categoria: 'Vivienda' },
            { value: 'alquiler', label: 'Alquiler', icono: '🏘️', categoria: 'Vivienda' },
            { value: 'servicios', label: 'Servicios', icono: '⚡', categoria: 'Servicios Básicos' },
            { value: 'alimentacion', label: 'Alimentación', icono: '🍽️', categoria: 'Alimentación' },
            { value: 'transporte', label: 'Transporte', icono: '🚗', categoria: 'Transporte' },
            { value: 'salud', label: 'Salud', icono: '🏥', categoria: 'Salud' },
            { value: 'educacion', label: 'Educación', icono: '📚', categoria: 'Educación' },
            { value: 'entretenimiento', label: 'Entretenimiento', icono: '🎬', categoria: 'Entretenimiento' },
            { value: 'deuda', label: 'Deuda', icono: '💳', categoria: 'Deudas' },
            { value: 'otro', label: 'Otro', icono: '💸', categoria: 'Varios' }
        ];
    }

    static obtenerPrioridadesValidas() {
        return [
            { value: 'alta', label: 'Alta (Obligatorio)', color: '#ef4444' },
            { value: 'media', label: 'Media (Importante)', color: '#f59e0b' },
            { value: 'baja', label: 'Baja (Opcional)', color: '#10b981' }
        ];
    }

    static obtenerFrecuenciasValidas() {
        return [
            { value: 'semanal', label: 'Semanal' },
            { value: 'quincenal', label: 'Quincenal' },
            { value: 'mensual', label: 'Mensual' },
            { value: 'anual', label: 'Anual' }
        ];
    }

    static obtenerEstadosValidos() {
        return [
            { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
            { value: 'pagado', label: 'Pagado', color: '#10b981' },
            { value: 'vencido', label: 'Vencido', color: '#ef4444' },
            { value: 'cancelado', label: 'Cancelado', color: '#6b7280' }
        ];
    }
}

// Exportar para uso global
window.Gasto = Gasto;

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gasto;
}
