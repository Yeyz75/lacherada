<template>
  <Card
    :id="id"
    :data-testid="testId"
    v-bind="$attrs"
    class="base-card"
    :class="cardClasses">
    <!-- Header con título y subtítulo -->
    <template #header v-if="$slots.header || title">
      <div class="base-card-header" :class="headerPaddingClasses">
        <!-- Slot de header personalizado -->
        <slot name="header" v-if="$slots.header" />

        <!-- Header por defecto con título -->
        <div v-else-if="title" class="base-card-title-section">
          <h3 class="base-card-title">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="base-card-subtitle">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </template>

    <!-- Contenido principal -->
    <template #content>
      <!-- Loading overlay -->
      <div v-if="loading" class="base-card-loading-overlay">
        <div class="base-card-loading-content">
          <Icon icon="mdi:loading" class="animate-spin text-2xl" />
        </div>
      </div>

      <!-- Contenido principal con padding configurable -->
      <div class="base-card-content" :class="contentPaddingClasses">
        <slot />
      </div>
    </template>

    <!-- Footer con acciones -->
    <template #footer v-if="$slots.actions || $slots.footer">
      <div class="base-card-footer" :class="footerPaddingClasses">
        <!-- Slot de acciones -->
        <div v-if="$slots.actions" class="base-card-actions">
          <slot name="actions" />
        </div>

        <!-- Slot de footer -->
        <div v-if="$slots.footer" class="base-card-footer-content">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
  import { computed } from 'vue'
  import { Icon } from '@iconify/vue'
  import Card from 'primevue/card'
  import type { CardProps } from '../../types'

  interface Props extends CardProps {
    title?: string
    subtitle?: string
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    padding: 'md',
    clickable: false,
    loading: false,
  })

  const cardClasses = computed(() => [
    'base-card-wrapper',
    {
      // Clickable behavior usando las clases de PrimeVue
      'cursor-pointer hover:shadow-lg transition-shadow':
        props.clickable && !props.loading,
      // Glass effect (se puede aplicar via CSS custom)
      'base-card-glass': props.variant === 'glass',
      'base-card-elevated': props.variant === 'elevated',
      'base-card-outlined': props.variant === 'outlined',
    },
    props.class,
  ])

  // Clases de padding configurables
  const headerPaddingClasses = computed(() => ({
    'p-3': props.padding === 'sm',
    'p-4': props.padding === 'md',
    'p-6': props.padding === 'lg',
    'p-8': props.padding === 'xl',
    'p-0': props.padding === 'none',
  }))

  const contentPaddingClasses = computed(() => ({
    'p-3': props.padding === 'sm',
    'p-4': props.padding === 'md',
    'p-6': props.padding === 'lg',
    'p-8': props.padding === 'xl',
    'p-0': props.padding === 'none',
  }))

  const footerPaddingClasses = computed(() => ({
    'p-3': props.padding === 'sm',
    'p-4': props.padding === 'md',
    'p-6': props.padding === 'lg',
    'p-8': props.padding === 'xl',
    'p-0': props.padding === 'none',
  }))
</script>

<script lang="ts">
  export default {
    name: 'BaseCard',
    inheritAttrs: false,
  }
</script>

<style scoped>
  /* Usar el diseño nativo de PrimeVue con extensiones opcionales */
  .base-card {
    /* Extensiones al diseño nativo de PrimeVue */
  }

  .base-card-wrapper {
    position: relative;
    overflow: hidden;
  }

  /* Loading overlay */
  .base-card-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: inherit;
  }

  .base-card-loading-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: var(--p-primary-color);
  }

  /* Header styling */
  .base-card-header {
    /* Ya está styled por PrimeVue */
  }

  .base-card-title-section {
    /* Styling para título y subtítulo */
  }

  .base-card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--p-text-color);
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  .base-card-subtitle {
    font-size: 0.875rem;
    color: var(--p-text-muted-color);
    margin: 0;
    line-height: 1.5;
  }

  /* Content area */
  .base-card-content {
    flex: 1;
  }

  /* Footer area */
  .base-card-footer {
    border-top: 1px solid var(--p-surface-border);
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .base-card-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .base-card-footer-content {
    /* Footer content styling */
  }

  /* Variantes extendidas */
  .base-card-glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .base-card-elevated {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .base-card-outlined {
    border: 2px solid var(--p-surface-border);
  }

  .base-card-outlined:hover {
    border-color: var(--p-primary-color);
  }

  /* Hover effects */
  .base-card-wrapper:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-card-title {
      font-size: 1.125rem;
    }

    .base-card-subtitle {
      font-size: 0.8125rem;
    }

    .base-card-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
