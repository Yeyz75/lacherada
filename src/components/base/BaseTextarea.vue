<template>
  <div :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="textareaId"
      class="transition-colors duration-150"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="ml-1 text-error">*</span>
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
      :unstyled="true"
      :aria-invalid="hasError || undefined"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      v-bind="textareaBindings" />

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="mt-1">
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
        :class="helperClasses"
        :id="`${textareaId}-helper`">
        {{ helperText }}
      </small>
    </div>

    <!-- Character Count -->
    <div v-if="maxlength && showCharacterCount" :class="countClasses">
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

const attrs = useAttrs()

const helperTextComputed = computed(() => props.helperText)

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

const countClasses = computed(() => [
  'mt-1 text-right text-xs text-text-muted transition-colors',
  {
    'text-error': isOverLimit.value,
  },
])

const textareaBaseClasses = computed(() => [
  'w-full rounded-xl border border-border bg-surface-primary text-text-primary placeholder:text-text-muted transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 px-4 py-3',
  {
    'border-error text-error focus:ring-error/30': hasError.value,
    'border-success focus:ring-success/25': hasSuccess.value,
    'disabled:cursor-not-allowed disabled:bg-surface-tertiary disabled:text-text-muted': true,
  },
])

const textareaBindings = computed(() => {
  const baseProps: Record<string, unknown> = { ...attrs }

  baseProps.class = mergeClassValue(baseProps.class, textareaBaseClasses.value)

  baseProps['aria-describedby'] =
    baseProps['aria-describedby'] ||
    (helperTextComputed.value ? `${textareaId.value}-helper` : undefined)

  return baseProps
})

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
