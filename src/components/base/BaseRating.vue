<template>
  <div v-bind="rootAttrs" :class="wrapperClasses">
    <!-- Label -->
    <label v-if="label" :class="labelClasses">
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
      :class="ratingClasses"
      :unstyled="true"
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
    <div v-if="showText || showCount" :class="displayClasses">
      <span v-if="showText" :class="textClasses">
        {{ ratingText }}
      </span>

      <span v-if="showCount && totalRatings" :class="countClasses">
        ({{ formatCount(totalRatings) }})
      </span>
    </div>

    <!-- Rating breakdown (para mostrar distribución) -->
    <div v-if="showBreakdown && breakdown" :class="breakdownClasses">
      <div
        v-for="(count, star) in breakdown"
        :key="star"
        :class="breakdownItemClasses">
        <span :class="breakdownStarClasses">{{ star }}★</span>
        <div :class="breakdownBarClasses">
          <div
            :class="breakdownFillClasses"
            :style="{ width: getBreakdownPercentage(count) + '%' }" />
        </div>
        <span :class="breakdownCountClasses">{{ count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
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

const attrs = useAttrs()

const rootAttrs = computed(() => {
  const { class: _class, ...rest } = Object.assign({}, attrs)
  return rest
})

const wrapperClasses = computed(() => [
  'flex w-full flex-col gap-2',
  {
    'opacity-60 pointer-events-none': props.disabled,
  },
  props.class,
  attrs.class,
])

const labelClasses = computed(() => 'text-sm font-medium text-text-primary')

const ratingClasses = computed(() => [
  'flex items-center gap-1 text-warning',
  {
    'text-sm': props.size === 'small',
    'text-base': props.size === 'normal',
    'text-lg': props.size === 'large',
  },
])

const displayClasses = computed(() => 'flex items-center gap-2 text-sm')

const textClasses = computed(() => 'font-medium text-text-primary')

const countClasses = computed(() => 'text-text-muted')

const breakdownClasses = computed(
  () => 'mt-2 flex flex-col gap-2 text-xs text-text-muted',
)

const breakdownItemClasses = computed(() => 'flex items-center gap-2')

const breakdownStarClasses = computed(() => 'min-w-[2rem] text-right')

const breakdownBarClasses = computed(
  () => 'flex-1 overflow-hidden rounded-full bg-border-muted',
)

const breakdownFillClasses = computed(
  () => 'h-2 rounded-full bg-warning transition-all duration-200 ease-out',
)

const breakdownCountClasses = computed(() => 'min-w-[2rem] text-right')

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
