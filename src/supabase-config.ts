// Supabase configuration
import { createClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

// Supabase configuration from environment variables
export const supabaseConfig: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
}

// Validate configuration
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  console.warn(
    'Supabase configuration is incomplete. Please check your environment variables.',
  )
}

// Initialize Supabase client
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Export types for better TypeScript support
export type { User, Session, AuthError } from '@supabase/supabase-js'
