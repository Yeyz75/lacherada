<template>
  <Button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :id="id"
    :data-testid="testId"
    :loading="loading"
    @click="handleClick"
    v-bind="$attrs"
    class="primevue-button-override">
    <!-- Left Icon -->
    <Icon
      v-if="icon && iconPosition === 'left' && !loading"
      :icon="icon"
      class="flex items-center justify-center flex-shrink-0"
      :class="{
        'text-xs': props.size === 'xs',
        'text-sm': props.size === 'sm',
        'text-base': props.size === 'md',
        'text-lg': props.size === 'lg',
        'text-xl': props.size === 'xl',
      }" />

    <!-- Button Content -->
    <span class="flex items-center gap-2">
      <slot />
    </span>

    <!-- Right Icon -->
    <Icon
      v-if="icon && iconPosition === 'right' && !loading"
      :icon="icon"
      class="flex items-center justify-center flex-shrink-0"
      :class="{
        'text-xs': props.size === 'xs',
        'text-sm': props.size === 'sm',
        'text-base': props.size === 'md',
        'text-lg': props.size === 'lg',
        'text-xl': props.size === 'xl',
      }" />
  </Button>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue'
  import { Icon } from '@iconify/vue'
  import Button from 'primevue/button'
  import type { ButtonProps } from '../../types'

  interface Props extends ButtonProps {
    // Extender props específicas del componente si es necesario
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

  const buttonClasses = computed(() => [
    // Base styles
    'relative inline-flex items-center justify-center gap-2 border-0 rounded-md font-medium text-decoration-none cursor-pointer outline-none overflow-hidden select-none transition-all duration-200',
    // Focus ring
    'focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2',

    // Size variants
    {
      'h-7 px-2.5 text-xs': props.size === 'xs',
      'h-8 px-3 text-sm': props.size === 'sm',
      'h-9 px-4 text-sm': props.size === 'md',
      'h-10 px-5 text-base': props.size === 'lg',
      'h-11 px-6 text-lg': props.size === 'xl',
    },

    // Variant styles
    {
      // Primary
      'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm hover:shadow-md hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm':
        props.variant === 'primary' && !props.disabled && !props.loading,
      // Secondary
      'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0':
        props.variant === 'secondary' && !props.disabled && !props.loading,
      // Ghost
      'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900':
        props.variant === 'ghost' && !props.disabled && !props.loading,
      // Danger
      'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md hover:shadow-red-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm':
        props.variant === 'danger' && !props.disabled && !props.loading,
      // Success
      'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-md hover:shadow-green-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm':
        props.variant === 'success' && !props.disabled && !props.loading,
      // Warning
      'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm hover:shadow-md hover:shadow-yellow-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm':
        props.variant === 'warning' && !props.disabled && !props.loading,
    },

    // State variants
    {
      'w-full': props.fullWidth,
      'opacity-50 cursor-not-allowed translate-y-0 shadow-none pointer-events-none':
        props.disabled,
      'cursor-default': props.loading,
      'aspect-square p-0': props.icon && !slots.default,
    },

    props.class,
  ])

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
  /* Override PrimeVue default styles */
  ::v-deep(.primevue-button-override) {
    border: none !important;
    border-radius: 0.375rem !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
    font-family: inherit !important;
    font-weight: 500 !important;
    transition: all 200ms !important;
  }

  ::v-deep(.primevue-button-override:focus) {
    box-shadow: none !important;
    outline: none !important;
  }

  ::v-deep(.primevue-button-override:disabled) {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    transform: translateY(0) !important;
    box-shadow: none !important;
    pointer-events: none !important;
  }

  /* Loading spinner override */
  ::v-deep(.primevue-button-override .p-button-loading-icon) {
    display: none !important;
  }

  /* Remove PrimeVue default loading overlay */
  ::v-deep(.primevue-button-override.p-button-loading) {
    position: relative !important;
  }
</style>
