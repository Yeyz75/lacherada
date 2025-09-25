<template>
  <Badge
    :value="label || value"
    :severity="badgeSeverity"
    :size="size"
    :unstyled="true"
    :class="badgeClasses"
    v-bind="badgeBindings"
    @click="handleClick">
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
      :class="removeButtonClasses"
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

const badgeBindings = computed(() => {
  const { class: _class, ...rest } = Object.assign({}, attrs)
  return rest
})

const severityTokens: Record<NonNullable<Props['severity']>, string> = {
  secondary: 'bg-surface-tertiary text-text-muted',
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  warn: 'bg-warning/15 text-warning',
  danger: 'bg-error/15 text-error',
  contrast: 'bg-text-primary text-surface-primary',
}

const variantMap: Record<NonNullable<Props['variant']>, string> = {
  filled: 'border border-transparent',
  outlined: 'border border-current bg-transparent text-current',
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

const sizeClassMap: Record<NonNullable<Props['size']>, string> = {
  small: 'px-2 py-0.5 text-[10px]',
  normal: 'px-2.5 py-1 text-xs',
  large: 'px-3 py-1.5 text-sm',
}

const dotSizeMap: Record<NonNullable<Props['size']>, string> = {
  small: 'h-1.5 w-1.5 min-w-[0.375rem]',
  normal: 'h-2 w-2 min-w-[0.5rem]',
  large: 'h-3 w-3 min-w-[0.75rem]',
}

const badgeClasses = computed(() => [
  'inline-flex items-center gap-1 rounded-full text-xs font-semibold leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  severityTokens[props.severity ?? 'secondary'],
  variantMap[props.variant ?? 'filled'],
  props.variant === 'dot'
    ? `p-0 border-transparent rounded-full ${dotSizeMap[props.size ?? 'normal']}`
    : sizeClassMap[props.size ?? 'normal'],
  {
    'cursor-pointer hover:opacity-85': props.clickable,
    'animate-pulse': props.pulse,
    'pr-6': props.removable && props.variant !== 'dot',
    'pl-0 pr-0': props.variant === 'dot',
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

const removeButtonClasses = computed(() => [
  'absolute right-1 flex h-4 w-4 items-center justify-center rounded-full bg-transparent text-current transition hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
  {
    'top-1/2 -translate-y-1/2': props.variant !== 'dot',
    'top-1 -translate-y-1/2': props.variant === 'dot',
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
