import { supabase } from '@/supabase-config'
import type {
  Item,
  CreateItemInput,
  UpdateItemInput,
  ItemFilters,
  PaginationOptions,
  PaginatedResult,
  ItemImage,
  UploadImageResult,
  ItemServiceError,
  Category,
  Favorite,
} from '@/types/marketplace'
import type { PostgrestError } from '@supabase/supabase-js'

export class ItemService {
  private static readonly TABLE_ITEMS = 'items'
  private static readonly TABLE_ITEM_IMAGES = 'item_images'
  private static readonly TABLE_CATEGORIES = 'categories'
  private static readonly TABLE_FAVORITES = 'favorites'
  private static readonly BUCKET_IMAGES = 'item-images'

  /**
   * Crea un nuevo item
   */
  static async createItem(input: CreateItemInput): Promise<Item> {
    try {
      // Generar slug si no se proporciona
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      const itemData = {
        ...input,
        slug: `${slug}-${Date.now()}`,
        currency: input.currency || 'USD',
        allowNegotiation: input.allowNegotiation ?? false,
        quantity: input.quantity || 1,
        fulfillmentOptions: input.fulfillmentOptions || ['pickup'],
        status: input.status || 'draft',
        isActive: input.isActive ?? true,
        tags: input.tags || [],
        metadata: input.metadata || {},
        viewCount: 0,
        favoriteCount: 0,
      }

      const { data, error } = await supabase
        .from(this.TABLE_ITEMS)
        .insert([itemData])
        .select('*')
        .single()

      if (error)
        throw this.createError('Error al crear el item', 'createItem', error)

      return data as Item
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al crear el item',
        'createItem',
        error as Error,
      )
    }
  }

  /**
   * Obtiene un item por ID
   */
  static async getItemById(
    id: string,
    includeRelations = true,
  ): Promise<Item | null> {
    try {
      const query = supabase
        .from(this.TABLE_ITEMS)
        .select(
          includeRelations
            ? '*, category:categories(*), images:item_images(*), userProfile:user_profiles!userId(displayName, avatarUrl)'
            : '*',
        )
        .eq('id', id)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        throw this.createError('Error al obtener el item', 'getItemById', error)
      }

      return data as unknown as Item
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al obtener el item',
        'getItemById',
        error as Error,
      )
    }
  }

  /**
   * Obtiene un item por slug
   */
  static async getItemBySlug(
    slug: string,
    includeRelations = true,
  ): Promise<Item | null> {
    try {
      const query = supabase
        .from(this.TABLE_ITEMS)
        .select(
          includeRelations
            ? '*, category:categories(*), images:item_images(*), userProfile:user_profiles!userId(displayName, avatarUrl)'
            : '*',
        )
        .eq('slug', slug)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        throw this.createError(
          'Error al obtener el item',
          'getItemBySlug',
          error,
        )
      }

      return data as unknown as Item
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al obtener el item',
        'getItemBySlug',
        error as Error,
      )
    }
  }

  /**
   * Actualiza un item
   */
  static async updateItem(id: string, input: UpdateItemInput): Promise<Item> {
    try {
      const updateData = {
        ...input,
        updatedAt: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from(this.TABLE_ITEMS)
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        throw this.createError(
          'Error al actualizar el item',
          'updateItem',
          error,
        )
      }

      return data as Item
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al actualizar el item',
        'updateItem',
        error as Error,
      )
    }
  }

  /**
   * Elimina un item
   */
  static async deleteItem(id: string): Promise<void> {
    try {
      // Primero eliminar las imágenes asociadas
      await this.deleteItemImages(id)

      const { error } = await supabase
        .from(this.TABLE_ITEMS)
        .delete()
        .eq('id', id)

      if (error)
        throw this.createError('Error al eliminar el item', 'deleteItem', error)
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al eliminar el item',
        'deleteItem',
        error as Error,
      )
    }
  }

  /**
   * Obtiene items con filtros y paginación
   */
  static async getItems(
    filters: ItemFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Item>> {
    try {
      const page = pagination.page || 1
      const limit = pagination.limit || 20
      const offset = (page - 1) * limit

      let query = supabase
        .from(this.TABLE_ITEMS)
        .select(
          '*, category:categories(*), images:item_images(*), userProfile:user_profiles!userId(displayName, avatarUrl)',
          {
            count: 'exact',
          },
        )

      // Aplicar filtros
      if (filters.onlyPublished !== false)
        query = query.eq('status', 'published').eq('isActive', true)

      if (filters.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
        )
      }

      if (filters.categoryId) query = query.eq('categoryId', filters.categoryId)

      if (filters.listingType)
        query = query.eq('listingType', filters.listingType)

      if (filters.pricingMode)
        query = query.eq('pricingMode', filters.pricingMode)

      if (filters.minPrice !== undefined)
        query = query.gte('price', filters.minPrice)

      if (filters.maxPrice !== undefined)
        query = query.lte('price', filters.maxPrice)

      if (filters.country) query = query.eq('locationCountry', filters.country)

      if (filters.state) query = query.eq('locationState', filters.state)

      if (filters.city) query = query.eq('locationCity', filters.city)

      if (filters.userId) query = query.eq('userId', filters.userId)

      if (filters.fulfillmentOption) {
        query = query.contains('fulfillmentOptions', [
          filters.fulfillmentOption,
        ])
      }

      if (filters.tags && filters.tags.length > 0)
        query = query.overlaps('tags', filters.tags)

      // Ordenar por fecha de publicación/creación
      query = query
        .order('publishedAt', { ascending: false, nullsFirst: false })
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error)
        throw this.createError('Error al obtener los items', 'getItems', error)

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        data: data as Item[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al obtener los items',
        'getItems',
        error as Error,
      )
    }
  }

  /**
   * Obtiene items del usuario actual
   */
  static async getUserItems(
    userId: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Item>> {
    return this.getItems({ userId, onlyPublished: false }, pagination)
  }

  /**
   * Incrementa el contador de vistas de un item
   */
  static async incrementViewCount(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_view_count', {
        item_id: id,
      })

      if (error) {
        throw this.createError(
          'Error al incrementar el contador de vistas',
          'incrementViewCount',
          error,
        )
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al incrementar el contador de vistas',
        'incrementViewCount',
        error as Error,
      )
    }
  }

  /**
   * Publica un item (cambia status a published)
   */
  static async publishItem(id: string): Promise<Item> {
    return this.updateItem(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      isActive: true,
    })
  }

  /**
   * Pausa un item (cambia status a paused)
   */
  static async pauseItem(id: string): Promise<Item> {
    return this.updateItem(id, {
      status: 'paused',
      isActive: false,
    })
  }

  /**
   * Archiva un item (cambia status a archived)
   */
  static async archiveItem(id: string): Promise<Item> {
    return this.updateItem(id, {
      status: 'archived',
      isActive: false,
    })
  }

  // ========== GESTIÓN DE IMÁGENES ==========

  /**
   * Sube una imagen para un item
   */
  static async uploadItemImage(
    itemId: string,
    file: File,
    position: number = 0,
  ): Promise<UploadImageResult> {
    try {
      const fileExtension = file.name.split('.').pop()
      const fileName = `${itemId}/${Date.now()}.${fileExtension}`

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_IMAGES)
        .upload(fileName, file)

      if (uploadError) {
        throw this.createError(
          'Error al subir la imagen',
          'uploadItemImage',
          uploadError,
        )
      }

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.BUCKET_IMAGES).getPublicUrl(fileName)

      // Crear registro en base de datos
      const { data: imageData, error: dbError } = await supabase
        .from(this.TABLE_ITEM_IMAGES)
        .insert([
          {
            itemId,
            storagePath: uploadData.path,
            publicUrl,
            position,
            metadata: {
              originalName: file.name,
              size: file.size,
              type: file.type,
            },
          },
        ])
        .select('*')
        .single()

      if (dbError) {
        // Si falla la BD, intentar eliminar el archivo subido
        await supabase.storage
          .from(this.BUCKET_IMAGES)
          .remove([uploadData.path])

        throw this.createError(
          'Error al guardar la información de la imagen',
          'uploadItemImage',
          dbError,
        )
      }

      return {
        image: imageData as ItemImage,
        publicUrl,
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al subir la imagen',
        'uploadItemImage',
        error as Error,
      )
    }
  }

  /**
   * Elimina una imagen específica
   */
  static async deleteItemImage(imageId: string): Promise<void> {
    try {
      // Obtener la información de la imagen
      const { data: imageData, error: fetchError } = await supabase
        .from(this.TABLE_ITEM_IMAGES)
        .select('storagePath')
        .eq('id', imageId)
        .single()

      if (fetchError) {
        throw this.createError(
          'Error al obtener la información de la imagen',
          'deleteItemImage',
          fetchError,
        )
      }

      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_IMAGES)
        .remove([imageData.storagePath])

      if (storageError) {
        console.warn(
          'Warning: Error al eliminar archivo del storage:',
          storageError,
        )
      }

      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from(this.TABLE_ITEM_IMAGES)
        .delete()
        .eq('id', imageId)

      if (dbError) {
        throw this.createError(
          'Error al eliminar el registro de la imagen',
          'deleteItemImage',
          dbError,
        )
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al eliminar la imagen',
        'deleteItemImage',
        error as Error,
      )
    }
  }

  /**
   * Elimina todas las imágenes de un item
   */
  static async deleteItemImages(itemId: string): Promise<void> {
    try {
      // Obtener todas las imágenes del item
      const { data: images, error: fetchError } = await supabase
        .from(this.TABLE_ITEM_IMAGES)
        .select('id, storagePath')
        .eq('itemId', itemId)

      if (fetchError) {
        throw this.createError(
          'Error al obtener las imágenes del item',
          'deleteItemImages',
          fetchError,
        )
      }

      if (!images || images.length === 0) return

      // Eliminar archivos del storage
      const storagePaths = images.map((img) => img.storagePath)
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_IMAGES)
        .remove(storagePaths)

      if (storageError) {
        console.warn(
          'Warning: Error al eliminar archivos del storage:',
          storageError,
        )
      }

      // Eliminar registros de la base de datos
      const { error: dbError } = await supabase
        .from(this.TABLE_ITEM_IMAGES)
        .delete()
        .eq('itemId', itemId)

      if (dbError) {
        throw this.createError(
          'Error al eliminar los registros de las imágenes',
          'deleteItemImages',
          dbError,
        )
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al eliminar las imágenes',
        'deleteItemImages',
        error as Error,
      )
    }
  }

  // ========== FAVORITOS ==========

  /**
   * Añade un item a favoritos
   */
  static async addToFavorites(
    userId: string,
    itemId: string,
  ): Promise<Favorite> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_FAVORITES)
        .insert([{ userId, itemId }])
        .select('*')
        .single()

      if (error) {
        throw this.createError(
          'Error al añadir a favoritos',
          'addToFavorites',
          error,
        )
      }

      // Incrementar contador de favoritos en el item
      await supabase.rpc('increment_favorite_count', { item_id: itemId })

      return data as Favorite
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al añadir a favoritos',
        'addToFavorites',
        error as Error,
      )
    }
  }

  /**
   * Elimina un item de favoritos
   */
  static async removeFromFavorites(
    userId: string,
    itemId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_FAVORITES)
        .delete()
        .eq('userId', userId)
        .eq('itemId', itemId)

      if (error) {
        throw this.createError(
          'Error al eliminar de favoritos',
          'removeFromFavorites',
          error,
        )
      }

      // Decrementar contador de favoritos en el item
      await supabase.rpc('decrement_favorite_count', { item_id: itemId })
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al eliminar de favoritos',
        'removeFromFavorites',
        error as Error,
      )
    }
  }

  /**
   * Obtiene los favoritos de un usuario
   */
  static async getUserFavorites(
    userId: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<Favorite>> {
    try {
      const page = pagination.page || 1
      const limit = pagination.limit || 20
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from(this.TABLE_FAVORITES)
        .select(
          '*, item:items(*, category:categories(*), images:item_images(*))',
          { count: 'exact' },
        )
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw this.createError(
          'Error al obtener favoritos',
          'getUserFavorites',
          error,
        )
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        data: data as Favorite[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      }
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al obtener favoritos',
        'getUserFavorites',
        error as Error,
      )
    }
  }

  /**
   * Verifica si un item está en favoritos del usuario
   */
  static async isItemFavorite(
    userId: string,
    itemId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_FAVORITES)
        .select('id')
        .eq('userId', userId)
        .eq('itemId', itemId)
        .maybeSingle()

      if (error) {
        throw this.createError(
          'Error al verificar favorito',
          'isItemFavorite',
          error,
        )
      }

      return Boolean(data)
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al verificar favorito',
        'isItemFavorite',
        error as Error,
      )
    }
  }

  // ========== CATEGORÍAS ==========

  /**
   * Obtiene todas las categorías activas
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_CATEGORIES)
        .select('*')
        .eq('isActive', true)
        .order('sortOrder', { ascending: true })

      if (error) {
        throw this.createError(
          'Error al obtener categorías',
          'getCategories',
          error,
        )
      }

      return data as Category[]
    } catch (error) {
      if (error instanceof Error && 'message' in error) throw error

      throw this.createError(
        'Error inesperado al obtener categorías',
        'getCategories',
        error as Error,
      )
    }
  }

  // ========== UTILIDADES ==========

  /**
   * Crea un error estructurado
   */
  private static createError(
    message: string,
    context: string,
    cause?: PostgrestError | Error,
  ): ItemServiceError {
    return {
      message,
      context,
      cause,
    }
  }
}

export default ItemService
