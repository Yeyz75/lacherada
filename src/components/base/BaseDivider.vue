<template>
  <Divider
    :align="align"
    :layout="layout"
    :type="type"
    v-bind="$attrs"
    class="base-divider"
    :class="dividerClasses">
    <!-- Custom content slot -->
    <template v-if="$slots.default">
      <div class="base-divider-content" :class="contentClasses">
        <slot />
      </div>
    </template>

    <!-- Text content -->
    <template v-else-if="text">
      <div class="base-divider-content" :class="contentClasses">
        <span class="base-divider-text">{{ text }}</span>
      </div>
    </template>

    <!-- Icon content -->
    <template v-else-if="icon">
      <div class="base-divider-content" :class="contentClasses">
        <Icon :icon="icon" class="base-divider-icon" />
      </div>
    </template>
  </Divider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Divider from 'primevue/divider'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  align?: 'left' | 'center' | 'right'
  layout?: 'horizontal' | 'vertical'
  type?: 'solid' | 'dashed' | 'dotted'
  text?: string
  icon?: string
  variant?: 'default' | 'subtle' | 'bold'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  layout: 'horizontal',
  type: 'solid',
  variant: 'default',
})

const dividerClasses = computed(() => [
  'base-divider-wrapper',
  {
    'base-divider-subtle': props.variant === 'subtle',
    'base-divider-bold': props.variant === 'bold',
  },
  props.class,
])

const contentClasses = computed(() => [
  'flex items-center justify-center',
  {
    'px-3': props.layout === 'horizontal',
    'py-2': props.layout === 'vertical',
  },
])
</script>

<script lang="ts">
export default {
  name: 'BaseDivider',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue con extensiones */
.base-divider {
  /* PrimeVue ya maneja los estilos base */
}

.base-divider-wrapper {
  /* Extensiones específicas */
}

.base-divider-content {
  background: var(--p-surface-0);
  color: var(--p-text-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.base-divider-text {
  /* Text styling */
}

.base-divider-icon {
  font-size: 1rem;
  color: var(--p-text-muted-color);
}

/* Variantes */
.base-divider-subtle :deep(.p-divider) {
  border-color: var(--p-surface-200);
}

.base-divider-subtle .base-divider-content {
  color: var(--p-text-muted-color);
  font-weight: 400;
}

.base-divider-bold :deep(.p-divider) {
  border-width: 2px;
  border-color: var(--p-primary-color);
}

.base-divider-bold .base-divider-content {
  color: var(--p-primary-color);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .base-divider-content {
    font-size: 0.8125rem;
  }

  .base-divider-icon {
    font-size: 0.875rem;
  }
}
</style>
