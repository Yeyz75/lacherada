<template>
  <section class="categories">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.categories.title') }}</h2>
      </div>

      <div class="categories-grid">
        <div
          v-for="(category, index) in categories"
          :key="category.key"
          class="category-card card animate-fade-up"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div
            class="category-icon"
            :class="`icon-${category.key}`">
            <Icon :icon="category.icon" />
          </div>
          <h3 class="category-title">
            {{ t(`home.categories.${category.key}`) }}
          </h3>
          <p class="category-count">{{ category.count }} {{ t('common.items') || 'elementos' }}</p>
          <div class="category-overlay">
            <button class="btn btn-primary btn-sm">
              {{ t('common.explore') || 'Explorar' }}
              <Icon icon="mdi:arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t } = useI18n()

const categories = [
  { key: 'tools', icon: 'mdi:tools', count: '2.5K' },
  { key: 'technology', icon: 'mdi:laptop', count: '1.8K' },
  { key: 'home', icon: 'mdi:home-variant', count: '3.2K' },
  { key: 'services', icon: 'mdi:account-tie', count: '950' },
  { key: 'education', icon: 'mdi:book-open-variant', count: '1.3K' },
  { key: 'sports', icon: 'mdi:basketball', count: '750' },
]
</script>

<style scoped>
.categories {
  padding: var(--space-3xl) 0;
  background: var(--color-background);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.section-title {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.category-card {
  position: relative;
  text-align: center;
  padding: var(--space-xl);
  background: var(--color-background-secondary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-3xl);
  transition: transform var(--transition-normal);
}

/* Category-specific colors */
.icon-tools {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.icon-technology {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.icon-home {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.icon-services {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.icon-education {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.icon-sports {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.category-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.category-count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 0;
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: var(--glass-background);
  backdrop-filter: var(--glass-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

/* Responsive */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .category-card {
    padding: var(--space-lg);
  }

  .category-icon {
    width: 60px;
    height: 60px;
    font-size: var(--font-size-2xl);
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
