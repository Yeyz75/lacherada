<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="flex-1">
        <h1
          class="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <Icon icon="mdi:heart" class="text-red-500 text-4xl" />
          {{ t('favorites.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ t('favorites.subtitle') }}
        </p>
      </div>
      <div class="flex gap-3">
        <BaseButton variant="secondary" @click="router.push('/explore')">
          <Icon icon="mdi:magnify" />
          {{ t('favorites.actions.explore') }}
        </BaseButton>
      </div>
    </div>

    <!-- Filtros -->
    <div
      v-if="favorites.length > 0"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <BaseSelect
            v-model="selectedCategory"
            :label="t('explore.filters.category')"
            :placeholder="t('explore.filters.allCategories')"
            :options="categoryOptions"
            clearable
            filter />
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 md:col-span-2">
          {{ filteredFavorites.length }} / {{ favorites.length }}
          {{ t('common.items') }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20 gap-4">
      <Icon icon="mdi:loading" class="text-6xl text-gray-400 animate-spin" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-20 gap-4">
      <Icon icon="mdi:alert-circle" class="text-6xl text-red-500" />
      <p class="text-gray-900 dark:text-white">{{ error }}</p>
      <BaseButton variant="secondary" @click="handleRetry">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="favorites.length === 0"
      class="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <Icon icon="mdi:heart-outline" class="text-6xl text-gray-400" />
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ t('favorites.empty.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md">
        {{ t('favorites.empty.description') }}
      </p>
      <BaseButton variant="primary" @click="router.push('/explore')">
        <Icon icon="mdi:magnify" />
        {{ t('favorites.actions.startExploring') }}
      </BaseButton>
    </div>

    <!-- Favorites Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        v-for="favorite in filteredFavorites"
        :key="favorite.id"
        class="flex flex-col gap-3">
        <ItemCard
          :item="favorite.item!"
          :show-actions="false"
          @click="handleItemClick(favorite.item!)" />
        <div class="flex justify-between">
          <BaseButton
            variant="outlined"
            size="small"
            @click.stop="handleItemClick(favorite.item!)">
            <Icon icon="mdi:open-in-new" />
          </BaseButton>
          <BaseButton
            variant="danger"
            size="small"
            @click.stop="handleRemoveFavorite(favorite.item!.id)">
            <Icon icon="mdi:heart-broken" />
            {{ t('itemDetail.actions.unfavorite') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 py-8">
      <BaseButton
        variant="secondary"
        size="small"
        :disabled="!hasPrevious"
        @click="prevPage">
        <Icon icon="mdi:chevron-left" />
        {{ t('common.previous') }}
      </BaseButton>

      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{
          t('common.pagination.info', {
            page: pagination.page,
            total: pagination.totalPages,
          })
        }}
      </div>

      <BaseButton
        variant="secondary"
        size="small"
        :disabled="!hasMore"
        @click="nextPage">
        {{ t('common.next') }}
        <Icon icon="mdi:chevron-right" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '@/composables/useAuth'
import { useItems } from '@/composables/useItems'
import { BaseButton, BaseSelect } from '@/components/base'
import ItemCard from '@/components/marketplace/ItemCard.vue'
import type { Item } from '@/types/marketplace'

const { t } = useI18n()
const router = useRouter()
const { user } = useAuth()
const {
  favorites,
  isLoading,
  error,
  pagination,
  hasMore,
  hasPrevious,
  loadUserFavorites,
  nextPage,
  prevPage,
  removeFromFavorites,
} = useItems()

const handleRetry = async () => {
  if (user.value?.uid) {
    await loadUserFavorites(user.value.uid)
  }
}

const handleItemClick = (item: Item) => {
  router.push(`/items/${item.slug || item.id}`)
}

onMounted(async () => {
  if (user.value?.uid) {
    await loadUserFavorites(user.value.uid)
  }
})

// Filtro por categoría (client-side)
const selectedCategory = ref('')
const categoryOptions = computed(() => {
  const set = new Map<string, string>()
  for (const fav of favorites.value) {
    const cat = fav.item?.category
    if (cat) set.set(cat.id, cat.name)
  }
  return [
    { label: t('explore.filters.allCategories'), value: '' },
    ...Array.from(set.entries()).map(([id, name]) => ({
      label: name,
      value: id,
    })),
  ]
})

const filteredFavorites = computed(() => {
  if (!selectedCategory.value) return favorites.value
  return favorites.value.filter(
    (f) => f.item?.categoryId === selectedCategory.value,
  )
})

const handleRemoveFavorite = async (itemId: string) => {
  if (!user.value?.uid) return
  const ok = await removeFromFavorites(user.value.uid, itemId)
  if (ok) {
    // No-op: useItems ya actualiza favorites localmente
  }
}
</script>
