# 📋 Instrucciones de Setup de Supabase para LaCherada

## 🎯 Esquema Optimizado y Corregido

He creado un esquema Supabase **optimizado y corregido** que reemplaza a todos los archivos anteriores.

## 🚀 Cómo Ejecutar

### Archivo Principal: `supabase-setup.sql`

1. **Copia** todo el contenido del archivo `supabase-setup.sql`
2. **Pega** en el SQL Editor de Supabase
3. **Ejecuta** el script

### Pasos Detallados:
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva consulta
4. Copia y pega el contenido de `supabase-setup.sql`
5. Haz clic en **Run**

### Verificar la Instalación
El script mostrará un mensaje de confirmación al final.

## 🔧 Mejoras Implementadas

### 1. **Acceso Robusto a Metadatos**
- ✅ Corregido acceso desde `app_metadata`, `user_metadata` e `identities`
- ✅ Múltiples fuentes de respaldo para obtener datos de usuario
- ✅ Manejo inteligente de proveedores OAuth

### 2. **Función `get_user_provider()`**
```sql
-- Detecta el proveedor de forma robusta desde múltiples fuentes
SELECT public.get_user_provider(auth.uid());
```

### 3. **Campos Adicionales**
- `provider`: Almacena el proveedor principal de autenticación
- `is_active`: Control de usuarios activos/inactivos
- `preferences`: Campo JSONB para preferencias de usuario

### 4. **Manejo de Usuarios Existentes**
- ✅ Actualización automática de usuarios existentes
- ✅ Corrección de metadatos incorrectos
- ✅ Migración sin pérdida de datos

### 5. **Optimizaciones de Rendimiento**
- ✅ Índices optimizados para consultas frecuentes
- ✅ Políticas RLS mejoradas
- ✅ Vista pública para funcionalidades comunitarias

## 🔐 Seguridad

### Row Level Security (RLS)
- **Habilitado** en la tabla `user_profiles`
- **Políticas**: Los usuarios solo pueden ver/editar su propio perfil
- **Funciones**: Ejecutadas con `SECURITY DEFINER`

### Permisos
- `authenticated`: Acceso completo a sus propios datos
- `anon`: Solo lectura a datos públicos necesarios

## 🎭 Flujos de Autenticación Soportados

### 1. **Email/Contraseña**
```typescript
// Usuario tradicional con email y contraseña
login_method: 'email'
has_password: true
provider: 'email'
```

### 2. **Google OAuth**
```typescript
// Usuario que se registra solo con Google
login_method: 'google'
has_password: false
provider: 'google'
```

### 3. **Mixto (Google + Contraseña)**
```typescript
// Usuario de Google que después establece contraseña
login_method: 'mixed'
has_password: true
provider: 'google'
```

## 🔄 Actualizaciones Automáticas

### Trigger `on_auth_user_created`
- Se ejecuta automáticamente cuando se crea un nuevo usuario
- Extrae metadatos de múltiples fuentes
- Crea el perfil de usuario correspondiente

### Trigger `handle_user_profiles_updated_at`
- Actualiza automáticamente el campo `updated_at`
- Se ejecuta en cada actualización del perfil

## 📊 Verificaciones Post-Instalación

Después de ejecutar el script, puedes verificar que todo funciona:

```sql
-- Verificar tabla creada
SELECT COUNT(*) FROM public.user_profiles;

-- Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'handle_%' OR routine_name = 'get_user_provider';

-- Verificar políticas RLS
SELECT policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_profiles';
```

## 🚨 Notas Importantes

1. **Archivo Principal**: `supabase-setup.sql`
2. **Idempotente**: Puede ejecutarse múltiples veces sin problemas
3. **Sin Errores**: Corregido para evitar problemas de relaciones inexistentes
4. **Optimizado**: Incluye todas las mejoras de metadatos y OAuth

## 🆘 Solución de Problemas

### Error de Archivos Antiguos Eliminado
- ✅ **Eliminados**: `supabase-schema.sql`, `supabase-update-google-flow.sql`
- ✅ **Mantenido**: `supabase-setup.sql` (versión corregida y optimizada)

### Error: "relation already exists"
- **Causa**: Componentes ya existen
- **Solución**: El script usa `IF NOT EXISTS` y `CREATE OR REPLACE`

### Error: "permission denied"
- **Causa**: Permisos insuficientes
- **Solución**: Asegúrate de ejecutar como propietario del proyecto

## 📈 Próximos Pasos

Después de ejecutar este script:

1. **Configurar Variables de Entorno**:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

2. **Probar Autenticación**:
   - Registro con email/contraseña
   - Login con Google OAuth
   - Establecer contraseña para usuarios de Google

3. **Verificar Perfiles**:
   - Los perfiles se crean automáticamente
   - Los metadatos se extraen correctamente
   - Las actualizaciones funcionan

## 🎉 ¡Listo!

Tu base de datos Supabase está ahora completamente configurada y optimizada para LaCherada con:
- ✅ Manejo robusto de OAuth
- ✅ Correcciones de metadatos
- ✅ Seguridad RLS
- ✅ Optimizaciones de rendimiento
- ✅ Compatibilidad con flujos mixtos de autenticación
