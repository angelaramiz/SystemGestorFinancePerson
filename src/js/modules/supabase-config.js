/**
 * Configuración de Supabase
 * Configura la conexión con la base de datos en la nube
 */

// Configuración segura de Supabase
const getSupabaseConfig = () => {
    // Intentar obtener de variables de entorno (si está disponible)
    const envUrl = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || null;
    const envKey = (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || null;
    
    // Si no hay variables de entorno, usar configuración local
    // NOTA: Estas son credenciales PÚBLICAS (anon key) - seguras para frontend
    const config = {
        url: envUrl || 'https://hqxghxslzewupwxooxvc.supabase.co',
        anonKey: envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeGdoeHNsemV3dXB3eG9veHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDEyNzcsImV4cCI6MjA2ODMxNzI3N30.2hbwsGMSY3pPyJ18qQe8hOx-fFmM7EJ7pJGDs6Cc0jM'
    };
    
    return config;
};

// Obtener configuración
const SUPABASE_CONFIG = getSupabaseConfig();
const SUPABASE_URL = SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

// Crear cliente de Supabase
let supabase = null;

// Función para inicializar Supabase
function initSupabase() {
    try {
        // Verificar que la librería de Supabase esté disponible
        if (typeof window.supabase === 'undefined') {
            console.log('⚠️ Librería de Supabase no disponible aún');
            return false;
        }
        
        // Solo inicializar si las credenciales están configuradas
        if (SUPABASE_URL !== 'TU_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'TU_SUPABASE_ANON_KEY') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase inicializado correctamente');
            console.log('🔗 URL:', SUPABASE_URL);
            return true;
        } else {
            console.log('⚠️ Credenciales de Supabase no configuradas - usando localStorage');
            return false;
        }
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return false;
    }
}

// Función para inicializar con reintentos
function initSupabaseWithRetry(maxRetries = 3) {
    let attempts = 0;
    
    const tryInit = () => {
        attempts++;
        console.log(`🔄 Intentando inicializar Supabase (intento ${attempts}/${maxRetries})`);
        
        if (initSupabase()) {
            return true;
        }
        
        if (attempts < maxRetries) {
            // Esperar un poco antes del siguiente intento
            setTimeout(tryInit, 500);
            return false;
        } else {
            console.log('⚠️ Máximo de intentos alcanzado - continuando con localStorage');
            return false;
        }
    };
    
    return tryInit();
}

// Verificar si Supabase está disponible
function isSupabaseAvailable() {
    return supabase !== null;
}

// Obtener el cliente de Supabase
function getSupabaseClient() {
    return supabase;
}

// Configuración de las tablas
const TABLES = {
    INGRESOS: 'ingresos',
    GASTOS: 'gastos',
    CATEGORIAS: 'categorias'
};

// Esquema de tablas para Supabase (SQL para ejecutar en el panel de Supabase)
const SCHEMA_SQL = `
-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    color VARCHAR(7) DEFAULT '#2563eb',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('nominal', 'recurrente', 'repentino')),
    descripcion TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    categoria_custom VARCHAR(255),
    notas TEXT,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia VARCHAR(20) CHECK (frecuencia IN ('diario', 'semanal', 'quincenal', 'mensual', 'anual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('futuro', 'recurrente', 'imprevisto')),
    descripcion TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
    fecha DATE NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    categoria_custom VARCHAR(255),
    notas TEXT,
    es_recurrente BOOLEAN DEFAULT FALSE,
    frecuencia VARCHAR(20) CHECK (frecuencia IN ('diario', 'semanal', 'quincenal', 'mensual', 'anual')),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_tipo ON ingresos(tipo);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos(tipo);
CREATE INDEX IF NOT EXISTS idx_gastos_estado ON gastos(estado);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingresos_updated_at BEFORE UPDATE ON ingresos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, tipo, color) VALUES 
    ('Salario', 'ingreso', '#10b981'),
    ('Freelance', 'ingreso', '#3b82f6'),
    ('Inversiones', 'ingreso', '#8b5cf6'),
    ('Otros Ingresos', 'ingreso', '#6b7280'),
    ('Vivienda', 'gasto', '#ef4444'),
    ('Alimentación', 'gasto', '#f59e0b'),
    ('Transporte', 'gasto', '#06b6d4'),
    ('Salud', 'gasto', '#ec4899'),
    ('Entretenimiento', 'gasto', '#84cc16'),
    ('Otros Gastos', 'gasto', '#6b7280')
ON CONFLICT DO NOTHING;
`;

// Funciones de utilidad para Supabase
const SupabaseUtils = {
    // Función genérica para insertar datos
    async insert(table, data) {
        if (!isSupabaseAvailable()) {
            throw new Error('Supabase no está disponible');
        }
        
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();
            
        if (error) throw error;
        return result;
    },

    // Función genérica para obtener datos
    async select(table, filters = {}) {
        if (!isSupabaseAvailable()) {
            throw new Error('Supabase no está disponible');
        }
        
        let query = supabase.from(table).select('*');
        
        // Aplicar filtros con lógica especial para fechas
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'fecha_desde') {
                // Filtrar fechas mayores o iguales a fecha_desde
                query = query.gte('fecha', value);
            } else if (key === 'fecha_hasta') {
                // Filtrar fechas menores o iguales a fecha_hasta
                query = query.lte('fecha', value);
            } else {
                // Filtros regulares de igualdad
                query = query.eq(key, value);
            }
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    // Función genérica para actualizar datos
    async update(table, id, data) {
        if (!isSupabaseAvailable()) {
            throw new Error('Supabase no está disponible');
        }
        
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select();
            
        if (error) throw error;
        return result;
    },

    // Función genérica para eliminar datos
    async delete(table, id) {
        if (!isSupabaseAvailable()) {
            throw new Error('Supabase no está disponible');
        }
        
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        return true;
    },

    // Obtener datos con rango de fechas
    async selectByDateRange(table, startDate, endDate) {
        if (!isSupabaseAvailable()) {
            throw new Error('Supabase no está disponible');
        }
        
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .gte('fecha', startDate)
            .lte('fecha', endDate)
            .order('fecha', { ascending: true });
            
        if (error) throw error;
        return data || [];
    }
};

// Exportar para uso global
window.SupabaseConfig = {
    init: initSupabase,
    initWithRetry: initSupabaseWithRetry,
    isAvailable: isSupabaseAvailable,
    getClient: getSupabaseClient,
    tables: TABLES,
    utils: SupabaseUtils,
    schema: SCHEMA_SQL
};
