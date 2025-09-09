<template>
  <Card
    :class="cardClasses"
    :id="id"
    :data-testid="testId"
    v-bind="$attrs"
    class="primevue-card-override">
    <!-- Loading overlay -->
    <template #content>
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-inherit">
        <div
          class="flex items-center justify-center p-4 text-xl text-orange-500">
          <Icon icon="mdi:loading" class="animate-spin" />
        </div>
      </div>

      <!-- Header slot -->
      <header v-if="$slots.header" class="mb-4">
        <slot name="header" />
      </header>

      <!-- Title and subtitle -->
      <header v-if="title || subtitle" class="mb-4">
        <h3
          v-if="title"
          class="text-xl font-semibold text-gray-900 mb-1 leading-tight">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm text-gray-600 leading-normal">
          {{ subtitle }}
        </p>
      </header>

      <!-- Main content -->
      <div class="flex-1" :class="contentClasses">
        <slot />
      </div>
    </template>

    <!-- Actions slot -->
    <template #footer v-if="$slots.actions || $slots.footer">
      <div class="flex flex-col gap-4">
        <footer
          v-if="$slots.actions"
          class="flex items-center gap-2 pt-4 border-t border-gray-200">
          <slot name="actions" />
        </footer>

        <!-- Footer slot -->
        <footer v-if="$slots.footer" class="pt-4 border-t border-gray-200">
          <slot name="footer" />
        </footer>
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
  import { computed } from 'vue'
  import { Icon } from '@iconify/vue'
  import Card from 'primevue/card'
  import type { CardProps } from '../../types'

  interface Props extends CardProps {
    title?: string
    subtitle?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    padding: 'md',
    clickable: false,
    loading: false,
  })

  const cardClasses = computed(() => [
    // Base styles
    'relative flex flex-col rounded-xl transition-all duration-300 overflow-hidden',

    // Variant styles
    {
      // Default
      'bg-white border border-gray-200 shadow-sm hover:shadow-md':
        props.variant === 'default',
      // Glass
      'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl':
        props.variant === 'glass',
      // Elevated
      'bg-white shadow-lg hover:shadow-xl': props.variant === 'elevated',
      // Outlined
      'bg-white border-2 border-gray-200 hover:border-orange-500':
        props.variant === 'outlined',
    },

    // Clickable behavior
    {
      'cursor-pointer hover:-translate-y-1': props.clickable && !props.loading,
    },

    props.class,
  ])

  const contentClasses = computed(() => ({
    // Padding variants
    'p-3': props.padding === 'sm',
    'p-4': props.padding === 'md',
    'p-6': props.padding === 'lg',
    'p-8': props.padding === 'xl',
    'p-0': props.padding === 'none',
  }))
</script>

<script lang="ts">
  export default {
    name: 'BaseCard',
    inheritAttrs: false,
  }
</script>

<style scoped>
  /* Override PrimeVue default styles */
  ::v-deep(.primevue-card-override) {
    border: none !important;
    border-radius: 0.75rem !important;
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
  }

  ::v-deep(.primevue-card-override .p-card-body) {
    padding: 0 !important;
  }

  ::v-deep(.primevue-card-override .p-card-content) {
    padding: 0 !important;
  }

  ::v-deep(.primevue-card-override .p-card-footer) {
    padding: 0 !important;
    border-top: none !important;
  }
</style>
