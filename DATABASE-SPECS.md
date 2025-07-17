# 📊 Especificaciones de la Base de Datos - Gestor Financiero

## 🎯 **Resumen Ejecutivo**
- **Tablas necesarias**: 2 (ingresos + gastos)
- **Campos por tabla**: 8 campos principales
- **Seguridad**: Row Level Security (RLS) habilitada
- **Rendimiento**: 6 índices optimizados
- **Características**: Multiusuario, timestamps automáticos, validaciones

---

## 📋 **Especificaciones Detalladas**

### **1. Tabla `ingresos`**
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `usuario_id` | UUID | NOT NULL, FK | Referencia al usuario |
| `titulo` | VARCHAR(255) | NOT NULL | Nombre del ingreso |
| `cantidad` | DECIMAL(12,2) | NOT NULL, ≥0 | Monto del ingreso |
| `categoria` | VARCHAR(100) | NOT NULL | Categoría del ingreso |
| `fecha` | DATE | NOT NULL | Fecha del evento |
| `descripcion` | TEXT | NULLABLE | Detalles adicionales |
| `created_at` | TIMESTAMP TZ | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP TZ | AUTO | Última modificación |

### **2. Tabla `gastos`**
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `usuario_id` | UUID | NOT NULL, FK | Referencia al usuario |
| `titulo` | VARCHAR(255) | NOT NULL | Nombre del gasto |
| `cantidad` | DECIMAL(12,2) | NOT NULL, ≥0 | Monto del gasto |
| `categoria` | VARCHAR(100) | NOT NULL | Categoría del gasto |
| `fecha` | DATE | NOT NULL | Fecha del evento |
| `descripcion` | TEXT | NULLABLE | Detalles adicionales |
| `created_at` | TIMESTAMP TZ | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP TZ | AUTO | Última modificación |

---

## 🔒 **Seguridad Implementada**

### **Row Level Security (RLS)**
- ✅ Usuarios solo ven sus propios datos
- ✅ Políticas separadas para SELECT, INSERT, UPDATE, DELETE
- ✅ Validación automática por `usuario_id`

### **Validaciones de Datos**
- ✅ Cantidades no pueden ser negativas
- ✅ Campos obligatorios validados
- ✅ Tipos de datos estrictos

---

## ⚡ **Optimización de Rendimiento**

### **Índices Creados**
1. `idx_ingresos_usuario_fecha` - Consultas por usuario y fecha
2. `idx_gastos_usuario_fecha` - Consultas por usuario y fecha
3. `idx_ingresos_categoria` - Filtros por categoría
4. `idx_gastos_categoria` - Filtros por categoría
5. `idx_ingresos_mes` - Agrupaciones mensuales
6. `idx_gastos_mes` - Agrupaciones mensuales

### **Triggers Automáticos**
- ✅ Actualización automática de `updated_at`
- ✅ Timestamps precisos con zona horaria

---

## 📈 **Categorías Predefinidas**

### **Ingresos**
- Salario
- Freelance  
- Inversiones
- Ventas
- Otros

### **Gastos**
- Alimentación
- Transporte
- Entretenimiento
- Servicios
- Compras
- Salud
- Otros

---

## 🔧 **Vistas Adicionales**

### **`resumen_ingresos_mensual`**
Agrupación automática de ingresos por mes y categoría

### **`resumen_gastos_mensual`**  
Agrupación automática de gastos por mes y categoría

---

## 📊 **Capacidad Estimada**

### **Almacenamiento**
- ~1KB por registro de ingreso/gasto
- ~365 registros/año por usuario activo
- ~365KB por usuario por año
- **Escalable** para miles de usuarios

### **Rendimiento**
- Consultas optimizadas con índices
- Respuesta < 100ms para consultas típicas
- Soporte para consultas concurrentes

---

## 🚀 **Instrucciones de Implementación**

### **Paso 1: Ejecutar Esquema**
```bash
# En el SQL Editor de Supabase:
# Copiar y ejecutar: supabase-database-schema.sql
```

### **Paso 2: Verificar Creación**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('ingresos', 'gastos');
```

### **Paso 3: Probar Conectividad**
```bash
# Ejecutar diagnóstico en la aplicación:
# http://localhost:8080/diagnostico.html
```

---

## 💡 **Extensibilidad Futura**

### **Posibles Mejoras**
- Tabla de categorías personalizadas
- Tabla de presupuestos
- Tabla de metas financieras
- Tabla de recordatorios
- Tabla de archivos adjuntos

### **Funcionalidades Avanzadas**
- Reportes automáticos
- Alertas de gastos
- Integración con bancos
- Exportación avanzada
- Dashboard analytics
