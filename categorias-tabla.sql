-- Crear tabla categorias en Supabase (ACTUALIZACIÓN PARA MÉXICO 🇲🇽)
-- Para ejecutar en el SQL Editor de Supabase

-- Solo crear tabla si no existe
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

-- Índices para mejorar rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id ON public.categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON public.categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_activa ON public.categorias(activa);

-- Habilitar RLS (no genera error si ya está habilitado)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para recrearlas con seguridad
DROP POLICY IF EXISTS "Usuarios pueden ver categorías públicas y propias" ON public.categorias;
DROP POLICY IF EXISTS "Usuarios pueden crear sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Usuarios pueden editar sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus categorías" ON public.categorias;

-- Recrear políticas de seguridad RLS
-- Política para lectura: usuarios pueden ver categorías públicas (usuario_id = null) y sus propias categorías
CREATE POLICY "Usuarios pueden ver categorías públicas y propias" ON public.categorias
    FOR SELECT USING (usuario_id IS NULL OR auth.uid() = usuario_id);

-- Política para inserción: usuarios pueden crear sus propias categorías  
CREATE POLICY "Usuarios pueden crear sus categorías" ON public.categorias
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política para actualización: usuarios pueden editar sus propias categorías
CREATE POLICY "Usuarios pueden editar sus categorías" ON public.categorias
    FOR UPDATE USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

-- Política para eliminación: usuarios pueden eliminar sus propias categorías (no las públicas)
CREATE POLICY "Usuarios pueden eliminar sus categorías" ON public.categorias
    FOR DELETE USING (auth.uid() = usuario_id AND usuario_id IS NOT NULL);

-- Insertar categorías predeterminadas para México 🇲🇽
-- Estas serán las categorías base específicas para usuarios mexicanos
INSERT INTO public.categorias (nombre, icono, color, tipo, activa) 
VALUES 
    -- Categorías de ingresos específicas para México
    ('Sueldo', '💼', '#22c55e', 'ingreso', true),
    ('Aguinaldo', '🎁', '#f59e0b', 'ingreso', true),
    ('Prima Vacacional', '�️', '#06b6d4', 'ingreso', true),
    ('Bonos', '💰', '#8b5cf6', 'ingreso', true),
    ('Freelance', '💻', '#3b82f6', 'ingreso', true),
    ('Negocio Propio', '🏪', '#10b981', 'ingreso', true),
    ('Inversiones', '�', '#f97316', 'ingreso', true),
    ('Remesas', '💸', '#ec4899', 'ingreso', true),
    ('Otros Ingresos', '📋', '#6b7280', 'ingreso', true),
    
    -- Categorías de gastos específicas para México  
    ('Comida', '�️', '#ef4444', 'gasto', true),
    ('Transporte', '�', '#f97316', 'gasto', true),
    ('Renta/Hipoteca', '🏠', '#eab308', 'gasto', true),
    ('Servicios (CFE, Telmex)', '⚡', '#06b6d4', 'gasto', true),
    ('Gas', '🔥', '#f59e0b', 'gasto', true),
    ('Gasolina', '⛽', '#dc2626', 'gasto', true),
    ('Salud/IMSS', '⚕️', '#22c55e', 'gasto', true),
    ('Educación', '📚', '#3b82f6', 'gasto', true),
    ('Entretenimiento', '🎮', '#a855f7', 'gasto', true),
    ('Ropa', '�', '#ec4899', 'gasto', true),
    ('Farmacia', '�', '#059669', 'gasto', true),
    ('Supermercado', '�', '#d97706', 'gasto', true),
    ('Restaurantes', '�', '#db2777', 'gasto', true),
    ('Otros Gastos', '�', '#6b7280', 'gasto', true)
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE public.categorias IS 'Categorías para clasificar ingresos y gastos';
COMMENT ON COLUMN public.categorias.tipo IS 'Tipo de transacción: ingreso, gasto o ambos';
COMMENT ON COLUMN public.categorias.color IS 'Color hexadecimal para la UI (#RRGGBB)';
COMMENT ON COLUMN public.categorias.icono IS 'Emoji o icono para mostrar en la UI';
