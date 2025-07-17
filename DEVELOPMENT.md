# 🔧 Guía para Desarrolladores - Gestor Financiero Personal

## 📋 **Logs y Debugging**

### **Activar Modo Desarrollador**

La aplicación está configurada para funcionar sin logs en producción. Para activar los logs:

#### **Método 1: URL**
```
http://localhost/index.html?debug=true
```

#### **Método 2: Consola del navegador**
```javascript
// Activar logs temporalmente
logger.enable()

// Activar modo desarrollador permanente
logger.enableDevMode()

// Desactivar modo desarrollador
logger.disableDevMode()
```

#### **Método 3: Local Storage**
```javascript
// Activar manualmente
localStorage.setItem('dev-mode', 'true')
location.reload()
```

### **Panel de Configuración de Desarrollador**

1. **Abrir configuración**: Click en ⚙️ (botón configuración)
2. **Opciones disponibles en modo dev:**
   - `logs` - Activar/desactivar logs
   - `sync` - Forzar sincronización con Supabase
   - `reset` - Limpiar datos locales
   - `info` - Mostrar información del sistema

## 🛠️ **Estructura del Sistema de Logs**

### **Logger (src/js/utils/logger.js)**
```javascript
// Métodos disponibles
logger.log('mensaje normal')
logger.info('información')
logger.warn('advertencia')
logger.error('error')
logger.success('✅ operación exitosa')
logger.loading('⏳ cargando...')
logger.database('💾 base de datos')
logger.api('🔗 llamada API')
```

### **Detección Automática de Modo Desarrollo**
El logger se activa automáticamente cuando detecta:
- `localhost` en la URL
- `127.0.0.1` en la URL
- `dev=true` en la URL
- `debug=true` en la URL
- `dev-mode` en localStorage

## 📊 **Monitoreo del Sistema**

### **Estado de la Aplicación**
```javascript
// Acceder al objeto principal
window.gestorFinanciero

// Ver estado actual
window.gestorFinanciero.storage.getConnectionStatus()
```

### **Componentes Disponibles**
```javascript
// Calendarios
window.gestorFinanciero.calendarioIngresos
window.gestorFinanciero.calendarioGastos

// Consultas y análisis
window.gestorFinanciero.consultas

// Sistema de almacenamiento
window.gestorFinanciero.storage
```

## 🚀 **Comandos de Desarrollo**

### **Limpiar Cache**
```javascript
// Limpiar caché del service worker
caches.keys().then(names => {
    names.forEach(name => caches.delete(name))
})

// Recargar con cache limpio
location.reload(true)
```

### **Forzar Sincronización**
```javascript
window.gestorFinanciero.sincronizarDatos()
```

### **Reset Completo**
```javascript
// ⚠️ CUIDADO: Elimina todos los datos
localStorage.clear()
sessionStorage.clear()
indexedDB.deleteDatabase('gestorFinanciero')
location.reload()
```

## 🔒 **Configuración de Supabase**

### **Variables de Entorno**
Las credenciales están en: `src/js/modules/supabase-config.js`

### **Testing de Conexión**
```javascript
// Verificar conexión
window.SupabaseConfig.testConnection()

// Reiniciar Supabase
window.SupabaseConfig.reiniciar()
```

## 📝 **Logs de Producción**

En producción, solo se registran:
- ❌ Errores críticos
- ⚠️ Advertencias importantes
- ✅ Operaciones exitosas principales

Los logs detallados están deshabilitados para mejorar el rendimiento.

## 🧪 **Testing Manual**

### **Probar Funcionalidades**
1. **Agregar Ingreso**: Click en fecha del calendario de ingresos
2. **Agregar Gasto**: Click en fecha del calendario de gastos
3. **Ver Estadísticas**: Pestaña "Consultas y Análisis"
4. **Sincronización**: Botón "🔄 Sync"

### **Probar Modo Offline**
1. Desconectar internet
2. Agregar datos
3. Reconectar internet
4. Verificar sincronización

## 📱 **PWA Testing**

### **Instalar como App**
1. Chrome: Menu → "Instalar aplicación"
2. Edge: Menu → "Aplicaciones" → "Instalar esta aplicación"

### **Verificar Service Worker**
```javascript
// Ver estado
navigator.serviceWorker.ready

// Forzar actualización
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.update())
})
```

---

## 🆘 **Solución de Problemas Comunes**

### **"FullCalendar no disponible"**
- Verificar conexión a internet
- Limpiar cache del navegador
- Recargar página

### **"Error de Supabase"**
- Verificar credenciales en supabase-config.js
- Comprobar políticas RLS en Supabase
- Verificar tablas creadas correctamente

### **"Datos no se sincronizan"**
- Verificar conexión a internet
- Comprobar estado con `logger.enableDevMode()`
- Forzar sync manual

---

**💡 Consejo**: Mantén las DevTools abiertas durante el desarrollo y usa `logger.enableDevMode()` para ver todos los logs detallados.
