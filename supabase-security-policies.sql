-- ===================================================
-- POLÍTICAS DE SEGURIDAD PARA SUPABASE (RLS)
-- Ejecuta este SQL en el panel SQL de Supabase
-- ===================================================

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- POLÍTICAS PARA CATEGORÍAS (Solo lectura pública)
-- ===================================================

-- Permitir lectura de categorías por defecto
CREATE POLICY "Permitir lectura de categorías"
ON categorias FOR SELECT
USING (true);

-- ===================================================
-- POLÍTICAS PARA INGRESOS (Acceso completo temporal)
-- ===================================================

-- Permitir insertar ingresos
CREATE POLICY "Permitir insertar ingresos"
ON ingresos FOR INSERT
WITH CHECK (true);

-- Permitir leer ingresos
CREATE POLICY "Permitir leer ingresos"
ON ingresos FOR SELECT
USING (true);

-- Permitir actualizar ingresos
CREATE POLICY "Permitir actualizar ingresos"
ON ingresos FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir eliminar ingresos
CREATE POLICY "Permitir eliminar ingresos"
ON ingresos FOR DELETE
USING (true);

-- ===================================================
-- POLÍTICAS PARA GASTOS (Acceso completo temporal)
-- ===================================================

-- Permitir insertar gastos
CREATE POLICY "Permitir insertar gastos"
ON gastos FOR INSERT
WITH CHECK (true);

-- Permitir leer gastos
CREATE POLICY "Permitir leer gastos"
ON gastos FOR SELECT
USING (true);

-- Permitir actualizar gastos
CREATE POLICY "Permitir actualizar gastos"
ON gastos FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir eliminar gastos
CREATE POLICY "Permitir eliminar gastos"
ON gastos FOR DELETE
USING (true);

-- ===================================================
-- NOTAS IMPORTANTES DE SEGURIDAD:
-- ===================================================

/*
📝 ESTAS SON POLÍTICAS BÁSICAS PARA DESARROLLO

🔒 PARA PRODUCCIÓN, CONSIDERA:

1. AUTENTICACIÓN DE USUARIOS:
   - Usar auth.uid() en las políticas
   - Requerir login para acceder a datos

2. POLÍTICAS MÁS RESTRICTIVAS:
   - Cada usuario solo ve sus propios datos
   - Limitar operaciones por roles

3. EJEMPLO DE POLÍTICA CON AUTENTICACIÓN:
   
   CREATE POLICY "Los usuarios solo ven sus ingresos"
   ON ingresos FOR SELECT
   USING (auth.uid() = user_id);
   
   -- Para esto necesitarías agregar una columna user_id a las tablas

4. RATE LIMITING:
   - Configurar límites de API calls
   - Monitorear uso de la base de datos

5. VALIDACIONES:
   - Funciones de validación en la base de datos
   - Triggers para auditoría

📖 Documentación de RLS:
https://supabase.com/docs/guides/auth/row-level-security
*/
