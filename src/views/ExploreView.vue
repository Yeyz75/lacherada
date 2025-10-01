<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-16 md:py-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            {{ t('explore.title') }}
          </h1>
          <p class="text-lg md:text-xl mb-8 opacity-90">
            {{ t('explore.subtitle') }}
          </p>

          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto">
            <div class="flex flex-col md:flex-row gap-3">
              <div class="relative flex-1">
                <Icon
                  icon="mdi:magnify"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('explore.search.placeholder')"
                  class="w-full pl-12 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-white/50"
                  @keyup.enter="handleSearch" />
              </div>
              <BaseButton
                variant="secondary"
                class="bg-white text-primary-600 hover:bg-gray-100"
                @click="handleSearch">
                <Icon icon="mdi:magnify" />
                {{ t('explore.search.button') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters Section -->
    <section
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseSelect
            v-model="selectedCategory"
            :label="t('explore.filters.category')"
            :placeholder="t('explore.filters.allCategories')"
            :options="categoryOptions"
            clearable
            filter />

          <BaseSelect
            v-model="selectedType"
            :label="t('explore.filters.listingType')"
            :placeholder="t('explore.filters.allTypes')"
            :options="typeOptions"
            clearable
            filter />

          <div class="relative">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('explore.filters.location') }}
            </label>
            <div class="relative">
              <Icon
                icon="mdi:map-marker"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="locationFilter"
                type="text"
                :placeholder="t('explore.filters.city')"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>

          <div class="flex items-end">
            <BaseButton variant="outlined" class="w-full" @click="clearFilters">
              <Icon icon="mdi:filter-remove" />
              {{ t('explore.filters.clear') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="py-8 md:py-12">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Results Header -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div class="flex-1">
            <h2
              class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {{
                currentSection === 'featured'
                  ? t('explore.featured')
                  : currentSection === 'recent'
                    ? t('explore.recent')
                    : t('explore.popular')
              }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ filteredItems.length }} resultados encontrados
            </p>
          </div>

          <div class="flex gap-2 flex-wrap">
            <BaseButton
              @click="currentSection = 'featured'"
              :variant="currentSection === 'featured' ? 'primary' : 'outlined'"
              size="sm">
              {{ t('explore.featured') }}
            </BaseButton>
            <BaseButton
              @click="currentSection = 'recent'"
              :variant="currentSection === 'recent' ? 'primary' : 'outlined'"
              size="sm">
              {{ t('explore.recent') }}
            </BaseButton>
            <BaseButton
              @click="currentSection = 'popular'"
              :variant="currentSection === 'popular' ? 'primary' : 'outlined'"
              size="sm">
              {{ t('explore.popular') }}
            </BaseButton>
          </div>
        </div>

        <!-- Items Grid -->
        <div
          v-if="filteredItems.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(item, index) in displayedItems"
            :key="item.id"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="navigateToItem(item.id)">
            <!-- Image -->
            <div
              class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

              <!-- Type Badge -->
              <div
                class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold uppercase text-white"
                :class="{
                  'bg-green-500': item.type === 'lend',
                  'bg-primary-500': item.type === 'sell',
                  'bg-yellow-500': item.type === 'exchange',
                  'bg-blue-500': item.type === 'donate',
                }">
                {{ t(`explore.filters.${item.type}`) }}
              </div>

              <!-- Actions -->
              <div
                class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  class="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click.stop="toggleFavorite(item.id)">
                  <Icon
                    icon="mdi:heart-outline"
                    class="text-lg text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  class="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click.stop="shareItem(item.id)">
                  <Icon
                    icon="mdi:share-variant"
                    class="text-lg text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <!-- Header -->
              <div class="flex justify-between items-start mb-2">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
                  {{ item.title }}
                </h3>
                <div
                  v-if="item.price"
                  class="text-lg font-bold text-primary-600 ml-2">
                  {{ item.price }}
                </div>
              </div>

              <!-- Description -->
              <p
                class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {{ item.description }}
              </p>

              <!-- Meta -->
              <div
                class="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div class="flex items-center gap-1">
                  <Icon
                    :icon="getCategoryIcon(item.category)"
                    class="text-sm" />
                  <span>{{ t(`home.categories.${item.category}`) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon icon="mdi:map-marker" class="text-sm" />
                  <span>{{ item.location }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <Icon
                    icon="mdi:account-circle"
                    class="text-2xl text-primary-600" />
                  <span
                    class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ item.user.name }}
                  </span>
                </div>
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click.stop="contactSeller(item.id)">
                  <Icon icon="mdi:message-text" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Icon icon="mdi:inbox" class="text-6xl text-gray-400" />
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ t('explore.empty.title') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 max-w-md">
            {{ t('explore.empty.description') }}
          </p>
          <BaseButton @click="clearFilters" variant="primary">
            <Icon icon="mdi:filter-remove" />
            {{ t('explore.filters.clear') }}
          </BaseButton>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreItems" class="flex justify-center mt-8">
          <BaseButton
            @click="loadMoreItems"
            variant="outlined"
            :disabled="loadingMore"
            :loading="loadingMore">
            <Icon
              :icon="loadingMore ? 'mdi:loading' : 'mdi:plus'"
              :class="{ 'animate-spin': loadingMore }" />
            {{ loadingMore ? t('common.loading') : t('explore.loadMore') }}
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { BaseButton, BaseSelect } from '@/components/base'

const { t } = useI18n()
const router = useRouter()

// Search and filters
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const locationFilter = ref('')
const currentSection = ref('featured')

// Pagination
const itemsPerPage = 12
const currentPage = ref(1)
const loadingMore = ref(false)

// Categories data
const categories = [
  { key: 'tools', icon: 'mdi:tools' },
  { key: 'technology', icon: 'mdi:laptop' },
  { key: 'home', icon: 'mdi:home-variant' },
  { key: 'services', icon: 'mdi:account-tie' },
  { key: 'education', icon: 'mdi:book-open-variant' },
  { key: 'sports', icon: 'mdi:basketball' },
]

// Select options
const categoryOptions = computed(() => [
  { label: t('explore.filters.all'), value: '' },
  ...categories.map((category) => ({
    label: t(`home.categories.${category.key}`),
    value: category.key,
  })),
])

const typeOptions = computed(() => [
  { label: t('explore.filters.all'), value: '' },
  { label: t('explore.filters.lend'), value: 'lend' },
  { label: t('explore.filters.sell'), value: 'sell' },
  { label: t('explore.filters.exchange'), value: 'exchange' },
  { label: t('explore.filters.donate'), value: 'donate' },
])

// Mock data
const allItems = ref([
  {
    id: 1,
    title: 'Taladro Profesional Bosch',
    description:
      'Taladro profesional en excelente estado, perfecto para trabajos de bricolaje y construcción.',
    type: 'lend',
    category: 'tools',
    price: null,
    location: 'Madrid Centro',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    user: { name: 'Carlos Méndez', rating: 4.8 },
    featured: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    title: 'Laptop Gaming MSI',
    description:
      'Laptop gaming de alta gama, perfecta para diseño y desarrollo. Incluye cargador y mouse.',
    type: 'sell',
    category: 'technology',
    price: '850€',
    location: 'Barcelona',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    user: { name: 'Ana García', rating: 4.9 },
    featured: true,
    createdAt: new Date('2024-01-14'),
  },
  {
    id: 3,
    title: 'Clases de Matemáticas',
    description:
      'Profesor universitario ofrece clases particulares de matemáticas para todos los niveles.',
    type: 'sell',
    category: 'services',
    price: '25€/hora',
    location: 'Valencia',
    image:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    user: { name: 'Miguel Rodríguez', rating: 5.0 },
    featured: false,
    createdAt: new Date('2024-01-13'),
  },
  {
    id: 4,
    title: 'Bicicleta de Montaña',
    description:
      'Bicicleta Trek en buen estado, perfecta para rutas de montaña. Incluye casco.',
    type: 'exchange',
    category: 'sports',
    price: null,
    location: 'Sevilla',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    user: { name: 'Laura Martín', rating: 4.7 },
    featured: false,
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 5,
    title: 'Libros de Programación',
    description:
      'Colección de libros sobre JavaScript, Python y desarrollo web. En perfecto estado.',
    type: 'donate',
    category: 'education',
    price: null,
    location: 'Bilbao',
    image:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    user: { name: 'David López', rating: 4.6 },
    featured: true,
    createdAt: new Date('2024-01-11'),
  },
  {
    id: 6,
    title: 'Sofá 3 Plazas',
    description:
      'Sofá cómodo en excelente estado, color gris. Perfecto para salón o estudio.',
    type: 'lend',
    category: 'home',
    price: null,
    location: 'Málaga',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    user: { name: 'Elena Ruiz', rating: 4.8 },
    featured: false,
    createdAt: new Date('2024-01-10'),
  },
])

// Computed properties
const filteredItems = computed(() => {
  let items = [...allItems.value]

  // Filter by section
  if (currentSection.value === 'featured') {
    items = items.filter((item) => item.featured)
  } else if (currentSection.value === 'recent') {
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } else {
    // Popular: sort by user rating
    items.sort((a, b) => b.user.rating - a.user.rating)
  }

  // Apply filters
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    )
  }

  if (selectedCategory.value) {
    items = items.filter((item) => item.category === selectedCategory.value)
  }

  if (selectedType.value) {
    items = items.filter((item) => item.type === selectedType.value)
  }

  if (locationFilter.value) {
    const location = locationFilter.value.toLowerCase()
    items = items.filter((item) =>
      item.location.toLowerCase().includes(location),
    )
  }

  return items
})

const displayedItems = computed(() => {
  return filteredItems.value.slice(0, currentPage.value * itemsPerPage)
})

const hasMoreItems = computed(() => {
  return displayedItems.value.length < filteredItems.value.length
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedType.value = ''
  locationFilter.value = ''
  currentPage.value = 1
}

const loadMoreItems = async () => {
  loadingMore.value = true
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  currentPage.value++
  loadingMore.value = false
}

const getCategoryIcon = (categoryKey: string) => {
  const category = categories.find((cat) => cat.key === categoryKey)
  return category?.icon || 'mdi:tag'
}

const navigateToItem = (itemId: number) => {
  router.push(`/items/${itemId}`)
}

const toggleFavorite = (itemId: number) => {
  console.log('Toggle favorite:', itemId)
  // TODO: Implement favorite toggle
}

const shareItem = (itemId: number) => {
  console.log('Share item:', itemId)
  // TODO: Implement share functionality
}

const contactSeller = (itemId: number) => {
  console.log('Contact seller for item:', itemId)
  // TODO: Implement contact seller
}

onMounted(() => {
  // Initialize page
})
</script>

<style scoped>
/* No custom CSS needed - 100% Tailwind CSS */
</style>
