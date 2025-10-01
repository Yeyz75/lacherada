<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-primary-500 flex flex-col h-full"
    @click="handleClick">
    <!-- Imagen principal -->
    <div
      class="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
      <img
        v-if="item.images && item.images.length > 0"
        :src="item.images[0].publicUrl || ''"
        :alt="item.title"
        class="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        loading="lazy" />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon icon="mdi:image-off" class="text-5xl text-gray-400" />
      </div>

      <!-- Badge de estado -->
      <div
        class="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold uppercase backdrop-blur-sm"
        :class="{
          'bg-gray-500/90 text-white': item.status === 'draft',
          'bg-green-500/90 text-white': item.status === 'published',
          'bg-yellow-500/90 text-white': item.status === 'paused',
          'bg-blue-500/90 text-white': item.status === 'completed',
          'bg-gray-600/90 text-white': item.status === 'archived',
        }">
        {{ t(`marketplace.status.${item.status}`) }}
      </div>

      <!-- Contador de imágenes -->
      <div
        v-if="item.images && item.images.length > 1"
        class="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 text-white rounded-md text-xs backdrop-blur-sm">
        <Icon icon="mdi:image-multiple" />
        {{ item.images.length }}
      </div>
    </div>

    <!-- Contenido -->
    <div class="p-4 flex flex-col gap-2 flex-1">
      <!-- Título -->
      <h3
        class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
        {{ item.title }}
      </h3>

      <!-- Categoría -->
      <div
        v-if="item.category"
        class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
        <Icon icon="mdi:tag" class="text-base" />
        <span>{{ item.category.name }}</span>
      </div>

      <!-- Descripción -->
      <p
        v-if="item.description"
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {{ truncateText(item.description, 100) }}
      </p>

      <!-- Precio -->
      <div
        class="flex items-center gap-2 mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
        <template v-if="item.pricingMode === 'free'">
          <span class="text-lg font-semibold text-green-600">
            {{ t('marketplace.pricing.free') }}
          </span>
        </template>
        <template v-else-if="item.pricingMode === 'donation'">
          <span class="text-lg font-semibold text-green-600">
            {{ t('marketplace.pricing.donation') }}
          </span>
        </template>
        <template v-else-if="item.price">
          <span class="text-xl font-bold text-primary-600">
            {{ formatCurrency(item.price, item.currency) }}
          </span>
          <span
            v-if="item.allowNegotiation"
            class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {{ t('marketplace.pricing.negotiable') }}
          </span>
        </template>
        <template v-else>
          <span class="text-lg font-semibold text-green-600">
            {{ t('marketplace.pricing.request') }}
          </span>
        </template>
      </div>

      <!-- Metadata -->
      <div
        class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-1">
          <Icon icon="mdi:eye" />
          <span>{{ item.viewCount || 0 }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="mdi:heart" />
          <span>{{ item.favoriteCount || 0 }}</span>
        </div>
        <div v-if="item.locationCity" class="flex items-center gap-1">
          <Icon icon="mdi:map-marker" />
          <span>{{ item.locationCity }}</span>
        </div>
      </div>

      <!-- Fecha -->
      <div class="flex items-center gap-1 text-xs text-gray-500">
        <Icon icon="mdi:clock-outline" />
        <span>{{ formatDate(item.createdAt) }}</span>
      </div>
    </div>

    <!-- Acciones -->
    <div
      v-if="showActions"
      class="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-wrap"
      @click.stop>
      <BaseButton
        v-if="item.status === 'draft'"
        size="small"
        variant="primary"
        @click="$emit('publish', item.id)">
        <Icon icon="mdi:upload" />
        {{ t('marketplace.actions.publish') }}
      </BaseButton>

      <BaseButton
        v-if="item.status === 'published'"
        size="small"
        variant="secondary"
        @click="$emit('pause', item.id)">
        <Icon icon="mdi:pause" />
        {{ t('marketplace.actions.pause') }}
      </BaseButton>

      <BaseButton
        v-if="item.status === 'paused'"
        size="small"
        variant="primary"
        @click="$emit('publish', item.id)">
        <Icon icon="mdi:play" />
        {{ t('marketplace.actions.resume') }}
      </BaseButton>

      <BaseButton
        size="small"
        variant="secondary"
        @click="$emit('edit', item.id)">
        <Icon icon="mdi:pencil" />
        {{ t('common.edit') }}
      </BaseButton>

      <BaseButton
        size="small"
        variant="danger"
        @click="$emit('delete', item.id)">
        <Icon icon="mdi:delete" />
        {{ t('common.delete') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import BaseButton from '@/components/base/BaseButton.vue'
import type { Item } from '@/types/marketplace'

interface Props {
  item: Item
  showActions?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  clickable: true,
})

defineEmits<{
  publish: [itemId: string]
  pause: [itemId: string]
  edit: [itemId: string]
  delete: [itemId: string]
  click: [item: Item]
}>()

const { t, locale } = useI18n()
const router = useRouter()

const handleClick = () => {
  if (props.clickable) {
    // Navegar al detalle del item
    if (props.item.slug) {
      router.push(`/items/${props.item.slug}`)
    } else {
      router.push(`/items/${props.item.id}`)
    }
  }
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return t('common.time.today')
  if (diffInDays === 1) return t('common.time.yesterday')
  if (diffInDays < 7) return t('common.time.daysAgo', { days: diffInDays })
  if (diffInDays < 30)
    return t('common.time.weeksAgo', { weeks: Math.floor(diffInDays / 7) })

  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>
