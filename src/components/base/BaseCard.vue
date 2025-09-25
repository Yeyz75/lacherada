<template>
  <Card
    :id="id"
    :data-testid="testId"
    v-bind="$attrs"
    :unstyled="true"
    :class="cardClasses">
    <!-- Header con título y subtítulo -->
    <template #header v-if="$slots.header || title">
      <div
        class="base-card-header flex flex-col gap-1 border-b border-border/60 text-text-primary"
        :class="headerPaddingClasses">
        <!-- Slot de header personalizado -->
        <slot name="header" v-if="$slots.header" />

        <!-- Header por defecto con título -->
        <div
          v-else-if="title"
          class="base-card-title-section flex flex-col gap-1">
          <h3 class="base-card-title text-lg font-semibold text-text-primary">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="base-card-subtitle text-sm text-text-muted">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </template>

    <!-- Contenido principal -->
    <template #content>
      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="base-card-loading-overlay absolute inset-0 z-10 flex items-center justify-center gap-sm rounded-[inherit] bg-surface-primary/85 backdrop-blur">
        <div
          class="base-card-loading-content flex items-center gap-sm text-primary-500">
          <Icon icon="mdi:loading" class="animate-spin text-2xl" />
        </div>
      </div>

      <!-- Contenido principal con padding configurable -->
      <div
        class="base-card-content flex flex-col gap-sm text-text-secondary"
        :class="contentPaddingClasses">
        <slot />
      </div>
    </template>

    <!-- Footer con acciones -->
    <template #footer v-if="$slots.actions || $slots.footer">
      <div
        class="base-card-footer flex flex-col gap-sm border-t border-border/60"
        :class="footerPaddingClasses">
        <!-- Slot de acciones -->
        <div
          v-if="$slots.actions"
          class="base-card-actions flex flex-wrap items-center justify-end gap-sm">
          <slot name="actions" />
        </div>

        <!-- Slot de footer -->
        <div
          v-if="$slots.footer"
          class="base-card-footer-content text-text-muted">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Card from 'primevue/card'
import type { CardProps, CardVariant } from '../../types'

interface Props extends CardProps {
  title?: string
  subtitle?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  clickable: false,
  loading: false,
})

const baseCardClass =
  'base-card-wrapper relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-primary shadow-sm transition duration-200'

const variantClassMap: Record<CardVariant, string> = {
  default: '',
  glass:
    'bg-surface-primary/70 border-white/20 shadow-none backdrop-blur-lg dark:bg-surface-muted/60',
  elevated: 'shadow-lg',
  outlined: 'border-2 border-border-strong shadow-none',
}

const cardClasses = computed(() => [
  baseCardClass,
  variantClassMap[props.variant ?? 'default'],
  {
    'cursor-pointer hover:shadow-lg': props.clickable && !props.loading,
    'opacity-80 pointer-events-none': props.loading,
  },
  props.class,
])

// Clases de padding configurables
const paddingClassMap: Record<NonNullable<Props['padding']>, string> = {
  none: 'p-0',
  sm: 'px-sm py-sm',
  md: 'px-md py-md',
  lg: 'px-lg py-lg',
  xl: 'px-xl py-xl',
}

const headerPaddingClasses = computed(
  () => paddingClassMap[props.padding] ?? paddingClassMap.md,
)

const contentPaddingClasses = computed(
  () => paddingClassMap[props.padding] ?? paddingClassMap.md,
)

const footerPaddingClasses = computed(
  () => paddingClassMap[props.padding] ?? paddingClassMap.md,
)
</script>

<script lang="ts">
export default {
  name: 'BaseCard',
  inheritAttrs: false,
}
</script>
