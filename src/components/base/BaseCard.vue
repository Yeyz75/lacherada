<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :class="cardClasses"
    :id="id"
    :data-testid="testId"
    @click="handleClick"
    v-bind="clickable ? {} : $attrs"
  >
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="base-card-loading">
      <div class="base-card-spinner">
        <Icon
          icon="mdi:loading"
          class="animate-spin" />
      </div>
    </div>

    <!-- Header slot -->
    <header
      v-if="$slots.header"
      class="base-card-header">
      <slot name="header" />
    </header>

    <!-- Title and subtitle -->
    <header
      v-if="title || subtitle"
      class="base-card-header">
      <h3
        v-if="title"
        class="base-card-title">
        {{ title }}
      </h3>
      <p
        v-if="subtitle"
        class="base-card-subtitle">
        {{ subtitle }}
      </p>
    </header>

    <!-- Main content -->
    <div
      class="base-card-content"
      :class="contentClasses">
      <slot />
    </div>

    <!-- Actions slot -->
    <footer
      v-if="$slots.actions"
      class="base-card-actions">
      <slot name="actions" />
    </footer>

    <!-- Footer slot -->
    <footer
      v-if="$slots.footer"
      class="base-card-footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { CardProps } from '../../types'

interface Props extends CardProps {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  clickable: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'base-card',
  `base-card--${props.variant}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--clickable': props.clickable,
    'base-card--loading': props.loading,
  },
  props.class,
])

const contentClasses = computed(() => ({
  'base-card-content--no-padding': props.padding === 'none',
}))

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  name: 'BaseCard',
  inheritAttrs: false,
}
</script>

<style scoped>
.base-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  overflow: hidden;

  /* Remove button styling when clickable */
  &.base-card--clickable {
    border: none;
    background: none;
    padding: 0;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: var(--focus-ring-offset);
    }
  }
}

/* =============================================================================
     VARIANT STYLES
     ============================================================================= */

.base-card--default {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.base-card--glass {
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop);
  box-shadow: var(--shadow-md);

  &:hover {
    box-shadow: var(--shadow-lg);
  }
}

.base-card--elevated {
  background: var(--color-background);
  border: none;
  box-shadow: var(--shadow-lg);

  &:hover {
    box-shadow: var(--shadow-xl);
  }
}

.base-card--outlined {
  background: var(--color-background);
  border: 2px solid var(--color-border);
  box-shadow: none;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }
}

/* =============================================================================
     CLICKABLE BEHAVIOR
     ============================================================================= */

.base-card--clickable:hover:not(.base-card--loading) {
  transform: translateY(-2px);
}

.base-card--clickable:active:not(.base-card--loading) {
  transform: translateY(0);
}

/* =============================================================================
     PADDING VARIANTS
     ============================================================================= */

.base-card--padding-none {
  padding: var(--card-padding-none);
}

.base-card--padding-sm {
  padding: var(--card-padding-sm);
}

.base-card--padding-md {
  padding: var(--card-padding-md);
}

.base-card--padding-lg {
  padding: var(--card-padding-lg);
}

.base-card--padding-xl {
  padding: var(--card-padding-xl);
}

/* =============================================================================
     CARD SECTIONS
     ============================================================================= */

.base-card-header {
  margin-bottom: var(--space-md);
}

.base-card-title {
  margin: 0 0 var(--space-xs) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.base-card-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.base-card-content {
  flex: 1;

  &.base-card-content--no-padding {
    margin: calc(var(--card-padding-md) * -1);
    margin-top: 0;
    margin-bottom: 0;
  }
}

.base-card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);

  /* If actions are the only footer content */
  &:last-child {
    margin-top: var(--space-lg);
  }
}

.base-card-footer {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

/* =============================================================================
     LOADING STATE
     ============================================================================= */

.base-card--loading {
  pointer-events: none;
  user-select: none;
}

.base-card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  border-radius: inherit;
}

[data-theme='dark'] .base-card-loading {
  background: rgba(15, 23, 42, 0.8);
}

.base-card-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  font-size: var(--font-size-2xl);
  color: var(--color-primary);

  .animate-spin {
    animation: spin 1s linear infinite;
  }
}

/* =============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================= */

@media (max-width: 640px) {
  .base-card--padding-lg {
    padding: var(--card-padding-md);
  }

  .base-card--padding-xl {
    padding: var(--card-padding-lg);
  }

  .base-card-title {
    font-size: var(--font-size-lg);
  }

  .base-card-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-xs);
  }
}

/* =============================================================================
     ANIMATIONS
     ============================================================================= */

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* =============================================================================
     SPECIAL CARD LAYOUTS
     ============================================================================= */

/* Compact card for small content */
.base-card--compact {
  .base-card-header {
    margin-bottom: var(--space-sm);
  }

  .base-card-title {
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-xs);
  }

  .base-card-actions,
  .base-card-footer {
    margin-top: var(--space-sm);
    padding-top: var(--space-sm);
  }
}

/* Image card variations */
.base-card--image-top .base-card-content img:first-child,
.base-card--image-top .base-card-content picture:first-child img {
  margin: calc(var(--card-padding-md) * -1) calc(var(--card-padding-md) * -1) var(--space-md)
    calc(var(--card-padding-md) * -1);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: calc(100% + var(--card-padding-md) * 2);
}
</style>
