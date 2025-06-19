# 🛠️ Guía para Desarrolladores

## 📋 Guía Rápida de Desarrollo

### 🚀 Setup Inicial

```bash
# 1. Clonar repositorio
git clone <url-del-repo>
cd SystemGestorFinancePerson

# 2. Iniciar servidor de desarrollo
python -m http.server 8000

# 3. Abrir versión de desarrollo
# http://localhost:8000/development/index-debug.html
```

### 🏗️ Estructura de Desarrollo

```
development/
├── index-debug.html         # 🐛 Versión con panel de debug
├── tests/                   # 🧪 Suite completa de pruebas
│   ├── test-runner.html     # Ejecutor principal
│   ├── test-simple.html     # Pruebas básicas
│   ├── test-*.js           # Tests individuales
│   └── demo-*.html         # Demos y configuraciones
├── docs/                    # 📚 Documentación técnica
│   ├── CHECKLIST_VERIFICACION.md
│   ├── CORRECCIONES_MODELOS.md
│   ├── ESTRUCTURA_PRUEBAS.md
│   ├── SOLUCION_ERRORES.md
│   └── GUIA_DESARROLLADOR.md (este archivo)
└── scripts/                 # ⚙️ Scripts de automatización
    ├── ejecutar_pruebas.bat
    ├── ejecutar_pruebas.py
    └── verificar_modelos.py
```

### 🔄 Flujo de Trabajo

1. **Desarrollar en código fuente** (`/css/`, `/js/`)
2. **Probar en versión debug** (`/development/index-debug.html`)
3. **Ejecutar pruebas** (`/development/tests/test-runner.html`)
4. **Copiar a producción** (`/production/assets/`)
5. **Verificar producción** (`/production/index.html`)

## 🧪 Testing

### 🎯 Ejecutar Pruebas

**Opción 1: Navegador (Recomendado)**
```
http://localhost:8000/development/tests/test-runner.html
```

**Opción 2: Scripts de Línea de Comandos**
```bash
# Windows
./development/scripts/ejecutar_pruebas.bat

# Python
python development/scripts/ejecutar_pruebas.py

# Verificar modelos específicos
python development/scripts/verificar_modelos.py
```

### 📊 Tipos de Pruebas

| Test File | Descripción | Cobertura |
|---|---|---|
| `test-storage.js` | localStorage + IndexedDB | 💾 Persistencia |
| `test-models.js` | Clases Ingreso + Gasto | 📋 Modelos |
| `test-algorithm.js` | Lógica de priorización | 🎯 Algoritmos |
| `test-utils.js` | Funciones utilitarias | 🔧 Utilidades |

### ✅ Crear Nuevas Pruebas

```javascript
// development/tests/test-nueva-funcionalidad.js
window.testNuevaFuncionalidad = {
    name: 'Nueva Funcionalidad',
    
    async ejecutarPruebas() {
        const resultados = [];
        
        // Test 1
        try {
            // Tu código de prueba aquí
            const resultado = await miFuncion();
            if (resultado === valorEsperado) {
                resultados.push({
                    test: 'Test descriptivo',
                    status: 'success',
                    message: 'Funcionó correctamente'
                });
            } else {
                throw new Error('Valor incorrecto');
            }
        } catch (error) {
            resultados.push({
                test: 'Test descriptivo',
                status: 'error',
                message: error.message
            });
        }
        
        return resultados;
    }
};
```

## 🐛 Debug y Desarrollo

### 🛠️ Panel de Debug

El archivo `/development/index-debug.html` incluye:

- **📊 Panel lateral**: Herramientas de desarrollo
- **🔍 Inspección de datos**: Visualización del estado
- **📝 Console logs**: Información detallada
- **⚡ Recarga rápida**: Actualizaciones instantáneas

### 🔧 Herramientas Útiles

**Console Commands:**
```javascript
// Ver estado completo
window.sistemaFinanciero.debug();

// Inspeccionar storage
console.log(localStorage.getItem('sistema_financiero'));

// Limpiar datos (cuidado!)
localStorage.clear();

// Recargar datos de ejemplo
window.sistemaFinanciero.cargarDatosEjemplo();
```

## 📦 Build y Producción

### 🚀 Crear Build de Producción

1. **Modificar código fuente**:
   ```bash
   # Editar archivos en /css/ y /js/
   vim js/models/MiModelo.js
   ```

2. **Copiar a producción**:
   ```bash
   # Copiar CSS
   cp css/*.css production/assets/css/

   # Copiar JS (estructura)
   cp js/**/*.js production/assets/js/
   ```

3. **Actualizar bundle** (manual por ahora):
   ```bash
   # Concatenar y minificar JS principales
   # cat js/main.js js/models/*.js js/storage/*.js > production/assets/js/app.min.js
   ```

4. **Verificar producción**:
   ```
   http://localhost:8000/production/
   ```

### ⚡ Scripts de Automatización Futuros

```bash
# TODO: Implementar build automation
npm install
npm run build    # Minificar y optimizar
npm run test     # Ejecutar pruebas
npm run deploy   # Desplegar a producción
```

## 🎨 Convenciones de Código

### 📝 JavaScript

```javascript
/**
 * Descripción de la función
 * @param {string} parametro - Descripción del parámetro
 * @returns {Object} Descripción del retorno
 */
class MiClase {
    constructor(config = {}) {
        this.propiedad = config.propiedad || 'valor_por_defecto';
    }
    
    metodoPublico() {
        return this._metodoPrivado();
    }
    
    _metodoPrivado() {
        // Lógica interna
    }
}
```

### 🎨 CSS

```css
/* BEM Methodology */
.componente {
    /* Estilos base */
}

.componente__elemento {
    /* Elemento del componente */
}

.componente--modificador {
    /* Variación del componente */
}

.componente__elemento--modificador {
    /* Elemento con modificador */
}
```

### 📂 Estructura de Archivos

```
js/
├── main.js                 # 🎮 Controlador principal
├── models/                 # 📋 Modelos de datos
│   ├── Ingreso.js
│   └── Gasto.js
├── storage/                # 💾 Persistencia
│   ├── localStorage.js
│   └── indexedDB.js
├── algoritmos/             # 🎯 Lógica de negocio
│   └── priorizacion.js
├── ui/                     # 🖥️ Interfaz
│   ├── navegacion.js
│   └── modales.js
├── ventanas/               # 🪟 Controladores
│   ├── ingresos.js
│   ├── gastos.js
│   ├── gestion.js
│   └── hojaCalculo.js
└── utils/                  # 🔧 Utilidades
    ├── notificaciones.js
    ├── exportar.js
    └── verificacion.js
```

## 🔄 Workflow de Contribución

### 1. 🍴 Fork y Clone

```bash
git clone https://github.com/tu-usuario/SystemGestorFinancePerson.git
cd SystemGestorFinancePerson
git remote add upstream https://github.com/original/SystemGestorFinancePerson.git
```

### 2. 🌿 Crear Branch

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/corregir-bug
# o
git checkout -b docs/actualizar-documentacion
```

### 3. 🛠️ Desarrollar

```bash
# Desarrollar código
vim js/models/NuevaFuncionalidad.js

# Agregar pruebas
vim development/tests/test-nueva-funcionalidad.js

# Probar
open development/tests/test-runner.html

# Actualizar producción
cp js/**/*.js production/assets/js/
```

### 4. ✅ Verificar

```bash
# Ejecutar todas las pruebas
open development/tests/test-runner.html

# Verificar en producción
open production/index.html

# Verificar en desarrollo
open development/index-debug.html
```

### 5. 📤 Commit y Push

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad X"
git push origin feature/nueva-funcionalidad
```

### 6. 🔄 Pull Request

1. Ir a GitHub
2. Crear Pull Request
3. Describir cambios
4. Esperar review

## 🚨 Troubleshooting

### ❗ Problemas Comunes

**"Las pruebas no se ejecutan"**
```bash
# Verificar servidor web
python -m http.server 8000

# Abrir la URL correcta
# http://localhost:8000/development/tests/test-runner.html
```

**"Los cambios no se ven en producción"**
```bash
# Copiar archivos actualizados
cp css/*.css production/assets/css/
cp js/**/*.js production/assets/js/

# Limpiar cache del navegador
Ctrl + F5
```

**"Error en IndexedDB"**
```javascript
// Limpiar base de datos
window.sistemaFinanciero.storage.limpiarBaseDatos();
```

### 🔍 Debug Avanzado

```javascript
// Habilitar logs detallados
window.DEBUG = true;

// Inspeccionar estado completo
console.table(window.sistemaFinanciero.obtenerEstadoCompleto());

// Verificar integridad de datos
window.sistemaFinanciero.verificarIntegridad();
```

## 📚 Recursos Adicionales

### 🔗 Enlaces Útiles

- [MDN Web Docs](https://developer.mozilla.org/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Drawflow Documentation](https://github.com/jerosoler/Drawflow)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

### 📖 Documentación Relacionada

- `CHECKLIST_VERIFICACION.md` - Lista de verificaciones pre-deploy
- `CORRECCIONES_MODELOS.md` - Historial de correcciones
- `ESTRUCTURA_PRUEBAS.md` - Documentación de pruebas
- `SOLUCION_ERRORES.md` - Soluciones a errores conocidos

---

**¡Happy Coding!** 🚀👨‍💻

*Esta guía se actualiza constantemente. Contribuye con mejoras y sugerencias.*
