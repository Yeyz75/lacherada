/**
 * Supabase Authentication Service
 *
 * Servicio modular para manejar todas las operaciones de autenticación con Supabase
 * Incluye login con Google, email/contraseña, registro y manejo de estado de usuarios
 */

import { supabase } from '../supabase-config'
import type { User, AuthError } from '@supabase/supabase-js'

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
  /**
   * Verificar la conexión a Supabase
   */
  static async checkConnection(): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true })

      if (error)
        throw new Error(`Error de conexión a Supabase: ${error.message}`)
    } catch (error) {
      console.error('Error verificando conexión a Supabase:', error)
      throw new Error(
        'No se pudo establecer conexión con el servidor de autenticación',
      )
    }
  }

  /**
   * Convierte un usuario de Supabase a nuestro formato UserData
   */
  private static createUserDataFromSupabase(supabaseUser: User): UserData {
    // Determinar el proveedor
    const provider =
      supabaseUser.app_metadata?.provider ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].provider
        : 'email')

    const loginMethod = provider === 'google' ? 'google' : 'email'

    // Obtener nombre de usuario
    const displayName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].identity_data?.full_name ||
          supabaseUser.identities[0].identity_data?.name
        : null) ||
      null

    // Obtener foto de perfil
    const photoURL =
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].identity_data?.avatar_url ||
          supabaseUser.identities[0].identity_data?.picture
        : null) ||
      null

    // Verificar el estado real de email verificado
    let emailVerified = false
    if (loginMethod === 'google') {
      // Los usuarios de Google siempre están verificados
      emailVerified = true
    } else {
      // Para usuarios de email, verificar el estado real
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

  /**
   * Inicio de sesión con email y contraseña
   */
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

  /**
   * Registro con email y contraseña
   */
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

      // Para usuarios nuevos, crear datos básicos sin consultar la base de datos
      // El trigger se encargará de crear el perfil en paralelo

      // CRÍTICO: Para usuarios de email recién registrados, SIEMPRE emailVerified = false
      // No importa lo que diga email_confirmed_at
      const userData: UserData = {
        uid: data.user.id,
        email: data.user.email || null,
        displayName: displayName || data.user.user_metadata?.full_name || null,
        photoURL: data.user.user_metadata?.avatar_url || null,
        emailVerified: false, // SIEMPRE false para usuarios de email recién registrados
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

  /**
   * Inicio de sesión con Google
   */
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
        console.error('❌ Error en signInWithOAuth:', error)
        throw error
      }

      return { redirecting: true }
    } catch (error) {
      console.error('💥 Error en signInWithGoogle:', error)
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Manejar el callback de OAuth (Google)
   */
  static async handleOAuthCallback(): Promise<AuthResult | null> {
    try {
      // Primero intentar obtener la sesión actual
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError)
        throw sessionError
      }

      if (!sessionData.session?.user) return null

      const supabaseUser = sessionData.session.user

      // Verificar si el perfil existe en la base de datos
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('has_password, login_method, created_at')
        .eq('id', supabaseUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error consultando perfil:', profileError)
        throw profileError
      }

      // Determinar si es un usuario nuevo basado en la existencia del perfil
      const isNewUser = !existingProfile

      const userData = this.createUserDataFromSupabase(supabaseUser)

      // Para usuarios nuevos, el trigger ya creó el perfil
      // Para usuarios existentes, no necesitamos hacer nada más
      // El listener onAuthStateChanged se encargará de actualizar los datos del usuario

      return {
        user: userData,
        isNewUser,
        needsPasswordSetup: false,
      }
    } catch (error) {
      console.error('💥 Error en handleOAuthCallback:', error)
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Cerrar sesión
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
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

  /**
   * Reenviar email de verificación
   */
  static async resendEmailVerification(): Promise<void> {
    try {
      // Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.email)
        throw new Error('No hay usuario autenticado o email disponible')

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })
      if (error) throw error
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Obtener el usuario actual
   */
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      // Determinar método de login y verificación
      const loginMethod =
        user.app_metadata?.provider === 'google' ? 'google' : 'email'

      // Verificar el estado real de email verificado
      let emailVerified = false
      if (loginMethod === 'google') {
        // Los usuarios de Google siempre están verificados
        emailVerified = true
      } else {
        // Para usuarios de email, verificar el estado real
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
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Escuchar cambios en el estado de autenticación
   */
  static onAuthStateChanged(
    callback: (user: UserData | null) => void,
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          // Determinar método de login y verificación
          const loginMethod =
            session.user.app_metadata?.provider === 'google'
              ? 'google'
              : 'email'

          // Verificar el estado real de email verificado
          let emailVerified = false
          if (loginMethod === 'google') {
            // Los usuarios de Google siempre están verificados
            emailVerified = true
          } else {
            // Para usuarios de email, verificar el estado real
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
            hasPassword: true, // Todos los usuarios registrados tienen contraseña lógica
            loginMethod,
          }
          callback(userData)
        } catch (error) {
          console.error('Error in auth listener:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })

    return () => subscription.unsubscribe()
  }

  /**
   * Manejar errores de autenticación de Supabase
   */
  private static handleAuthError(error: AuthError | Error): Error {
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
