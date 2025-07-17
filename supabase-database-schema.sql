-- =============================================
-- ESQUEMA DE BASE DE DATOS - GESTOR FINANCIERO PERSONAL
-- =============================================
-- Archivo: supabase-database-schema.sql
-- Descripción: Esquema completo para las tablas de ingresos y gastos
-- Fecha: Julio 2025

-- =============================================
-- 1. CREAR TABLAS PRINCIPALES
-- =============================================

-- Tabla de Ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL CHECK (cantidad >= 0),
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL CHECK (cantidad >= 0),
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CREAR ÍNDICES PARA RENDIMIENTO
-- =============================================

-- Índices para ingresos
CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ingresos_categoria ON ingresos(usuario_id, categoria);
CREATE INDEX IF NOT EXISTS idx_ingresos_mes ON ingresos(usuario_id, date_trunc('month', fecha));

-- Índices para gastos
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha ON gastos(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(usuario_id, categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_mes ON gastos(usuario_id, date_trunc('month', fecha));

-- =============================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en ambas tablas
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREAR POLÍTICAS DE SEGURIDAD
-- =============================================

-- Políticas para ingresos
DROP POLICY IF EXISTS "Usuarios pueden ver sus ingresos" ON ingresos;
CREATE POLICY "Usuarios pueden ver sus ingresos" ON ingresos
    FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden insertar sus ingresos" ON ingresos;
CREATE POLICY "Usuarios pueden insertar sus ingresos" ON ingresos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus ingresos" ON ingresos;
CREATE POLICY "Usuarios pueden actualizar sus ingresos" ON ingresos
    FOR UPDATE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus ingresos" ON ingresos;
CREATE POLICY "Usuarios pueden eliminar sus ingresos" ON ingresos
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para gastos
DROP POLICY IF EXISTS "Usuarios pueden ver sus gastos" ON gastos;
CREATE POLICY "Usuarios pueden ver sus gastos" ON gastos
    FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden insertar sus gastos" ON gastos;
CREATE POLICY "Usuarios pueden insertar sus gastos" ON gastos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus gastos" ON gastos;
CREATE POLICY "Usuarios pueden actualizar sus gastos" ON gastos
    FOR UPDATE USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus gastos" ON gastos;
CREATE POLICY "Usuarios pueden eliminar sus gastos" ON gastos
    FOR DELETE USING (auth.uid() = usuario_id);

-- =============================================
-- 5. CREAR FUNCIÓN DE ACTUALIZACIÓN AUTOMÁTICA
-- =============================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_ingresos_updated_at ON ingresos;
CREATE TRIGGER update_ingresos_updated_at
    BEFORE UPDATE ON ingresos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gastos_updated_at ON gastos;
CREATE TRIGGER update_gastos_updated_at
    BEFORE UPDATE ON gastos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. CREAR VISTAS ÚTILES (OPCIONAL)
-- =============================================

-- Vista para resumen mensual de ingresos
CREATE OR REPLACE VIEW resumen_ingresos_mensual AS
SELECT 
    usuario_id,
    date_trunc('month', fecha) as mes,
    categoria,
    COUNT(*) as cantidad_registros,
    SUM(cantidad) as total,
    AVG(cantidad) as promedio
FROM ingresos
GROUP BY usuario_id, date_trunc('month', fecha), categoria
ORDER BY mes DESC, total DESC;

-- Vista para resumen mensual de gastos
CREATE OR REPLACE VIEW resumen_gastos_mensual AS
SELECT 
    usuario_id,
    date_trunc('month', fecha) as mes,
    categoria,
    COUNT(*) as cantidad_registros,
    SUM(cantidad) as total,
    AVG(cantidad) as promedio
FROM gastos
GROUP BY usuario_id, date_trunc('month', fecha), categoria
ORDER BY mes DESC, total DESC;

-- =============================================
-- 7. DATOS DE EJEMPLO (OPCIONAL - PARA TESTING)
-- =============================================

-- Solo insertar si no existen datos
-- NOTA: Cambiar el UUID por tu ID de usuario real si quieres datos de prueba

/*
-- Ejemplo de ingresos de prueba
INSERT INTO ingresos (usuario_id, titulo, cantidad, categoria, fecha, descripcion) VALUES
('00000000-0000-0000-0000-000000000000', 'Salario Enero', 3000.00, 'Salario', '2025-01-15', 'Pago mensual'),
('00000000-0000-0000-0000-000000000000', 'Freelance Web', 500.00, 'Freelance', '2025-01-20', 'Desarrollo de sitio web'),
('00000000-0000-0000-0000-000000000000', 'Venta Productos', 150.00, 'Ventas', '2025-01-25', 'Venta de productos online');

-- Ejemplo de gastos de prueba
INSERT INTO gastos (usuario_id, titulo, cantidad, categoria, fecha, descripcion) VALUES
('00000000-0000-0000-0000-000000000000', 'Supermercado', 120.50, 'Alimentación', '2025-01-16', 'Compras semanales'),
('00000000-0000-0000-0000-000000000000', 'Gasolina', 45.00, 'Transporte', '2025-01-18', 'Combustible para auto'),
('00000000-0000-0000-0000-000000000000', 'Netflix', 15.99, 'Entretenimiento', '2025-01-01', 'Suscripción mensual');
*/

-- =============================================
-- ESQUEMA COMPLETADO
-- =============================================

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas correctamente' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('ingresos', 'gastos');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('ingresos', 'gastos');
