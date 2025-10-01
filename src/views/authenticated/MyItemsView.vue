<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="flex-1">
        <h1
          class="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <Icon icon="mdi:package-variant" class="text-primary-600 text-4xl" />
          {{ t('myItems.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ t('myItems.subtitle') }}
        </p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <BaseButton
          variant="primary"
          @click="goToPublish"
          class="flex-1 md:flex-none">
          <Icon icon="mdi:plus" />
          {{ t('myItems.actions.newItem') }}
        </BaseButton>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col gap-4 mb-8">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm text-gray-600 dark:text-gray-400 cursor-pointer transition-all whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-500"
          :class="{
            'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700':
              currentFilter === status.value,
          }"
          @click="filterByStatus(status.value)">
          <Icon :icon="status.icon" />
          <span>{{ t(status.label) }}</span>
          <span
            v-if="getCountByStatus(status.value)"
            class="px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="
              currentFilter === status.value
                ? 'bg-white/20'
                : 'bg-gray-100 dark:bg-gray-700'
            ">
            {{ getCountByStatus(status.value) }}
          </span>
        </button>
      </div>

      <div class="relative max-w-md">
        <Icon
          icon="mdi:magnify"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('myItems.search.placeholder')"
          class="w-full pl-12 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          @input="handleSearch" />
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
      v-else-if="filteredItems.length === 0"
      class="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <Icon icon="mdi:package-variant-closed" class="text-6xl text-gray-400" />
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ t('myItems.empty.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md">
        {{ t('myItems.empty.description') }}
      </p>
      <BaseButton variant="primary" @click="goToPublish">
        <Icon icon="mdi:plus" />
        {{ t('myItems.actions.publishFirst') }}
      </BaseButton>
    </div>

    <!-- Items Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <ItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :show-actions="true"
        @publish="handlePublish"
        @pause="handlePause"
        @edit="handleEdit"
        @delete="handleDelete" />
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

    <!-- Modal de confirmación de eliminación -->
    <Dialog
      v-model:visible="showDeleteDialog"
      :header="t('myItems.delete.confirmTitle')"
      :modal="true"
      :closable="true"
      :style="{ width: '450px' }">
      <p>{{ t('myItems.delete.confirmMessage') }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteDialog = false">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton
          variant="danger"
          :loading="isSubmitting"
          @click="confirmDelete">
          {{ t('common.delete') }}
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'
import { useItems } from '@/composables/useItems'
import BaseButton from '@/components/base/BaseButton.vue'
import ItemCard from '@/components/marketplace/ItemCard.vue'
import type { ItemStatus } from '@/types/marketplace'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { user } = useAuth()
const {
  items,
  isLoading,
  isSubmitting,
  error,
  pagination,
  hasMore,
  hasPrevious,
  loadUserItems,
  publishItem,
  pauseItem,
  deleteItem,
  nextPage,
  prevPage,
} = useItems()

const currentFilter = ref<ItemStatus | 'all'>('all')
const searchQuery = ref('')
const showDeleteDialog = ref(false)
const itemToDelete = ref<string | null>(null)

const statusFilters: Array<{
  value: ItemStatus | 'all'
  label: string
  icon: string
}> = [
  { value: 'all', label: 'myItems.filters.all', icon: 'mdi:view-grid' },
  {
    value: 'draft',
    label: 'myItems.filters.draft',
    icon: 'mdi:file-document-edit',
  },
  {
    value: 'published',
    label: 'myItems.filters.published',
    icon: 'mdi:check-circle',
  },
  {
    value: 'paused',
    label: 'myItems.filters.paused',
    icon: 'mdi:pause-circle',
  },
  { value: 'archived', label: 'myItems.filters.archived', icon: 'mdi:archive' },
]

const filteredItems = computed(() => {
  let result = items.value

  // Filtrar por estado
  if (currentFilter.value !== 'all') {
    result = result.filter((item) => item.status === currentFilter.value)
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  return result
})

const getCountByStatus = (status: ItemStatus | 'all'): number => {
  if (status === 'all') return items.value.length
  return items.value.filter((item) => item.status === status).length
}

const filterByStatus = (status: ItemStatus | 'all') => {
  currentFilter.value = status
}

const handleSearch = () => {
  // La búsqueda se maneja reactivamente con el computed
}

const goToPublish = () => {
  router.push('/publish')
}

const handleRetry = async () => {
  if (user.value?.uid) {
    await loadUserItems(user.value.uid)
  }
}

const handlePublish = async (itemId: string) => {
  const success = await publishItem(itemId)
  if (success) {
    toast.add({
      severity: 'success',
      summary: t('myItems.actions.published'),
      detail: t('myItems.messages.publishSuccess'),
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('myItems.messages.publishError'),
      life: 3000,
    })
  }
}

const handlePause = async (itemId: string) => {
  const success = await pauseItem(itemId)
  if (success) {
    toast.add({
      severity: 'success',
      summary: t('myItems.actions.paused'),
      detail: t('myItems.messages.pauseSuccess'),
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('myItems.messages.pauseError'),
      life: 3000,
    })
  }
}

const handleEdit = (itemId: string) => {
  router.push(`/items/${itemId}/edit`)
}

const handleDelete = (itemId: string) => {
  itemToDelete.value = itemId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return

  const success = await deleteItem(itemToDelete.value)
  if (success) {
    toast.add({
      severity: 'success',
      summary: t('myItems.actions.deleted'),
      detail: t('myItems.messages.deleteSuccess'),
      life: 3000,
    })
    showDeleteDialog.value = false
    itemToDelete.value = null
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('myItems.messages.deleteError'),
      life: 3000,
    })
  }
}

onMounted(async () => {
  if (user.value?.uid) {
    await loadUserItems(user.value.uid)
  }
})
</script>
