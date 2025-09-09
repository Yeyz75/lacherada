<template>
  <div class="base-rating" :class="ratingClasses">
    <!-- Label -->
    <label v-if="label" class="base-rating-label">
      {{ label }}
    </label>

    <!-- Rating Component -->
    <Rating
      :model-value="modelValue"
      @update:model-value="handleChange"
      :readonly="readonly"
      :disabled="disabled"
      :stars="stars"
      :cancel="cancel"
      class="base-rating-component"
      v-bind="$attrs">
      <!-- Custom star template si se necesita -->
      <template v-if="$slots.onicon" #onicon>
        <slot name="onicon" />
      </template>

      <template v-if="$slots.officon" #officon>
        <slot name="officon" />
      </template>
    </Rating>

    <!-- Rating display con texto -->
    <div v-if="showText || showCount" class="base-rating-display">
      <span v-if="showText" class="base-rating-text">
        {{ ratingText }}
      </span>

      <span v-if="showCount && totalRatings" class="base-rating-count">
        ({{ formatCount(totalRatings) }})
      </span>
    </div>

    <!-- Rating breakdown (para mostrar distribución) -->
    <div v-if="showBreakdown && breakdown" class="base-rating-breakdown">
      <div
        v-for="(count, star) in breakdown"
        :key="star"
        class="base-rating-breakdown-item">
        <span class="base-rating-breakdown-stars">{{ star }}★</span>
        <div class="base-rating-breakdown-bar">
          <div
            class="base-rating-breakdown-fill"
            :style="{ width: getBreakdownPercentage(count) + '%' }" />
        </div>
        <span class="base-rating-breakdown-count">{{ count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Rating from 'primevue/rating'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  // Rating props
  modelValue?: number
  readonly?: boolean
  disabled?: boolean
  stars?: number
  cancel?: boolean

  // Extended props
  label?: string
  size?: 'small' | 'normal' | 'large'
  showText?: boolean
  showCount?: boolean
  showBreakdown?: boolean
  totalRatings?: number
  breakdown?: Record<number, number> // {5: 120, 4: 45, 3: 12, 2: 3, 1: 1}
  precision?: 'full' | 'half' // Para ratings de media estrella
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  readonly: false,
  disabled: false,
  stars: 5,
  cancel: true,
  size: 'normal',
  showText: false,
  showCount: false,
  showBreakdown: false,
  precision: 'full',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
}>()

const ratingClasses = computed(() => [
  'base-rating-wrapper',
  {
    'base-rating-small': props.size === 'small',
    'base-rating-large': props.size === 'large',
    'base-rating-readonly': props.readonly,
    'base-rating-disabled': props.disabled,
  },
  props.class,
])

const ratingText = computed(() => {
  if (!props.modelValue) return 'Sin calificación'

  const rating = props.modelValue
  if (rating >= 4.5) return 'Excelente'
  if (rating >= 4.0) return 'Muy bueno'
  if (rating >= 3.0) return 'Bueno'
  if (rating >= 2.0) return 'Regular'
  return 'Malo'
})

const handleChange = (value: number) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

const getBreakdownPercentage = (count: number): number => {
  if (!props.totalRatings || props.totalRatings === 0) return 0
  return (count / props.totalRatings) * 100
}
</script>

<script lang="ts">
export default {
  name: 'BaseRating',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue con extensiones */
.base-rating-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.base-rating-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.base-rating-component {
  display: flex;
  align-items: center;
}

.base-rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.base-rating-text {
  font-weight: 500;
  color: var(--p-text-color);
}

.base-rating-count {
  color: var(--p-text-muted-color);
}

/* Size variants */
.base-rating-small .base-rating-component {
  font-size: 0.875rem;
}

.base-rating-small .base-rating-display {
  font-size: 0.75rem;
}

.base-rating-large .base-rating-component {
  font-size: 1.25rem;
}

.base-rating-large .base-rating-display {
  font-size: 1rem;
}

/* States */
.base-rating-readonly .base-rating-component {
  pointer-events: none;
}

.base-rating-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Breakdown styling */
.base-rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.base-rating-breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.base-rating-breakdown-stars {
  min-width: 2rem;
  color: var(--p-text-muted-color);
}

.base-rating-breakdown-bar {
  flex: 1;
  height: 4px;
  background: var(--p-surface-200);
  border-radius: 2px;
  overflow: hidden;
}

.base-rating-breakdown-fill {
  height: 100%;
  background: var(--p-warning-color);
  transition: width 0.3s ease;
}

.base-rating-breakdown-count {
  min-width: 2rem;
  text-align: right;
  color: var(--p-text-muted-color);
}

/* Responsive */
@media (max-width: 768px) {
  .base-rating-breakdown-item {
    font-size: 0.6875rem;
  }

  .base-rating-breakdown-stars,
  .base-rating-breakdown-count {
    min-width: 1.5rem;
  }
}
</style>
