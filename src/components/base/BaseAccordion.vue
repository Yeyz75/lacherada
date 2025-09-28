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
  default: 'bg-transparent',
  outlined: 'bg-transparent',
  filled: 'bg-surface-secondary/60',
  borderless: 'bg-transparent',
}

const panelVariantTokens: Record<NonNullable<Props['variant']>, string> = {
  default: 'border border-border/60 bg-surface-primary/90 shadow-sm',
  outlined: 'border border-primary/50 bg-surface-primary/95 shadow-sm',
  filled: 'border border-border/40 bg-surface-secondary/90 shadow-sm',
  borderless: 'border border-transparent bg-surface-primary/80 shadow-sm',
}

const headerVariantTokens: Record<NonNullable<Props['variant']>, string> = {
  default: 'text-text-primary/90',
  outlined: 'text-text-primary',
  filled: 'text-text-primary',
  borderless: 'text-text-primary',
}

const contentVariantTokens: Record<NonNullable<Props['variant']>, string> = {
  default: 'bg-surface-primary/90',
  outlined: 'bg-surface-primary/95',
  filled: 'bg-surface-secondary/90',
  borderless: 'bg-surface-primary/85',
}

const sizeTokens: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const accordionClasses = computed(() => [
  'base-accordion flex flex-col gap-4 transition-colors duration-200',
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
  sm: 'px-4 pt-0 pb-4',
  md: 'px-5 pt-0 pb-5',
  lg: 'px-6 pt-0 pb-6',
}

const accordionBindings = computed(() => ({
  ...attrs,
  class: undefined,
  pt: {
    root: [
      'flex flex-col gap-4',
      props.disabled ? 'pointer-events-none opacity-60' : '',
    ],
    panel: [
      'group overflow-hidden rounded-2xl backdrop-blur-sm transition-all duration-200 hover:shadow-lg/20 focus-within:ring-2 focus-within:ring-primary/10',
      panelVariantTokens[props.variant ?? 'default'],
    ],
    header: [
      'flex items-center justify-between text-left font-medium transition-colors duration-200 hover:bg-surface-tertiary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      headerPaddingMap[props.size ?? 'md'],
      headerVariantTokens[props.variant ?? 'default'],
    ],
    headerAction: 'flex w-full items-center justify-between gap-3',
    toggleIcon: 'text-text-muted transition-transform duration-200',
    content: [
      'border-t border-border/50 text-text-secondary/90',
      contentVariantTokens[props.variant ?? 'default'],
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
