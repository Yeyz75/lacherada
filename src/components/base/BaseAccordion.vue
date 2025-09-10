<template>
  <Accordion
    :id="id"
    :data-testid="testId"
    v-bind="$attrs"
    class="base-accordion"
    :class="accordionClasses"
    :value="internalValue"
    @update:value="handleValueChange">
    <slot />
  </Accordion>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const accordionClasses = computed(() => [
  'base-accordion-wrapper',
  `base-accordion-${props.variant}`,
  `base-accordion-${props.size}`,
  {
    'base-accordion-disabled': props.disabled,
    'base-accordion-multiple': props.multiple,
  },
  props.class,
])
</script>

<script lang="ts">
export default {
  name: 'BaseAccordion',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Estilos base para el accordion */
.base-accordion {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.base-accordion-wrapper {
  --accordion-border-color: var(--color-border);
  --accordion-background: var(--color-background);
  --accordion-header-background: var(--color-background);
  --accordion-header-hover-background: var(--color-background-secondary);
  --accordion-content-background: var(--color-background);
  --accordion-text-color: var(--color-text-primary);
  --accordion-header-padding: var(--space-lg);
  --accordion-content-padding: var(--space-lg);
}

/* Variantes */
.base-accordion-outlined {
  --accordion-border-color: var(--color-border);
}

.base-accordion-filled {
  --accordion-header-background: var(--color-background-secondary);
  --accordion-header-hover-background: var(--color-background-tertiary);
}

.base-accordion-borderless {
  --accordion-border-color: transparent;
}

/* Tamaños */
.base-accordion-sm {
  --accordion-header-padding: var(--space-md);
  --accordion-content-padding: var(--space-md);
  font-size: var(--font-size-sm);
}

.base-accordion-md {
  --accordion-header-padding: var(--space-lg);
  --accordion-content-padding: var(--space-lg);
  font-size: var(--font-size-base);
}

.base-accordion-lg {
  --accordion-header-padding: var(--space-xl);
  --accordion-content-padding: var(--space-xl);
  font-size: var(--font-size-lg);
}

/* Estado deshabilitado */
.base-accordion-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Personalización global de PrimeVue Accordion */
:deep(.p-accordion) {
  border: 1px solid var(--accordion-border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.p-accordion-panel) {
  border: none;
  border-bottom: 1px solid var(--accordion-border-color);
}

:deep(.p-accordion-panel:last-child) {
  border-bottom: none;
}

:deep(.p-accordion-header) {
  background: var(--accordion-header-background);
  border: none;
  border-radius: 0;
}

:deep(.p-accordion-header-link) {
  padding: var(--accordion-header-padding);
  background: var(--accordion-header-background);
  color: var(--accordion-text-color);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  border-radius: 0;
  border: none;
}

:deep(.p-accordion-header-link:hover) {
  background: var(--accordion-header-hover-background);
  color: var(--color-primary);
}

:deep(.p-accordion-header-link:focus) {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  box-shadow: none;
}

:deep(.p-accordion-content) {
  background: var(--accordion-content-background);
  border: none;
  border-top: 1px solid var(--accordion-border-color);
  transition: all var(--transition-base);
}

:deep(.p-accordion-content-wrapper) {
  padding: var(--accordion-content-padding);
}

/* Flecha del accordion - Corregir dirección */
:deep(.p-accordion-toggle-icon) {
  transition: transform var(--transition-fast);
  transform: rotate(0deg); /* Flecha hacia abajo cuando está colapsado */
}

/* Cuando el panel está activo (expandido), rotar la flecha hacia arriba */
:deep(.p-accordion-panel-active .p-accordion-toggle-icon) {
  transform: rotate(180deg); /* Flecha hacia arriba cuando está expandido */
}

/* Responsive */
@media (max-width: 768px) {
  .base-accordion-sm {
    --accordion-header-padding: var(--space-sm);
    --accordion-content-padding: var(--space-sm);
  }

  .base-accordion-md {
    --accordion-header-padding: var(--space-md);
    --accordion-content-padding: var(--space-md);
  }

  .base-accordion-lg {
    --accordion-header-padding: var(--space-lg);
    --accordion-content-padding: var(--space-lg);
  }
}
</style>
