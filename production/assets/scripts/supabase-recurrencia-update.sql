-- =============================================
-- ACTUALIZACIÓN PARA INGRESOS Y GASTOS RECURRENTES
-- =============================================
-- Archivo: supabase-recurrencia-update.sql
-- Descripción: Agregar campos para transacciones recurrentes
-- Fecha: Julio 2025

-- =============================================
-- SECCIÓN 1: ACTUALIZACIÓN DE TABLA INGRESOS
-- =============================================

-- Agregar campos de recurrencia a la tabla ingresos
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS es_recurrente BOOLEAN DEFAULT FALSE;
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS frecuencia_recurrencia VARCHAR(20) DEFAULT 'mensual'; -- 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS dia_recurrencia VARCHAR(10) DEFAULT '1'; -- Día específico del mes/semana
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS fecha_fin_recurrencia DATE DEFAULT NULL; -- Fecha límite para la recurrencia
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE; -- Para activar/desactivar recurrencia
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS proximo_pago DATE DEFAULT NULL; -- Fecha del próximo pago programado
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS ingreso_padre_id UUID DEFAULT NULL; -- Referencia al ingreso original
ALTER TABLE ingresos ADD COLUMN IF NOT EXISTS numero_secuencia INTEGER DEFAULT 1; -- Número en la secuencia (1, 2, 3...)

-- Crear índices para mejorar performance en consultas de recurrencia
CREATE INDEX IF NOT EXISTS idx_ingresos_recurrente ON ingresos(es_recurrente, activo);
CREATE INDEX IF NOT EXISTS idx_ingresos_proximo_pago ON ingresos(proximo_pago);
CREATE INDEX IF NOT EXISTS idx_ingresos_padre ON ingresos(ingreso_padre_id);

-- Agregar comentarios para documentación
COMMENT ON COLUMN ingresos.es_recurrente IS 'Indica si este ingreso se repite automáticamente';
COMMENT ON COLUMN ingresos.frecuencia_recurrencia IS 'Frecuencia de repetición: semanal, quincenal, mensual, etc.';
COMMENT ON COLUMN ingresos.dia_recurrencia IS 'Día específico en que ocurre la recurrencia';
COMMENT ON COLUMN ingresos.fecha_fin_recurrencia IS 'Fecha límite hasta cuando se genera la recurrencia';
COMMENT ON COLUMN ingresos.activo IS 'Estado activo/inactivo de la recurrencia';
COMMENT ON COLUMN ingresos.proximo_pago IS 'Fecha calculada del siguiente pago';
COMMENT ON COLUMN ingresos.ingreso_padre_id IS 'ID del ingreso original que genera esta recurrencia';
COMMENT ON COLUMN ingresos.numero_secuencia IS 'Número de orden en la secuencia de pagos';

-- =============================================
-- SECCIÓN 2: ACTUALIZACIÓN DE TABLA GASTOS
-- =============================================

-- También agregar los mismos campos a gastos para consistencia
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS es_recurrente BOOLEAN DEFAULT FALSE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS frecuencia_recurrencia VARCHAR(20) DEFAULT 'mensual';
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS dia_recurrencia VARCHAR(10) DEFAULT '1';
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS fecha_fin_recurrencia DATE DEFAULT NULL;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS proximo_pago DATE DEFAULT NULL;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS gasto_padre_id UUID DEFAULT NULL;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS numero_secuencia INTEGER DEFAULT 1;

-- Índices para gastos recurrentes
CREATE INDEX IF NOT EXISTS idx_gastos_recurrente ON gastos(es_recurrente, activo);
CREATE INDEX IF NOT EXISTS idx_gastos_proximo_pago ON gastos(proximo_pago);
CREATE INDEX IF NOT EXISTS idx_gastos_padre ON gastos(gasto_padre_id);

-- Agregar comentarios para documentación
COMMENT ON COLUMN gastos.es_recurrente IS 'Indica si este gasto se repite automáticamente';
COMMENT ON COLUMN gastos.frecuencia_recurrencia IS 'Frecuencia de repetición: semanal, quincenal, mensual, etc.';
COMMENT ON COLUMN gastos.dia_recurrencia IS 'Día específico en que ocurre la recurrencia';
COMMENT ON COLUMN gastos.fecha_fin_recurrencia IS 'Fecha límite hasta cuando se genera la recurrencia';
COMMENT ON COLUMN gastos.activo IS 'Estado activo/inactivo de la recurrencia';
COMMENT ON COLUMN gastos.proximo_pago IS 'Fecha calculada del siguiente pago';
COMMENT ON COLUMN gastos.gasto_padre_id IS 'ID del gasto original que genera esta recurrencia';
COMMENT ON COLUMN gastos.numero_secuencia IS 'Número de orden en la secuencia de pagos';

-- Actualizar privilegios para el rol anon (si es necesario)
GRANT SELECT, INSERT, UPDATE, DELETE ON ingresos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON gastos TO anon;

-- =============================================
-- MENSAJES DE CONFIRMACIÓN
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '=========================================================';
  RAISE NOTICE 'Actualización completada: Sistema de recurrencia instalado';
  RAISE NOTICE 'Las tablas de ingresos y gastos ahora soportan recurrencia.';
  RAISE NOTICE '=========================================================';
END $$;
