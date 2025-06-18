/**
 * Utilidades para exportar e importar datos del sistema
 * Permite guardar y cargar información en diferentes formatos
 */

class ExportadorDatos {
    constructor() {
        this.formatos = ['json', 'csv', 'excel'];
        this.configurarEventListeners();
    }

    configurarEventListeners() {
        // Botón de exportar
        const btnExportar = document.getElementById('exportar-datos');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.mostrarModalExportar();
            });
        }

        // Botón de importar
        const btnImportar = document.getElementById('importar-datos');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                this.mostrarModalImportar();
            });
        }
    }

    /**
     * Exportar todos los datos del sistema
     */
    async exportarTodosDatos(formato = 'json') {
        try {
            const datos = await this.recopilarTodosDatos();
            
            switch (formato.toLowerCase()) {
                case 'json':
                    return this.exportarJSON(datos);
                case 'csv':
                    return this.exportarCSV(datos);
                case 'excel':
                    return this.exportarExcel(datos);
                default:
                    throw new Error(`Formato no soportado: ${formato}`);
            }
        } catch (error) {
            console.error('Error exportando datos:', error);
            throw error;
        }
    }

    /**
     * Recopilar todos los datos del sistema
     */
    async recopilarTodosDatos() {
        const datos = {
            version: '1.0.0',
            fechaExportacion: new Date().toISOString(),
            datos: {}
        };

        if (window.indexedDBManager) {
            try {
                datos.datos.ingresos = await window.indexedDBManager.obtenerIngresos();
                datos.datos.gastos = await window.indexedDBManager.obtenerGastos();
                datos.datos.conexiones = await window.indexedDBManager.obtenerConexiones();
                datos.datos.proyecciones = await window.indexedDBManager.obtenerProyecciones();
                datos.datos.diagramas = await window.indexedDBManager.obtenerDiagramas();
            } catch (error) {
                console.warn('Error obteniendo datos de IndexedDB:', error);
            }
        }

        // Agregar configuración desde localStorage
        if (window.localStorageManager) {
            try {
                datos.configuracion = window.localStorageManager.get('configuracion');
            } catch (error) {
                console.warn('Error obteniendo configuración:', error);
            }
        }

        // Estadísticas
        datos.estadisticas = {
            totalIngresos: datos.datos.ingresos?.length || 0,
            totalGastos: datos.datos.gastos?.length || 0,
            totalConexiones: datos.datos.conexiones?.length || 0,
            montoTotalIngresos: this.calcularTotal(datos.datos.ingresos, 'monto'),
            montoTotalGastos: this.calcularTotal(datos.datos.gastos, 'monto')
        };

        return datos;
    }

    /**
     * Exportar en formato JSON
     */
    exportarJSON(datos) {
        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        
        const filename = `sgfp-backup-${this.generarFechaArchivo()}.json`;
        this.descargarArchivo(blob, filename);
        
        return { success: true, filename, size: blob.size };
    }

    /**
     * Exportar en formato CSV
     */
    exportarCSV(datos) {
        const csvs = {};
        
        // Exportar ingresos
        if (datos.datos.ingresos) {
            csvs.ingresos = this.convertirArrayACSV(datos.datos.ingresos, [
                'id', 'descripcion', 'tipo', 'monto', 'fecha', 
                'recurrente', 'frecuencia', 'estado'
            ]);
        }

        // Exportar gastos
        if (datos.datos.gastos) {
            csvs.gastos = this.convertirArrayACSV(datos.datos.gastos, [
                'id', 'descripcion', 'tipo', 'monto', 'fechaVencimiento',
                'prioridad', 'estado', 'recurrente', 'frecuencia'
            ]);
        }

        // Crear ZIP con todos los CSVs
        return this.crearZipCSV(csvs);
    }

    /**
     * Convertir array a CSV
     */
    convertirArrayACSV(array, columnas) {
        if (!array || array.length === 0) return '';

        const headers = columnas.map(col => `"${col}"`).join(',');
        const filas = array.map(item => {
            return columnas.map(col => {
                const valor = item[col] || '';
                return `"${String(valor).replace(/"/g, '""')}"`;
            }).join(',');
        });

        return [headers, ...filas].join('\n');
    }

    /**
     * Crear ZIP con archivos CSV
     */
    async crearZipCSV(csvs) {
        // Para simplificar, descargar cada CSV por separado
        const timestamp = this.generarFechaArchivo();
        
        for (const [nombre, contenido] of Object.entries(csvs)) {
            if (contenido) {
                const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
                this.descargarArchivo(blob, `sgfp-${nombre}-${timestamp}.csv`);
            }
        }

        return { success: true, archivos: Object.keys(csvs).length };
    }

    /**
     * Exportar a Excel (simplificado como CSV con extensión .xlsx)
     */
    exportarExcel(datos) {
        // Para una implementación completa se necesitaría una librería como SheetJS
        // Por ahora, exportamos como CSV con extensión .xlsx
        const resultado = this.exportarCSV(datos);
        return resultado;
    }

    /**
     * Importar datos desde archivo
     */
    async importarDatos(archivo) {
        try {
            const extension = archivo.name.split('.').pop().toLowerCase();
            let datos;

            switch (extension) {
                case 'json':
                    datos = await this.importarJSON(archivo);
                    break;
                case 'csv':
                    datos = await this.importarCSV(archivo);
                    break;
                default:
                    throw new Error(`Formato de archivo no soportado: ${extension}`);
            }

            // Validar datos
            this.validarDatosImportacion(datos);

            // Importar a la base de datos
            const resultado = await this.procesarImportacion(datos);

            return resultado;

        } catch (error) {
            console.error('Error importando datos:', error);
            throw error;
        }
    }

    /**
     * Importar desde JSON
     */
    async importarJSON(archivo) {
        const texto = await this.leerArchivoTexto(archivo);
        const datos = JSON.parse(texto);
        return datos;
    }

    /**
     * Importar desde CSV
     */
    async importarCSV(archivo) {
        const texto = await this.leerArchivoTexto(archivo);
        const nombre = archivo.name.replace('.csv', '');
        
        // Determinar tipo de datos por el nombre del archivo
        let tipo = 'ingresos';
        if (nombre.includes('gasto')) tipo = 'gastos';
        if (nombre.includes('conexion')) tipo = 'conexiones';
        
        const array = this.parsearCSV(texto);
        
        return {
            datos: {
                [tipo]: array
            }
        };
    }

    /**
     * Parsear CSV a array de objetos
     */
    parsearCSV(texto) {
        const lineas = texto.split('\n').filter(linea => linea.trim());
        if (lineas.length < 2) return [];

        const headers = lineas[0].split(',').map(h => h.replace(/"/g, '').trim());
        const datos = [];

        for (let i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(',').map(v => v.replace(/"/g, '').trim());
            const objeto = {};
            
            headers.forEach((header, index) => {
                let valor = valores[index] || '';
                
                // Convertir tipos básicos
                if (valor === 'true') valor = true;
                else if (valor === 'false') valor = false;
                else if (!isNaN(valor) && valor !== '') valor = Number(valor);
                
                objeto[header] = valor;
            });
            
            datos.push(objeto);
        }

        return datos;
    }

    /**
     * Validar datos de importación
     */
    validarDatosImportacion(datos) {
        if (!datos || typeof datos !== 'object') {
            throw new Error('Formato de datos inválido');
        }

        // Validar estructura básica
        if (datos.datos) {
            const tiposValidos = ['ingresos', 'gastos', 'conexiones', 'proyecciones', 'diagramas'];
            
            for (const [tipo, array] of Object.entries(datos.datos)) {
                if (!tiposValidos.includes(tipo)) {
                    console.warn(`Tipo de datos desconocido: ${tipo}`);
                    continue;
                }
                
                if (!Array.isArray(array)) {
                    throw new Error(`Los datos de ${tipo} deben ser un array`);
                }
            }
        }
    }

    /**
     * Procesar importación en la base de datos
     */
    async procesarImportacion(datos) {
        if (!window.indexedDBManager) {
            throw new Error('Base de datos no disponible');
        }

        const resultado = {
            importados: {},
            errores: [],
            total: 0
        };

        // Confirmar antes de importar
        const confirmar = confirm(
            '¿Estás seguro de que quieres importar estos datos? ' +
            'Esto puede sobrescribir datos existentes.'
        );
        
        if (!confirmar) {
            throw new Error('Importación cancelada por el usuario');
        }

        try {
            // Importar cada tipo de datos
            if (datos.datos) {
                for (const [tipo, items] of Object.entries(datos.datos)) {
                    if (!Array.isArray(items) || items.length === 0) continue;

                    resultado.importados[tipo] = 0;
                    
                    for (const item of items) {
                        try {
                            // Generar nuevo ID si no existe
                            if (!item.id) {
                                item.id = this.generarId();
                            }
                            
                            await window.indexedDBManager.add(tipo, item);
                            resultado.importados[tipo]++;
                            resultado.total++;
                            
                        } catch (error) {
                            resultado.errores.push({
                                tipo: tipo,
                                item: item.id || 'sin ID',
                                error: error.message
                            });
                        }
                    }
                }
            }

            // Importar configuración si existe
            if (datos.configuracion && window.localStorageManager) {
                window.localStorageManager.set('configuracion', datos.configuracion);
            }

            return resultado;

        } catch (error) {
            console.error('Error durante la importación:', error);
            throw error;
        }
    }

    /**
     * Mostrar modal de exportación
     */
    mostrarModalExportar() {
        const modal = this.crearModalExportar();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Crear modal de exportación
     */
    crearModalExportar() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📤 Exportar Datos</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <p>Selecciona el formato para exportar tus datos:</p>
                    <div style="margin: 1rem 0;">
                        <label style="display: block; margin-bottom: 0.5rem;">
                            <input type="radio" name="formato-exportar" value="json" checked>
                            JSON (Completo, recomendado para respaldos)
                        </label>
                        <label style="display: block; margin-bottom: 0.5rem;">
                            <input type="radio" name="formato-exportar" value="csv">
                            CSV (Para análisis en Excel)
                        </label>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                        <button 
                            class="btn-secondary"
                            onclick="this.closest('.modal').remove()"
                        >
                            Cancelar
                        </button>
                        <button 
                            class="btn-primary"
                            onclick="window.exportadorDatos.ejecutarExportacion(this.closest('.modal'))"
                        >
                            📥 Exportar
                        </button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Ejecutar exportación desde modal
     */
    async ejecutarExportacion(modal) {
        try {
            const formato = modal.querySelector('input[name="formato-exportar"]:checked').value;
            
            // Mostrar indicador de carga
            const btn = modal.querySelector('.btn-primary');
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '⏳ Exportando...';
            btn.disabled = true;

            const resultado = await this.exportarTodosDatos(formato);
            
            modal.remove();
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: `Datos exportados exitosamente en formato ${formato.toUpperCase()}`,
                    tipo: 'success'
                });
            }

        } catch (error) {
            console.error('Error en exportación:', error);
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Error al exportar datos: ' + error.message,
                    tipo: 'error'
                });
            }
        }
    }

    /**
     * Mostrar modal de importación
     */
    mostrarModalImportar() {
        const modal = this.crearModalImportar();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Crear modal de importación
     */
    crearModalImportar() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📤 Importar Datos</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <p>Selecciona el archivo de respaldo para importar:</p>
                    <div style="margin: 1rem 0;">
                        <input 
                            type="file" 
                            id="archivo-importar" 
                            accept=".json,.csv"
                            style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
                        >
                        <p style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                            Formatos soportados: JSON (.json), CSV (.csv)
                        </p>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                        <button 
                            class="btn-secondary"
                            onclick="this.closest('.modal').remove()"
                        >
                            Cancelar
                        </button>
                        <button 
                            class="btn-primary"
                            onclick="window.exportadorDatos.ejecutarImportacion(this.closest('.modal'))"
                        >
                            📤 Importar
                        </button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Ejecutar importación desde modal
     */
    async ejecutarImportacion(modal) {
        try {
            const archivo = modal.querySelector('#archivo-importar').files[0];
            
            if (!archivo) {
                alert('Por favor selecciona un archivo');
                return;
            }

            // Mostrar indicador de carga
            const btn = modal.querySelector('.btn-primary');
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '⏳ Importando...';
            btn.disabled = true;

            const resultado = await this.importarDatos(archivo);
            
            modal.remove();
            
            // Mostrar resultado
            let mensaje = `Importación completada. ${resultado.total} elementos importados.`;
            if (resultado.errores.length > 0) {
                mensaje += ` ${resultado.errores.length} errores encontrados.`;
            }

            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: mensaje,
                    tipo: resultado.errores.length > 0 ? 'warning' : 'success'
                });
            }

            // Recargar datos en las ventanas
            this.recargarVentanas();

        } catch (error) {
            console.error('Error en importación:', error);
            
            if (window.notificacionesManager) {
                window.notificacionesManager.mostrar({
                    mensaje: 'Error al importar datos: ' + error.message,
                    tipo: 'error'
                });
            }
        }
    }

    /**
     * Recargar datos en todas las ventanas
     */
    recargarVentanas() {
        if (window.ventanaIngresos) {
            window.ventanaIngresos.cargarIngresos();
        }
        if (window.ventanaGastos) {
            window.ventanaGastos.cargarGastos();
        }
        if (window.ventanaHojaCalculo) {
            window.ventanaHojaCalculo.actualizarProyecciones();
        }
    }

    /**
     * Utilidades
     */
    generarFechaArchivo() {
        const ahora = new Date();
        return ahora.toISOString().split('T')[0].replace(/-/g, '');
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    calcularTotal(array, campo) {
        if (!Array.isArray(array)) return 0;
        return array.reduce((sum, item) => sum + (parseFloat(item[campo]) || 0), 0);
    }

    async leerArchivoTexto(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(archivo);
        });
    }

    descargarArchivo(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Crear instancia global
window.exportadorDatos = new ExportadorDatos();

// Configurar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Exportador de datos inicializado');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportadorDatos;
}
