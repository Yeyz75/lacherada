<template>
  <div class="base-select-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="selectId"
      class="base-select-label"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Select Component -->
    <Select
      :id="selectId"
      ref="selectRef"
      :model-value="modelValue"
      @update:model-value="(value: any) => $emit('update:modelValue', value)"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :invalid="hasError"
      :size="size"
      :variant="variant"
      :data-testid="testId"
      :clearable="clearable"
      :filter="filter"
      :show-clear="showClear"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
      v-bind="selectProps">
      <!-- Custom option template -->
      <template v-if="$slots.option" #option="slotProps">
        <slot name="option" v-bind="slotProps" />
      </template>

      <!-- Custom value template -->
      <template v-if="$slots.value" #value="slotProps">
        <slot name="value" v-bind="slotProps" />
      </template>
    </Select>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="base-select-help">
      <Message
        v-if="errorMessage"
        severity="error"
        variant="simple"
        size="small"
        :id="`${selectId}-error`">
        {{ errorMessage }}
      </Message>
      <small
        v-else-if="helperText"
        class="base-select-helper"
        :id="`${selectId}-helper`">
        {{ helperText }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import Select from 'primevue/select'
import Message from 'primevue/message'
import type { BaseComponentProps } from '../../types'

interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  [key: string]: any
}

interface Props extends BaseComponentProps {
  modelValue?: any
  label?: string
  helperText?: string
  options?: SelectOption[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  filter?: boolean
  showClear?: boolean
  error?: boolean | string
  success?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'outlined' | 'filled'
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'label',
  optionValue: 'value',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  filter: false,
  showClear: false,
  size: 'medium',
  variant: 'outlined',
  options: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const selectRef = ref<any>()
const selectId = ref(`base-select-${Math.random().toString(36).substr(2, 9)}`)

// Computed properties
const hasError = computed(
  () => Boolean(props.error) || Boolean(errorMessage.value),
)
const hasSuccess = computed(() => props.success && !hasError.value)

const errorMessage = computed(() => {
  if (typeof props.error === 'string') return props.error
  return props.error ? 'Este campo contiene errores' : ''
})

// Props adicionales para el select
const selectProps = computed(() => {
  const baseProps = { ...useAttrs() }
  return baseProps
})

// CSS Classes
const wrapperClasses = computed(() => [
  'base-select-wrapper',
  {
    'opacity-75': props.disabled,
    'base-select-error': hasError.value,
    'base-select-success': hasSuccess.value,
  },
  props.class,
])

const labelClasses = computed(() => ({
  'text-red-600': hasError.value,
  'text-green-600': hasSuccess.value,
}))

// Event handlers
const handleBlur = (event: Event) => {
  emit('blur', event as FocusEvent)
}

const handleFocus = (event: Event) => {
  emit('focus', event as FocusEvent)
}

const handleChange = (value: any) => {
  emit('change', value)
}

// Public methods
const focus = () => {
  selectRef.value?.$el?.focus() || selectRef.value?.focus()
}

const blur = () => {
  selectRef.value?.$el?.blur() || selectRef.value?.blur()
}

defineExpose({
  focus,
  blur,
  selectRef,
})
</script>

<script lang="ts">
export default {
  name: 'BaseSelect',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue, solo agregar espaciado y utilidades */
.base-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.base-select-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
  margin-bottom: 0.25rem;
  transition: color 0.2s;
}

.base-select-help {
  margin-top: 0.25rem;
}

.base-select-helper {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  display: block;
}

/* Estados de error y éxito */
.base-select-error .base-select-label {
  color: var(--p-red-500);
}

.base-select-success .base-select-label {
  color: var(--p-green-500);
}

/* Responsive */
@media (max-width: 768px) {
  .base-select-label {
    font-size: 0.8125rem;
  }

  .base-select-helper {
    font-size: 0.6875rem;
  }
}
</style>
