<template>
  <section class="stats">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.stats.title') }}</h2>
      </div>

      <div class="stats-grid">
        <div
          v-for="(stat, index) in stats"
          :key="stat.key"
          class="stat-card animate-fade-up"
          :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="stat-icon" :class="`icon-${stat.key}`">
            <Icon :icon="stat.icon" />
          </div>
          <div class="stat-number" :data-target="stat.value">
            {{ stat.displayValue }}
          </div>
          <div class="stat-label">
            {{ t(`home.stats.${stat.key}`) }}
          </div>
          <div class="stat-trend">
            <Icon icon="mdi:trending-up" />
            <span>+{{ stat.growth }}% este mes</span>
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

  const stats = [
    {
      key: 'users',
      icon: 'mdi:account-group',
      value: 10000,
      displayValue: '10K+',
      growth: 23,
    },
    {
      key: 'exchanges',
      icon: 'mdi:swap-horizontal',
      value: 25000,
      displayValue: '25K+',
      growth: 18,
    },
    {
      key: 'cities',
      icon: 'mdi:city',
      value: 50,
      displayValue: '50+',
      growth: 12,
    },
  ]
</script>

<style scoped>
  .stats {
    padding: var(--space-3xl) 0;
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--color-secondary)
    );
    color: white;
    position: relative;
    overflow: hidden;
  }

  .stats::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  .section-header {
    text-align: center;
    margin-bottom: var(--space-3xl);
    position: relative;
    z-index: 1;
  }

  .section-title {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--space-md);
    color: white;
    text-shadow: 0 2px 10px rgb(0 0 0 / 30%);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-xl);
    position: relative;
    z-index: 1;
  }

  .stat-card {
    text-align: center;
    padding: var(--space-xl);
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    transition: all var(--transition-normal);
    opacity: 0;
    transform: translateY(30px);
  }

  .stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgb(0 0 0 / 30%);
  }

  .stat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: var(--space-lg);
    font-size: var(--font-size-3xl);
    background: rgb(255 255 255 / 20%);
    color: white;
    transition: transform var(--transition-normal);
  }

  .stat-card:hover .stat-icon {
    transform: scale(1.1);
  }

  .stat-number {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-sm);
    color: white;
    text-shadow: 0 2px 10px rgb(0 0 0 / 30%);
  }

  .stat-label {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--space-md);
    color: rgb(255 255 255 / 90%);
  }

  .stat-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    font-size: var(--font-size-sm);
    color: rgb(255 255 255 / 80%);
    background: rgb(255 255 255 / 10%);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: var(--space-lg);
    }

    .stat-card {
      padding: var(--space-lg);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      font-size: var(--font-size-2xl);
    }

    .stat-number {
      font-size: var(--font-size-4xl);
    }
  }
</style>
