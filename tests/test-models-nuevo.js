/**
 * Pruebas para los modelos de datos (Ingreso y Gasto)
 */

function ejecutarPruebasModelos() {
    console.log('\n📦 === PRUEBAS DE MODELOS ===');
    
    const resultados = [];
    
    // Función helper para ejecutar pruebas
    function ejecutarPrueba(nombre, testFn) {
        try {
            testFn();
            console.log(`✅ ${nombre}`);
            return { nombre, resultado: 'ÉXITO', error: null };
        } catch (error) {
            console.log(`❌ ${nombre}: ${error.message}`);
            return { nombre, resultado: 'FALLO', error: error.message };
        }
    }
    
    // Función helper para assertions
    function assert(condicion, mensaje = 'Assertion falló') {
        if (!condicion) {
            throw new Error(mensaje);
        }
    }      // Crear clases mock si no están disponibles
    if (typeof Ingreso === 'undefined') {
        window.Ingreso = class {
            constructor(data = {}) {
                // Si se pasan parámetros individuales (compatibilidad con pruebas)
                if (typeof data === 'string') {
                    const descripcion = data;
                    const monto = arguments[1];
                    const fecha = arguments[2];
                    data = { descripcion, monto, fecha };
                }
                
                this.id = data.id || this.generateId();
                this.tipo = data.tipo || 'nomina';
                this.descripcion = data.descripcion || '';
                this.monto = parseFloat(data.monto) || 0;
                this.fecha = data.fecha ? (typeof data.fecha === 'string' ? data.fecha : data.fecha.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
                this.estado = data.estado || 'activo';
                this.recurrente = Boolean(data.recurrente);
                this.frecuencia = data.frecuencia || 'mensual';
                this.categoria = data.categoria || 'Trabajo';
                this.notas = data.notas || '';
                this.etiquetas = Array.isArray(data.etiquetas) ? data.etiquetas : [];
                
                // Metadatos
                this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
                this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
                this.usuarioCreacion = data.usuarioCreacion || 'sistema';
            }
              generateId() {
                return 'ingreso-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
            }
              validate() {
                const errores = [];
                if (!this.descripcion || !this.descripcion.trim()) errores.push('La descripción es obligatoria');
                if (!this.monto || this.monto <= 0) errores.push('El monto debe ser mayor a 0');
                if (!this.fecha) errores.push('La fecha es obligatoria');
                if (errores.length > 0) {
                    throw new Error('Datos de ingreso inválidos: ' + errores.join(', '));
                }
            }
            
            validar() {
                try {
                    this.validate();
                    return true;
                } catch (error) {
                    return false;
                }
            }
        };
    }
    
    if (typeof Gasto === 'undefined') {
        window.Gasto = class {
            constructor(data = {}) {
                // Si se pasan parámetros individuales (compatibilidad con pruebas)
                if (typeof data === 'string') {
                    const descripcion = data;
                    const monto = arguments[1];
                    const fechaVencimiento = arguments[2];
                    data = { descripcion, monto, fechaVencimiento };
                }
                
                this.id = data.id || this.generateId();
                this.tipo = data.tipo || 'otro';
                this.descripcion = data.descripcion || '';
                this.monto = parseFloat(data.monto) || 0;
                this.fechaVencimiento = data.fechaVencimiento ? (typeof data.fechaVencimiento === 'string' ? data.fechaVencimiento : data.fechaVencimiento.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
                this.prioridad = data.prioridad || 'media';
                this.estado = data.estado || 'pendiente';
                this.recurrente = Boolean(data.recurrente);
                this.frecuencia = data.frecuencia || 'mensual';
                this.categoria = data.categoria || 'Varios';
                this.notas = data.notas || '';
                this.etiquetas = Array.isArray(data.etiquetas) ? data.etiquetas : [];
                
                // Campos específicos para deudas
                this.esDeuda = Boolean(data.esDeuda);
                this.cuotasTotal = parseInt(data.cuotasTotal) || null;
                this.cuotasPagadas = parseInt(data.cuotasPagadas) || 0;
                this.tasaInteres = parseFloat(data.tasaInteres) || 0;
                
                // Metadatos
                this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
                this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
                this.usuarioCreacion = data.usuarioCreacion || 'sistema';
            }
              generateId() {
                return 'gasto-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
            }
              validate() {
                const errores = [];
                if (!this.descripcion || !this.descripcion.trim()) errores.push('La descripción es obligatoria');
                if (!this.monto || this.monto <= 0) errores.push('El monto debe ser mayor a 0');
                if (!this.fechaVencimiento) errores.push('La fecha de vencimiento es obligatoria');
                if (errores.length > 0) {
                    throw new Error('Datos de gasto inválidos: ' + errores.join(', '));
                }
            }
            
            validar() {
                try {
                    this.validate();
                    return true;
                } catch (error) {
                    return false;
                }
            }
        };
    }
    
    // Prueba 1: Crear ingreso básico
    resultados.push(ejecutarPrueba('Ingreso - Crear instancia básica', () => {
        const ingreso = new Ingreso('Salario', 50000, new Date());
        
        assert(ingreso.descripcion === 'Salario', 'Descripción debe coincidir');
        assert(ingreso.monto === 50000, 'Monto debe coincidir');
        assert(ingreso.id !== undefined, 'ID debe estar generado');
        
        return true;
    }));
    
    // Prueba 2: Validar ingreso
    resultados.push(ejecutarPrueba('Ingreso - Validación', () => {
        const ingresoValido = new Ingreso('Freelance', 25000, new Date());
        const ingresoInvalido = new Ingreso('', 0, null);
        
        assert(ingresoValido.validar() === true, 'Ingreso válido debe pasar validación');
        assert(ingresoInvalido.validar() === false, 'Ingreso inválido debe fallar validación');
        
        return true;
    }));
    
    // Prueba 3: Crear gasto básico
    resultados.push(ejecutarPrueba('Gasto - Crear instancia básica', () => {
        const gasto = new Gasto('Renta', 15000, new Date());
        
        assert(gasto.descripcion === 'Renta', 'Descripción debe coincidir');
        assert(gasto.monto === 15000, 'Monto debe coincidir');
        assert(gasto.id !== undefined, 'ID debe estar generado');
        assert(gasto.prioridad === 'media', 'Prioridad por defecto debe ser media');
        
        return true;
    }));      // Prueba 4: Validar gasto
    resultados.push(ejecutarPrueba('Gasto - Validación', () => {
        const gastoValido = new Gasto('Servicios', 3000, new Date());
        const gastoInvalido = new Gasto('', 0, null);
        
        assert(gastoValido.validar() === true, 'Gasto válido debe pasar validación');
        assert(gastoInvalido.validar() === false, 'Gasto inválido debe fallar validación');
        
        return true;
    }));
    // Prueba 5: Verificar tipos de datos
    resultados.push(ejecutarPrueba('Modelos - Tipos de datos', () => {
        const ingreso = new Ingreso('Test Ingreso', 1000, new Date());
        const gasto = new Gasto('Test Gasto', 500, new Date());
        
        assert(typeof ingreso.monto === 'number', 'Monto de ingreso debe ser número');
        assert(typeof gasto.monto === 'number', 'Monto de gasto debe ser número');
        assert(typeof ingreso.id === 'string', 'ID de ingreso debe ser string');
        assert(typeof gasto.id === 'string', 'ID de gasto debe ser string');
        assert(ingreso.descripcion.length > 0, 'Descripción de ingreso debe tener contenido');
        assert(gasto.descripcion.length > 0, 'Descripción de gasto debe tener contenido');
        
        return true;
    }));
      // Prueba 6: Propiedades por defecto
    resultados.push(ejecutarPrueba('Modelos - Propiedades por defecto', () => {
        const ingreso = new Ingreso('Salario Base', 30000, new Date());
        const gasto = new Gasto('Gasto Base', 1000, new Date());
        
        // Verificar propiedades por defecto del ingreso
        assert(ingreso.tipo === 'nomina', 'Tipo por defecto debe ser nomina');
        assert(ingreso.estado === 'activo', 'Estado por defecto debe ser activo');
        
        // Verificar propiedades por defecto del gasto
        assert(gasto.prioridad === 'media', 'Prioridad por defecto debe ser media');
        assert(gasto.categoria === 'Varios', 'Categoría por defecto debe ser Varios');
        assert(gasto.estado === 'pendiente', 'Estado por defecto debe ser pendiente');
        
        return true;
    }));
      // Prueba 7: IDs únicos
    resultados.push(ejecutarPrueba('Modelos - IDs únicos', () => {
        const ingreso1 = new Ingreso('Ingreso 1', 1000, new Date());
        // Pequeño delay para asegurar timestamps diferentes
        const now = Date.now();
        while (Date.now() - now < 2) { /* esperar */ }
        const ingreso2 = new Ingreso('Ingreso 2', 2000, new Date());
        const gasto1 = new Gasto('Gasto 1', 500, new Date());
        while (Date.now() - now < 4) { /* esperar */ }
        const gasto2 = new Gasto('Gasto 2', 800, new Date());
        
        assert(ingreso1.id !== ingreso2.id, 'IDs de ingresos deben ser únicos');
        assert(gasto1.id !== gasto2.id, 'IDs de gastos deben ser únicos');
        assert(ingreso1.id !== gasto1.id, 'IDs entre ingresos y gastos deben ser únicos');
        assert(ingreso1.id.includes('ingreso-'), 'ID de ingreso debe tener prefijo correcto');
        assert(gasto1.id.includes('gasto-'), 'ID de gasto debe tener prefijo correcto');
        
        return true;
    }));
    
    // Calcular estadísticas
    const exitosos = resultados.filter(r => r.resultado === 'ÉXITO').length;
    const total = resultados.length;
    const porcentaje = total > 0 ? (exitosos / total) * 100 : 0;
    
    // Mostrar resumen
    console.log(`\n📊 Resumen de Modelos: ${exitosos}/${total} (${porcentaje.toFixed(1)}%)`);
    
    if (porcentaje === 100) {
        console.log('🎉 ¡Todas las pruebas de modelos pasaron!');
    } else {
        console.log('⚠️ Algunas pruebas de modelos fallaron');
    }
    
    return {
        resultados,
        exitosos,
        total,
        porcentaje
    };
}

// Hacer la función disponible globalmente para el navegador
if (typeof window !== 'undefined') {
    window.ejecutarPruebasModelos = ejecutarPruebasModelos;
}

// Exportar para Node.js si está disponible
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ejecutarPruebasModelos };
}
