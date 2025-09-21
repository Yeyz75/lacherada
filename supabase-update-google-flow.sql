-- Script para actualizar el flujo de autenticación con Google
-- Ejecutar este script en Supabase SQL Editor

-- 1. Primero, eliminar el trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recrear la función mejorada para manejar usuarios de Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo insertar si el perfil no existe
    INSERT INTO public.user_profiles (id, email, display_name, photo_url, has_password, login_method)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        -- Los usuarios de Google no tienen contraseña inicialmente
        CASE 
            WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN false
            WHEN NEW.encrypted_password IS NOT NULL THEN true 
            ELSE false 
        END,
        CASE 
            WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
            ELSE 'email'
        END
    )
    ON CONFLICT (id) DO NOTHING; -- No hacer nada si el perfil ya existe
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recrear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Actualizar perfiles existentes de usuarios de Google que no tienen contraseña
UPDATE public.user_profiles
SET has_password = false
WHERE login_method = 'google' 
AND id IN (
    SELECT id FROM auth.users 
    WHERE raw_app_meta_data->>'provider' = 'google'
    AND encrypted_password IS NULL
);

-- 5. Verificar y corregir el estado de los usuarios existentes
-- Esto asegura que los usuarios de Google tengan el estado correcto
UPDATE public.user_profiles p
SET 
    has_password = CASE 
        WHEN u.encrypted_password IS NOT NULL THEN true
        ELSE false
    END,
    login_method = CASE
        WHEN p.login_method = 'google' AND u.encrypted_password IS NOT NULL THEN 'mixed'
        ELSE p.login_method
    END
FROM auth.users u
WHERE p.id = u.id
AND p.login_method = 'google';

-- 6. Mensaje de confirmación
SELECT 'Script ejecutado exitosamente. El flujo de Google ha sido actualizado.' as mensaje;
