<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :id="id"
    :data-testid="testId"
    @click="handleClick"
    v-bind="$attrs"
  >
    <!-- Loading Spinner -->
    <span
      v-if="loading"
      class="btn-spinner">
      <Icon
        icon="mdi:loading"
        class="animate-spin" />
    </span>

    <!-- Left Icon -->
    <Icon
      v-if="icon && iconPosition === 'left' && !loading"
      :icon="icon"
      class="btn-icon btn-icon-left"
    />

    <!-- Button Content -->
    <span
      class="btn-content"
      :class="{ 'btn-content-hidden': loading }">
      <slot />
    </span>

    <!-- Right Icon -->
    <Icon
      v-if="icon && iconPosition === 'right' && !loading"
      :icon="icon"
      class="btn-icon btn-icon-right"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { Icon } from '@iconify/vue'
import type { ButtonProps } from '../../types'

interface Props extends ButtonProps {
  // Extender props específicas del componente si es necesario
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  iconPosition: 'left',
  disabled: false,
  loading: false,
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()

const buttonClasses = computed(() => [
  'base-btn',
  `base-btn--${props.variant}`,
  `base-btn--${props.size}`,
  {
    'base-btn--full-width': props.fullWidth,
    'base-btn--loading': props.loading,
    'base-btn--disabled': props.disabled,
    'base-btn--icon-only': props.icon && !slots.default,
  },
  props.class,
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  name: 'BaseButton',
  inheritAttrs: false,
}
</script>

<style scoped>
.base-btn {
  /* Base styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
  overflow: hidden;
  user-select: none;

  /* Focus ring */
  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
}

/* =============================================================================
     SIZE VARIANTS
     ============================================================================= */

.base-btn--xs {
  height: var(--btn-height-xs);
  padding: var(--btn-padding-xs);
  font-size: var(--btn-font-size-xs);

  .btn-icon {
    font-size: 14px;
  }
}

.base-btn--sm {
  height: var(--btn-height-sm);
  padding: var(--btn-padding-sm);
  font-size: var(--btn-font-size-sm);

  .btn-icon {
    font-size: 16px;
  }
}

.base-btn--md {
  height: var(--btn-height-md);
  padding: var(--btn-padding-md);
  font-size: var(--btn-font-size-md);

  .btn-icon {
    font-size: 18px;
  }
}

.base-btn--lg {
  height: var(--btn-height-lg);
  padding: var(--btn-padding-lg);
  font-size: var(--btn-font-size-lg);

  .btn-icon {
    font-size: 20px;
  }
}

.base-btn--xl {
  height: var(--btn-height-xl);
  padding: var(--btn-padding-xl);
  font-size: var(--btn-font-size-xl);

  .btn-icon {
    font-size: 22px;
  }
}

/* =============================================================================
     COLOR VARIANTS
     ============================================================================= */

.base-btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-white);
  box-shadow: var(--shadow-sm);

  &:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    transform: var(--hover-lift);
    box-shadow: var(--shadow-md), var(--shadow-glow);
  }

  &:active {
    transform: var(--state-active-scale);
    box-shadow: var(--state-active-shadow);
  }
}

.base-btn--secondary {
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);

  &:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    background: var(--color-background-secondary);
    transform: var(--hover-lift);
    box-shadow: var(--shadow-md);
  }
}

.base-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);

  &:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    background: var(--color-background-tertiary);
    color: var(--color-text-primary);
  }
}

.base-btn--danger {
  background: linear-gradient(135deg, var(--color-error), var(--color-error-dark));
  color: var(--color-white);
  box-shadow: var(--shadow-sm);

  &:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    transform: var(--hover-lift);
    box-shadow: var(--shadow-md);
  }
}

.base-btn--success {
  background: linear-gradient(135deg, var(--color-success), var(--color-success-dark));
  color: var(--color-white);
  box-shadow: var(--shadow-sm);

  &:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    transform: var(--hover-lift);
    box-shadow: var(--shadow-md);
  }
}

.base-btn--warning {
  background: linear-gradient(135deg, var(--color-warning), var(--color-warning-dark));
  color: var(--color-white);
  box-shadow: var(--shadow-sm);

  &:hover:not(.base-btn--disabled):not(.base-btn--loading) {
    transform: var(--hover-lift);
    box-shadow: var(--shadow-md);
  }
}

/* =============================================================================
     STATE VARIANTS
     ============================================================================= */

.base-btn--full-width {
  width: 100%;
}

.base-btn--disabled {
  opacity: var(--state-disabled-opacity);
  cursor: var(--state-disabled-cursor);
  transform: none !important;
  box-shadow: none !important;
}

.base-btn--loading {
  cursor: default;

  .btn-content {
    visibility: hidden;
  }
}

.base-btn--icon-only {
  aspect-ratio: 1;
  padding: 0;
}

/* =============================================================================
     BUTTON ELEMENTS
     ============================================================================= */

.btn-spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  .animate-spin {
    animation: spin 1s linear infinite;
  }
}

.btn-content {
  display: flex;
  align-items: center;
  gap: inherit;
}

.btn-content-hidden {
  visibility: hidden;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-icon-left {
  margin-right: calc(var(--space-xs) * -0.5);
}

.btn-icon-right {
  margin-left: calc(var(--space-xs) * -0.5);
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

/* Ripple effect */
.base-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition:
    width 0.6s,
    height 0.6s,
    top 0.6s,
    left 0.6s;
  transform: translate(-50%, -50%);
}

.base-btn:active::before {
  width: 300px;
  height: 300px;
}

/* =============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================= */

@media (max-width: 640px) {
  .base-btn--lg {
    height: var(--btn-height-md);
    padding: var(--btn-padding-md);
    font-size: var(--btn-font-size-md);
  }

  .base-btn--xl {
    height: var(--btn-height-lg);
    padding: var(--btn-padding-lg);
    font-size: var(--btn-font-size-lg);
  }
}
</style>
