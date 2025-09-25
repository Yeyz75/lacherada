<template>
  <Chip
    :label="label"
    :icon="icon"
    :image="image"
    :removable="removable"
    :unstyled="true"
    :class="chipClasses"
    @remove="handleRemove"
    @click="handleClick"
    v-bind="chipBindings">
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
import { computed, useAttrs } from 'vue'
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

const attrs = useAttrs()

const severityTokens: Record<NonNullable<Props['severity']>, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600',
  secondary: 'bg-surface-secondary text-text-primary hover:bg-surface-tertiary',
  success: 'bg-success/15 text-success hover:bg-success/20',
  info: 'bg-info/15 text-info hover:bg-info/20',
  warn: 'bg-warning/15 text-warning hover:bg-warning/20',
  danger: 'bg-error/15 text-error hover:bg-error/20',
}

const variantMap: Record<NonNullable<Props['variant']>, string> = {
  filled: 'border border-transparent',
  outlined: 'border border-current bg-transparent hover:bg-surface-tertiary/60',
  text: 'border border-transparent bg-transparent hover:bg-surface-tertiary/50',
}

const sizeClassMap: Record<NonNullable<Props['size']>, string> = {
  small: 'h-7 px-2 text-xs gap-1',
  normal: 'h-8 px-3 text-sm gap-2',
  large: 'h-10 px-4 text-base gap-3',
}

const chipClasses = computed(() => [
  'base-chip inline-flex items-center rounded-full font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  severityTokens[props.severity ?? 'secondary'],
  variantMap[props.variant ?? 'filled'],
  sizeClassMap[props.size ?? 'normal'],
  {
    'cursor-pointer': props.clickable && !props.disabled,
    'opacity-70 pointer-events-none': props.disabled,
    'ring-4 ring-primary/20': props.selected,
    'shadow-sm hover:shadow-md': props.clickable && !props.disabled,
  },
  props.class,
])

const chipBindings = computed(() => ({
  ...attrs,
  class: undefined,
}))

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
