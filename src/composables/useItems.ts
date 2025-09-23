import { ref, computed, type Ref } from 'vue'
import { ItemService } from '@/services/itemService'
import type {
  Item,
  CreateItemInput,
  UpdateItemInput,
  ItemFilters,
  PaginationOptions,
  PaginatedResult,
  UploadImageResult,
  Favorite,
  Category,
  ItemServiceError,
} from '@/types/marketplace'

interface UseItemsState {
  items: Ref<Item[]>
  favorites: Ref<Favorite[]>
  categories: Ref<Category[]>
  currentItem: Ref<Item | null>
  isLoading: Ref<boolean>
  isSubmitting: Ref<boolean>
  error: Ref<string | null>
  pagination: Ref<{
    page: number
    limit: number
    total: number
    totalPages: number
  }>
  filters: Ref<ItemFilters>
  hasMore: Ref<boolean> // <-- Agregado
  hasPrevious: Ref<boolean> // <-- Agregado
}

interface UseItemsActions {
  // CRUD básico
  createItem: (input: CreateItemInput) => Promise<Item | null>
  getItemById: (id: string, includeRelations?: boolean) => Promise<Item | null>
  getItemBySlug: (
    slug: string,
    includeRelations?: boolean,
  ) => Promise<Item | null>
  updateItem: (id: string, input: UpdateItemInput) => Promise<Item | null>
  deleteItem: (id: string) => Promise<boolean>

  // Listados y filtros
  loadItems: (
    newFilters?: Partial<ItemFilters>,
    newPagination?: PaginationOptions,
  ) => Promise<void>
  loadUserItems: (
    userId: string,
    pagination?: PaginationOptions,
  ) => Promise<void>
  searchItems: (query: string) => Promise<void>
  filterByCategory: (categoryId: string) => Promise<void>
  clearFilters: () => Promise<void>

  // Paginación
  nextPage: () => Promise<void>
  prevPage: () => Promise<void>
  goToPage: (page: number) => Promise<void>

  // Acciones de estado
  publishItem: (id: string) => Promise<boolean>
  pauseItem: (id: string) => Promise<boolean>
  archiveItem: (id: string) => Promise<boolean>

  // Gestión de imágenes
  uploadItemImage: (
    itemId: string,
    file: File,
    position?: number,
  ) => Promise<UploadImageResult | null>
  deleteItemImage: (imageId: string) => Promise<boolean>

  // Favoritos
  addToFavorites: (userId: string, itemId: string) => Promise<boolean>
  removeFromFavorites: (userId: string, itemId: string) => Promise<boolean>
  loadUserFavorites: (
    userId: string,
    pagination?: PaginationOptions,
  ) => Promise<void>
  isItemFavorite: (userId: string, itemId: string) => Promise<boolean>

  // Categorías
  loadCategories: () => Promise<void>

  // Utilidades
  clearError: () => void
  resetState: () => void
}

export type UseItemsReturn = UseItemsState & UseItemsActions

export function useItems(): UseItemsReturn {
  // ========== ESTADO REACTIVO ==========
  const items = ref<Item[]>([])
  const favorites = ref<Favorite[]>([])
  const categories = ref<Category[]>([])
  const currentItem = ref<Item | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const filters = ref<ItemFilters>({
    query: '',
    onlyPublished: true,
  })

  // ========== COMPUTED ==========
  const hasMore = computed(
    () => pagination.value.page < pagination.value.totalPages,
  )
  const hasPrevious = computed(() => pagination.value.page > 1)

  // ========== UTILIDADES INTERNAS ==========
  const handleError = (err: unknown, context: string) => {
    console.error(`Error in ${context}:`, err)

    if (err && typeof err === 'object' && 'message' in err)
      error.value = (err as ItemServiceError).message
    else if (err instanceof Error) error.value = err.message
    else error.value = `Error inesperado en ${context}`
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
    if (loading) clearError()
  }

  const setSubmitting = (submitting: boolean) => {
    isSubmitting.value = submitting
    if (submitting) clearError()
  }

  // ========== CRUD BÁSICO ==========
  const createItem = async (input: CreateItemInput): Promise<Item | null> => {
    try {
      setSubmitting(true)
      const newItem = await ItemService.createItem(input)

      // Añadir al inicio de la lista si coincide con los filtros actuales
      if (!filters.value.userId || filters.value.userId === input.userId)
        items.value.unshift(newItem)

      return newItem
    } catch (err) {
      handleError(err, 'createItem')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const getItemById = async (
    id: string,
    includeRelations = true,
  ): Promise<Item | null> => {
    try {
      setLoading(true)
      const item = await ItemService.getItemById(id, includeRelations)

      if (item) {
        currentItem.value = item
        // Incrementar contador de vistas si no es el propietario
        // Nota: Esto debería verificarse con el usuario actual
        await ItemService.incrementViewCount(id).catch(() => {
          // Ignorar errores en el contador de vistas
        })
      }

      return item
    } catch (err) {
      handleError(err, 'getItemById')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getItemBySlug = async (
    slug: string,
    includeRelations = true,
  ): Promise<Item | null> => {
    try {
      setLoading(true)
      const item = await ItemService.getItemBySlug(slug, includeRelations)

      if (item) {
        currentItem.value = item
        // Incrementar contador de vistas
        await ItemService.incrementViewCount(item.id).catch(() => {
          // Ignorar errores en el contador de vistas
        })
      }

      return item
    } catch (err) {
      handleError(err, 'getItemBySlug')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (
    id: string,
    input: UpdateItemInput,
  ): Promise<Item | null> => {
    try {
      setSubmitting(true)
      const updatedItem = await ItemService.updateItem(id, input)

      // Actualizar en la lista local
      const index = items.value.findIndex((item) => item.id === id)
      if (index !== -1) items.value[index] = updatedItem

      // Actualizar currentItem si es el mismo
      if (currentItem.value?.id === id) currentItem.value = updatedItem

      return updatedItem
    } catch (err) {
      handleError(err, 'updateItem')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      setSubmitting(true)
      await ItemService.deleteItem(id)

      // Remover de la lista local
      items.value = items.value.filter((item) => item.id !== id)

      // Limpiar currentItem si es el mismo
      if (currentItem.value?.id === id) currentItem.value = null

      return true
    } catch (err) {
      handleError(err, 'deleteItem')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // ========== LISTADOS Y FILTROS ==========
  const loadItems = async (
    newFilters?: Partial<ItemFilters>,
    newPagination?: PaginationOptions,
  ) => {
    try {
      setLoading(true)

      // Actualizar filtros si se proporcionan
      if (newFilters) filters.value = { ...filters.value, ...newFilters }

      // Actualizar paginación si se proporciona
      const paginationOptions = {
        page: newPagination?.page || pagination.value.page,
        limit: newPagination?.limit || pagination.value.limit,
      }

      const result: PaginatedResult<Item> = await ItemService.getItems(
        filters.value,
        paginationOptions,
      )

      items.value = result.data
      pagination.value = result.pagination
    } catch (err) {
      handleError(err, 'loadItems')
    } finally {
      setLoading(false)
    }
  }

  const loadUserItems = async (
    userId: string,
    paginationOptions?: PaginationOptions,
  ) => {
    await loadItems({ userId, onlyPublished: false }, paginationOptions)
  }

  const searchItems = async (query: string) => {
    await loadItems({ query }, { page: 1 })
  }

  const filterByCategory = async (categoryId: string) => {
    await loadItems({ categoryId }, { page: 1 })
  }

  const clearFilters = async () => {
    filters.value = {
      query: '',
      onlyPublished: true,
    }
    await loadItems({}, { page: 1 })
  }

  // ========== PAGINACIÓN ==========
  const nextPage = async () => {
    if (hasMore.value) await loadItems({}, { page: pagination.value.page + 1 })
  }

  const prevPage = async () => {
    if (hasPrevious.value)
      await loadItems({}, { page: pagination.value.page - 1 })
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages)
      await loadItems({}, { page })
  }

  // ========== ACCIONES DE ESTADO ==========
  const publishItem = async (id: string): Promise<boolean> => {
    try {
      setSubmitting(true)
      const updatedItem = await ItemService.publishItem(id)

      // Actualizar en la lista local
      const index = items.value.findIndex((item) => item.id === id)
      if (index !== -1) items.value[index] = updatedItem

      if (currentItem.value?.id === id) currentItem.value = updatedItem

      return true
    } catch (err) {
      handleError(err, 'publishItem')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const pauseItem = async (id: string): Promise<boolean> => {
    try {
      setSubmitting(true)
      const updatedItem = await ItemService.pauseItem(id)

      const index = items.value.findIndex((item) => item.id === id)
      if (index !== -1) items.value[index] = updatedItem

      if (currentItem.value?.id === id) currentItem.value = updatedItem

      return true
    } catch (err) {
      handleError(err, 'pauseItem')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const archiveItem = async (id: string): Promise<boolean> => {
    try {
      setSubmitting(true)
      const updatedItem = await ItemService.archiveItem(id)

      const index = items.value.findIndex((item) => item.id === id)
      if (index !== -1) items.value[index] = updatedItem

      if (currentItem.value?.id === id) currentItem.value = updatedItem

      return true
    } catch (err) {
      handleError(err, 'archiveItem')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // ========== GESTIÓN DE IMÁGENES ==========
  const uploadItemImage = async (
    itemId: string,
    file: File,
    position = 0,
  ): Promise<UploadImageResult | null> => {
    try {
      setSubmitting(true)
      const result = await ItemService.uploadItemImage(itemId, file, position)

      // Actualizar item local si existe
      const item = items.value.find((i) => i.id === itemId)
      if (item && result) {
        if (!item.images) item.images = []
        item.images.push(result.image)
      }

      if (currentItem.value?.id === itemId && result) {
        if (!currentItem.value.images) currentItem.value.images = []
        currentItem.value.images.push(result.image)
      }

      return result
    } catch (err) {
      handleError(err, 'uploadItemImage')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const deleteItemImage = async (imageId: string): Promise<boolean> => {
    try {
      setSubmitting(true)
      await ItemService.deleteItemImage(imageId)

      // Remover de todos los items locales
      items.value.forEach((item) => {
        if (item.images)
          item.images = item.images.filter((img) => img.id !== imageId)
      })

      if (currentItem.value?.images) {
        currentItem.value.images = currentItem.value.images.filter(
          (img) => img.id !== imageId,
        )
      }

      return true
    } catch (err) {
      handleError(err, 'deleteItemImage')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // ========== FAVORITOS ==========
  const addToFavorites = async (
    userId: string,
    itemId: string,
  ): Promise<boolean> => {
    try {
      setSubmitting(true)
      const favorite = await ItemService.addToFavorites(userId, itemId)

      // Actualizar lista de favoritos si está cargada
      if (favorites.value.length > 0 || filters.value.userId === userId)
        favorites.value.unshift(favorite)

      return true
    } catch (err) {
      handleError(err, 'addToFavorites')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const removeFromFavorites = async (
    userId: string,
    itemId: string,
  ): Promise<boolean> => {
    try {
      setSubmitting(true)
      await ItemService.removeFromFavorites(userId, itemId)

      // Remover de lista local de favoritos
      favorites.value = favorites.value.filter(
        (fav) => !(fav.userId === userId && fav.itemId === itemId),
      )

      return true
    } catch (err) {
      handleError(err, 'removeFromFavorites')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const loadUserFavorites = async (
    userId: string,
    paginationOptions?: PaginationOptions,
  ) => {
    try {
      setLoading(true)

      const paginationOpts = {
        page: paginationOptions?.page || 1,
        limit: paginationOptions?.limit || 20,
      }

      const result = await ItemService.getUserFavorites(userId, paginationOpts)
      favorites.value = result.data
      pagination.value = result.pagination
    } catch (err) {
      handleError(err, 'loadUserFavorites')
    } finally {
      setLoading(false)
    }
  }

  const isItemFavorite = async (
    userId: string,
    itemId: string,
  ): Promise<boolean> => {
    try {
      return await ItemService.isItemFavorite(userId, itemId)
    } catch (err) {
      handleError(err, 'isItemFavorite')
      return false
    }
  }

  // ========== CATEGORÍAS ==========
  const loadCategories = async () => {
    try {
      const result = await ItemService.getCategories()
      categories.value = result
    } catch (err) {
      handleError(err, 'loadCategories')
    }
  }

  // ========== UTILIDADES ==========
  const resetState = () => {
    items.value = []
    favorites.value = []
    currentItem.value = null
    error.value = null
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
    filters.value = {
      query: '',
      onlyPublished: true,
    }
  }

  // ========== WATCHERS ==========
  // Auto-cargar categorías al inicializar
  if (categories.value.length === 0) loadCategories()

  return {
    // Estado
    items,
    favorites,
    categories,
    currentItem,
    isLoading,
    isSubmitting,
    error,
    pagination,
    filters,

    // Computed
    hasMore,
    hasPrevious,

    // Acciones CRUD
    createItem,
    getItemById,
    getItemBySlug,
    updateItem,
    deleteItem,

    // Listados y filtros
    loadItems,
    loadUserItems,
    searchItems,
    filterByCategory,
    clearFilters,

    // Paginación
    nextPage,
    prevPage,
    goToPage,

    // Acciones de estado
    publishItem,
    pauseItem,
    archiveItem,

    // Gestión de imágenes
    uploadItemImage,
    deleteItemImage,

    // Favoritos
    addToFavorites,
    removeFromFavorites,
    loadUserFavorites,
    isItemFavorite,

    // Categorías
    loadCategories,

    // Utilidades
    clearError,
    resetState,
  }
}

export default useItems
