<template>
  <div class="coming-soon-container">
    <div class="coming-soon-content">
      <div class="coming-soon-icon">
        <Icon icon="mdi:account-circle" />
      </div>
      <h1 class="coming-soon-title">{{ t('comingSoon.profile.title') }}</h1>
      <p class="coming-soon-description">
        {{ t('comingSoon.profile.description') }}
      </p>

      <div class="coming-soon-features">
        <h3 class="features-title">{{ t('comingSoon.whatToExpect') }}</h3>
        <ul class="features-list">
          <li class="feature-item">
            <Icon icon="mdi:camera" />
            <span>{{ t('comingSoon.profile.features.photo') }}</span>
          </li>
          <li class="feature-item">
            <Icon icon="mdi:star" />
            <span>{{ t('comingSoon.profile.features.reputation') }}</span>
          </li>
          <li class="feature-item">
            <Icon icon="mdi:history" />
            <span>{{ t('comingSoon.profile.features.history') }}</span>
          </li>
          <li class="feature-item">
            <Icon icon="mdi:shield-check" />
            <span>{{ t('comingSoon.profile.features.verification') }}</span>
          </li>
        </ul>
      </div>

      <div class="coming-soon-actions">
        <router-link to="/dashboard" class="btn btn-primary">
          <Icon icon="mdi:arrow-left" />
          {{ t('comingSoon.backToDashboard') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t } = useI18n()
</script>

<style scoped>
.coming-soon-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.coming-soon-content {
  max-width: 600px;
  text-align: center;
  padding: var(--space-xl);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.coming-soon-icon {
  font-size: 4rem;
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
}

.coming-soon-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.coming-soon-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.coming-soon-features {
  margin-bottom: var(--space-xl);
  text-align: left;
}

.features-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  text-align: center;
}

.features-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.feature-item svg {
  font-size: 1.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.feature-item span {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.coming-soon-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .coming-soon-container {
    padding: var(--space-md);
  }

  .coming-soon-content {
    padding: var(--space-lg);
  }

  .coming-soon-title {
    font-size: var(--font-size-2xl);
  }

  .coming-soon-description {
    font-size: var(--font-size-base);
  }
}
</style>
