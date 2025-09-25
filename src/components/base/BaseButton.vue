<template>
  <Button
    :disabled="disabled || loading"
    :type="type"
    :id="id"
    :data-testid="testId"
    :loading="loading"
    :size="size"
    :severity="severity"
    :variant="variant"
    :text="isTextVariant"
    :outlined="isOutlinedVariant"
    :raised="isRaisedVariant"
    @click="handleClick"
    v-bind="$attrs"
    :class="buttonClasses"
    :unstyled="true">
    <!-- Icon Template -->
    <template v-if="icon && iconPosition === 'left'" #icon>
      <Icon :icon="icon" :class="iconClasses" />
    </template>

    <!-- Default Slot Content -->
    <slot />

    <!-- Right Icon (usando slot por defecto ya que PrimeVue no tiene iconRight) -->
    <Icon
      v-if="icon && iconPosition === 'right'"
      :icon="icon"
      :class="['ml-2', iconClasses]" />
  </Button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import type { ButtonProps, ButtonVariant, ButtonSize } from '../../types'

interface Props extends ButtonProps {
  // Props extendidas específicas del componente
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

// Mapear variantes customizadas a las de PrimeVue
const severity = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'danger':
      return 'danger'
    case 'success':
      return 'success'
    case 'warning':
      return 'warn'
    case 'ghost':
      return 'secondary'
    default:
      return 'primary'
  }
})

// Configurar variantes de estilo
const isTextVariant = computed(
  () => props.variant === 'ghost' || props.variant === 'text',
)
const isOutlinedVariant = computed(() => props.variant === 'outlined')
const isRaisedVariant = computed(() => props.variant === 'raised')

const baseButtonClass =
  'base-button inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60'

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary/80',
  secondary:
    'border border-border bg-surface-secondary text-text-primary hover:bg-surface-tertiary',
  ghost:
    'bg-transparent text-text-muted hover:bg-surface-tertiary focus-visible:ring-primary/40',
  danger: 'bg-error text-white shadow-sm hover:bg-error/90',
  success: 'bg-success text-white shadow-sm hover:bg-success/90',
  warning:
    'bg-warning text-surface-elevated shadow-sm hover:brightness-95 focus-visible:ring-warning/60',
  text: 'bg-transparent text-primary-500 hover:bg-primary-50 focus-visible:ring-primary/40',
  outlined:
    'border border-border bg-transparent text-text-primary hover:bg-surface-tertiary',
  raised:
    'bg-primary-500 text-white shadow-md hover:shadow-lg hover:bg-primary-500/95',
}

const resolveSizeClasses = (size: ButtonSize | undefined): string => {
  switch (size) {
    case 'xs':
      return 'min-h-[2rem] px-3 text-xs'
    case 'small':
    case 'sm':
      return 'min-h-[2.25rem] px-3 text-sm'
    case 'medium':
    case 'md':
      return 'min-h-[var(--control-height-md)] px-4 text-sm'
    case 'large':
    case 'lg':
      return 'min-h-[var(--control-height-lg)] px-5 text-base'
    case 'xl':
      return 'min-h-[3.25rem] px-6 text-lg'
    default:
      return 'min-h-[var(--control-height-md)] px-4 text-sm'
  }
}

const buttonClasses = computed(() => [
  baseButtonClass,
  variantClassMap[props.variant ?? 'primary'],
  resolveSizeClasses(props.size),
  {
    'w-full': props.fullWidth,
    'aspect-square px-0 gap-0': props.icon && !slots.default,
  },
  props.class,
])

const resolveIconClasses = (size: ButtonSize | undefined): string => {
  switch (size) {
    case 'xs':
    case 'small':
      return 'text-xs'
    case 'sm':
    case 'medium':
    case 'md':
      return 'text-sm'
    case 'large':
    case 'lg':
      return 'text-base'
    case 'xl':
      return 'text-lg'
    default:
      return 'text-sm'
  }
}

const iconClasses = computed(
  () => `shrink-0 ${resolveIconClasses(props.size ?? 'md')}`,
)

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
