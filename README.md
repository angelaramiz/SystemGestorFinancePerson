# 💰 Sistema de Gestión Financiera Personal

Un sistema completo de gestión financiera personal desarrollado como aplicación web moderna y PWA. Permite registrar ingresos y gastos, priorizar pagos mediante algoritmos inteligentes, generar proyecciones financieras y visualizar datos con gráficos interactivos.

## 🌟 Características Principales

- ✅ **Registro de Ingresos y Gastos**: Interfaz intuitiva para gestionar todas las transacciones
- 🎯 **Priorización Inteligente**: Algoritmos que conectan ingresos con gastos según criterios personalizables
- 📊 **Visualización Avanzada**: Gráficos interactivos, calendarios y tablas dinámicas
- 🔄 **Gestión Visual**: Sistema de arrastrar y soltar para conectar flujos financieros
- 📈 **Proyecciones**: Análisis de tendencias y predicciones financieras
- 💾 **Almacenamiento Local**: Datos guardados localmente con opciones de exportación/importación
- 📱 **PWA**: Aplicación web progresiva instalable
- 🧪 **Probado**: Suite completa de pruebas unitarias

## 🚀 Inicio Rápido

### 🎯 Para Usuarios Finales (Producción)

**Opción 1: Usar la versión optimizada para producción**
1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd SystemGestorFinancePerson
   ```

2. **Iniciar servidor web**
   ```bash
   python -m http.server 8000
   ```

3. **Abrir la versión de producción**
   ```
   http://localhost:8000/production/
   ```

**Opción 2: Instalar como PWA**
1. Abre la aplicación en tu navegador
2. Busca el ícono de "Instalar" en la barra de direcciones
3. Haz clic en "Instalar" para usarla como aplicación nativa

### 🛠️ Para Desarrolladores

**Usar la versión de desarrollo con herramientas de debug**
1. **Iniciar servidor de desarrollo**
   ```bash
   python -m http.server 8000
   ```

2. **Abrir la versión de desarrollo**
   ```
   http://localhost:8000/development/index-debug.html
   ```

**Ejecutar pruebas**
```
http://localhost:8000/development/tests/test-runner.html
```

## 📖 Tutorial Completo de Uso

### 1. Pantalla Principal y Navegación

Al iniciar la aplicación, verás una interfaz moderna con cuatro ventanas principales:

- **🏠 Inicio**: Panel de control con resumen general
- **💵 Ingresos**: Gestión de todas las entradas de dinero
- **💸 Gastos**: Administración de egresos y pagos
- **⚙️ Gestión**: Herramientas de conexión y priorización
- **📊 Análisis**: Proyecciones y análisis financiero

### 2. Gestión de Ingresos

#### Agregar un Nuevo Ingreso

1. Navega a la ventana **💵 Ingresos**
2. Haz clic en **"+ Nuevo Ingreso"**
3. Completa el formulario:
   - **Descripción**: Nombre del ingreso (ej: "Salario Enero")
   - **Monto**: Cantidad en tu moneda local
   - **Fecha de Cobro**: Cuándo recibirás el dinero
   - **Tipo**: Selecciona entre:
     - `fijo`: Ingresos regulares (salario, renta)
     - `variable`: Ingresos ocasionales (bonos, freelance)
     - `extraordinario`: Ingresos únicos (premios, ventas)
   - **Periodicidad**: Para ingresos recurrentes
   - **Estado**: `pendiente`, `cobrado`, `vencido`

4. Haz clic en **"Guardar"**

#### Funcionalidades de la Ventana de Ingresos

- **📅 Vista de Calendario**: Visualiza ingresos por fechas
- **📋 Lista Detallada**: Tabla con todos los ingresos
- **🔍 Filtros Avanzados**:
  - Por tipo de ingreso
  - Por rango de fechas
  - Por estado
  - Por monto mínimo/máximo
- **📈 Estadísticas**: Totales por período y tipo

### 3. Gestión de Gastos

#### Agregar un Nuevo Gasto

1. Ve a la ventana **💸 Gastos**
2. Haz clic en **"+ Nuevo Gasto"**
3. Llena los campos:
   - **Descripción**: Nombre del gasto (ej: "Renta Departamento")
   - **Monto**: Cantidad a pagar
   - **Fecha de Vencimiento**: Cuándo debe pagarse
   - **Prioridad**: 
     - `alta`: Gastos críticos (servicios básicos)
     - `media`: Gastos importantes (seguros)
     - `baja`: Gastos opcionales (entretenimiento)
   - **Categoría**: `vivienda`, `alimentación`, `transporte`, `salud`, `educación`, `entretenimiento`, `otros`
   - **Estado**: `pendiente`, `pagado`, `vencido`
   - **Es Recurrente**: Para gastos mensuales

#### Funcionalidades de la Ventana de Gastos

- **🫧 Vista de Burbujas**: Visualización proporcional por monto
- **📅 Calendario de Vencimientos**: Fechas importantes resaltadas
- **📊 Contadores Dinámicos**:
  - Total de gastos pendientes
  - Gastos vencidos
  - Gastos por prioridad
- **🎯 Acciones Rápidas**:
  - Marcar como pagado
  - Posponer vencimiento
  - Eliminar gasto

### 4. Gestión y Conexiones Visuales

La ventana **⚙️ Gestión** es el corazón del sistema, donde conectas ingresos con gastos.

#### Usar el Editor Visual (Drawflow)

1. Ve a la ventana **Gestión**
2. Verás un lienzo con:
   - **Nodos de Ingresos** (verdes): Representan tu dinero entrante
   - **Nodos de Gastos** (rojos): Representan tus pagos

#### Conectar Ingresos con Gastos

1. **Arrastra desde un ingreso** hacia un gasto para crear una conexión
2. **Configura la conexión**:
   - Porcentaje del ingreso destinado a ese gasto
   - Prioridad de la conexión
   - Comentarios adicionales

#### Ejecutar el Algoritmo de Priorización

1. Haz clic en **"🎯 Ejecutar Algoritmo"**
2. El sistema automáticamente:
   - Analiza todas las conexiones
   - Prioriza pagos según criterios configurados
   - Optimiza la distribución de ingresos
   - Genera un plan de pagos

#### Panel de Propiedades

- **Selecciona cualquier nodo** para ver/editar sus propiedades
- **Modifica conexiones** ajustando porcentajes y prioridades
- **Revisa el resumen** de priorización en tiempo real

### 5. Análisis y Proyecciones

La ventana **📊 Análisis** proporciona herramientas avanzadas de análisis financiero.

#### Proyecciones Financieras

1. **Configurar Período**:
   - Selecciona rango de fechas
   - Define frecuencia de análisis (semanal, mensual)

2. **Generar Proyección**:
   - Haz clic en **"📊 Generar Proyección"**
   - El sistema calcula tendencias futuras basadas en datos históricos

#### Visualizaciones Disponibles

- **📈 Gráfico de Líneas**: Evolución temporal de ingresos/gastos
- **🥧 Gráfico Circular**: Distribución por categorías
- **📊 Gráfico de Barras**: Comparaciones mensuales
- **📉 Análisis de Tendencias**: Predicciones futuras

#### Análisis de Riesgo

- **Identificación de problemas**: Gastos que exceden ingresos
- **Alertas tempranas**: Vencimientos próximos sin fondos
- **Recomendaciones**: Sugerencias de optimización

### 6. Herramientas Adicionales

#### Exportar/Importar Datos

1. **Exportar**:
   - Ve a cualquier ventana
   - Haz clic en **"📤 Exportar"**
   - Selecciona formato: JSON, CSV, Excel
   - Descarga el archivo

2. **Importar**:
   - Haz clic en **"📥 Importar"**
   - Selecciona archivo compatible
   - Confirma la importación

#### Notificaciones

El sistema envía notificaciones automáticas para:
- ✅ Gastos próximos a vencer
- ⚠️ Ingresos retrasados
- 🎯 Objetivos de ahorro alcanzados
- 📊 Resúmenes periódicos

## 🏗️ Estructura del Proyecto

### 📁 Organización de Carpetas

```
SystemGestorFinancePerson/
├── 🚀 production/                    # VERSIÓN DE PRODUCCIÓN (RELEASE)
│   ├── index.html                   # Página principal optimizada
│   ├── manifest.json                # Configuración PWA
│   ├── sw.js                       # Service Worker para PWA
│   └── assets/                     # Recursos optimizados
│       ├── css/                    # Estilos minificados
│       │   ├── main.css
│       │   └── ventanas.css
│       └── js/                     # Scripts optimizados
│           ├── app.min.js          # Bundle principal minificado
│           └── [otros scripts...]
│
├── 🛠️ development/                   # VERSIÓN DE DESARROLLO
│   ├── index-debug.html             # Página con panel de debug
│   ├── tests/                      # Todas las pruebas y demos
│   │   ├── test-runner.html        # Suite principal de pruebas
│   │   ├── test-simple.html        # Pruebas simplificadas
│   │   ├── demo-configuracion.html # Demos de configuración
│   │   ├── test-*.js               # Archivos de test individuales
│   │   └── verificacion-*.html     # Herramientas de verificación
│   ├── docs/                       # Documentación técnica
│   │   ├── CHECKLIST_VERIFICACION.md
│   │   ├── CORRECCIONES_MODELOS.md
│   │   ├── ESTRUCTURA_PRUEBAS.md
│   │   └── SOLUCION_ERRORES.md
│   └── scripts/                    # Scripts de automatización
│       ├── ejecutar_pruebas.bat
│       ├── ejecutar_pruebas.py
│       └── verificar_modelos.py
│
├── 📂 CÓDIGO FUENTE COMPARTIDO        # Archivos fuente originales
│   ├── css/                        # Estilos fuente
│   │   ├── main.css
│   │   └── ventanas.css
│   └── js/                         # Scripts fuente
│       ├── main.js                 # Controlador principal
│       ├── models/                 # Modelos de datos
│       │   ├── Ingreso.js
│       │   └── Gasto.js
│       ├── storage/                # Gestión de almacenamiento
│       │   ├── localStorage.js
│       │   └── indexedDB.js
│       ├── algoritmos/             # Lógica de negocio
│       │   └── priorizacion.js
│       ├── ui/                     # Componentes de interfaz
│       │   ├── navegacion.js
│       │   └── modales.js
│       ├── ventanas/               # Controladores de ventanas
│       │   ├── ingresos.js
│       │   ├── gastos.js
│       │   ├── gestion.js
│       │   └── hojaCalculo.js
│       └── utils/                  # Utilidades
│           ├── notificaciones.js
│           ├── exportar.js
│           └── verificacion.js
│
├── 📄 README.md                     # Este archivo
└── 📄 LICENSE                       # Licencia del proyecto
```

### 🎯 Diferencias entre Versiones

| Característica | 🚀 Producción | 🛠️ Desarrollo |
|---|---|---|
| **Rendimiento** | ⚡ Optimizado, minificado | 🐌 Sin optimizar, debug |
| **PWA** | ✅ Service Worker, manifest | ❌ No disponible |
| **Panel Debug** | ❌ Oculto | ✅ Visible con herramientas |
| **Console Logs** | ❌ Minimizados | ✅ Detallados |
| **Pruebas** | ❌ No incluidas | ✅ Suite completa |
| **Tamaño** | 📦 Compacto | 📦 Completo con extras |
| **Uso** | 👤 Usuarios finales | 👨‍💻 Desarrolladores |

### 🔧 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **PWA**: Service Worker, Web App Manifest
- **Gráficos**: Chart.js para visualizaciones
- **Interfaz Visual**: Drawflow para conexiones
- **Almacenamiento**: localStorage + IndexedDB
- **Pruebas**: Sistema de pruebas unitarias personalizado
- **Build**: Scripts de optimización y minificación

## 🧪 Ejecutar Pruebas

### 🔍 Para Desarrolladores

**Opción 1: Suite Completa de Pruebas**
1. **Abrir el navegador en**:
   ```
   http://localhost:8000/development/tests/test-runner.html
   ```
2. **Ejecutar todas las pruebas**:
   - Haz clic en **"🚀 Ejecutar Todas las Pruebas"**
   - Observa los resultados detallados en tiempo real

**Opción 2: Pruebas Simplificadas**
1. **Abrir el navegador en**:
   ```
   http://localhost:8000/development/tests/test-simple.html
   ```
2. **Ejecutar pruebas básicas**:
   - Haz clic en **"🚀 Ejecutar Todas las Pruebas"**
   - Ideal para verificaciones rápidas

### 🛠️ Herramientas de Verificación

**Scripts de Automatización** (ubicados en `/development/scripts/`):

- **Windows**: Ejecuta `ejecutar_pruebas.bat`
- **Python**: Ejecuta `python ejecutar_pruebas.py`
- **Verificar Modelos**: `python verificar_modelos.py`

### ✅ Pruebas Incluidas

- **💾 Almacenamiento**: localStorage e IndexedDB
- **📋 Modelos**: Clases Ingreso y Gasto
- **🎯 Algoritmos**: Lógica de priorización
- **🔄 Integración**: Flujos completos del sistema
- **🖥️ UI**: Componentes de interfaz
- **📊 Visualización**: Gráficos y reportes

### 📊 Interpretar Resultados

- **Verde (✅)**: Prueba exitosa
- **Amarillo (⚠️)**: Advertencia o prueba parcial
- **Rojo (❌)**: Error en la prueba

## 🚀 Despliegue

### 📦 Versión de Producción

La carpeta `/production/` contiene una versión optimizada lista para despliegue:

1. **Subir a servidor web**: Copia el contenido de `/production/` a tu servidor
2. **CDN/Hosting**: Compatible con GitHub Pages, Netlify, Vercel
3. **Servidor local**: `python -m http.server 8000` desde `/production/`

### 📱 PWA (Progressive Web App)

La versión de producción incluye:
- ✅ **Service Worker**: Cache offline y actualizaciones
- ✅ **Web Manifest**: Instalación como app nativa
- ✅ **Íconos**: Múltiples tamaños para diferentes dispositivos
- ✅ **Optimización**: Scripts y estilos minificados

### 🌐 Compatibilidad

- **Navegadores**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Móviles**: iOS Safari 11+, Chrome Mobile 60+
- **Características**: PWA, Service Workers, IndexedDB

## 📊 Casos de Uso Ejemplo

### Escenario 1: Trabajador con Salario Fijo

```javascript
// 1. Registrar ingreso mensual
const salario = {
    descripcion: "Salario Enero 2024",
    monto: 50000,
    fecha: "2024-01-31",
    tipo: "fijo",
    periodicidad: "mensual"
};

// 2. Registrar gastos prioritarios
const gastos = [
    { descripcion: "Renta", monto: 15000, prioridad: "alta" },
    { descripcion: "Servicios", monto: 3000, prioridad: "alta" },
    { descripcion: "Alimentación", monto: 8000, prioridad: "media" },
    { descripcion: "Entretenimiento", monto: 5000, prioridad: "baja" }
];

// 3. El algoritmo distribuye automáticamente
// Resultado: 30% renta, 6% servicios, 16% alimentación, 10% entretenimiento
```

### Escenario 2: Freelancer con Ingresos Variables

```javascript
// 1. Múltiples ingresos irregulares
const proyectos = [
    { descripcion: "Proyecto A", monto: 25000, fecha: "2024-01-15" },
    { descripcion: "Proyecto B", monto: 18000, fecha: "2024-01-28" },
    { descripcion: "Consultoría", monto: 12000, fecha: "2024-02-05" }
];

// 2. Gastos con diferentes vencimientos
// 3. El sistema optimiza qué ingreso usar para cada gasto
```

## 🔧 Configuración Avanzada

### 🛠️ Para Desarrolladores

**Panel de Debug** (solo en versión de desarrollo):
- Abre `/development/index-debug.html`
- Panel lateral con herramientas de desarrollo
- Console logs detallados
- Inspección de datos en tiempo real

### 🎨 Personalizar Categorías

Edita el archivo `js/models/Gasto.js` para agregar nuevas categorías:

```javascript
static get CATEGORIAS_VALIDAS() {
    return [
        'vivienda', 'alimentación', 'transporte', 
        'salud', 'educación', 'entretenimiento',
        'nueva_categoria', 'otros'
    ];
}
```

### ⚙️ Algoritmo de Priorización

Modifica `js/algoritmos/priorizacion.js` para cambiar los criterios:

```javascript
// Cambiar pesos de priorización
const PESOS = {
    fechaVencimiento: 0.4,    // 40% peso por urgencia
    prioridad: 0.3,           // 30% peso por importancia
    monto: 0.2,               // 20% peso por cantidad
    categoria: 0.1            // 10% peso por tipo
};
```

### 🔄 Build y Optimización

**Para crear una nueva versión de producción:**

1. **Modificar código fuente** en `/css/` y `/js/`
2. **Copiar cambios** a `/production/assets/`
3. **Minificar recursos** (usar herramientas como uglify, cssnano)
4. **Actualizar** `app.min.js` con el bundle optimizado
5. **Probar** la versión de producción

**Script de ejemplo para automatización:**
```bash
# Copiar archivos actualizados
cp css/* production/assets/css/
cp js/**/*.js production/assets/js/

# Minificar (requiere herramientas adicionales)
# uglifyjs js/**/*.js -o production/assets/js/app.min.js
# cssnano css/main.css production/assets/css/main.min.css
```

## 🐛 Solución de Problemas

### ❗ Problemas Comunes

**1. Los datos no se guardan**
- ✅ Verifica que el navegador permita localStorage
- ✅ Revisa la consola del desarrollador (F12)
- ✅ Usa la versión de desarrollo para ver logs detallados

**2. Las gráficas no aparecen**
- ✅ Asegúrate de que Chart.js se carga correctamente
- ✅ Verifica la conexión a internet para CDN
- ✅ Revisa los errores en la consola

**3. El algoritmo no funciona**
- ✅ Confirma que hay ingresos y gastos registrados
- ✅ Verifica que las fechas sean válidas
- ✅ Usa las herramientas de verificación en `/development/tests/`

**4. Error en importación de datos**
- ✅ Confirma que el formato del archivo sea correcto
- ✅ Revisa que los campos requeridos estén presentes
- ✅ Usa los demos de configuración para probar

**5. PWA no se instala**
- ✅ Asegúrate de usar la versión de producción
- ✅ Verifica que el navegador soporte PWA
- ✅ Revisa que el manifest.json sea válido

### 🔍 Herramientas de Depuración

**Para Usuarios:**
- Usa la versión de producción en `/production/`
- Revisa la consola (F12) para errores básicos

**Para Desarrolladores:**
- Usa la versión de desarrollo en `/development/index-debug.html`
- Ejecuta pruebas en `/development/tests/test-runner.html`
- Revisa los scripts de verificación en `/development/scripts/`

**Comandos útiles en la consola:**
```javascript
// Ver estado del sistema
console.log(window.sistemaFinanciero.obtenerIngresos());
console.log(window.sistemaFinanciero.obtenerGastos());
console.log(window.conexionesVisuales.obtenerConexiones());

// Limpiar datos (cuidado!)
localStorage.clear();
```

### 📋 Documentación Técnica

En la carpeta `/development/docs/` encontrarás:

- **CHECKLIST_VERIFICACION.md**: Lista de verificaciones
- **CORRECCIONES_MODELOS.md**: Historial de correcciones
- **ESTRUCTURA_PRUEBAS.md**: Documentación de pruebas
- **SOLUCION_ERRORES.md**: Soluciones detalladas a errores

## 🤝 Contribuir

### 🐛 Reportar Bugs

1. **Usa las herramientas de desarrollo**:
   - Ejecuta pruebas en `/development/tests/test-runner.html`
   - Revisa los logs en la versión de debug
   - Consulta la documentación en `/development/docs/`

2. **Crear un issue detallado**:
   - Descripción clara del problema
   - Pasos para reproducir el error
   - Información del navegador y sistema
   - Screenshots si es necesario

### ✨ Agregar Funcionalidades

1. **Fork del repositorio**
2. **Crea una rama para tu feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrolla siguiendo la estructura**:
   - Código fuente en `/css/` y `/js/`
   - Pruebas en `/development/tests/`
   - Documentación en `/development/docs/`
4. **Prueba tu código**:
   - Ejecuta todas las pruebas
   - Verifica en versión de desarrollo y producción
5. **Actualiza las versiones**:
   - Copia cambios a `/production/assets/`
   - Actualiza documentación
6. **Envía pull request**

### 📝 Guías de Estilo

- **JavaScript**: ES6+, comentarios JSDoc
- **CSS**: BEM methodology, variables CSS
- **Commits**: Conventional Commits
- **Documentación**: Markdown con emojis
- **Pruebas**: Cobertura completa de nuevas funcionalidades

### 🏗️ Estructura de Desarrollo

```bash
# 1. Modifica código fuente
vim js/models/NuevoModelo.js

# 2. Agrega pruebas
vim development/tests/test-nuevo-modelo.js

# 3. Documenta cambios
vim development/docs/NUEVAS_FUNCIONALIDADES.md

# 4. Actualiza producción
cp js/**/*.js production/assets/js/

# 5. Prueba todo
open development/tests/test-runner.html
```

## � Soporte

### 🔗 Recursos de Ayuda

- **📖 Documentación**: Este README.md
- **🧪 Pruebas**: `/development/tests/test-runner.html`
- **📋 Documentación Técnica**: `/development/docs/`
- **🛠️ Herramientas Debug**: `/development/index-debug.html`
- **🐛 Issues**: GitHub Issues
- **📧 Email**: [tu-email@ejemplo.com]

### 🚀 Enlaces Rápidos

| Propósito | Enlace | Descripción |
|---|---|---|
| **🎯 Usar la App** | `/production/` | Versión optimizada para usuarios |
| **🛠️ Desarrollar** | `/development/index-debug.html` | Versión con herramientas de debug |
| **🧪 Probar** | `/development/tests/test-runner.html` | Suite completa de pruebas |
| **📚 Documentar** | `/development/docs/` | Documentación técnica |
| **⚙️ Scripts** | `/development/scripts/` | Herramientas de automatización |

---

## 🎯 Próximas Funcionalidades

### 🚀 Versión 2.0

- [ ] **🌙 Modo Oscuro**: Tema visual alternativo
- [ ] **💱 Múltiples Monedas**: Soporte para diferentes divisas
- [ ] **☁️ Sincronización en la Nube**: Backup automático
- [ ] **📱 App Móvil Nativa**: Versión React Native/Flutter
- [ ] **📄 Reportes PDF**: Generación de informes exportables

### 🔮 Versión 3.0

- [ ] **🏦 Integración Bancaria**: Importación automática de transacciones
- [ ] **🎯 Metas de Ahorro**: Objetivos financieros con seguimiento
- [ ] **🔔 Alertas Inteligentes**: Notificaciones predictivas con IA
- [ ] **👥 Finanzas Familiares**: Gestión colaborativa multi-usuario
- [ ] **📊 Dashboard Avanzado**: Analytics y KPIs financieros

### 🛠️ Mejoras Técnicas

- [ ] **⚡ Build Automation**: Webpack/Vite para optimización
- [ ] **🧪 Tests E2E**: Cypress/Playwright para pruebas completas
- [ ] **🚀 CI/CD**: GitHub Actions para despliegue automático
- [ ] **📦 Docker**: Containerización para deployment
- [ ] **🔒 Seguridad**: Encriptación de datos sensibles

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver archivo `LICENSE` para más detalles.

### 🔐 Términos de Uso

- ✅ **Uso comercial** permitido
- ✅ **Modificación** permitida
- ✅ **Distribución** permitida
- ✅ **Uso privado** permitido
- ⚠️ **Sin garantía** - uso bajo tu propio riesgo

---

**¡Gracias por usar el Sistema de Gestión Financiera Personal!** 💰✨

Desarrollado con ❤️ para ayudarte a tomar control de tus finanzas personales.

### 📊 Estadísticas del Proyecto

- **🗂️ Archivos**: 50+ archivos organizados
- **📱 PWA**: Instalable como app nativa
- **🧪 Pruebas**: 20+ tests automatizados
- **📚 Documentación**: Guías completas incluidas
- **🎨 UI/UX**: Interfaz moderna y responsiva
- **⚡ Performance**: Optimizado para producción