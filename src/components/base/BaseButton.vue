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
    class="base-button"
    :class="buttonClasses">
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
import type { ButtonProps } from '../../types'

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

const buttonClasses = computed(() => [
  'base-button',
  {
    'w-full': props.fullWidth,
    'aspect-square p-0': props.icon && !slots.default,
    'auto-width': !props.fullWidth, // Clase para ancho automático
  },
  props.class,
])

const iconClasses = computed(() => ({
  'text-xs': props.size === 'small' || props.size === 'xs',
  'text-sm':
    props.size === 'medium' || props.size === 'md' || props.size === 'sm',
  'text-base': props.size === 'large' || props.size === 'lg',
  'text-lg': props.size === 'xl',
}))

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
/* Usar el diseño nativo de PrimeVue, solo agregar utilidades extendidas */
.base-button {
  /* Extensiones opcionales al diseño de PrimeVue */
  transition: transform 0.15s ease;
  /* Permitir que el botón se adapte al contenido por defecto */
  width: auto;
  min-width: fit-content;
  white-space: nowrap;
}

/* Clase para botones con ancho automático */
.auto-width {
  width: auto !important;
  min-width: fit-content !important;
  max-width: 100%;
  flex-shrink: 0;
}

.base-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.base-button:active:not(:disabled) {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-button {
    min-height: 44px; /* Touch-friendly on mobile */
  }

  /* En móviles, permitir que algunos botones ocupen todo el ancho */
  .auto-width {
    width: 100% !important;
    max-width: none;
  }
}
</style>
