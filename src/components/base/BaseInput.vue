<template>
  <div :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="transition-colors duration-150"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="ml-1 text-error">*</span>
    </label>

    <!-- Input Group para inputs con iconos -->
    <InputGroup v-if="hasInputGroup" :class="inputGroupClasses">
      <!-- Left Icon Addon -->
      <InputGroupAddon
        v-if="icon && iconPosition === 'left'"
        :class="addonClasses">
        <Icon :icon="icon" class="text-lg text-text-muted" />
      </InputGroupAddon>

      <!-- Input Principal -->
      <component
        :is="inputComponent"
        :id="inputId"
        ref="inputRef"
        :model-value="String(modelValue)"
        @update:model-value="
          (value: string) => $emit('update:modelValue', value)
        "
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :invalid="hasError"
        :size="size"
        :variant="variant"
        :data-testid="testId"
        :toggle-mask="type === 'password' && showPasswordToggle"
        :feedback="type === 'password' ? false : undefined"
        :aria-invalid="hasError || undefined"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        v-bind="inputBindings" />

      <!-- Right Icon Addon -->
      <InputGroupAddon
        v-if="icon && iconPosition === 'right'"
        :class="addonClasses">
        <Icon :icon="icon" class="text-lg text-text-muted" />
      </InputGroupAddon>

      <!-- Clear Button Addon -->
      <InputGroupAddon
        v-if="clearable && modelValue && !disabled && !readonly"
        :class="addonClasses">
        <BaseButton
          icon="mdi:close"
          variant="ghost"
          size="sm"
          class="h-9 w-9 rounded-full text-text-muted hover:text-text-primary"
          @click="handleClear"
          :aria-label="'Limpiar campo'" />
      </InputGroupAddon>
    </InputGroup>

    <!-- Input Simple sin iconos -->
    <component
      v-else
      :is="inputComponent"
      :id="inputId"
      ref="inputRef"
      :model-value="String(modelValue)"
      @update:model-value="(value: string) => $emit('update:modelValue', value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :minlength="minlength"
      :pattern="pattern"
      :autocomplete="autocomplete"
      :invalid="hasError"
      :size="size"
      :variant="variant"
      :data-testid="testId"
      :toggle-mask="type === 'password' && showPasswordToggle"
      :feedback="type === 'password' ? false : undefined"
      :aria-invalid="hasError || undefined"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
      v-bind="inputBindings" />

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="mt-1">
      <Message
        v-if="errorMessage"
        severity="error"
        variant="simple"
        size="small"
        :id="`${inputId}-error`">
        {{ errorMessage }}
      </Message>
      <small
        v-else-if="helperText"
        :class="helperClasses"
        :id="`${inputId}-helper`">
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
import { Icon } from '@iconify/vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Message from 'primevue/message'
import type { InputProps } from '../../types'
import BaseButton from './BaseButton.vue'

interface Props extends InputProps {
  modelValue?: string | number
  label?: string
  helperText?: string
  showCharacterCount?: boolean
  showPasswordToggle?: boolean
  variant?: 'outlined' | 'filled'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  iconPosition: 'left',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  showCharacterCount: false,
  showPasswordToggle: false,
  variant: 'outlined',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'clear': []
  'keydown': [event: KeyboardEvent]
}>()

const inputRef = ref<any>()
const inputId = ref(`base-input-${Math.random().toString(36).substr(2, 9)}`)

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

// Determinar el componente a usar
const inputComponent = computed(() => {
  switch (props.type) {
    case 'password':
      return Password
    case 'textarea':
      return Textarea
    default:
      return InputText
  }
})

// Verificar si necesitamos InputGroup
const hasInputGroup = computed(() => {
  return (
    (props.icon && props.type !== 'password') ||
    (props.clearable && props.type !== 'password')
  )
})

// Props adicionales para el input
const attrs = useAttrs()

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

const sizeClassMap: Record<NonNullable<Props['size']>, string> = {
  sm: 'rounded-lg px-3 py-2 text-sm',
  md: 'rounded-xl px-4 py-2.5 text-base',
  lg: 'rounded-2xl px-lg py-3 text-lg',
}

const inputClasses = computed(() => [
  'w-full border border-border bg-surface-primary text-text-primary placeholder:text-text-muted transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30',
  sizeClassMap[props.size],
  {
    'border-error text-error focus:ring-error/30': hasError.value,
    'border-success focus:ring-success/25': hasSuccess.value,
    'disabled:cursor-not-allowed disabled:bg-surface-tertiary disabled:text-text-muted': true,
  },
])

const passwordWrapperClasses = computed(() => [
  'flex w-full items-center overflow-hidden rounded-xl border border-border bg-surface-primary transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary/25',
  {
    'border-error focus-within:border-error focus-within:ring-error/25':
      hasError.value,
    'border-success focus-within:border-success focus-within:ring-success/25':
      hasSuccess.value,
    'opacity-60 pointer-events-none': props.disabled,
  },
])

const inputGroupClasses = computed(() => [
  'flex w-full items-stretch overflow-hidden rounded-xl border border-border bg-surface-primary transition duration-150 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary/25',
  {
    'border-error focus-within:border-error focus-within:ring-error/25':
      hasError.value,
    'border-success focus-within:border-success focus-within:ring-success/25':
      hasSuccess.value,
    'opacity-60 pointer-events-none': props.disabled,
  },
])

const addonClasses = computed(
  () =>
    'flex items-center gap-1 bg-surface-secondary px-sm text-sm text-text-muted',
)

const baseInputBindings = computed(() => {
  const baseProps = { ...attrs }

  if (props.type === 'textarea') {
    baseProps.rows = baseProps.rows || 4
  }

  return baseProps
})

const inputBindings = computed(() => {
  const bindings: Record<string, unknown> = { ...baseInputBindings.value }

  if (props.type === 'password') {
    bindings.class = mergeClassValue(
      bindings.class,
      passwordWrapperClasses.value,
    )
    bindings.inputClass = mergeClassValue(
      bindings.inputClass,
      inputClasses.value,
    )
  } else {
    bindings.class = mergeClassValue(bindings.class, inputClasses.value)
  }

  bindings['aria-describedby'] =
    bindings['aria-describedby'] ||
    (helperText ? `${inputId.value}-helper` : undefined)

  return bindings
})

const helperText = computed(() => attrs.helperText as string | undefined)

// Event handlers
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  // Focus the input after clearing
  setTimeout(() => {
    inputRef.value?.$el?.focus() || inputRef.value?.focus()
  }, 10)
}

// Public methods
const focus = () => {
  inputRef.value?.$el?.focus() || inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.$el?.blur() || inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.$el?.select() || inputRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  inputRef,
})
</script>

<script lang="ts">
export default {
  name: 'BaseInput',
  inheritAttrs: false,
}
</script>
