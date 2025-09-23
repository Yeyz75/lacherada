/**
 * Supabase Authentication Service
 * Maneja autenticación con Google OAuth y email/contraseña
 */

import { supabase } from '../supabase-config'
import type { User, AuthError } from '@supabase/supabase-js'
import { logger } from '../utils/logger'

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
  hasPassword: boolean
  loginMethod: 'email' | 'google' | 'mixed'
}

export interface AuthResult {
  user: UserData
  isNewUser: boolean
  needsPasswordSetup: boolean
}

export class SupabaseAuthService {
  static async checkConnection(): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true })

      if (error)
        throw new Error(`Error de conexión a Supabase: ${error.message}`)
    } catch (error) {
      logger.error(
        'Error verificando conexión a Supabase',
        { component: 'auth', method: 'checkConnection' },
        error as Error,
      )
      throw new Error(
        'No se pudo establecer conexión con el servidor de autenticación',
      )
    }
  }

  private static createUserDataFromSupabase(supabaseUser: User): UserData {
    const provider =
      supabaseUser.app_metadata?.provider ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].provider
        : 'email')

    const loginMethod = provider === 'google' ? 'google' : 'email'

    const displayName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].identity_data?.full_name ||
          supabaseUser.identities[0].identity_data?.name
        : null) ||
      null

    const photoURL =
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].identity_data?.avatar_url ||
          supabaseUser.identities[0].identity_data?.picture
        : null) ||
      null

    let emailVerified = false
    if (loginMethod === 'google') {
      emailVerified = true
    } else {
      const userMetadataVerified =
        supabaseUser.user_metadata?.email_verified === true
      const identityVerified =
        supabaseUser.identities &&
        supabaseUser.identities.length > 0 &&
        supabaseUser.identities[0].identity_data?.email_verified === true

      emailVerified = userMetadataVerified || identityVerified || false
    }

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || null,
      displayName,
      photoURL,
      emailVerified,
      createdAt: new Date(supabaseUser.created_at),
      lastLoginAt: new Date(),
      hasPassword: true,
      loginMethod,
    }
  }

  static async signInWithEmail(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user)
        throw new Error('No se pudo obtener los datos del usuario')

      const userData = this.createUserDataFromSupabase(data.user)

      return {
        user: userData,
        isNewUser: false,
        needsPasswordSetup: false,
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName || '',
          },
        },
      })

      if (error) throw error
      if (!data.user) throw new Error('No se pudo crear el usuario')

      // CRÍTICO: Para usuarios de email recién registrados, emailVerified = false
      const userData: UserData = {
        uid: data.user.id,
        email: data.user.email || null,
        displayName: displayName || data.user.user_metadata?.full_name || null,
        photoURL: data.user.user_metadata?.avatar_url || null,
        emailVerified: false,
        createdAt: new Date(data.user.created_at),
        lastLoginAt: new Date(),
        hasPassword: true,
        loginMethod: 'email',
      }

      return {
        user: userData,
        isNewUser: true,
        needsPasswordSetup: false,
      }
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async signInWithGoogle(): Promise<{ redirecting: boolean }> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        logger.authError(
          'Error en signInWithOAuth',
          error,
          undefined,
          'signInWithGoogle',
        )
        throw error
      }

      return { redirecting: true }
    } catch (error) {
      logger.authError(
        'Error en signInWithGoogle',
        error as Error,
        undefined,
        'signInWithGoogle',
      )
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async handleOAuthCallback(): Promise<AuthResult | null> {
    try {
      // Primero intentar obtener la sesión actual
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) {
        logger.authError(
          'Error obteniendo sesión',
          sessionError,
          undefined,
          'handleOAuthCallback',
        )
        throw sessionError
      }

      if (!sessionData.session?.user) return null

      const supabaseUser = sessionData.session.user

      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('has_password, login_method, created_at')
        .eq('id', supabaseUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        logger.authError(
          'Error consultando perfil',
          profileError,
          supabaseUser.id,
          'handleOAuthCallback',
        )
        throw profileError
      }

      const isNewUser = !existingProfile

      const userData = this.createUserDataFromSupabase(supabaseUser)

      return {
        user: userData,
        isNewUser,
        needsPasswordSetup: false,
      }
    } catch (error) {
      logger.authError(
        'Error en handleOAuthCallback',
        error as Error,
        undefined,
        'handleOAuthCallback',
      )
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async resendEmailVerification(email?: string): Promise<void> {
    try {
      let emailToUse = email

      if (!emailToUse) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        emailToUse = user?.email
      }

      if (!emailToUse)
        throw new Error('No hay usuario autenticado o email disponible')

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
      })
      if (error) throw error
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const loginMethod =
        user.app_metadata?.provider === 'google' ? 'google' : 'email'

      let emailVerified = false
      if (loginMethod === 'google') {
        emailVerified = true
      } else {
        const userMetadataVerified = user.user_metadata?.email_verified === true
        const identityVerified =
          user.identities &&
          user.identities.length > 0 &&
          user.identities[0].identity_data?.email_verified === true

        emailVerified = userMetadataVerified || identityVerified || false
      }

      return {
        uid: user.id,
        email: user.email || null,
        displayName:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        photoURL:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        emailVerified,
        createdAt: new Date(user.created_at),
        lastLoginAt: new Date(),
        hasPassword: true,
        loginMethod,
      }
    } catch (error) {
      logger.warn(
        'Error getting current user',
        { component: 'auth', method: 'getCurrentUser' },
        error as Error,
      )
      return null
    }
  }

  static onAuthStateChanged(
    callback: (user: UserData | null) => void,
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const loginMethod =
            session.user.app_metadata?.provider === 'google'
              ? 'google'
              : 'email'

          let emailVerified = false
          if (loginMethod === 'google') {
            emailVerified = true
          } else {
            emailVerified =
              session.user.user_metadata?.email_verified === true ||
              (session.user.identities &&
                session.user.identities.length > 0 &&
                session.user.identities[0].identity_data?.email_verified ===
                  true) ||
              false
          }

          const userData: UserData = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              null,
            photoURL:
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture ||
              null,
            emailVerified,
            createdAt: new Date(session.user.created_at),
            lastLoginAt: new Date(),
            hasPassword: true,
            loginMethod,
          }
          callback(userData)
        } catch (error) {
          logger.error(
            'Error in auth listener',
            { component: 'auth', method: 'onAuthStateChanged' },
            error as Error,
          )
          callback(null)
        }
      } else {
        callback(null)
      }
    })

    return () => subscription.unsubscribe()
  }

  private static handleAuthError(error: AuthError | Error): Error {
    logger.authError('Handling auth error', error)
    let message = 'Error de autenticación'

    if ('message' in error) {
      switch (error.message) {
        case 'Invalid login credentials':
          message = 'Credenciales inválidas'
          break
        case 'Email not confirmed':
          message = 'Email no confirmado. Revisa tu bandeja de entrada'
          break
        case 'User already registered':
          message = 'Ya existe una cuenta con este email'
          break
        case 'Password should be at least 6 characters':
          message = 'La contraseña debe tener al menos 6 caracteres'
          break
        case 'Unable to validate email address: invalid format':
          message = 'Email inválido'
          break
        case 'Signup is disabled':
          message = 'El registro está deshabilitado'
          break
        case 'Too many requests':
          message = 'Demasiados intentos. Intenta más tarde'
          break
        default:
          message = error.message || 'Error desconocido'
      }
    }

    return new Error(message)
  }
}
