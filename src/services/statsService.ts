import { supabase } from '@/supabase-config'

export interface UserStats {
  publishedItems: number
  draftItems: number
  pausedItems: number
  totalViews: number
  totalFavorites: number
  unreadMessages: number
}

export interface UserActivity {
  id: string
  type: 'exchange' | 'message' | 'favorite' | 'view' | 'publish'
  title: string
  description?: string
  itemId?: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface UserReputation {
  rating: number
  totalReviews: number
  positiveReviews: number
  neutralReviews: number
  negativeReviews: number
}

export class StatsService {
  /**
   * Obtiene las estadísticas del usuario
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Obtener conteo de items por estado
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('status, viewCount, favoriteCount')
        .eq('userId', userId)

      if (itemsError) throw itemsError

      const stats: UserStats = {
        publishedItems:
          items?.filter((i) => i.status === 'published').length || 0,
        draftItems: items?.filter((i) => i.status === 'draft').length || 0,
        pausedItems: items?.filter((i) => i.status === 'paused').length || 0,
        totalViews: items?.reduce((sum, i) => sum + (i.viewCount || 0), 0) || 0,
        totalFavorites:
          items?.reduce((sum, i) => sum + (i.favoriteCount || 0), 0) || 0,
        unreadMessages: 0, // TODO: Implementar cuando tengamos sistema de mensajería
      }

      return stats
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        publishedItems: 0,
        draftItems: 0,
        pausedItems: 0,
        totalViews: 0,
        totalFavorites: 0,
        unreadMessages: 0,
      }
    }
  }

  /**
   * Obtiene actividad reciente del usuario
   */
  static async getUserActivity(
    userId: string,
    limit = 10,
  ): Promise<UserActivity[]> {
    try {
      // Por ahora retornamos actividad basada en items recientes
      const { data: recentItems, error } = await supabase
        .from('items')
        .select('id, title, status, createdAt, updatedAt')
        .eq('userId', userId)
        .order('updatedAt', { ascending: false })
        .limit(limit)

      if (error) throw error

      const activities: UserActivity[] =
        recentItems?.map((item) => ({
          id: item.id,
          type: item.status === 'published' ? 'publish' : 'view',
          title: item.title,
          itemId: item.id,
          createdAt: item.updatedAt || item.createdAt,
        })) || []

      return activities
    } catch (error) {
      console.error('Error getting user activity:', error)
      return []
    }
  }

  /**
   * Obtiene la reputación del usuario
   */
  static async getUserReputation(userId: string): Promise<UserReputation> {
    try {
      const { data: ratings, error } = await supabase
        .from('user_ratings')
        .select('rating, comment')
        .eq('ratedUserId', userId)

      if (error) throw error

      const totalReviews = ratings?.length || 0
      const avgRating =
        totalReviews > 0
          ? ratings!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0

      const positiveReviews = ratings?.filter((r) => r.rating >= 4).length || 0
      const neutralReviews = ratings?.filter((r) => r.rating === 3).length || 0
      const negativeReviews = ratings?.filter((r) => r.rating <= 2).length || 0

      return {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews,
        positiveReviews,
        neutralReviews,
        negativeReviews,
      }
    } catch (error) {
      console.error('Error getting user reputation:', error)
      return {
        rating: 0,
        totalReviews: 0,
        positiveReviews: 0,
        neutralReviews: 0,
        negativeReviews: 0,
      }
    }
  }

  /**
   * Obtiene items recomendados para el usuario
   */
  static async getRecommendedItems(userId: string, limit = 6): Promise<any[]> {
    try {
      // Obtener categorías de items favoritos del usuario
      const { data: userFavorites } = await supabase
        .from('favorites')
        .select('itemId')
        .eq('userId', userId)
        .limit(10)

      const favoriteItemIds = userFavorites?.map((f) => f.itemId) || []

      let categoryIds: string[] = []
      if (favoriteItemIds.length > 0) {
        const { data: favoriteItems } = await supabase
          .from('items')
          .select('categoryId')
          .in('id', favoriteItemIds)

        categoryIds =
          favoriteItems?.map((i) => i.categoryId).filter(Boolean) || []
      }

      // Obtener items recomendados basados en categorías favoritas
      let query = supabase
        .from('items')
        .select(
          '*, category:categories(*), images:item_images(*), userProfile:user_profiles!userId(displayName, avatarUrl)',
        )
        .eq('status', 'published')
        .eq('isActive', true)
        .neq('userId', userId) // No mostrar items propios
        .order('createdAt', { ascending: false })
        .limit(limit)

      // Si tiene categorías favoritas, filtrar por ellas
      if (categoryIds.length > 0) query = query.in('categoryId', categoryIds)

      const { data: items, error } = await query

      if (error) throw error

      return items || []
    } catch (error) {
      console.error('Error getting recommended items:', error)
      return []
    }
  }

  /**
   * Obtiene el conteo de favoritos del usuario
   */
  static async getUserFavoritesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error getting favorites count:', error)
      return 0
    }
  }
}
