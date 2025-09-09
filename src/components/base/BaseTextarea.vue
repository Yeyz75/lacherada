<template>
  <div class="base-textarea-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="textareaId"
      class="base-textarea-label"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Textarea Component -->
    <Textarea
      :id="textareaId"
      ref="textareaRef"
      :model-value="String(modelValue || '')"
      @update:model-value="(value: string) => $emit('update:modelValue', value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :minlength="minlength"
      :rows="rows"
      :cols="cols"
      :invalid="hasError"
      :variant="variant"
      :data-testid="testId"
      :auto-resize="autoResize"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      v-bind="textareaProps" />

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="base-textarea-help">
      <Message
        v-if="errorMessage"
        severity="error"
        variant="simple"
        size="small"
        :id="`${textareaId}-error`">
        {{ errorMessage }}
      </Message>
      <small
        v-else-if="helperText"
        class="base-textarea-helper"
        :id="`${textareaId}-helper`">
        {{ helperText }}
      </small>
    </div>

    <!-- Character Count -->
    <div
      v-if="maxlength && showCharacterCount"
      class="base-textarea-count"
      :class="{ 'text-red-500': isOverLimit }">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import type { BaseComponentProps } from '../../types'

interface Props extends BaseComponentProps {
  modelValue?: string | number
  label?: string
  helperText?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  maxlength?: number
  minlength?: number
  rows?: number
  cols?: number
  autoResize?: boolean
  showCharacterCount?: boolean
  error?: boolean | string
  success?: boolean
  variant?: 'outlined' | 'filled'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  autoResize: false,
  showCharacterCount: false,
  variant: 'outlined',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const textareaRef = ref<any>()
const textareaId = ref(
  `base-textarea-${Math.random().toString(36).substr(2, 9)}`,
)

// Computed properties
const hasError = computed(
  () => Boolean(props.error) || Boolean(errorMessage.value),
)
const hasSuccess = computed(() => props.success && !hasError.value)
const characterCount = computed(() => String(props.modelValue || '').length)
const isOverLimit = computed(() =>
  props.maxlength ? characterCount.value > props.maxlength : false,
)

const errorMessage = computed(() => {
  if (typeof props.error === 'string') return props.error
  return props.error ? 'Este campo contiene errores' : ''
})

// Props adicionales para el textarea
const textareaProps = computed(() => {
  const baseProps = { ...useAttrs() }
  return baseProps
})

// CSS Classes
const wrapperClasses = computed(() => [
  'base-textarea-wrapper',
  {
    'opacity-75': props.disabled,
    'base-textarea-error': hasError.value,
    'base-textarea-success': hasSuccess.value,
  },
  props.class,
])

const labelClasses = computed(() => ({
  'text-red-600': hasError.value,
  'text-green-600': hasSuccess.value,
}))

// Event handlers
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('input', target.value)
}

// Public methods
const focus = () => {
  textareaRef.value?.$el?.focus() || textareaRef.value?.focus()
}

const blur = () => {
  textareaRef.value?.$el?.blur() || textareaRef.value?.blur()
}

const select = () => {
  textareaRef.value?.$el?.select() || textareaRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  textareaRef,
})
</script>

<script lang="ts">
export default {
  name: 'BaseTextarea',
  inheritAttrs: false,
}
</script>

<style scoped>
/* Usar el diseño nativo de PrimeVue, solo agregar espaciado y utilidades */
.base-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.base-textarea-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
  margin-bottom: 0.25rem;
  transition: color 0.2s;
}

.base-textarea-help {
  margin-top: 0.25rem;
}

.base-textarea-helper {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  display: block;
}

.base-textarea-count {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  text-align: right;
  margin-top: 0.25rem;
  transition: color 0.2s;
}

/* Estados de error y éxito */
.base-textarea-error .base-textarea-label {
  color: var(--p-red-500);
}

.base-textarea-success .base-textarea-label {
  color: var(--p-green-500);
}

/* Responsive */
@media (max-width: 768px) {
  .base-textarea-label {
    font-size: 0.8125rem;
  }

  .base-textarea-helper,
  .base-textarea-count {
    font-size: 0.6875rem;
  }
}
</style>
