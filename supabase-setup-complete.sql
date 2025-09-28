-- =====================================================
-- SETUP COMPLETO DE SUPABASE - DESDE CERO (VERSION ROBUSTA)
-- =====================================================
-- Esta versión es más robusta y maneja errores sin fallar
-- =====================================================

-- =====================================================
-- 1. LIMPIEZA INICIAL
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    END IF;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
    END IF;
END $$;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.get_user_provider(UUID);

-- =====================================================
-- 2. CREAR TABLA user_profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    has_password BOOLEAN DEFAULT true,
    login_method TEXT CHECK (login_method IN ('email', 'google')) DEFAULT 'email',
    provider TEXT,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. FUNCIONES AUXILIARES
-- =====================================================

-- Función simplificada para detectar proveedor
CREATE OR REPLACE FUNCTION public.get_user_provider(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    provider_name TEXT;
BEGIN
    -- Buscar en identities primero (más confiable para OAuth)
    SELECT provider INTO provider_name
    FROM auth.identities
    WHERE user_id = get_user_provider.user_id
    LIMIT 1;

    -- Si no encontró, buscar en app_metadata
    IF provider_name IS NULL THEN
        SELECT app_metadata->>'provider' INTO provider_name
        FROM auth.users
        WHERE id = user_id;
    END IF;

    -- Si aún no encontró, buscar en user_metadata
    IF provider_name IS NULL THEN
        SELECT user_metadata->>'provider' INTO provider_name
        FROM auth.users
        WHERE id = user_id;
    END IF;

    -- Fallback por defecto - SIEMPRE devolver un valor válido
    IF provider_name IS NULL OR provider_name NOT IN ('google', 'email') THEN
        provider_name := 'email';
    END IF;

    RETURN provider_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN ROBUSTA PARA NUEVOS USUARIOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_provider TEXT;
    user_name TEXT;
    user_avatar TEXT;
    login_method_value TEXT;
BEGIN
    -- Log inicial
    RAISE NOTICE '🔄 handle_new_user triggered for user: %', NEW.id;

    BEGIN
        -- Obtener proveedor de forma segura
        BEGIN
            user_provider := public.get_user_provider(NEW.id);
            RAISE NOTICE '📋 Raw provider from function: %', user_provider;
        EXCEPTION
            WHEN OTHERS THEN
                user_provider := 'email'; -- fallback seguro
                RAISE NOTICE '⚠️ Error getting provider, using fallback: %', user_provider;
        END;

        -- Forzar valores válidos para el constraint
        IF user_provider = 'google' THEN
            login_method_value := 'google';
        ELSE
            login_method_value := 'email';
        END IF;

        RAISE NOTICE '📋 Final provider: %, login_method: %', user_provider, login_method_value;

        -- Obtener nombre de forma segura
        BEGIN
            user_name := COALESCE(
                NEW.user_metadata->>'full_name',
                NEW.user_metadata->>'name',
                NEW.app_metadata->>'full_name',
                NEW.app_metadata->>'name',
                (SELECT identity_data->>'full_name' FROM auth.identities WHERE user_id = NEW.id LIMIT 1),
                (SELECT identity_data->>'name' FROM auth.identities WHERE user_id = NEW.id LIMIT 1),
                SPLIT_PART(NEW.email, '@', 1)
            );
        EXCEPTION
            WHEN OTHERS THEN
                user_name := SPLIT_PART(NEW.email, '@', 1); -- fallback seguro
        END;

        RAISE NOTICE '👤 Display name: %', user_name;

        -- Obtener avatar de forma segura
        BEGIN
            user_avatar := COALESCE(
                NEW.user_metadata->>'photo_url',
                NEW.user_metadata->>'picture',
                NEW.app_metadata->>'photo_url',
                NEW.app_metadata->>'picture',
                (SELECT identity_data->>'photo_url' FROM auth.identities WHERE user_id = NEW.id LIMIT 1),
                (SELECT identity_data->>'picture' FROM auth.identities WHERE user_id = NEW.id LIMIT 1)
            );
        EXCEPTION
            WHEN OTHERS THEN
                user_avatar := NULL;
        END;

        RAISE NOTICE '💾 Creating profile with login_method: %', login_method_value;

        -- Insertar perfil de forma segura
        BEGIN
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
                true, -- Siempre true
                login_method_value, -- Usar la variable verificada
                user_provider,
                timezone('utc'::text, now())
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
                photo_url = COALESCE(EXCLUDED.photo_url, user_profiles.photo_url),
                last_login_at = timezone('utc'::text, now()),
                updated_at = timezone('utc'::text, now());

            RAISE NOTICE '✅ Profile created successfully for user: %', NEW.id;

        EXCEPTION
            WHEN OTHERS THEN
                -- Si falla la inserción, al menos registrar el error
                RAISE NOTICE '❌ Error creating profile: %', SQLERRM;
                RAISE NOTICE '❌ Attempted login_method value: %', login_method_value;
                -- NO lanzamos excepción para no romper el registro del usuario
        END;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Unexpected error in handle_new_user: %', SQLERRM;
            -- NO lanzamos excepción para permitir que el usuario se registre
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREAR TRIGGERS
-- =====================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. POLÍTICAS RLS
-- =====================================================

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. PERMISOS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

GRANT EXECUTE ON FUNCTION public.get_user_provider(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =====================================================
-- 8. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_login_method_idx ON public.user_profiles(login_method);
CREATE INDEX IF NOT EXISTS user_profiles_provider_idx ON public.user_profiles(provider);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS user_profiles_last_login_idx ON public.user_profiles(last_login_at);
CREATE INDEX IF NOT EXISTS user_profiles_active_idx ON public.user_profiles(is_active);

-- =====================================================
-- 9. VERIFICACIÓN
-- =====================================================

SELECT
    '✅ Configuración robusta completada' as status,
    COUNT(*) as total_users
FROM public.user_profiles;
