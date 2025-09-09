<template>
  <section class="hero">
    <div class="hero-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title animate-fade-up">
            {{ t('home.hero.title') }}
          </h1>
          <p class="hero-subtitle animate-fade-up">
            {{ t('home.hero.subtitle') }}
          </p>
          <div class="hero-actions animate-fade-up">
            <button class="btn btn-primary btn-lg">
              {{ t('home.hero.primaryCta') }}
              <Icon icon="mdi:arrow-right" />
            </button>
            <button class="btn btn-secondary btn-lg">
              {{ t('home.hero.secondaryCta') }}
              <Icon icon="mdi:play-circle" />
            </button>
          </div>

          <!-- Stats -->
          <div class="hero-stats animate-fade-up">
            <div class="stat-item">
              <span class="stat-number">10K+</span>
              <span class="stat-label">{{ t('home.stats.users') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">25K+</span>
              <span class="stat-label">{{ t('home.stats.exchanges') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50+</span>
              <span class="stat-label">{{ t('home.stats.cities') }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual animate-slide-right">
          <div class="hero-card card-glass">
            <div class="card-header">
              <div class="user-avatar">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop&crop=face"
                  alt="Usuario"
                  class="avatar-image" />
              </div>
              <div class="user-info">
                <h4>María González</h4>
                <p>Arquitecta</p>
                <div class="rating">
                  <Icon icon="mdi:star" v-for="i in 5" :key="i" />
                  <span>4.9</span>
                </div>
              </div>
            </div>

            <div class="item-preview">
              <img
                src="https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Taladro eléctrico"
                class="item-image" />
              <div class="item-info">
                <h3>Taladro Eléctrico</h3>
                <p>Perfecto estado, ideal para proyectos de hogar</p>
                <div class="item-meta">
                  <span class="item-type">
                    {{ $t('common.lend') || 'Prestar' }}
                  </span>
                  <span class="item-location">Barcelona</span>
                </div>
              </div>
            </div>

            <div class="interaction-buttons">
              <button class="btn btn-primary btn-sm">
                <Icon icon="mdi:message-text" />
                Contactar
              </button>
              <button class="btn btn-ghost btn-sm">
                <Icon icon="mdi:heart" />
                Guardar
              </button>
            </div>
          </div>
          <div class="floating-elements">
            <div class="floating-card card-1">
              <Icon icon="mdi:tools" />
              <span>Herramientas</span>
            </div>
            <div class="floating-card card-2">
              <Icon icon="mdi:book-open-variant" />
              <span>Libros</span>
            </div>
            <div class="floating-card card-3">
              <Icon icon="mdi:laptop" />
              <span>Tecnología</span>
            </div>
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
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--color-background);
}

.hero-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--color-primary), transparent);
  top: 10%;
  right: 20%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--color-secondary), transparent);
  bottom: 20%;
  left: 10%;
  animation-delay: 2s;
}

.orb-3 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, var(--color-accent), transparent);
  top: 60%;
  right: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3xl);
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.hero-title {
  font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: 0;
  background: linear-gradient(
    135deg,
    var(--color-text-primary),
    var(--color-text-secondary)
  );
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: 0;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.btn-lg {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-lg);
}

.btn-sm {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-sm);
}

.hero-stats {
  display: flex;
  gap: var(--space-xl);
  margin-top: var(--space-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-card {
  max-width: 350px;
  width: 100%;
  padding: var(--space-lg);
  transform: rotate(-2deg);
  transition: transform var(--transition-normal);
}

.hero-card:hover {
  transform: rotate(0deg) scale(1.02);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.user-avatar {
  position: relative;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
}

.user-info h4 {
  margin-bottom: var(--space-xs);
  font-size: var(--font-size-lg);
}

.user-info p {
  margin-bottom: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.item-preview {
  margin-bottom: var(--space-lg);
}

.item-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
}

.item-info h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
}

.item-info p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-type {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.item-location {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.interaction-buttons {
  display: flex;
  gap: var(--space-sm);
}

.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  background: var(--glass-background);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  animation: floatSlow 8s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: -20px;
  animation-delay: 1s;
}

.card-2 {
  top: 70%;
  right: -30px;
  animation-delay: 3s;
}

.card-3 {
  bottom: 30%;
  left: -40px;
  animation-delay: 5s;
}

@keyframes floatSlow {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    text-align: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .floating-elements {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 80vh;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-lg {
    width: 100%;
    max-width: 300px;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: var(--space-lg);
  }

  .hero-card {
    transform: none;
    max-width: 100%;
  }
}
</style>
