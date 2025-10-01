import { ref, type Ref } from 'vue'
import {
  StatsService,
  type UserStats,
  type UserActivity,
  type UserReputation,
} from '@/services/statsService'
import type { Item } from '@/types/marketplace'

interface UseStatsState {
  stats: Ref<UserStats | null>
  activities: Ref<UserActivity[]>
  reputation: Ref<UserReputation | null>
  recommendations: Ref<Item[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
}

interface UseStatsActions {
  loadUserStats: (userId: string) => Promise<void>
  loadUserActivity: (userId: string, limit?: number) => Promise<void>
  loadUserReputation: (userId: string) => Promise<void>
  loadRecommendations: (userId: string, limit?: number) => Promise<void>
  loadAllDashboardData: (userId: string) => Promise<void>
  clearError: () => void
  resetState: () => void
}

export type UseStatsReturn = UseStatsState & UseStatsActions

export function useStats(): UseStatsReturn {
  // Estado reactivo
  const stats = ref<UserStats | null>(null)
  const activities = ref<UserActivity[]>([])
  const reputation = ref<UserReputation | null>(null)
  const recommendations = ref<Item[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Utilidades
  const handleError = (err: unknown, context: string) => {
    console.error(`Error in ${context}:`, err)
    error.value =
      err instanceof Error ? err.message : `Error inesperado en ${context}`
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
    if (loading) clearError()
  }

  // Acciones
  const loadUserStats = async (userId: string) => {
    try {
      setLoading(true)
      stats.value = await StatsService.getUserStats(userId)
    } catch (err) {
      handleError(err, 'loadUserStats')
    } finally {
      setLoading(false)
    }
  }

  const loadUserActivity = async (userId: string, limit = 10) => {
    try {
      activities.value = await StatsService.getUserActivity(userId, limit)
    } catch (err) {
      handleError(err, 'loadUserActivity')
    }
  }

  const loadUserReputation = async (userId: string) => {
    try {
      reputation.value = await StatsService.getUserReputation(userId)
    } catch (err) {
      handleError(err, 'loadUserReputation')
    }
  }

  const loadRecommendations = async (userId: string, limit = 6) => {
    try {
      recommendations.value = await StatsService.getRecommendedItems(
        userId,
        limit,
      )
    } catch (err) {
      handleError(err, 'loadRecommendations')
    }
  }

  const loadAllDashboardData = async (userId: string) => {
    try {
      setLoading(true)
      await Promise.all([
        loadUserStats(userId),
        loadUserActivity(userId, 5),
        loadUserReputation(userId),
        loadRecommendations(userId, 3),
      ])
    } catch (err) {
      handleError(err, 'loadAllDashboardData')
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    stats.value = null
    activities.value = []
    reputation.value = null
    recommendations.value = []
    error.value = null
  }

  return {
    // Estado
    stats,
    activities,
    reputation,
    recommendations,
    isLoading,
    error,

    // Acciones
    loadUserStats,
    loadUserActivity,
    loadUserReputation,
    loadRecommendations,
    loadAllDashboardData,
    clearError,
    resetState,
  }
}

export default useStats
