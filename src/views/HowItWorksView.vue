<template>
  <div class="how-it-works-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ t('howItWorks.title') }}</h1>
          <p class="hero-subtitle">{{ t('howItWorks.subtitle') }}</p>
          <div class="hero-actions">
            <BaseButton
              variant="primary"
              icon="mdi:rocket-launch"
              size="large"
              class="hero-cta-btn">
              {{ t('howItWorks.getStarted') }}
            </BaseButton>
            <BaseButton
              variant="outlined"
              icon="mdi:book-open-variant"
              size="large"
              class="hero-cta-btn">
              {{ t('howItWorks.learnMore') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Component -->
    <HowItWorks />

    <!-- Benefits Section -->
    <section class="benefits-section">
      <div class="container">
        <h2 class="section-title">{{ t('howItWorks.benefits.title') }}</h2>
        <div class="benefits-grid">
          <BaseCard
            v-for="(benefit, index) in benefits"
            :key="benefit.key"
            class="benefit-card"
            :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="benefit-icon">
              <Icon :icon="benefit.icon" />
            </div>
            <h3 class="benefit-title">
              {{ t(`howItWorks.benefits.${benefit.key}.title`) }}
            </h3>
            <p class="benefit-description">
              {{ t(`howItWorks.benefits.${benefit.key}.description`) }}
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">{{ t('home.hero.title') }}</h2>
          <p class="cta-subtitle">{{ t('home.hero.subtitle') }}</p>
          <div class="cta-actions">
            <BaseButton
              as="router-link"
              to="/auth/register"
              variant="primary"
              icon="mdi:account-plus"
              size="large"
              class="cta-btn">
              {{ t('navbar.register') }}
            </BaseButton>
            <BaseButton
              as="router-link"
              to="/explore"
              variant="outlined"
              icon="mdi:compass"
              size="large"
              class="cta-btn">
              {{ t('navbar.explore') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import HowItWorks from '../components/HowItWorks/index.vue'
// Base components
import { BaseButton, BaseCard } from '@/components/base'

const { t } = useI18n()

const benefits = [
  { key: 'community', icon: 'mdi:account-group' },
  { key: 'sustainable', icon: 'mdi:leaf' },
  { key: 'economic', icon: 'mdi:piggy-bank' },
  { key: 'diverse', icon: 'mdi:view-grid' },
]
</script>

<style scoped>
.how-it-works-page {
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
  padding: var(--space-3xl) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: var(--font-size-5xl); /* 48px - Main Hero Title */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-md);
  line-height: var(--line-height-tight);
}

.hero-subtitle {
  font-size: var(--font-size-xl); /* 20px - Hero Subtitle */
  margin-bottom: var(--space-2xl);
  opacity: 0.9;
  line-height: var(--line-height-normal);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

/* Benefits Section */
.benefits-section {
  padding: var(--space-3xl) 0;
  background: var(--color-background-secondary);
}

.section-title {
  text-align: center;
  font-size: var(--font-size-2xl); /* 24px - Section Title */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2xl);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
  margin-top: var(--space-2xl);
  align-items: stretch;
}

.benefit-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 300px;
  transition: transform var(--transition-normal);
}

.benefit-card:hover {
  transform: translateY(-5px);
}

.benefit-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-lg);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  color: white;
  flex-shrink: 0;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(
    135deg,
    var(--color-background) 0%,
    var(--color-background-secondary) 100%
  );
  padding: var(--space-3xl) 0;
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: var(--font-size-2xl); /* 24px - CTA Title */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-md);
}

.cta-subtitle {
  font-size: var(--font-size-lg); /* 18px - CTA Subtitle */
  margin-bottom: var(--space-2xl);
  line-height: var(--line-height-normal);
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
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
    font-size: var(--font-size-4xl); /* 36px - Responsive Hero */
  }

  .hero-subtitle {
    font-size: var(--font-size-lg); /* 18px - Responsive Subtitle */
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .benefit-card {
    min-height: 280px;
  }

  .benefit-icon {
    margin-bottom: var(--space-md);
  }

  .section-title {
    font-size: var(--font-size-xl); /* 20px - Responsive Section */
  }

  .cta-title {
    font-size: var(--font-size-xl); /* 20px - Responsive CTA */
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-2xl) 0;
  }

  .hero-title {
    font-size: var(--font-size-3xl); /* 30px - Mobile Hero */
  }

  .hero-subtitle {
    font-size: var(--font-size-base); /* 16px - Mobile Subtitle */
  }

  .benefits-section {
    padding: var(--space-2xl) 0;
  }

  .cta-section {
    padding: var(--space-2xl) 0;
  }

  .benefit-icon {
    width: 60px;
    height: 60px;
    font-size: var(--font-size-xl);
  }
}
</style>
