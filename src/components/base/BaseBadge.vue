<template>
  <Badge
    :value="label || value"
    :severity="badgeSeverity"
    :size="size"
    :unstyled="true"
    :class="badgeClasses"
    @click="handleClick"
    v-bind="badgeBindings">
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
      class="flex h-4 w-4 items-center justify-center rounded-full bg-transparent text-current transition hover:bg-current/10"
      @click="handleRemove"
      :aria-label="'Remover ' + (label || value)">
      <Icon icon="mdi:close" class="text-xs" />
    </button>
  </Badge>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
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

const attrs = useAttrs()

const severityTokens: Record<NonNullable<Props['severity']>, string> = {
  secondary: 'bg-surface-tertiary text-text-muted',
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  warn: 'bg-warning/15 text-warning',
  danger: 'bg-error/15 text-error',
  contrast: 'bg-text-primary text-surface-elevated',
}

const variantMap: Record<NonNullable<Props['variant']>, string> = {
  filled: 'border border-transparent',
  outlined: 'border border-current bg-transparent',
  dot: 'border border-transparent',
}

// Mapear severity para PrimeVue
const badgeSeverity = computed(() => {
  switch (props.severity) {
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

const baseBadgeClass =
  'base-badge inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none transition-colors duration-150'

const sizeClassMap: Record<NonNullable<Props['size']>, string> = {
  small: 'px-2 py-0.5 text-[10px]',
  normal: 'px-2.5 py-1 text-xs',
  large: 'px-3 py-1.5 text-sm',
}

const badgeClasses = computed(() => [
  baseBadgeClass,
  severityTokens[props.severity ?? 'secondary'],
  variantMap[props.variant ?? 'filled'],
  sizeClassMap[props.size ?? 'normal'],
  {
    'cursor-pointer hover:opacity-85': props.clickable,
    'ring-4 ring-current/20': props.pulse,
    'relative pr-7': props.removable,
    'h-2 w-2 rounded-full p-0': props.variant === 'dot',
  },
  props.class,
])

const iconClasses = computed(() => [
  'flex-shrink-0 text-inherit opacity-80',
  {
    'mr-1': props.iconPosition === 'left' && (props.label || props.value),
    'ml-1': props.iconPosition === 'right' && (props.label || props.value),
    'text-[10px]': props.size === 'small',
    'text-xs': props.size === 'normal',
    'text-sm': props.size === 'large',
  },
])

const badgeBindings = computed(() => ({
  ...attrs,
  class: undefined,
}))

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
