<template>
  <Accordion
    :id="id"
    :data-testid="testId"
    :value="internalValue"
    :multiple="multiple"
    :disabled="disabled"
    :unstyled="true"
    v-bind="accordionBindings"
    class="base-accordion"
    :class="accordionClasses"
    @update:value="handleValueChange">
    <slot />
  </Accordion>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import Accordion from 'primevue/accordion'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  /** Valor del accordion (controla qué paneles están expandidos) */
  modelValue?: string | string[]
  /** Permite múltiples paneles expandidos simultáneamente */
  multiple?: boolean
  /** Variante visual del accordion */
  variant?: 'default' | 'outlined' | 'filled' | 'borderless'
  /** Tamaño del accordion */
  size?: 'sm' | 'md' | 'lg'
  /** Deshabilitar todo el accordion */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  multiple: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

// Estado interno del valor
const internalValue = ref(props.modelValue)

// Sincronizar valor interno con prop
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue
  },
  { immediate: true },
)

// Manejar cambios de valor
const handleValueChange = (value: string | string[] | null | undefined) => {
  // Normalizar el valor - PrimeVue puede pasar null/undefined
  const normalizedValue = value ?? (props.multiple ? [] : '')
  internalValue.value = normalizedValue
  emit('update:modelValue', normalizedValue)
}

// Clases computadas para el accordion
const attrs = useAttrs()

const variantTokens: Record<NonNullable<Props['variant']>, string> = {
  default: 'border border-border bg-surface-primary',
  outlined: 'border border-border bg-surface-primary',
  filled: 'border border-border bg-surface-secondary',
  borderless: 'border border-transparent bg-transparent',
}

const sizeTokens: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const accordionClasses = computed(() => [
  'base-accordion overflow-hidden rounded-2xl transition-colors duration-200',
  variantTokens[props.variant ?? 'default'],
  sizeTokens[props.size ?? 'md'],
  {
    'opacity-60 pointer-events-none': props.disabled,
  },
  props.class,
])

const headerPaddingMap: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-4 py-3',
  md: 'px-5 py-4',
  lg: 'px-6 py-5',
}

const contentPaddingMap: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-4 pb-4',
  md: 'px-5 pb-5',
  lg: 'px-6 pb-6',
}

const accordionBindings = computed(() => ({
  ...attrs,
  class: undefined,
  pt: {
    root: 'divide-y divide-border overflow-hidden rounded-2xl shadow-sm',
    panel: 'bg-transparent',
    header: [
      'flex items-center justify-between text-text-primary transition duration-200',
      'hover:bg-surface-tertiary',
      headerPaddingMap[props.size ?? 'md'],
    ],
    headerAction: 'flex w-full items-center justify-between gap-3',
    toggleIcon: 'text-text-muted transition-transform duration-200',
    content: [
      'bg-surface-primary text-text-secondary',
      contentPaddingMap[props.size ?? 'md'],
    ],
  },
}))
</script>

<script lang="ts">
export default {
  name: 'BaseAccordion',
  inheritAttrs: false,
}
</script>
