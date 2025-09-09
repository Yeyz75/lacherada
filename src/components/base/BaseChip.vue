<template>
  <Chip
    :label="label"
    :icon="icon"
    :image="image"
    :removable="removable"
    class="base-chip"
    :class="chipClasses"
    @remove="handleRemove"
    @click="handleClick"
    v-bind="$attrs">
    <!-- Custom icon template -->
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>

    <!-- Default content -->
    <slot>{{ label }}</slot>

    <!-- Suffix content -->
    <template v-if="$slots.suffix">
      <slot name="suffix" />
    </template>
  </Chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Chip from 'primevue/chip'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  // Chip props
  label?: string
  icon?: string
  image?: string
  removable?: boolean

  // Extended props
  variant?: 'filled' | 'outlined' | 'text'
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger'
  size?: 'small' | 'normal' | 'large'
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'filled',
  severity: 'secondary',
  size: 'normal',
  removable: false,
  clickable: false,
  selected: false,
  disabled: false,
})

const emit = defineEmits<{
  remove: []
  click: [event: MouseEvent]
}>()

const chipClasses = computed(() => [
  'base-chip-wrapper',
  {
    // Variants
    'base-chip-outlined': props.variant === 'outlined',
    'base-chip-text': props.variant === 'text',

    // Severity colors
    'base-chip-primary': props.severity === 'primary',
    'base-chip-secondary': props.severity === 'secondary',
    'base-chip-success': props.severity === 'success',
    'base-chip-info': props.severity === 'info',
    'base-chip-warn': props.severity === 'warn',
    'base-chip-danger': props.severity === 'danger',

    // Sizes
    'base-chip-small': props.size === 'small',
    'base-chip-large': props.size === 'large',

    // States
    'cursor-pointer hover:opacity-80 transition-all':
      props.clickable && !props.disabled,
    'base-chip-selected': props.selected,
    'opacity-50 cursor-not-allowed': props.disabled,
  },
  props.class,
])

const handleRemove = () => {
  if (!props.disabled) {
    emit('remove')
  }
}

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.disabled) {
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  name: 'BaseChip',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue con extensiones */
.base-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.base-chip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Variant styles */
.base-chip-outlined {
  background: transparent !important;
  border: 1px solid currentColor;
}

.base-chip-text {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Severity colors */
.base-chip-primary {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.base-chip-primary.base-chip-outlined {
  color: var(--p-primary-color);
  border-color: var(--p-primary-color);
}

.base-chip-secondary {
  background: var(--p-surface-200);
  color: var(--p-surface-700);
}

.base-chip-success {
  background: var(--p-green-500);
  color: white;
}

.base-chip-success.base-chip-outlined {
  color: var(--p-green-500);
  border-color: var(--p-green-500);
}

.base-chip-info {
  background: var(--p-blue-500);
  color: white;
}

.base-chip-info.base-chip-outlined {
  color: var(--p-blue-500);
  border-color: var(--p-blue-500);
}

.base-chip-warn {
  background: var(--p-yellow-500);
  color: var(--p-yellow-950);
}

.base-chip-warn.base-chip-outlined {
  color: var(--p-yellow-600);
  border-color: var(--p-yellow-500);
}

.base-chip-danger {
  background: var(--p-red-500);
  color: white;
}

.base-chip-danger.base-chip-outlined {
  color: var(--p-red-500);
  border-color: var(--p-red-500);
}

/* Size variants */
.base-chip-small {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem !important;
  height: 1.5rem;
}

.base-chip-large {
  font-size: 1rem;
  padding: 0.5rem 1rem !important;
  height: 2.5rem;
}

/* Selected state */
.base-chip-selected {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Clickable hover effects */
.base-chip-wrapper:hover .base-chip {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Text variant hover */
.base-chip-text:hover {
  background: var(--p-surface-100) !important;
}

/* Focus styles */
.base-chip:focus {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Remove button customization */
.base-chip :deep(.p-chip-remove-icon) {
  margin-left: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.base-chip :deep(.p-chip-remove-icon:hover) {
  opacity: 0.7;
}

/* Icon styling */
.base-chip :deep(.p-chip-icon) {
  margin-right: 0.375rem;
  font-size: 1rem;
}

.base-chip-small :deep(.p-chip-icon) {
  font-size: 0.875rem;
  margin-right: 0.25rem;
}

.base-chip-large :deep(.p-chip-icon) {
  font-size: 1.125rem;
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .base-chip-large {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem !important;
    height: 2rem;
  }
}
</style>
