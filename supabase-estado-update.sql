-- =============================================
-- ACTUALIZACIÓN: AGREGAR CAMPO ESTADO A GASTOS E INGRESOS
-- =============================================
-- Archivo: supabase-estado-update.sql
-- Descripción: Agrega el campo estado a las tablas de gastos e ingresos
-- Fecha: Julio 2025

-- Agregar campo estado a la tabla gastos
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' 
CHECK (estado IN ('pendiente', 'pagado', 'cancelado'));

-- Agregar campo estado a la tabla ingresos
ALTER TABLE ingresos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' 
CHECK (estado IN ('pendiente', 'recibido', 'cancelado'));

-- Comentarios de los campos
COMMENT ON COLUMN gastos.estado IS 'Estado del gasto: pendiente, pagado, cancelado';
COMMENT ON COLUMN ingresos.estado IS 'Estado del ingreso: pendiente, recibido, cancelado';

-- Actualizar registros existentes a estado pendiente si es null
UPDATE gastos 
SET estado = 'pendiente' 
WHERE estado IS NULL;

UPDATE ingresos 
SET estado = 'pendiente' 
WHERE estado IS NULL;

-- Crear índices para el campo estado
CREATE INDEX IF NOT EXISTS idx_gastos_estado ON gastos(usuario_id, estado);
CREATE INDEX IF NOT EXISTS idx_ingresos_estado ON ingresos(usuario_id, estado);

-- Verificar la actualización
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('gastos', 'ingresos') AND column_name = 'estado'
ORDER BY table_name, column_name;
