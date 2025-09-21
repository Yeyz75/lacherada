-- =====================================================
-- SUPABASE SETUP COMPLETO PARA LACHERADA
-- =====================================================
-- Este script unificado configura toda la base de datos
-- Incluye correcciones de acceso a metadatos y manejo robusto de OAuth
-- Versión: 2.0 - Optimizada y corregida
-- =====================================================

-- =====================================================
-- 1. LIMPIEZA INICIAL (Evitar conflictos)
-- =====================================================

-- Eliminar políticas existentes solo si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    END IF;
END $$;

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar trigger de user_profiles solo si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
    END IF;
END $$;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.get_user_provider(UUID);

-- Eliminar vista si existe
DROP VIEW IF EXISTS public.public_user_profiles;

-- =====================================================
-- 2. CREAR TABLA user_profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    has_password BOOLEAN DEFAULT false,
    login_method TEXT CHECK (login_method IN ('email', 'google', 'mixed')) DEFAULT 'email',
    provider TEXT, -- Nuevo campo para almacenar el proveedor principal
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. FUNCIONES AUXILIARES
-- =====================================================

-- Función para detectar el proveedor de autenticación de forma robusta
CREATE OR REPLACE FUNCTION public.get_user_provider(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    provider_name TEXT;
BEGIN
    -- Intentar obtener el proveedor desde diferentes fuentes
    SELECT 
        COALESCE(
            -- Desde app_metadata
            (SELECT app_metadata->>'provider' FROM auth.users WHERE id = user_id),
            -- Desde user_metadata
            (SELECT user_metadata->>'provider' FROM auth.users WHERE id = user_id),
            -- Desde identities (más confiable)
            (SELECT provider FROM auth.identities WHERE user_id = get_user_provider.user_id LIMIT 1),
            -- Fallback: detectar por presencia de contraseña
            CASE 
                WHEN (SELECT encrypted_password FROM auth.users WHERE id = user_id) IS NOT NULL THEN 'email'
                ELSE 'google'
            END
        ) INTO provider_name;
    
    RETURN COALESCE(provider_name, 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para manejar actualizaciones de timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN PRINCIPAL PARA NUEVOS USUARIOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_provider TEXT;
    user_name TEXT;
    user_avatar TEXT;
    has_pwd BOOLEAN;
BEGIN
    -- Obtener proveedor de forma robusta
    user_provider := public.get_user_provider(NEW.id);
    
    -- Obtener nombre de usuario desde múltiples fuentes
    user_name := COALESCE(
        NEW.user_metadata->>'full_name',
        NEW.user_metadata->>'name',
        NEW.app_metadata->>'full_name',
        NEW.app_metadata->>'name',
        -- Desde identities si está disponible
        (SELECT identity_data->>'full_name' FROM auth.identities WHERE user_id = NEW.id LIMIT 1),
        (SELECT identity_data->>'name' FROM auth.identities WHERE user_id = NEW.id LIMIT 1),
        -- Fallback: extraer del email
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Obtener avatar desde múltiples fuentes
    user_avatar := COALESCE(
        NEW.user_metadata->>'avatar_url',
        NEW.user_metadata->>'picture',
        NEW.app_metadata->>'avatar_url',
        NEW.app_metadata->>'picture',
        (SELECT identity_data->>'avatar_url' FROM auth.identities WHERE user_id = NEW.id LIMIT 1),
        (SELECT identity_data->>'picture' FROM auth.identities WHERE user_id = NEW.id LIMIT 1)
    );
    
    -- Determinar si tiene contraseña
    has_pwd := CASE 
        WHEN user_provider = 'google' THEN false
        WHEN NEW.encrypted_password IS NOT NULL THEN true 
        ELSE false 
    END;
    
    -- Insertar perfil de usuario
    INSERT INTO public.user_profiles (
        id, 
        email, 
        display_name, 
        photo_url, 
        has_password, 
        login_method,
        provider,
        last_login_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        user_avatar,
        has_pwd,
        user_provider,
        user_provider,
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        photo_url = COALESCE(EXCLUDED.photo_url, user_profiles.photo_url),
        last_login_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREAR TRIGGERS
-- =====================================================

-- Trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar timestamp
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. PERMISOS Y ACCESOS
-- =====================================================

-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Permisos para las funciones
GRANT EXECUTE ON FUNCTION public.get_user_provider(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =====================================================
-- 8. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_login_method_idx ON public.user_profiles(login_method);
CREATE INDEX IF NOT EXISTS user_profiles_provider_idx ON public.user_profiles(provider);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS user_profiles_last_login_idx ON public.user_profiles(last_login_at);
CREATE INDEX IF NOT EXISTS user_profiles_active_idx ON public.user_profiles(is_active);

-- =====================================================
-- 9. VISTA PÚBLICA (Para funcionalidades comunitarias)
-- =====================================================

CREATE OR REPLACE VIEW public.public_user_profiles AS
SELECT 
    id,
    display_name,
    photo_url,
    created_at,
    is_active
FROM public.user_profiles
WHERE display_name IS NOT NULL 
AND is_active = true;

-- Otorgar acceso a la vista
GRANT SELECT ON public.public_user_profiles TO authenticated, anon;

-- =====================================================
-- 10. ACTUALIZACIÓN DE USUARIOS EXISTENTES
-- =====================================================

-- Actualizar usuarios existentes para corregir metadatos
DO $$
DECLARE
    user_record RECORD;
    corrected_provider TEXT;
    corrected_name TEXT;
    corrected_avatar TEXT;
BEGIN
    -- Iterar sobre todos los usuarios existentes
    FOR user_record IN 
        SELECT u.id, u.email, u.encrypted_password, u.app_metadata, u.user_metadata
        FROM auth.users u
        LEFT JOIN public.user_profiles p ON u.id = p.id
        WHERE p.id IS NULL OR p.provider IS NULL
    LOOP
        -- Obtener proveedor corregido
        corrected_provider := public.get_user_provider(user_record.id);
        
        -- Obtener nombre corregido
        corrected_name := COALESCE(
            user_record.user_metadata->>'full_name',
            user_record.user_metadata->>'name',
            user_record.app_metadata->>'full_name',
            user_record.app_metadata->>'name',
            SPLIT_PART(user_record.email, '@', 1)
        );
        
        -- Obtener avatar corregido
        corrected_avatar := COALESCE(
            user_record.user_metadata->>'avatar_url',
            user_record.user_metadata->>'picture',
            user_record.app_metadata->>'avatar_url',
            user_record.app_metadata->>'picture'
        );
        
        -- Insertar o actualizar perfil
        INSERT INTO public.user_profiles (
            id, email, display_name, photo_url, has_password, login_method, provider
        )
        VALUES (
            user_record.id,
            user_record.email,
            corrected_name,
            corrected_avatar,
            CASE 
                WHEN corrected_provider = 'google' AND user_record.encrypted_password IS NULL THEN false
                WHEN user_record.encrypted_password IS NOT NULL THEN true 
                ELSE false 
            END,
            CASE 
                WHEN corrected_provider = 'google' AND user_record.encrypted_password IS NOT NULL THEN 'mixed'
                ELSE corrected_provider
            END,
            corrected_provider
        )
        ON CONFLICT (id) DO UPDATE SET
            provider = EXCLUDED.provider,
            login_method = CASE 
                WHEN EXCLUDED.provider = 'google' AND user_profiles.has_password = true THEN 'mixed'
                ELSE EXCLUDED.login_method
            END,
            display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
            photo_url = COALESCE(EXCLUDED.photo_url, user_profiles.photo_url),
            updated_at = timezone('utc'::text, now());
    END LOOP;
END $$;

-- =====================================================
-- 11. VERIFICACIONES FINALES
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Verificar tabla
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles';
    
    -- Verificar funciones
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('handle_new_user', 'handle_updated_at', 'get_user_provider');
    
    -- Verificar triggers
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name IN ('on_auth_user_created', 'handle_user_profiles_updated_at');
    
    -- Verificar políticas RLS
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles';
    
    -- Mostrar resultados
    RAISE NOTICE 'Verificación completada:';
    RAISE NOTICE '- Tabla user_profiles: %', CASE WHEN table_count > 0 THEN 'OK' ELSE 'ERROR' END;
    RAISE NOTICE '- Funciones creadas: % de 3', function_count;
    RAISE NOTICE '- Triggers creados: % de 2', trigger_count;
    RAISE NOTICE '- Políticas RLS: % de 3', policy_count;
    
    IF table_count > 0 AND function_count = 3 AND trigger_count = 2 AND policy_count = 3 THEN
        RAISE NOTICE '✅ SETUP COMPLETADO EXITOSAMENTE';
    ELSE
        RAISE NOTICE '⚠️  Algunos componentes pueden no haberse creado correctamente';
    END IF;
END $$;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================
SELECT 
    '🎉 Supabase setup completo para LaCherada' as mensaje,
    'Esquema unificado y optimizado aplicado correctamente' as detalle,
    'Versión 2.0 - Con correcciones de metadatos y manejo robusto de OAuth' as version;
