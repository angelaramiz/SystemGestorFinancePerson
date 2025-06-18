/**
 * Ejecutor principal de todas las pruebas
 */

// Importar todos los archivos de prueba
let testStorage, testModels, testAlgorithm;

if (typeof require !== 'undefined') {
    // En Node.js
    testStorage = require('./test-storage.js');
    testModels = require('./test-models.js');
    testAlgorithm = require('./test-algorithm.js');
} else {
    // En el navegador, las funciones estarán disponibles globalmente
    testStorage = { ejecutarPruebasAlmacenamiento: window.ejecutarPruebasAlmacenamiento };
    testModels = { ejecutarPruebasModelos: window.ejecutarPruebasModelos };
    testAlgorithm = { ejecutarPruebasAlgoritmo: window.ejecutarPruebasAlgoritmo };
}

function ejecutarTodasLasPruebas() {
    console.log('\n🚀 === EJECUTANDO TODAS LAS PRUEBAS ===');
    console.log('Fecha de ejecución:', new Date().toLocaleString());
    console.log('='.repeat(50));
    
    const resultados = {};
    let totalPruebas = 0;
    let totalExitosas = 0;
    
    try {
        // Ejecutar pruebas de almacenamiento
        console.log('\n1️⃣ Ejecutando pruebas de almacenamiento...');
        resultados.almacenamiento = testStorage.ejecutarPruebasAlmacenamiento();
        totalPruebas += resultados.almacenamiento.total;
        totalExitosas += resultados.almacenamiento.exitosos;
        
    } catch (error) {
        console.error('❌ Error en pruebas de almacenamiento:', error);
        resultados.almacenamiento = { exitosos: 0, total: 0, porcentaje: 0, error: error.message };
    }
    
    try {
        // Ejecutar pruebas de modelos
        console.log('\n2️⃣ Ejecutando pruebas de modelos...');
        resultados.modelos = testModels.ejecutarPruebasModelos();
        totalPruebas += resultados.modelos.total;
        totalExitosas += resultados.modelos.exitosos;
        
    } catch (error) {
        console.error('❌ Error en pruebas de modelos:', error);
        resultados.modelos = { exitosos: 0, total: 0, porcentaje: 0, error: error.message };
    }
    
    try {
        // Ejecutar pruebas de algoritmo
        console.log('\n3️⃣ Ejecutando pruebas de algoritmo...');
        resultados.algoritmo = testAlgorithm.ejecutarPruebasAlgoritmo();
        totalPruebas += resultados.algoritmo.total;
        totalExitosas += resultados.algoritmo.exitosos;
        
    } catch (error) {
        console.error('❌ Error en pruebas de algoritmo:', error);
        resultados.algoritmo = { exitosos: 0, total: 0, porcentaje: 0, error: error.message };
    }
    
    // Mostrar resumen final
    mostrarResumenFinal(resultados, totalExitosas, totalPruebas);
    
    return {
        resultados,
        resumen: {
            totalExitosas,
            totalPruebas,
            porcentajeGeneral: totalPruebas > 0 ? (totalExitosas / totalPruebas) * 100 : 0,
            estado: totalExitosas === totalPruebas ? 'ÉXITO' : 'FALLO'
        }
    };
}

function mostrarResumenFinal(resultados, totalExitosas, totalPruebas) {
    console.log('\n' + '='.repeat(50));
    console.log('📋 === RESUMEN FINAL DE PRUEBAS ===');
    console.log('='.repeat(50));
    
    // Mostrar resultados por categoría
    Object.entries(resultados).forEach(([categoria, resultado]) => {
        const icono = resultado.porcentaje === 100 ? '✅' : 
                     resultado.porcentaje >= 80 ? '⚠️' : '❌';
        
        console.log(`${icono} ${categoria.toUpperCase()}:`);
        console.log(`   Exitosas: ${resultado.exitosos}/${resultado.total}`);
        console.log(`   Porcentaje: ${resultado.porcentaje.toFixed(1)}%`);
        
        if (resultado.error) {
            console.log(`   Error: ${resultado.error}`);
        }
        console.log('');
    });
    
    // Resumen general
    const porcentajeGeneral = totalPruebas > 0 ? (totalExitosas / totalPruebas) * 100 : 0;
    const estadoGeneral = totalExitosas === totalPruebas ? 'ÉXITO TOTAL' : 
                         porcentajeGeneral >= 80 ? 'ÉXITO PARCIAL' : 'FALLÓ';
    
    console.log('📊 RESULTADO GENERAL:');
    console.log(`   Total de pruebas: ${totalPruebas}`);
    console.log(`   Pruebas exitosas: ${totalExitosas}`);
    console.log(`   Porcentaje de éxito: ${porcentajeGeneral.toFixed(1)}%`);
    console.log(`   Estado: ${estadoGeneral}`);
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    if (porcentajeGeneral === 100) {
        console.log('   ✨ ¡Excelente! Todas las pruebas pasaron correctamente.');
        console.log('   🚀 El sistema está listo para producción.');
    } else if (porcentajeGeneral >= 90) {
        console.log('   👍 Muy bien. La mayoría de pruebas pasaron.');
        console.log('   🔧 Revisar las pruebas fallidas para completar la calidad.');
    } else if (porcentajeGeneral >= 70) {
        console.log('   ⚠️ Aceptable, pero se requieren mejoras.');
        console.log('   🛠️ Revisar y corregir las funcionalidades que fallan.');
    } else {
        console.log('   ❌ Se requiere trabajo adicional significativo.');
        console.log('   🏗️ Revisar la implementación de los componentes principales.');
    }
    
    console.log('\n' + '='.repeat(50));
}

function generarReportePruebas(resultadoCompleto) {
    const fecha = new Date().toLocaleString();
    const { resultados, resumen } = resultadoCompleto;
    
    const reporte = `
# Reporte de Pruebas - Sistema Gestor Financiero Personal

**Fecha de ejecución:** ${fecha}
**Estado general:** ${resumen.estado}
**Porcentaje de éxito:** ${resumen.porcentajeGeneral.toFixed(1)}%

## Resumen por Categorías

### 🏪 Almacenamiento
- **Pruebas:** ${resultados.almacenamiento.exitosos}/${resultados.almacenamiento.total}
- **Porcentaje:** ${resultados.almacenamiento.porcentaje.toFixed(1)}%
- **Estado:** ${resultados.almacenamiento.porcentaje === 100 ? 'ÉXITO' : 'REQUIERE ATENCIÓN'}

### 📦 Modelos de Datos
- **Pruebas:** ${resultados.modelos.exitosos}/${resultados.modelos.total}
- **Porcentaje:** ${resultados.modelos.porcentaje.toFixed(1)}%
- **Estado:** ${resultados.modelos.porcentaje === 100 ? 'ÉXITO' : 'REQUIERE ATENCIÓN'}

### 🧮 Algoritmo de Priorización
- **Pruebas:** ${resultados.algoritmo.exitosos}/${resultados.algoritmo.total}
- **Porcentaje:** ${resultados.algoritmo.porcentaje.toFixed(1)}%
- **Estado:** ${resultados.algoritmo.porcentaje === 100 ? 'ÉXITO' : 'REQUIERE ATENCIÓN'}

## Análisis de Calidad

### Cobertura de Funcionalidades
${resumen.porcentajeGeneral >= 90 ? '✅ Excelente cobertura de funcionalidades principales' : 
  resumen.porcentajeGeneral >= 70 ? '⚠️ Buena cobertura, algunos aspectos por mejorar' : 
  '❌ Cobertura insuficiente, requiere trabajo adicional'}

### Recomendaciones para Producción
${resumen.estado === 'ÉXITO' ? 
  '🚀 Sistema listo para producción con todas las funcionalidades verificadas.' :
  '🔧 Se recomienda completar las correcciones antes del despliegue en producción.'
}

---
*Reporte generado automáticamente por el sistema de pruebas*
    `;
    
    return reporte;
}

// Función para ejecutar pruebas específicas
function ejecutarPruebasEspecificas(categorias = ['almacenamiento', 'modelos', 'algoritmo']) {
    console.log(`\n🎯 Ejecutando pruebas específicas: ${categorias.join(', ')}`);
    
    const resultados = {};
    
    if (categorias.includes('almacenamiento')) {
        resultados.almacenamiento = testStorage.ejecutarPruebasAlmacenamiento();
    }
    
    if (categorias.includes('modelos')) {
        resultados.modelos = testModels.ejecutarPruebasModelos();
    }
    
    if (categorias.includes('algoritmo')) {
        resultados.algoritmo = testAlgorithm.ejecutarPruebasAlgoritmo();
    }
    
    return resultados;
}

// Ejecutar automáticamente si está en Node.js
if (typeof require !== 'undefined' && require.main === module) {
    const resultado = ejecutarTodasLasPruebas();
    
    // Generar reporte si se solicita
    if (process.argv.includes('--reporte')) {
        const reporte = generarReportePruebas(resultado);
        console.log('\n📄 REPORTE DETALLADO:');
        console.log(reporte);
    }
    
    // Salir con código de error si las pruebas fallan
    if (resultado.resumen.estado !== 'ÉXITO') {
        process.exit(1);
    }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ejecutarTodasLasPruebas,
        ejecutarPruebasEspecificas,
        generarReportePruebas
    };
}

// Para uso en el navegador
if (typeof window !== 'undefined') {
    window.ejecutarTodasLasPruebas = ejecutarTodasLasPruebas;
    window.ejecutarPruebasEspecificas = ejecutarPruebasEspecificas;
    window.generarReportePruebas = generarReportePruebas;
}
