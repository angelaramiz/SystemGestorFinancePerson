# 🌐 Configuración de CORS para Supabase

Si ves errores de "Failed to fetch" o problemas de CORS, sigue estos pasos:

## 📋 Pasos para configurar CORS en Supabase:

### 1. **Acceder al Dashboard de Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión en tu cuenta
   - Selecciona tu proyecto

### 2. **Configurar Authentication URLs**
   - Ve a **Authentication** > **URL Configuration**
   - En **Site URL**, agrega: `http://localhost:8080`
   - En **Additional Redirect URLs**, agrega:
     ```
     http://localhost:8080
     http://localhost:8080/index-new.html
     http://localhost:8080/diagnostico.html
     ```

### 3. **Configurar API Settings (Opcional)**
   - Ve a **Settings** > **API**
   - Verifica que la URL del proyecto coincida con la configuración
   - Copia la **anon/public key** si es necesario

### 4. **Verificar Row Level Security (RLS)**
   - Ve a **Table Editor**
   - Si las tablas `ingresos` y `gastos` no existen, créalas ejecutando:
   ```sql
   -- Ejecutar el archivo supabase-security-policies.sql
   ```

## 🔧 Solución de Problemas Comunes:

### Error: "Failed to fetch"
- **Causa**: Problema de CORS o URLs no configuradas
- **Solución**: Configurar URLs en Authentication

### Error: "Table doesn't exist"
- **Causa**: Tablas no creadas en la base de datos
- **Solución**: Ejecutar políticas SQL

### Error: "JWT malformed"
- **Causa**: Clave anon incorrecta
- **Solución**: Verificar que la clave en el código coincida con el dashboard

## 🚀 Después de la Configuración:
1. Guarda los cambios en Supabase
2. Recarga la aplicación (`Ctrl+F5`)
3. Ejecuta el diagnóstico nuevamente
