# 💰 Sistema de Gestión Financiera Personal

Un sistema completo de gestión financiera personal desarrollado como aplicación web moderna. Permite registrar ingresos y gastos, priorizar pagos mediante algoritmos inteligentes, generar proyecciones financieras y visualizar datos con gráficos interactivos.

## 🌟 Características Principales

- ✅ **Registro de Ingresos y Gastos**: Interfaz intuitiva para gestionar todas las transacciones
- 🎯 **Priorización Inteligente**: Algoritmos que conectan ingresos con gastos según criterios personalizables
- 📊 **Visualización Avanzada**: Gráficos interactivos, calendarios y tablas dinámicas
- 🔄 **Gestión Visual**: Sistema de arrastrar y soltar para conectar flujos financieros
- 📈 **Proyecciones**: Análisis de tendencias y predicciones financieras
- 💾 **Almacenamiento Local**: Datos guardados localmente con opciones de exportación/importación
- 🧪 **Probado**: Suite completa de pruebas unitarias

## 🚀 Inicio Rápido

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Python 3.6+ (para servidor de desarrollo local)

### Instalación y Ejecución

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd SystemGestorFinancePerson
   ```

2. **Iniciar servidor de desarrollo**
   ```bash
   python -m http.server 8000
   ```

3. **Abrir en el navegador**
   ```
   http://localhost:8000
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

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
SystemGestorFinancePerson/
├── index.html                 # Página principal
├── css/
│   ├── main.css              # Estilos generales
│   └── ventanas.css          # Estilos específicos de ventanas
├── js/
│   ├── main.js               # Controlador principal
│   ├── models/               # Modelos de datos
│   │   ├── Ingreso.js
│   │   └── Gasto.js
│   ├── storage/              # Gestión de almacenamiento
│   │   ├── localStorage.js
│   │   └── indexedDB.js
│   ├── algoritmos/           # Lógica de negocio
│   │   └── priorizacion.js
│   ├── ui/                   # Componentes de interfaz
│   │   ├── navegacion.js
│   │   └── modales.js
│   ├── ventanas/             # Controladores de ventanas
│   │   ├── ingresos.js
│   │   ├── gastos.js
│   │   ├── gestion.js
│   │   └── hojaCalculo.js
│   └── utils/                # Utilidades
│       ├── notificaciones.js
│       └── exportar.js
└── tests/                    # Pruebas unitarias
    ├── test-runner.html
    ├── run-tests.js
    ├── test-storage.js
    ├── test-models.js
    └── test-algorithm.js
```

### Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: Chart.js para visualizaciones
- **Interfaz Visual**: Drawflow para conexiones
- **Almacenamiento**: localStorage + IndexedDB
- **Pruebas**: Sistema de pruebas unitarias personalizado

## 🧪 Ejecutar Pruebas

### Pruebas Automáticas

**Opción 1: Interfaz Simplificada (Recomendada)**
1. **Abrir el navegador en**:
   ```
   http://localhost:8000/tests/test-simple.html
   ```
2. **Ejecutar todas las pruebas**:
   - Haz clic en **"🚀 Ejecutar Todas las Pruebas"**
   - Observa los resultados en tiempo real

**Opción 2: Interfaz Completa**
1. **Abrir el navegador en**:
   ```
   http://localhost:8000/tests/test-runner.html
   ```
2. **Ejecutar todas las pruebas**:
   - Haz clic en **"🚀 Ejecutar Todas las Pruebas"**
   - Observa los resultados en tiempo real

### Pruebas Incluidas

- **✅ Almacenamiento**: localStorage e IndexedDB
- **📋 Modelos**: Clases Ingreso y Gasto
- **🎯 Algoritmos**: Lógica de priorización
- **🔄 Integración**: Flujos completos del sistema

### Interpretar Resultados

- **Verde (✅)**: Prueba exitosa
- **Amarillo (⚠️)**: Advertencia o prueba parcial
- **Rojo (❌)**: Error en la prueba

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

### Personalizar Categorías

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

### Algoritmo de Priorización

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

## 🐛 Solución de Problemas

### Problemas Comunes

**1. Los datos no se guardan**
- Verifica que el navegador permita localStorage
- Revisa la consola del desarrollador (F12)

**2. Las gráficas no aparecen**
- Asegúrate de que Chart.js se carga correctamente
- Verifica la conexión a internet para CDN

**3. El algoritmo no funciona**
- Confirma que hay ingresos y gastos registrados
- Verifica que las fechas sean válidas

**4. Error en importación de datos**
- Confirma que el formato del archivo sea correcto
- Revisa que los campos requeridos estén presentes

### Depuración

Abre la consola del navegador (F12) para:
- Ver errores detallados
- Inspeccionar el estado de los datos
- Verificar las conexiones del algoritmo

```javascript
// Comandos útiles en la consola
console.log(window.sistemaFinanciero.obtenerIngresos());
console.log(window.sistemaFinanciero.obtenerGastos());
console.log(window.conexionesVisuales.obtenerConexiones());
```

## 🤝 Contribuir

### Reportar Bugs

1. Usa las pruebas automáticas para identificar problemas
2. Abre un issue con descripción detallada
3. Incluye pasos para reproducir el error

### Agregar Funcionalidades

1. Fork del repositorio
2. Crea una rama para tu feature
3. Implementa con pruebas unitarias
4. Envía pull request

### Guías de Estilo

- **JavaScript**: ES6+, comentarios JSDoc
- **CSS**: BEM methodology
- **Commits**: Conventional Commits

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Documentación**: Este README.md
- **Pruebas**: `/tests/test-runner.html`
- **Issues**: GitHub Issues
- **Email**: [tu-email@ejemplo.com]

---

## 🎯 Próximas Funcionalidades

- [ ] **Modo Oscuro**: Tema visual alternativo
- [ ] **Múltiples Monedas**: Soporte para diferentes divisas
- [ ] **Sincronización en la Nube**: Backup automático
- [ ] **Aplicación Móvil**: PWA con instalación
- [ ] **Reportes PDF**: Generación de informes
- [ ] **Integración Bancaria**: Importación automática
- [ ] **Metas de Ahorro**: Objetivos financieros
- [ ] **Alertas Inteligentes**: Notificaciones predictivas

---

**¡Gracias por usar el Sistema de Gestión Financiera Personal!** 💰✨

Desarrollado con ❤️ para ayudarte a tomar control de tus finanzas personales.