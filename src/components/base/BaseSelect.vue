<template>
  <div :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="selectId"
      class="transition-colors duration-150"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="ml-1 text-error">*</span>
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
      :unstyled="true"
      :aria-invalid="hasError || undefined"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
      v-bind="selectBindings">
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
    <div v-if="helperText || errorMessage" class="mt-1">
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
        :class="helperClasses"
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

const attrs = useAttrs()

const helperText = computed(() => props.helperText)

const mergeClassValue = (existing: unknown, addition: unknown) => {
  const normalize = (value: unknown): unknown[] => {
    if (!value && value !== 0) return []
    if (Array.isArray(value)) return value
    return [value]
  }
  return [...normalize(addition), ...normalize(existing)]
}

const baseWrapperClass = 'flex w-full flex-col gap-2'

const wrapperClasses = computed(() => [
  baseWrapperClass,
  {
    'opacity-60 pointer-events-none': props.disabled,
  },
  attrs.class,
])

const labelClasses = computed(() => [
  'flex items-center gap-1 text-sm font-medium text-text-primary',
  {
    'text-error': hasError.value,
    'text-success': hasSuccess.value,
  },
])

const helperClasses = computed(() => 'text-xs text-text-muted')

const controlSizeMap: Record<NonNullable<Props['size']>, string> = {
  small: 'min-h-[2.25rem] px-3 py-2 text-sm',
  medium: 'min-h-[var(--control-height-md)] px-4 py-2.5 text-sm',
  large: 'min-h-[var(--control-height-lg)] px-5 py-3 text-base',
}

const triggerClasses = computed(() => [
  'flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-primary text-left text-text-primary shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/25',
  controlSizeMap[props.size ?? 'medium'],
  {
    'border-error focus:ring-error/25 text-error': hasError.value,
    'border-success focus:ring-success/25': hasSuccess.value,
    'disabled:cursor-not-allowed disabled:bg-surface-tertiary disabled:text-text-muted': true,
  },
])

const panelClasses = computed(() => [
  'rounded-2xl border border-border bg-surface-primary shadow-lg',
])

const optionClasses = computed(() => [
  'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition hover:bg-surface-tertiary hover:text-text-primary',
])

const optionSelectedClasses = computed(() => [
  'bg-primary-50 text-text-primary hover:bg-primary-100',
])

const selectBindings = computed(() => {
  const baseProps: Record<string, unknown> = { ...attrs }

  baseProps.class = mergeClassValue(baseProps.class, triggerClasses.value)
  baseProps.panelClass = mergeClassValue(
    baseProps.panelClass,
    panelClasses.value,
  )
  baseProps.optionClass = mergeClassValue(
    baseProps.optionClass,
    optionClasses.value,
  )
  baseProps.optionSelectedClass = mergeClassValue(
    baseProps.optionSelectedClass,
    optionSelectedClasses.value,
  )

  baseProps['aria-describedby'] =
    baseProps['aria-describedby'] ||
    (helperText.value ? `${selectId.value}-helper` : undefined)

  return baseProps
})

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
