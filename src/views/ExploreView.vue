<template>
  <div class="explore-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ t('explore.title') }}</h1>
          <p class="hero-subtitle">{{ t('explore.subtitle') }}</p>

          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <BaseInput
                v-model="searchQuery"
                :placeholder="t('explore.searchPlaceholder')"
                @keyup.enter="handleSearch"
                icon="mdi:magnify"
                icon-position="left"
                class="search-input" />
              <BaseButton
                @click="handleSearch"
                variant="primary"
                size="large"
                icon="mdi:magnify"
                class="search-btn">
                Buscar
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters Section -->
    <section class="filters-section">
      <div class="container">
        <div class="filters-container">
          <div class="filter-group">
            <BaseSelect
              v-model="selectedCategory"
              :label="t('explore.filters.category')"
              :placeholder="t('explore.filters.all')"
              :options="categoryOptions"
              clearable
              filter
              class="filter-select" />
          </div>

          <div class="filter-group">
            <BaseSelect
              v-model="selectedType"
              :label="t('explore.filters.type')"
              :placeholder="t('explore.filters.all')"
              :options="typeOptions"
              clearable
              filter
              class="filter-select" />
          </div>

          <div class="filter-group">
            <BaseInput
              v-model="locationFilter"
              :label="t('explore.filters.location')"
              placeholder="Ciudad, barrio..."
              icon="mdi:map-marker"
              clearable
              class="filter-input" />
          </div>

          <div class="filter-group filter-actions">
            <BaseButton
              @click="clearFilters"
              variant="outlined"
              size="md"
              icon="mdi:filter-remove"
              class="clear-button">
              {{ t('explore.clearFilters') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section">
      <div class="container">
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <h2 class="results-title">
              {{
                currentSection === 'featured'
                  ? t('explore.featured')
                  : currentSection === 'recent'
                    ? t('explore.recent')
                    : t('explore.popular')
              }}
            </h2>
            <p class="results-count">
              {{ filteredItems.length }} resultados encontrados
            </p>
          </div>

          <div class="results-tabs">
            <BaseButton
              @click="currentSection = 'featured'"
              :variant="currentSection === 'featured' ? 'primary' : 'outlined'"
              size="sm"
              class="tab-button">
              {{ t('explore.featured') }}
            </BaseButton>
            <BaseButton
              @click="currentSection = 'recent'"
              :variant="currentSection === 'recent' ? 'primary' : 'outlined'"
              size="sm"
              class="tab-button">
              {{ t('explore.recent') }}
            </BaseButton>
            <BaseButton
              @click="currentSection = 'popular'"
              :variant="currentSection === 'popular' ? 'primary' : 'outlined'"
              size="sm"
              class="tab-button">
              {{ t('explore.popular') }}
            </BaseButton>
          </div>
        </div>

        <!-- Items Grid -->
        <div v-if="filteredItems.length > 0" class="items-grid">
          <div
            v-for="(item, index) in displayedItems"
            :key="item.id"
            class="item-card"
            :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="item-image">
              <img :src="item.image" :alt="item.title" />
              <div class="item-type-badge" :class="item.type">
                {{ t(`explore.filters.${item.type}`) }}
              </div>
              <div class="item-actions">
                <BaseButton
                  class="action-btn"
                  icon="mdi:heart-outline"
                  variant="ghost"
                  size="sm" />
                <BaseButton
                  class="action-btn"
                  icon="mdi:share-variant"
                  variant="ghost"
                  size="sm" />
              </div>
            </div>

            <div class="item-content">
              <div class="item-header">
                <h3 class="item-title">{{ item.title }}</h3>
                <div class="item-price" v-if="item.price">
                  {{ item.price }}
                </div>
              </div>

              <p class="item-description">{{ item.description }}</p>

              <div class="item-meta">
                <div class="item-category">
                  <Icon :icon="getCategoryIcon(item.category)" />
                  {{ t(`home.categories.${item.category}`) }}
                </div>
                <div class="item-location">
                  <Icon icon="mdi:map-marker" />
                  {{ item.location }}
                </div>
              </div>

              <div class="item-footer">
                <div class="item-user">
                  <div class="user-avatar">
                    <Icon icon="mdi:account-circle" />
                  </div>
                  <span class="user-name">{{ item.user.name }}</span>
                </div>
                <BaseButton variant="primary" size="sm" icon="mdi:message-text">
                  Contactar
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="no-results">
          <Icon icon="mdi:inbox" class="no-results-icon" />
          <h3 class="no-results-title">{{ t('explore.noResults') }}</h3>
          <p class="no-results-text">
            Prueba ajustando los filtros o cambiando los términos de búsqueda
          </p>
          <BaseButton
            @click="clearFilters"
            variant="primary"
            size="md"
            icon="mdi:filter-remove">
            Limpiar Filtros
          </BaseButton>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreItems" class="load-more-container">
          <BaseButton
            @click="loadMoreItems"
            variant="outlined"
            size="lg"
            :disabled="loadingMore"
            :loading="loadingMore"
            :icon="loadingMore ? 'mdi:loading' : 'mdi:plus'">
            {{ t('explore.loadMore') }}
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
// Base components
import { BaseInput, BaseButton, BaseSelect } from '@/components/base'

// PrimeVue components
// Removed InputGroup and InputGroupAddon - no longer needed

const { t } = useI18n()

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

onMounted(() => {
  // Initialize page
})
</script>

<style scoped>
.explore-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(
    135deg,
    var(--color-primary-light) 0%,
    var(--color-primary) 50%,
    var(--color-secondary) 100%
  );
  color: white;
  padding: var(--space-2xl) 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: var(--font-size-4xl); /* 36px - Hero Title */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
}

.hero-subtitle {
  font-size: var(--font-size-lg); /* 18px - Hero Subtitle */
  margin-bottom: var(--space-2xl);
  opacity: 0.9;
}

/* Search Layout */
.search-container {
  max-width: 700px;
  margin: 0 auto;
}

.search-input-wrapper {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-end;
  width: 100%;
}

.search-input {
  flex: 1;
  min-width: 0;
}

/* Filters Layout */
.filters-section {
  background: var(--color-background-secondary);
  padding: var(--space-xl) 0;
  border-bottom: 1px solid var(--color-border);
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  align-items: end;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.filter-actions {
  justify-content: flex-end;
  align-items: flex-end;
}

/* Results Layout */
.results-section {
  padding: var(--space-2xl) 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.results-title {
  font-size: var(--font-size-2xl); /* 24px - Section Title */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.results-count {
  font-size: var(--font-size-sm); /* 14px - Secondary Info */
  color: var(--color-text-secondary);
}

.results-tabs {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

/* Items Grid Layout */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.item-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
  transition: transform var(--transition-normal);
}

.item-card:hover {
  transform: translateY(-5px);
}

.item-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-type-badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.item-type-badge.lend {
  background: var(--color-success);
  color: white;
}

.item-type-badge.sell {
  background: var(--color-primary);
  color: white;
}

.item-type-badge.exchange {
  background: var(--color-warning);
  color: white;
}

.item-type-badge.donate {
  background: var(--color-info);
  color: white;
}

.item-actions {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  display: flex;
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.item-card:hover .item-actions {
  opacity: 1;
}

.item-content {
  padding: var(--space-md);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-sm);
}

.item-title {
  font-size: var(--font-size-xl); /* 20px - Card Title */
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.item-price {
  font-size: var(--font-size-lg); /* 18px - Important Info */
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.item-description {
  font-size: var(--font-size-base); /* 16px - Body Text */
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.item-category,
.item-location {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}

.item-user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-avatar {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
}

.user-name {
  font-size: var(--font-size-sm); /* 14px - User Info */
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* No Results */
.no-results {
  text-align: center;
  padding: var(--space-3xl) var(--space-md);
}

.no-results-icon {
  font-size: 4rem;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-lg);
}

.no-results-title {
  font-size: var(--font-size-xl); /* 20px - Message Title */
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.no-results-text {
  font-size: var(--font-size-base); /* 16px - Message Text */
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

/* Load More */
.load-more-container {
  text-align: center;
  margin-top: var(--space-2xl);
}

/* Animations */
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-3xl); /* 30px - Responsive Hero */
  }

  .hero-section {
    padding: var(--space-xl) 0;
  }

  .search-input-wrapper {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .filters-container {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .filter-actions {
    order: 4;
    justify-content: stretch;
    align-items: stretch;
  }

  .results-header {
    flex-direction: column;
    align-items: start;
    gap: var(--space-md);
  }

  .results-title {
    font-size: var(--font-size-xl); /* 20px - Responsive Section */
  }

  .results-tabs {
    order: -1;
    width: 100%;
    justify-content: center;
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-lg) 0;
  }

  .hero-title {
    font-size: var(--font-size-2xl); /* 24px - Mobile Hero */
  }

  .hero-subtitle {
    font-size: var(--font-size-base); /* 16px - Mobile Subtitle */
  }

  .search-container {
    padding: 0 var(--space-sm);
  }

  .item-content {
    padding: var(--space-sm);
  }

  .item-title {
    font-size: var(--font-size-lg); /* 18px - Mobile Card Title */
  }
}
</style>
