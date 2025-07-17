-- ===================================================
-- SCRIPT DE ACTUALIZACIÓN PARA MÉXICO 🇲🇽
-- Ejecutar en el SQL Editor de Supabase
-- ===================================================

-- 1. CREAR TABLA SI NO EXISTE
CREATE TABLE IF NOT EXISTS public.categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(10) DEFAULT '📝',
    color VARCHAR(7) DEFAULT '#6366f1',
    tipo VARCHAR(20) CHECK (tipo IN ('ingreso', 'gasto', 'ambos')) DEFAULT 'ambos',
    activa BOOLEAN DEFAULT true,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREAR ÍNDICES (SI NO EXISTEN)
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id ON public.categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON public.categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_activa ON public.categorias(activa);

-- 3. HABILITAR RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR POLÍTICAS EXISTENTES PARA RECREARLAS
DROP POLICY IF EXISTS "Usuarios pueden ver categorías públicas y propias" ON public.categorias;
DROP POLICY IF EXISTS "Usuarios pueden crear sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Usuarios pueden editar sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus categorías" ON public.categorias;

-- 5. CREAR POLÍTICAS NUEVAS
CREATE POLICY "Usuarios pueden ver categorías públicas y propias" ON public.categorias
    FOR SELECT USING (usuario_id IS NULL OR auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden crear sus categorías" ON public.categorias
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden editar sus categorías" ON public.categorias
    FOR UPDATE USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus categorías" ON public.categorias
    FOR DELETE USING (auth.uid() = usuario_id AND usuario_id IS NOT NULL);

-- 6. LIMPIAR CATEGORÍAS PÚBLICAS ANTERIORES
DELETE FROM public.categorias WHERE usuario_id IS NULL;

-- 7. INSERTAR CATEGORÍAS PARA MÉXICO 🇲🇽
INSERT INTO public.categorias (nombre, icono, color, tipo, activa) VALUES

-- ===================================================
-- CATEGORÍAS DE INGRESOS PARA MÉXICO
-- ===================================================
('Sueldo', '💼', '#22c55e', 'ingreso', true),
('Aguinaldo', '🎁', '#f59e0b', 'ingreso', true),
('Prima Vacacional', '🏖️', '#06b6d4', 'ingreso', true),
('Bonos y Comisiones', '💰', '#8b5cf6', 'ingreso', true),
('Freelance', '💻', '#3b82f6', 'ingreso', true),
('Negocio Propio', '🏪', '#10b981', 'ingreso', true),
('Inversiones', '📈', '#f97316', 'ingreso', true),
('Remesas', '💸', '#ec4899', 'ingreso', true),
('Renta de Propiedad', '🏘️', '#14b8a6', 'ingreso', true),
('Otros Ingresos', '📋', '#6b7280', 'ingreso', true),

-- ===================================================
-- CATEGORÍAS DE GASTOS PARA MÉXICO
-- ===================================================
('Comida y Despensa', '🍽️', '#ef4444', 'gasto', true),
('Transporte Público', '🚌', '#f97316', 'gasto', true),
('Renta o Hipoteca', '🏠', '#eab308', 'gasto', true),
('CFE (Luz)', '⚡', '#06b6d4', 'gasto', true),
('Telmex/Internet', '📡', '#3b82f6', 'gasto', true),
('Gas LP', '🔥', '#f59e0b', 'gasto', true),
('Gasolina', '⛽', '#dc2626', 'gasto', true),
('IMSS/Salud', '⚕️', '#22c55e', 'gasto', true),
('Educación', '📚', '#3b82f6', 'gasto', true),
('Entretenimiento', '🎮', '#a855f7', 'gasto', true),
('Ropa y Calzado', '👕', '#ec4899', 'gasto', true),
('Farmacia', '💊', '#059669', 'gasto', true),
('Supermercado', '🛒', '#d97706', 'gasto', true),
('Restaurantes', '🍕', '#db2777', 'gasto', true),
('Servicios Bancarios', '🏦', '#64748b', 'gasto', true),
('Seguros', '🛡️', '#7c3aed', 'gasto', true),
('Mantenimiento Hogar', '🔧', '#84cc16', 'gasto', true),
('Impuestos', '📋', '#525252', 'gasto', true),
('Otros Gastos', '📝', '#6b7280', 'gasto', true);

-- 8. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE public.categorias IS 'Categorías para clasificar ingresos y gastos - Adaptado para México';
COMMENT ON COLUMN public.categorias.tipo IS 'Tipo de transacción: ingreso, gasto o ambos';
COMMENT ON COLUMN public.categorias.color IS 'Color hexadecimal para la UI (#RRGGBB)';
COMMENT ON COLUMN public.categorias.icono IS 'Emoji o icono para mostrar en la UI';

-- ===================================================
-- VERIFICACIÓN FINAL
-- ===================================================
-- Verificar que las categorías se insertaron correctamente
SELECT 
    tipo,
    COUNT(*) as total_categorias,
    STRING_AGG(nombre, ', ' ORDER BY nombre) as categorias
FROM public.categorias 
WHERE usuario_id IS NULL 
GROUP BY tipo 
ORDER BY tipo;
