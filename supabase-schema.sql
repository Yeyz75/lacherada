-- Supabase Database Schema for LaCherada
-- This file contains the SQL commands to set up the database schema

-- Note: Removed ALTER DATABASE command as it's not needed in Supabase
-- Supabase handles JWT secrets automatically

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    has_password BOOLEAN DEFAULT false,
    login_method TEXT CHECK (login_method IN ('email', 'google', 'mixed')) DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_login_method_idx ON public.user_profiles(login_method);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON public.user_profiles(created_at);

-- Optional: Create a view for public user information (if needed for community features)
CREATE OR REPLACE VIEW public.public_user_profiles AS
SELECT 
    id,
    display_name,
    photo_url,
    created_at
FROM public.user_profiles
WHERE display_name IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.public_user_profiles TO authenticated, anon;
