import { supabase } from '@/supabase-config'
import type { PostgrestError } from '@supabase/supabase-js'

export interface AvatarUploadResult {
  publicUrl: string
  success: boolean
}

export interface AvatarServiceError {
  message: string
  context: string
  cause?: PostgrestError | Error
}

export class AvatarService {
  private static readonly TABLE_USER_PROFILES = 'user_profiles'
  private static readonly BUCKET_AVATARS = 'user-avatars'

  /**
   * Sube una nueva imagen de avatar para el usuario
   */
  static async uploadAvatar(file: File): Promise<AvatarUploadResult> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user)
        throw this.createError('Usuario no autenticado', 'uploadAvatar')

      const fileExtension = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExtension}`

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_AVATARS)
        .upload(fileName, file)

      if (uploadError) {
        throw this.createError(
          'Error al subir la imagen del avatar',
          'uploadAvatar',
          uploadError,
        )
      }

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.BUCKET_AVATARS).getPublicUrl(fileName)

      // Actualizar perfil del usuario con la nueva URL
      const { error: updateError } = await supabase
        .from(this.TABLE_USER_PROFILES)
        .update({
          photo_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        // Si falla la BD, intentar eliminar el archivo subido
        await supabase.storage
          .from(this.BUCKET_AVATARS)
          .remove([uploadData.path])

        throw this.createError(
          'Error al actualizar el perfil del usuario',
          'uploadAvatar',
          updateError,
        )
      }

      return {
        publicUrl,
        success: true,
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al subir el avatar',
        'uploadAvatar',
        error as Error,
      )
    }
  }

  /**
   * Elimina el avatar actual del usuario
   */
  static async deleteAvatar(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user)
        throw this.createError('Usuario no autenticado', 'deleteAvatar')

      // Obtener la URL actual del avatar
      const { data: profile, error: fetchError } = await supabase
        .from(this.TABLE_USER_PROFILES)
        .select('photo_url')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        throw this.createError(
          'Error al obtener el perfil del usuario',
          'deleteAvatar',
          fetchError,
        )
      }

      // Si hay un avatar, eliminarlo del storage
      if (profile?.photo_url) {
        // Extraer el path del storage de la URL pública
        const url = new URL(profile.photo_url)
        const pathSegments = url.pathname.split('/')
        const storagePath = pathSegments.slice(-2).join('/') // userId/filename

        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_AVATARS)
          .remove([storagePath])

        if (storageError) {
          console.warn(
            'Warning: Error al eliminar archivo del storage:',
            storageError,
          )
        }
      }

      // Actualizar perfil del usuario removiendo la URL del avatar
      const { error: updateError } = await supabase
        .from(this.TABLE_USER_PROFILES)
        .update({
          photo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        throw this.createError(
          'Error al actualizar el perfil del usuario',
          'deleteAvatar',
          updateError,
        )
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al eliminar el avatar',
        'deleteAvatar',
        error as Error,
      )
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getCurrentUserProfile(): Promise<any> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user)
        throw this.createError(
          'Usuario no autenticado',
          'getCurrentUserProfile',
        )

      const { data, error } = await supabase
        .from(this.TABLE_USER_PROFILES)
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw this.createError(
          'Error al obtener el perfil del usuario',
          'getCurrentUserProfile',
          error,
        )
      }

      return data
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al obtener el perfil del usuario',
        'getCurrentUserProfile',
        error as Error,
      )
    }
  }

  /**
   * Crea un error estructurado
   */
  private static createError(
    message: string,
    context: string,
    cause?: PostgrestError | Error,
  ): AvatarServiceError {
    return {
      message,
      context,
      cause,
    }
  }
}

export default AvatarService
