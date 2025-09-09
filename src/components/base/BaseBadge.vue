<template>
  <Badge
    :value="label || value"
    :severity="badgeSeverity"
    :size="size"
    class="base-badge"
    :class="badgeClasses"
    @click="handleClick"
    v-bind="$attrs">
    <!-- Icon prefix -->
    <Icon
      v-if="icon && iconPosition === 'left'"
      :icon="icon"
      :class="iconClasses" />

    <!-- Content slot -->
    <slot>{{ label || value }}</slot>

    <!-- Icon suffix -->
    <Icon
      v-if="icon && iconPosition === 'right'"
      :icon="icon"
      :class="iconClasses" />

    <!-- Close button para badges removibles -->
    <button
      v-if="removable"
      type="button"
      class="base-badge-remove"
      @click="handleRemove"
      :aria-label="'Remover ' + (label || value)">
      <Icon icon="mdi:close" class="text-xs" />
    </button>
  </Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Badge from 'primevue/badge'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  // Badge props
  value?: string | number
  label?: string
  severity?: 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast'
  size?: 'small' | 'normal' | 'large'

  // Extended props
  variant?: 'filled' | 'outlined' | 'dot'
  icon?: string
  iconPosition?: 'left' | 'right'
  removable?: boolean
  clickable?: boolean
  pulse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'secondary',
  size: 'normal',
  variant: 'filled',
  iconPosition: 'left',
  removable: false,
  clickable: false,
  pulse: false,
})

const emit = defineEmits<{
  remove: []
  click: [event: MouseEvent]
}>()

// Mapear severity para PrimeVue
const badgeSeverity = computed(() => {
  switch (props.severity) {
    case 'secondary':
      return 'secondary'
    case 'info':
      return 'info'
    case 'success':
      return 'success'
    case 'warn':
      return 'warn'
    case 'danger':
      return 'danger'
    case 'contrast':
      return 'contrast'
    default:
      return 'secondary'
  }
})

const badgeClasses = computed(() => [
  'base-badge-wrapper',
  {
    // Variants
    'base-badge-outlined': props.variant === 'outlined',
    'base-badge-dot': props.variant === 'dot',

    // States
    'cursor-pointer hover:opacity-80 transition-opacity': props.clickable,
    'base-badge-removable': props.removable,
    'base-badge-pulse': props.pulse,

    // Sizes
    'base-badge-small': props.size === 'small',
    'base-badge-large': props.size === 'large',
  },
  props.class,
])

const iconClasses = computed(() => [
  'base-badge-icon',
  {
    'mr-1': props.iconPosition === 'left' && (props.label || props.value),
    'ml-1': props.iconPosition === 'right' && (props.label || props.value),
    'text-xs': props.size === 'small',
    'text-sm': props.size === 'normal',
    'text-base': props.size === 'large',
  },
])

const handleRemove = (event: MouseEvent) => {
  event.stopPropagation()
  emit('remove')
}

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  name: 'BaseBadge',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue con extensiones */
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.base-badge-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Variantes extendidas */
.base-badge-outlined {
  background: transparent !important;
  border: 1px solid currentColor;
  color: var(--p-primary-color) !important;
}

.base-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  padding: 0 !important;
  min-width: 8px;
}

.base-badge-dot.base-badge-small {
  width: 6px;
  height: 6px;
  min-width: 6px;
}

.base-badge-dot.base-badge-large {
  width: 12px;
  height: 12px;
  min-width: 12px;
}

/* Remove button */
.base-badge-removable {
  padding-right: 1.5rem !important;
}

.base-badge-remove {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: currentColor;
  opacity: 0.7;
  padding: 0.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.base-badge-remove:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

/* Pulse animation */
.base-badge-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Size variants */
.base-badge-small {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem !important;
  min-height: 1.25rem;
}

.base-badge-large {
  font-size: 1rem;
  padding: 0.375rem 0.75rem !important;
  min-height: 2rem;
}

/* Icon styling */
.base-badge-icon {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .base-badge-large {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem !important;
  }
}
</style>
