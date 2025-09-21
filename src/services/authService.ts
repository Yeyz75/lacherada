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
  private static async createUserData(
    supabaseUser: User,
    _isNewUser: boolean = false,
  ): Promise<UserData> {
    // Obtener datos adicionales del perfil si existen
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()

    // Determinar el proveedor de forma más robusta
    const provider =
      supabaseUser.app_metadata?.provider ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].provider
        : 'email')

    const loginMethod = provider === 'google' ? 'google' : 'email'

    // Un usuario tiene contraseña si:
    // 1. Se registró con email/contraseña (provider === 'email')
    // 2. O si el perfil indica que tiene contraseña (usuarios de Google que establecieron contraseña)
    const hasPassword = profile?.has_password || provider === 'email'

    // Obtener nombre de usuario de múltiples fuentes
    const displayName =
      profile?.display_name ||
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].identity_data?.full_name ||
          supabaseUser.identities[0].identity_data?.name
        : null) ||
      null

    // Obtener foto de perfil de múltiples fuentes
    const photoURL =
      profile?.photo_url ||
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      (supabaseUser.identities && supabaseUser.identities.length > 0
        ? supabaseUser.identities[0].identity_data?.avatar_url ||
          supabaseUser.identities[0].identity_data?.picture
        : null) ||
      null

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || null,
      displayName,
      photoURL,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: new Date(supabaseUser.created_at),
      lastLoginAt: new Date(),
      hasPassword,
      loginMethod: profile?.login_method || loginMethod,
    }
  }

  /**
   * Guarda/actualiza los datos del usuario en la tabla de perfiles
   */
  private static async saveUserProfile(
    user: UserData,
    isNewUser: boolean = false,
  ): Promise<void> {
    const profileData = {
      id: user.uid,
      email: user.email,
      display_name: user.displayName,
      photo_url: user.photoURL,
      has_password: user.hasPassword,
      login_method: user.loginMethod,
      last_login_at: new Date().toISOString(),
      ...(isNewUser && { created_at: new Date().toISOString() }),
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (error) console.error('Error saving user profile:', error)
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

      const userData = await this.createUserData(data.user)
      await this.saveUserProfile(userData)

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

      const userData = await this.createUserData(data.user, true)
      if (displayName) userData.displayName = displayName

      await this.saveUserProfile(userData, true)

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

      const userData = await this.createUserData(supabaseUser, isNewUser)

      // Siempre actualizar el perfil para asegurar datos actualizados
      await this.saveUserProfile(userData, isNewUser)

      // Si es un usuario de Google, intentar actualizar con datos de identities
      if (userData.loginMethod === 'google') {
        try {
          const { error: updateError } = await supabase.rpc(
            'update_user_profile_from_identities',
            { user_id: supabaseUser.id },
          )
          if (updateError) {
            console.warn(
              '⚠️ No se pudo actualizar desde identities:',
              updateError,
            )
          } else {
            // Recargar los datos del usuario
            const updatedUserData = await this.createUserData(
              supabaseUser,
              isNewUser,
            )
            return {
              user: updatedUserData,
              isNewUser,
              needsPasswordSetup:
                updatedUserData.loginMethod === 'google' &&
                !updatedUserData.hasPassword,
            }
          }
        } catch (error) {
          console.warn('⚠️ Error actualizando desde identities:', error)
        }
      }

      // Un usuario de Google necesita establecer contraseña si:
      // 1. Su método de login es 'google'
      // 2. No tiene contraseña establecida
      const needsPasswordSetup =
        userData.loginMethod === 'google' && !userData.hasPassword

      return {
        user: userData,
        isNewUser,
        needsPasswordSetup,
      }
    } catch (error) {
      console.error('💥 Error en handleOAuthCallback:', error)
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Establecer contraseña para usuarios que se registraron con Google
   */
  static async setPassword(password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      // Actualizar el perfil del usuario
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_profiles')
          .update({
            has_password: true,
            login_method: 'mixed',
          })
          .eq('id', user.id)
      }
    } catch (error) {
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
   * Obtener el usuario actual
   */
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      return await this.createUserData(user)
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Verificar si el usuario actual necesita establecer contraseña
   */
  static async currentUserNeedsPasswordSetup(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('has_password, login_method')
        .eq('id', user.id)
        .single()

      return !profile?.has_password && profile?.login_method === 'google'
    } catch (error) {
      console.error('Error checking password setup requirement:', error)
      return false
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
        const userData = await this.createUserData(session.user)
        callback(userData)
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
