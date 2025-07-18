-- ===================================================
-- OPTIMIZACIÓN DE CATEGORÍAS DE GASTOS PARA MÉXICO 🇲🇽
-- Ejecutar en el SQL Editor de Supabase
-- ===================================================

-- 1. BACKUP DE CATEGORÍAS EXISTENTES (opcional)
-- CREATE TABLE categorias_backup AS SELECT * FROM public.categorias;

-- 2. ACTUALIZAR GASTOS EXISTENTES PARA CONSOLIDAR CATEGORÍAS
BEGIN;

-- Consolidar servicios públicos
UPDATE public.gastos 
SET categoria = 'Servicios Públicos' 
WHERE categoria IN ('CFE (Luz)', 'Telmex/Internet', 'Gas LP', 'Agua');

-- Consolidar alimentación
UPDATE public.gastos 
SET categoria = 'Alimentación' 
WHERE categoria IN ('Comida y Despensa', 'Supermercado', 'Restaurantes');

-- Consolidar salud
UPDATE public.gastos 
SET categoria = 'Salud' 
WHERE categoria IN ('IMSS/Salud', 'Farmacia');

-- Consolidar servicios financieros
UPDATE public.gastos 
SET categoria = 'Servicios Financieros' 
WHERE categoria IN ('Servicios Bancarios', 'Seguros', 'Impuestos');

-- Consolidar transporte
UPDATE public.gastos 
SET categoria = 'Transporte' 
WHERE categoria IN ('Transporte Público', 'Gasolina', 'Uber/Taxi');

COMMIT;

-- 3. ELIMINAR CATEGORÍAS REDUNDANTES
DELETE FROM public.categorias 
WHERE nombre IN (
    'CFE (Luz)',
    'Telmex/Internet', 
    'Gas LP',
    'Comida y Despensa',
    'Supermercado',
    'Restaurantes',
    'IMSS/Salud',
    'Farmacia',
    'Servicios Bancarios',
    'Seguros',
    'Impuestos',
    'Transporte Público',
    'Gasolina'
);

-- 4. INSERTAR CATEGORÍAS OPTIMIZADAS
INSERT INTO public.categorias (nombre, icono, color, tipo, activa) VALUES

-- ===================================================
-- CATEGORÍAS DE GASTOS OPTIMIZADAS
-- ===================================================
('Alimentación', '🍽️', '#ef4444', 'gasto', true),
('Vivienda', '🏠', '#eab308', 'gasto', true),
('Servicios Públicos', '⚡', '#06b6d4', 'gasto', true),
('Transporte', '🚌', '#f97316', 'gasto', true),
('Salud', '⚕️', '#22c55e', 'gasto', true),
('Educación', '📚', '#3b82f6', 'gasto', true),
('Entretenimiento', '🎮', '#a855f7', 'gasto', true),
('Ropa y Calzado', '👕', '#ec4899', 'gasto', true),
('Servicios Financieros', '🏦', '#64748b', 'gasto', true),
('Tarjetas de Crédito', '💳', '#dc2626', 'gasto', true),
('Préstamos y Créditos', '🏛️', '#7c2d12', 'gasto', true),
('Mantenimiento Hogar', '🔧', '#84cc16', 'gasto', true),
('Otros Gastos', '📝', '#6b7280', 'gasto', true)

ON CONFLICT (nombre) DO UPDATE SET
    icono = EXCLUDED.icono,
    color = EXCLUDED.color,
    tipo = EXCLUDED.tipo,
    activa = EXCLUDED.activa;

-- 5. VERIFICAR CATEGORÍAS ACTUALIZADAS
SELECT 
    id,
    nombre,
    icono,
    color,
    tipo
FROM public.categorias 
WHERE tipo IN ('gasto', 'ambos')
ORDER BY nombre;

-- 6. VERIFICAR CONSOLIDACIÓN DE GASTOS
SELECT 
    categoria,
    COUNT(*) as total_gastos
FROM public.gastos 
GROUP BY categoria 
ORDER BY total_gastos DESC;

-- ===================================================
-- COMENTARIOS SOBRE LA OPTIMIZACIÓN
-- ===================================================
/*
CONSOLIDACIONES REALIZADAS:

1. SERVICIOS PÚBLICOS: CFE (Luz), Telmex/Internet, Gas LP, Agua
2. ALIMENTACIÓN: Comida y Despensa, Supermercado, Restaurantes
3. SALUD: IMSS/Salud, Farmacia
4. SERVICIOS FINANCIEROS: Servicios Bancarios, Seguros, Impuestos
5. TRANSPORTE: Transporte Público, Gasolina, Uber/Taxi

NUEVAS CATEGORÍAS AGREGADAS:
- Tarjetas de Crédito
- Préstamos y Créditos

CATEGORÍAS MANTENIDAS:
- Vivienda (Renta o Hipoteca)
- Educación
- Entretenimiento
- Ropa y Calzado
- Mantenimiento Hogar
- Otros Gastos
*/
