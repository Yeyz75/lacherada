<template>
  <section class="how-it-works">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.howItWorks.title') }}</h2>
      </div>

      <div class="steps-grid">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-card card animate-fade-up"
          :style="{ animationDelay: `${index * 0.2}s` }">
          <div class="step-icon">
            <Icon :icon="step.icon" />
            <span class="step-number">{{ index + 1 }}</span>
          </div>
          <div class="step-content">
            <h3>{{ t(`home.howItWorks.step${index + 1}.title`) }}</h3>
            <p>{{ t(`home.howItWorks.step${index + 1}.description`) }}</p>
          </div>
        </div>
      </div>

      <!-- Process Flow -->
      <div class="process-flow">
        <div class="flow-line"></div>
        <div class="flow-dots">
          <div
            v-for="index in 3"
            :key="index"
            class="flow-dot"
            :class="{ active: index <= 2 }"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t } = useI18n()

const steps = [
  { icon: 'mdi:plus-circle' },
  { icon: 'mdi:account-group' },
  { icon: 'mdi:handshake' },
]
</script>

<style scoped>
.how-it-works {
  padding: var(--space-3xl) 0;
  background: var(--color-background-secondary);
  position: relative;
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

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.step-card {
  text-align: center;
  padding: var(--space-2xl);
  background: var(--color-background);
  border-radius: var(--radius-xl);
  position: relative;
  opacity: 0;
  transform: translateY(30px);
}

.step-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: 50%;
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-2xl);
  color: white;
}

.step-number {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: var(--color-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border: 3px solid var(--color-background);
}

.step-content h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.step-content p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.process-flow {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--space-2xl);
}

.flow-line {
  position: absolute;
  width: 200px;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: 1px;
}

.flow-dots {
  display: flex;
  justify-content: space-between;
  width: 200px;
  z-index: 1;
}

.flow-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  transition: all var(--transition-normal);
}

.flow-dot.active {
  background: var(--color-primary);
  transform: scale(1.2);
  box-shadow: 0 0 10px var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .steps-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .step-card {
    padding: var(--space-xl);
  }

  .process-flow {
    display: none;
  }
}
</style>
