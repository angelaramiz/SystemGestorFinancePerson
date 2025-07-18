# 🔧 Corrección: Estado de Gastos no se Actualiza

## Problema Identificado

El problema era que cuando se marcaba un gasto como pagado, el estado se actualizaba localmente pero no se sincronizaba correctamente con Supabase debido a:

1. **Error en función `update`**: Los parámetros se pasaban en orden incorrecto
2. **Falta de mapeo del campo `estado`**: No se incluía en las funciones de mapeo
3. **Campo `estado` faltante en BD**: No existe en el esquema de Supabase

## Correcciones Aplicadas

### 1. Corrección en `storage.js` (línea 371)
```javascript
// ❌ Antes (incorrecto)
result = await window.SupabaseConfig.utils.update('gastos', dataForSupabase, { id: nuevoGasto.id });

// ✅ Después (correcto)
result = await window.SupabaseConfig.utils.update('gastos', nuevoGasto.id, dataForSupabase);
```

### 2. Mapeo del campo `estado` en `mapFrontendToSupabase`
```javascript
const baseData = {
    titulo: item.descripcion || item.titulo || '',
    cantidad: parseFloat(item.monto || item.cantidad || 0),
    categoria: item.categoria || '',
    fecha: item.fecha || '',
    descripcion: item.notas || item.descripcion || '',
    estado: item.estado || 'pendiente' // ✅ Agregado
};
```

### 3. Mapeo del campo `estado` en `mapSupabaseToFrontend`
```javascript
const baseData = {
    id: item.id,
    tipo: item.titulo || '',
    descripcion: item.titulo || '',
    monto: item.cantidad || 0,
    categoria: item.categoria || '',
    fecha: item.fecha || '',
    notas: item.descripcion || '',
    estado: item.estado || 'pendiente', // ✅ Agregado
    created_at: item.created_at,
    updated_at: item.updated_at
};
```

### 4. Eliminación de código que forzaba estado 'pendiente'
```javascript
// ❌ Removido
if (type === 'gasto') {
    baseData.estado = 'pendiente';
}
```

## Actualización de Base de Datos Requerida

⚠️ **IMPORTANTE**: Para que funcione completamente, necesitas ejecutar el script SQL:

```sql
-- Ejecutar en el panel SQL de Supabase
-- Archivo: supabase-estado-update.sql

-- Agregar campo estado a la tabla gastos
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' 
CHECK (estado IN ('pendiente', 'pagado', 'cancelado'));

-- Agregar campo estado a la tabla ingresos
ALTER TABLE ingresos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' 
CHECK (estado IN ('pendiente', 'recibido', 'cancelado'));
```

## Archivos Modificados

1. ✅ `src/js/modules/storage.js` - Correcciones en mapeo y llamadas a update
2. ✅ `supabase-estado-update.sql` - Script para agregar campo estado
3. ✅ `production/assets/js/modules/storage.js` - Copiado a producción

## Pruebas

Para verificar que funciona:

1. Crea un gasto nuevo
2. Márcalo como pagado
3. Verifica que el estado se mantiene después de refrescar
4. Revisa que en Supabase el campo `estado` se actualice a 'pagado'

## Estados Disponibles

- **Gastos**: `pendiente`, `pagado`, `cancelado`
- **Ingresos**: `pendiente`, `recibido`, `cancelado`
