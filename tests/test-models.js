/**
 * Pruebas para los modelos de datos (Ingreso y Gasto)
 */

// Configurar entorno de prueba para modelos
function configurarEntornoModelos() {
    // Simulamos las clases si no están disponibles
    if (typeof Ingreso === 'undefined') {
        global.Ingreso = class Ingreso {
            constructor(datos) {
                this.id = datos.id || this.generarId();
                this.fuente = datos.fuente;
                this.monto = datos.monto;
                this.fecha = datos.fecha;
                this.recurrente = datos.recurrente || false;
                this.frecuencia = datos.frecuencia;
                this.estado = datos.estado || 'activo';
                this.descripcion = datos.descripcion || '';
                this.categoria = datos.categoria || 'general';
                this.fechaCreacion = datos.fechaCreacion || new Date().toISOString();
            }
            
            generarId() {
                return 'ingreso_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            validar() {
                const errores = [];
                
                if (!this.fuente || this.fuente.trim() === '') {
                    errores.push('La fuente del ingreso es requerida');
                }
                
                if (!this.monto || this.monto <= 0) {
                    errores.push('El monto debe ser mayor a 0');
                }
                
                if (!this.fecha) {
                    errores.push('La fecha es requerida');
                }
                
                if (this.recurrente && !this.frecuencia) {
                    errores.push('La frecuencia es requerida para ingresos recurrentes');
                }
                
                return errores;
            }
            
            calcularProximaFecha() {
                if (!this.recurrente) return null;
                
                const fecha = new Date(this.fecha);
                
                switch (this.frecuencia) {
                    case 'diario':
                        fecha.setDate(fecha.getDate() + 1);
                        break;
                    case 'semanal':
                        fecha.setDate(fecha.getDate() + 7);
                        break;
                    case 'quincenal':
                        fecha.setDate(fecha.getDate() + 15);
                        break;
                    case 'mensual':
                        fecha.setMonth(fecha.getMonth() + 1);
                        break;
                    case 'anual':
                        fecha.setFullYear(fecha.getFullYear() + 1);
                        break;
                    default:
                        return null;
                }
                
                return fecha.toISOString().split('T')[0];
            }
            
            toJSON() {
                return {
                    id: this.id,
                    fuente: this.fuente,
                    monto: this.monto,
                    fecha: this.fecha,
                    recurrente: this.recurrente,
                    frecuencia: this.frecuencia,
                    estado: this.estado,
                    descripcion: this.descripcion,
                    categoria: this.categoria,
                    fechaCreacion: this.fechaCreacion
                };
            }
        };
    }
    
    if (typeof Gasto === 'undefined') {
        global.Gasto = class Gasto {
            constructor(datos) {
                this.id = datos.id || this.generarId();
                this.nombre = datos.nombre;
                this.monto = datos.monto;
                this.fechaVencimiento = datos.fechaVencimiento;
                this.prioridad = datos.prioridad || 'media';
                this.estado = datos.estado || 'pendiente';
                this.recurrente = datos.recurrente || false;
                this.frecuencia = datos.frecuencia;
                this.categoria = datos.categoria || 'general';
                this.descripcion = datos.descripcion || '';
                this.fechaCreacion = datos.fechaCreacion || new Date().toISOString();
            }
            
            generarId() {
                return 'gasto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            validar() {
                const errores = [];
                
                if (!this.nombre || this.nombre.trim() === '') {
                    errores.push('El nombre del gasto es requerido');
                }
                
                if (!this.monto || this.monto <= 0) {
                    errores.push('El monto debe ser mayor a 0');
                }
                
                if (!this.fechaVencimiento) {
                    errores.push('La fecha de vencimiento es requerida');
                }
                
                if (!['alta', 'media', 'baja'].includes(this.prioridad)) {
                    errores.push('La prioridad debe ser alta, media o baja');
                }
                
                if (!['pendiente', 'pagado', 'vencido'].includes(this.estado)) {
                    errores.push('El estado debe ser pendiente, pagado o vencido');
                }
                
                return errores;
            }
            
            calcularDiasVencimiento() {
                const hoy = new Date();
                const vencimiento = new Date(this.fechaVencimiento);
                const diferencia = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
                return diferencia;
            }
            
            estaVencido() {
                return this.calcularDiasVencimiento() < 0;
            }
            
            esUrgente() {
                const dias = this.calcularDiasVencimiento();
                return dias <= 3 && dias >= 0 && this.prioridad === 'alta';
            }
            
            calcularProximaFecha() {
                if (!this.recurrente) return null;
                
                const fecha = new Date(this.fechaVencimiento);
                
                switch (this.frecuencia) {
                    case 'diario':
                        fecha.setDate(fecha.getDate() + 1);
                        break;
                    case 'semanal':
                        fecha.setDate(fecha.getDate() + 7);
                        break;
                    case 'quincenal':
                        fecha.setDate(fecha.getDate() + 15);
                        break;
                    case 'mensual':
                        fecha.setMonth(fecha.getMonth() + 1);
                        break;
                    case 'anual':
                        fecha.setFullYear(fecha.getFullYear() + 1);
                        break;
                    default:
                        return null;
                }
                
                return fecha.toISOString().split('T')[0];
            }
            
            toJSON() {
                return {
                    id: this.id,
                    nombre: this.nombre,
                    monto: this.monto,
                    fechaVencimiento: this.fechaVencimiento,
                    prioridad: this.prioridad,
                    estado: this.estado,
                    recurrente: this.recurrente,
                    frecuencia: this.frecuencia,
                    categoria: this.categoria,
                    descripcion: this.descripcion,
                    fechaCreacion: this.fechaCreacion
                };
            }
        };
    }
}

function ejecutarPruebasModelos() {
    console.log('\n📦 === PRUEBAS DE MODELOS ===');
    
    configurarEntornoModelos();
    const { ejecutarPrueba, assert, assertEqual } = testUtils || 
        { ejecutarPrueba: global.ejecutarPrueba, assert: global.assert, assertEqual: global.assertEqual };
    
    const resultados = [];
    
    // === PRUEBAS DE INGRESO ===
    
    // Prueba 1: Crear ingreso válido
    resultados.push(ejecutarPrueba('Ingreso - Creación válida', () => {
        const datos = {
            fuente: 'Salario Test',
            monto: 50000,
            fecha: '2025-06-15',
            recurrente: true,
            frecuencia: 'mensual'
        };
        
        const ingreso = new Ingreso(datos);
        
        assertEqual(ingreso.fuente, datos.fuente);
        assertEqual(ingreso.monto, datos.monto);
        assertEqual(ingreso.fecha, datos.fecha);
        assert(ingreso.id !== undefined, 'Debe generar un ID');
        return true;
    }));
    
    // Prueba 2: Validación de ingreso
    resultados.push(ejecutarPrueba('Ingreso - Validación', () => {
        const ingresoInvalido = new Ingreso({
            fuente: '',
            monto: -100,
            fecha: '',
            recurrente: true,
            frecuencia: ''
        });
        
        const errores = ingresoInvalido.validar();
        
        assert(errores.length > 0, 'Debe tener errores de validación');
        assert(errores.some(e => e.includes('fuente')), 'Debe validar fuente');
        assert(errores.some(e => e.includes('monto')), 'Debe validar monto');
        assert(errores.some(e => e.includes('fecha')), 'Debe validar fecha');
        assert(errores.some(e => e.includes('frecuencia')), 'Debe validar frecuencia');
        return true;
    }));
    
    // Prueba 3: Cálculo de próxima fecha
    resultados.push(ejecutarPrueba('Ingreso - Próxima fecha mensual', () => {
        const ingreso = new Ingreso({
            fuente: 'Test',
            monto: 1000,
            fecha: '2025-06-15',
            recurrente: true,
            frecuencia: 'mensual'
        });
        
        const proximaFecha = ingreso.calcularProximaFecha();
        assertEqual(proximaFecha, '2025-07-15');
        return true;
    }));
    
    // Prueba 4: JSON serialización
    resultados.push(ejecutarPrueba('Ingreso - Serialización JSON', () => {
        const datos = {
            fuente: 'Test JSON',
            monto: 25000,
            fecha: '2025-06-15'
        };
        
        const ingreso = new Ingreso(datos);
        const json = ingreso.toJSON();
        
        assertEqual(json.fuente, datos.fuente);
        assertEqual(json.monto, datos.monto);
        assertEqual(json.fecha, datos.fecha);
        return true;
    }));
    
    // === PRUEBAS DE GASTO ===
    
    // Prueba 5: Crear gasto válido
    resultados.push(ejecutarPrueba('Gasto - Creación válida', () => {
        const datos = {
            nombre: 'Hipoteca Test',
            monto: 20000,
            fechaVencimiento: '2025-06-30',
            prioridad: 'alta',
            estado: 'pendiente'
        };
        
        const gasto = new Gasto(datos);
        
        assertEqual(gasto.nombre, datos.nombre);
        assertEqual(gasto.monto, datos.monto);
        assertEqual(gasto.fechaVencimiento, datos.fechaVencimiento);
        assertEqual(gasto.prioridad, datos.prioridad);
        assert(gasto.id !== undefined, 'Debe generar un ID');
        return true;
    }));
    
    // Prueba 6: Validación de gasto
    resultados.push(ejecutarPrueba('Gasto - Validación', () => {
        const gastoInvalido = new Gasto({
            nombre: '',
            monto: 0,
            fechaVencimiento: '',
            prioridad: 'invalida',
            estado: 'invalido'
        });
        
        const errores = gastoInvalido.validar();
        
        assert(errores.length > 0, 'Debe tener errores de validación');
        assert(errores.some(e => e.includes('nombre')), 'Debe validar nombre');
        assert(errores.some(e => e.includes('monto')), 'Debe validar monto');
        assert(errores.some(e => e.includes('vencimiento')), 'Debe validar fecha');
        assert(errores.some(e => e.includes('prioridad')), 'Debe validar prioridad');
        assert(errores.some(e => e.includes('estado')), 'Debe validar estado');
        return true;
    }));
    
    // Prueba 7: Cálculo de días de vencimiento
    resultados.push(ejecutarPrueba('Gasto - Días de vencimiento', () => {
        // Crear gasto que vence en 5 días
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 5);
        
        const gasto = new Gasto({
            nombre: 'Test Vencimiento',
            monto: 1000,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0]
        });
        
        const dias = gasto.calcularDiasVencimiento();
        assert(dias === 5, `Debe calcular 5 días, calculó ${dias}`);
        return true;
    }));
    
    // Prueba 8: Verificar si está vencido
    resultados.push(ejecutarPrueba('Gasto - Verificar vencido', () => {
        // Crear gasto vencido (ayer)
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() - 1);
        
        const gastoVencido = new Gasto({
            nombre: 'Test Vencido',
            monto: 1000,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0]
        });
        
        assert(gastoVencido.estaVencido(), 'Debe estar vencido');
        return true;
    }));
    
    // Prueba 9: Verificar si es urgente
    resultados.push(ejecutarPrueba('Gasto - Verificar urgente', () => {
        // Crear gasto urgente (vence en 2 días con prioridad alta)
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 2);
        
        const gastoUrgente = new Gasto({
            nombre: 'Test Urgente',
            monto: 1000,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            prioridad: 'alta'
        });
        
        assert(gastoUrgente.esUrgente(), 'Debe ser urgente');
        return true;
    }));
    
    // Prueba 10: Próxima fecha recurrente
    resultados.push(ejecutarPrueba('Gasto - Próxima fecha mensual', () => {
        const gasto = new Gasto({
            nombre: 'Test Recurrente',
            monto: 1000,
            fechaVencimiento: '2025-06-15',
            recurrente: true,
            frecuencia: 'mensual'
        });
        
        const proximaFecha = gasto.calcularProximaFecha();
        assertEqual(proximaFecha, '2025-07-15');
        return true;
    }));
    
    const exitosos = resultados.filter(r => r).length;
    const total = resultados.length;
    
    console.log(`\n📊 Resultados de Modelos: ${exitosos}/${total} pruebas pasaron`);
    return { exitosos, total, porcentaje: (exitosos / total) * 100 };
}

// Ejecutar si está en Node.js
if (typeof require !== 'undefined' && require.main === module) {
    ejecutarPruebasModelos();
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ejecutarPruebasModelos };
}
