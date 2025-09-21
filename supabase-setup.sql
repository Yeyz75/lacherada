-- =====================================================
-- SUPABASE SETUP SIMPLE PARA LACHERADA
-- =====================================================
-- Versión simplificada sin limpieza previa
-- Ideal para instalación inicial limpia
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA user_profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    has_password BOOLEAN DEFAULT false,
    login_method TEXT CHECK (login_method IN ('email', 'google', 'mixed')) DEFAULT 'email',
    provider TEXT, -- Campo para almacenar el proveedor principal
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. FUNCIONES AUXILIARES
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
-- 3. FUNCIÓN PRINCIPAL PARA NUEVOS USUARIOS
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
-- 4. CREAR TRIGGERS
-- =====================================================

-- Trigger para nuevos usuarios
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar timestamp
CREATE OR REPLACE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. POLÍTICAS RLS (Row Level Security)
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
-- 6. PERMISOS Y ACCESOS
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
-- 7. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_login_method_idx ON public.user_profiles(login_method);
CREATE INDEX IF NOT EXISTS user_profiles_provider_idx ON public.user_profiles(provider);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS user_profiles_last_login_idx ON public.user_profiles(last_login_at);
CREATE INDEX IF NOT EXISTS user_profiles_active_idx ON public.user_profiles(is_active);

-- =====================================================
-- 8. VISTA PÚBLICA (Para funcionalidades comunitarias)
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
-- 9. MENSAJE FINAL
-- =====================================================
SELECT 
    '🎉 Supabase setup simple completado para LaCherada' as mensaje,
    'Esquema creado exitosamente' as detalle,
    'Versión Simple - Sin limpieza previa' as version;
