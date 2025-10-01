<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
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
      <BaseButton variant="secondary" @click="loadItem">
        {{ t('common.retry') }}
      </BaseButton>
    </div>

    <!-- Item Detail -->
    <div v-else-if="currentItem" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Galería de imágenes -->
      <div class="space-y-4">
        <!-- Imagen principal -->
        <div
          class="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            :alt="currentItem.title"
            class="w-full h-full object-contain"
            @click="openLightbox" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon icon="mdi:image-off" class="text-6xl text-gray-400" />
          </div>

          <!-- Badge de estado -->
          <div
            class="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold uppercase backdrop-blur-sm"
            :class="{
              'bg-gray-500/90 text-white': currentItem.status === 'draft',
              'bg-green-500/90 text-white': currentItem.status === 'published',
              'bg-yellow-500/90 text-white': currentItem.status === 'paused',
              'bg-blue-500/90 text-white': currentItem.status === 'completed',
              'bg-gray-600/90 text-white': currentItem.status === 'archived',
            }">
            {{ t(`marketplace.status.${currentItem.status}`) }}
          </div>

          <!-- Botón de zoom -->
          <button
            v-if="selectedImage"
            class="absolute bottom-4 right-4 p-2 bg-black/70 text-white rounded-lg backdrop-blur-sm hover:bg-black/90 transition-colors"
            @click="openLightbox">
            <Icon icon="mdi:magnify-plus-outline" class="text-2xl" />
          </button>
        </div>

        <!-- Miniaturas -->
        <div
          v-if="currentItem.images && currentItem.images.length > 1"
          class="grid grid-cols-4 gap-2">
          <button
            v-for="(image, index) in currentItem.images"
            :key="image.id"
            class="aspect-square rounded-lg overflow-hidden border-2 transition-all"
            :class="
              selectedImage === image.publicUrl
                ? 'border-primary-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            "
            @click="selectedImage = image.publicUrl || ''">
            <img
              :src="image.publicUrl || ''"
              :alt="`${currentItem.title} - ${index + 1}`"
              class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Información del item -->
      <div class="space-y-6">
        <!-- Título y precio -->
        <div>
          <h1
            class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ currentItem.title }}
          </h1>

          <!-- Categoría -->
          <div
            v-if="currentItem.category"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
            <Icon icon="mdi:tag" class="text-lg" />
            <span>{{ currentItem.category.name }}</span>
          </div>

          <!-- Precio -->
          <div class="flex items-center gap-3">
            <template v-if="currentItem.pricingMode === 'free'">
              <span class="text-3xl font-bold text-green-600">
                {{ t('marketplace.pricing.free') }}
              </span>
            </template>
            <template v-else-if="currentItem.pricingMode === 'donation'">
              <span class="text-3xl font-bold text-green-600">
                {{ t('marketplace.pricing.donation') }}
              </span>
            </template>
            <template v-else-if="currentItem.price">
              <span class="text-3xl font-bold text-primary-600">
                {{ formatCurrency(currentItem.price, currentItem.currency) }}
              </span>
              <span
                v-if="currentItem.allowNegotiation"
                class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                {{ t('marketplace.pricing.negotiable') }}
              </span>
            </template>
            <template v-else>
              <span class="text-3xl font-bold text-green-600">
                {{ t('marketplace.pricing.request') }}
              </span>
            </template>
          </div>
        </div>

        <!-- Metadata -->
        <div
          class="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 py-4 border-y border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:eye" class="text-lg" />
            <span>{{ currentItem.viewCount || 0 }} vistas</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="mdi:heart" class="text-lg" />
            <span>{{ currentItem.favoriteCount || 0 }} favoritos</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="mdi:clock-outline" class="text-lg" />
            <span>{{ formatDate(currentItem.createdAt) }}</span>
          </div>
        </div>

        <!-- Descripción -->
        <div v-if="currentItem.description">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {{ t('itemDetail.description') }}
          </h2>
          <p
            class="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {{ currentItem.description }}
          </p>
        </div>

        <!-- Detalles -->
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('itemDetail.details') }}
          </h2>

          <div class="grid grid-cols-2 gap-3">
            <!-- Tipo de listado -->
            <div
              class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon
                icon="mdi:format-list-bulleted-type"
                class="text-xl text-primary-600" />
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ t(`marketplace.listingType.${currentItem.listingType}`) }}
                </p>
              </div>
            </div>

            <!-- Condición -->
            <div
              v-if="currentItem.condition"
              class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon icon="mdi:star" class="text-xl text-primary-600" />
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Condición
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ t(`marketplace.condition.${currentItem.condition}`) }}
                </p>
              </div>
            </div>

            <!-- Cantidad -->
            <div
              class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon
                icon="mdi:package-variant"
                class="text-xl text-primary-600" />
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Cantidad</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ currentItem.quantity }}
                </p>
              </div>
            </div>

            <!-- Ubicación -->
            <div
              v-if="currentItem.locationCity"
              class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Icon icon="mdi:map-marker" class="text-xl text-primary-600" />
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Ubicación
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ currentItem.locationCity }}
                </p>
              </div>
            </div>
          </div>

          <!-- Opciones de entrega -->
          <div
            v-if="
              currentItem.fulfillmentOptions &&
              currentItem.fulfillmentOptions.length > 0
            "
            class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Opciones de entrega
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="option in currentItem.fulfillmentOptions"
                :key="option"
                class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300">
                {{ t(`marketplace.fulfillment.${option}`) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div
          v-if="currentItem.tags && currentItem.tags.length > 0"
          class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('itemDetail.tags') }}
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in currentItem.tags"
              :key="tag"
              class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3 pt-6">
          <BaseButton
            v-if="!isOwner"
            variant="primary"
            class="flex-1"
            @click="handleContact">
            <Icon icon="mdi:message-text" />
            {{ t('itemDetail.actions.contact') }}
          </BaseButton>

          <BaseButton
            v-if="!isOwner"
            :variant="isFavorite ? 'secondary' : 'outlined'"
            @click="toggleFavorite">
            <Icon :icon="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" />
            {{
              isFavorite
                ? t('itemDetail.actions.unfavorite')
                : t('itemDetail.actions.favorite')
            }}
          </BaseButton>

          <BaseButton variant="outlined" @click="shareCurrentItem">
            <Icon icon="mdi:share-variant" />
            Compartir
          </BaseButton>

          <BaseButton
            v-if="isOwner"
            variant="secondary"
            class="flex-1"
            @click="handleEdit">
            <Icon icon="mdi:pencil" />
            {{ t('common.edit') }}
          </BaseButton>
        </div>

        <!-- Información del vendedor -->
        <div
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ t('itemDetail.seller') }}
          </h3>
          <div class="flex items-center gap-3">
            <BaseAvatar
              :src="currentItem.userProfile?.avatarUrl || ''"
              :alt="currentItem.userProfile?.displayName || 'Usuario'"
              size="large" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{
                  currentItem.userProfile?.displayName ||
                  t('profile.anonymousUser')
                }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Miembro desde {{ formatDate(currentItem.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Relacionados -->
        <div v-if="relatedItems.length" class="pt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            También te puede interesar
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ItemCard
              v-for="item in relatedItems"
              :key="item.id"
              :item="item"
              @click="router.push(`/items/${item.slug || item.id}`)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Dialog
      v-model:visible="showLightbox"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      class="w-full max-w-6xl">
      <template #header>
        <span class="text-lg font-semibold">{{ currentItem?.title }}</span>
      </template>
      <div class="relative">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          :alt="currentItem?.title"
          class="w-full h-auto max-h-[80vh] object-contain" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'
import { useItems } from '@/composables/useItems'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAvatar from '@/components/base/BaseAvatar.vue'
import ItemCard from '@/components/marketplace/ItemCard.vue'
import { ItemService } from '@/services/itemService'
import type { Item } from '@/types/marketplace'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { user } = useAuth()
const {
  currentItem,
  isLoading,
  error,
  getItemBySlug,
  getItemById,
  addToFavorites,
  removeFromFavorites,
  isItemFavorite,
} = useItems()

const selectedImage = ref<string>('')
const showLightbox = ref(false)
const isFavorite = ref(false)
const relatedItems = ref<Item[]>([])

const isOwner = computed(() => {
  return user.value?.uid === currentItem.value?.userId
})

const loadItem = async () => {
  const itemIdentifier = (route.params.slug as string) || ''

  // Intentar cargar por slug primero, luego por ID
  let item = await getItemBySlug(itemIdentifier)
  if (!item) {
    item = await getItemById(itemIdentifier)
  }

  if (item && item.images && item.images.length > 0) {
    selectedImage.value = item.images[0].publicUrl || ''
  }

  // Verificar si está en favoritos
  if (user.value?.uid && item) {
    isFavorite.value = await isItemFavorite(user.value.uid, item.id)
  }

  // Cargar relacionados
  if (item?.categoryId) {
    await loadRelatedItems(item.id, item.categoryId)
  }
}

const openLightbox = () => {
  showLightbox.value = true
}

const toggleFavorite = async () => {
  if (!user.value?.uid || !currentItem.value) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('auth.loginRequired'),
      life: 3000,
    })
    return
  }

  if (isFavorite.value) {
    const success = await removeFromFavorites(
      user.value.uid,
      currentItem.value.id,
    )
    if (success) {
      isFavorite.value = false
      toast.add({
        severity: 'success',
        summary: t('itemDetail.messages.unfavorited'),
        life: 2000,
      })
    }
  } else {
    const success = await addToFavorites(user.value.uid, currentItem.value.id)
    if (success) {
      isFavorite.value = true
      toast.add({
        severity: 'success',
        summary: t('itemDetail.messages.favorited'),
        life: 2000,
      })
    }
  }
}

const handleContact = () => {
  if (!user.value?.uid) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('auth.loginRequired'),
      life: 3000,
    })
    router.push('/auth/login')
    return
  }

  // Navegar a mensajes con el vendedor
  router.push(`/messages?item=${currentItem.value?.id}`)
}

const handleEdit = () => {
  router.push(`/items/${currentItem.value?.id}/edit`)
}

const shareCurrentItem = async () => {
  if (!currentItem.value) return
  const url = `${window.location.origin}/items/${currentItem.value.slug || currentItem.value.id}`
  const shareData = {
    title: currentItem.value.title,
    text: currentItem.value.description || '',
    url,
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (e) {
      // Silenciar cancelaciones
    }
  } else {
    await navigator.clipboard.writeText(url)
  }
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

onMounted(() => {
  loadItem()
})

// Helpers
const loadRelatedItems = async (excludeId: string, categoryId: string) => {
  // Usamos ItemService vía useItems.loadItems, pero aquí llamamos directamente al servicio para obtener un lote pequeño
  const result = await ItemService.getItems(
    { categoryId, onlyPublished: true },
    { page: 1, limit: 6 },
  )
  relatedItems.value = result.data.filter((i: Item) => i.id !== excludeId)
}
</script>
