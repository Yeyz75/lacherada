<template>
  <section class="testimonials">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.testimonials.title') }}</h2>
      </div>

      <div class="testimonials-grid">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="testimonial-card card-glass animate-fade-up"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <div class="testimonial-content">
            <div class="quote-icon">
              <Icon icon="mdi:format-quote-open" />
            </div>
            <p class="testimonial-text">
              {{ t(`home.testimonials.testimonial${index + 1}.text`) }}
            </p>
          </div>

          <div class="testimonial-author">
            <div class="author-avatar">
              <img
                :src="testimonial.avatar"
                :alt="t(`home.testimonials.testimonial${index + 1}.author`)"
                class="avatar-image"
              />
              <div class="verified-badge">
                <Icon icon="mdi:check-decagram" />
              </div>
            </div>
            <div class="author-info">
              <h4 class="author-name">
                {{ t(`home.testimonials.testimonial${index + 1}.author`) }}
              </h4>
              <p class="author-role">
                {{ t(`home.testimonials.testimonial${index + 1}.role`) }}
              </p>
              <div class="rating">
                <Icon
                  icon="mdi:star"
                  v-for="i in 5"
                  :key="i" />
                <span>5.0</span>
              </div>
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

const testimonials = [
  {
    avatar:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  },
  {
    avatar:
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  },
  {
    avatar:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
  },
]
</script>

<style scoped>
.testimonials {
  padding: var(--space-3xl) 0;
  background: var(--color-background-secondary);
  position: relative;
  overflow: hidden;
}

.testimonials::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
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

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-xl);
}

.testimonial-card {
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  position: relative;
  opacity: 0;
  transform: translateY(30px);
  transition: transform var(--transition-normal);
}

.testimonial-card:hover {
  transform: translateY(-4px);
}

.testimonial-content {
  margin-bottom: var(--space-xl);
  position: relative;
}

.quote-icon {
  position: absolute;
  top: -10px;
  left: -10px;
  font-size: var(--font-size-3xl);
  color: var(--color-primary);
  opacity: 0.3;
}

.testimonial-text {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  font-style: italic;
  margin-bottom: 0;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.author-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
}

.verified-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid var(--color-background);
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-xs);
  color: var(--color-text-primary);
}

.author-role {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-warning);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Responsive */
@media (max-width: 768px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .testimonial-card {
    padding: var(--space-lg);
  }

  .testimonial-text {
    font-size: var(--font-size-base);
  }
}
</style>
