<template>
  <div class="base-input-group" :class="groupClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="base-input-label"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="base-input-required">*</span>
    </label>

    <!-- Input Container -->
    <div class="base-input-container" :class="containerClasses">
      <!-- Left Icon -->
      <Icon
        v-if="icon && iconPosition === 'left'"
        :icon="icon"
        class="base-input-icon base-input-icon--left" />

      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :class="inputClasses"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :value="modelValue"
        :data-testid="testId"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        v-bind="$attrs" />

      <!-- Right Icon / Clear Button -->
      <div
        v-if="showRightIcon || (clearable && modelValue)"
        class="base-input-icon-container">
        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="base-input-clear"
          @click="handleClear"
          :tabindex="-1">
          <Icon icon="mdi:close-circle" />
        </button>

        <!-- Right Icon -->
        <Icon
          v-else-if="icon && iconPosition === 'right'"
          :icon="icon"
          class="base-input-icon base-input-icon--right" />
      </div>
    </div>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="base-input-message">
      <span
        v-if="errorMessage"
        class="base-input-error"
        :id="`${inputId}-error`"
        role="alert">
        <Icon icon="mdi:alert-circle" />
        {{ errorMessage }}
      </span>
      <span
        v-else-if="helperText"
        class="base-input-helper"
        :id="`${inputId}-helper`">
        {{ helperText }}
      </span>
    </div>

    <!-- Character Count (if maxlength is set) -->
    <div
      v-if="maxlength && showCharacterCount"
      class="base-input-count"
      :class="{ 'base-input-count--over': isOverLimit }">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, nextTick } from 'vue'
  import { Icon } from '@iconify/vue'
  import type { InputProps } from '../../types'

  interface Props extends InputProps {
    modelValue?: string | number
    label?: string
    helperText?: string
    showCharacterCount?: boolean
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
    modelValue: '',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number]
    'input': [event: Event]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
    'clear': []
    'keydown': [event: KeyboardEvent]
  }>()

  const inputRef = ref<HTMLInputElement>()
  const isFocused = ref(false)
  const inputId = ref(`base-input-${Math.random().toString(36).substr(2, 9)}`)

  // Computed properties
  const hasError = computed(
    () => Boolean(props.error) || Boolean(errorMessage.value),
  )
  const hasSuccess = computed(() => props.success && !hasError.value)
  const showRightIcon = computed(
    () => props.icon && props.iconPosition === 'right',
  )
  const characterCount = computed(() => String(props.modelValue || '').length)
  const isOverLimit = computed(() =>
    props.maxlength ? characterCount.value > props.maxlength : false,
  )

  const errorMessage = computed(() => {
    if (typeof props.error === 'string') return props.error
    return props.error ? 'Este campo contiene errores' : ''
  })

  // CSS Classes
  const groupClasses = computed(() => [
    'base-input-group',
    `base-input-group--${props.size}`,
    {
      'base-input-group--disabled': props.disabled,
      'base-input-group--readonly': props.readonly,
      'base-input-group--error': hasError.value,
      'base-input-group--success': hasSuccess.value,
      'base-input-group--focused': isFocused.value,
    },
    props.class,
  ])

  const containerClasses = computed(() => [
    'base-input-container',
    {
      'base-input-container--has-left-icon':
        props.icon && props.iconPosition === 'left',
      'base-input-container--has-right-icon':
        showRightIcon.value || (props.clearable && props.modelValue),
    },
  ])

  const inputClasses = computed(() => [
    'base-input',
    `base-input--${props.size}`,
  ])

  const labelClasses = computed(() => ({
    'base-input-label--required': props.required,
  }))

  // Event handlers
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = props.type === 'number' ? Number(target.value) : target.value
    emit('update:modelValue', value)
    emit('input', event)
  }

  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }

  const handleKeydown = (event: KeyboardEvent) => {
    emit('keydown', event)
  }

  const handleClear = () => {
    emit('update:modelValue', '')
    emit('clear')
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  // Public methods
  const focus = () => {
    inputRef.value?.focus()
  }

  const blur = () => {
    inputRef.value?.blur()
  }

  const select = () => {
    inputRef.value?.select()
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

<style scoped>
  .base-input-group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* =============================================================================
     LABEL STYLES
     ============================================================================= */

  .base-input-label {
    display: block;
    margin-bottom: var(--form-label-spacing);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    transition: color var(--transition-fast);
  }

  .base-input-label--required {
    .base-input-required {
      color: var(--color-error);
      margin-left: 2px;
    }
  }

  /* =============================================================================
     INPUT CONTAINER
     ============================================================================= */

  .base-input-container {
    position: relative;
    display: flex;
    align-items: center;
    border: var(--input-border-width) solid var(--input-border-color);
    border-radius: var(--radius-md);
    background: var(--color-background);
    transition: all var(--transition-fast);
    overflow: hidden;
  }

  .base-input-container:hover:not(
      .base-input-group--disabled .base-input-container
    ) {
    border-color: var(--color-primary);
  }

  .base-input-container--has-left-icon {
    padding-left: var(--space-xs);
  }

  .base-input-container--has-right-icon {
    padding-right: var(--space-xs);
  }

  /* =============================================================================
     INPUT ELEMENT
     ============================================================================= */

  .base-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text-primary);
    font-family: var(--font-family-primary);
    font-weight: var(--font-weight-normal);
    transition: all var(--transition-fast);

    &::placeholder {
      color: var(--color-text-tertiary);
    }

    &:disabled {
      color: var(--state-disabled-color);
      cursor: var(--state-disabled-cursor);

      &::placeholder {
        color: var(--state-disabled-color);
      }
    }
  }

  /* Size variants */
  .base-input--sm {
    height: var(--input-height-sm);
    padding: var(--input-padding-sm);
    font-size: var(--font-size-sm);
  }

  .base-input--md {
    height: var(--input-height-md);
    padding: var(--input-padding-md);
    font-size: var(--font-size-base);
  }

  .base-input--lg {
    height: var(--input-height-lg);
    padding: var(--input-padding-lg);
    font-size: var(--font-size-lg);
  }

  /* =============================================================================
     ICON STYLES
     ============================================================================= */

  .base-input-icon {
    color: var(--color-text-secondary);
    font-size: 18px;
    transition: color var(--transition-fast);
  }

  .base-input-icon--left {
    margin-right: var(--space-xs);
  }

  .base-input-icon--right {
    margin-left: var(--space-xs);
  }

  .base-input-icon-container {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  /* Clear button */
  .base-input-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      color: var(--color-text-secondary);
      background: var(--color-background-tertiary);
    }
  }

  /* =============================================================================
     STATE VARIANTS
     ============================================================================= */

  /* Focused state */
  .base-input-group--focused .base-input-container {
    border-color: var(--input-border-color-focus);
    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
  }

  .base-input-group--focused .base-input-icon {
    color: var(--color-primary);
  }

  /* Error state */
  .base-input-group--error .base-input-container {
    border-color: var(--input-border-color-error);
  }

  .base-input-group--error .base-input-container:hover {
    border-color: var(--input-border-color-error);
  }

  .base-input-group--error .base-input-label {
    color: var(--color-error);
  }

  .base-input-group--error .base-input-icon {
    color: var(--color-error);
  }

  /* Success state */
  .base-input-group--success .base-input-container {
    border-color: var(--input-border-color-success);
  }

  .base-input-group--success .base-input-icon {
    color: var(--color-success);
  }

  /* Disabled state */
  .base-input-group--disabled {
    opacity: var(--state-disabled-opacity);

    .base-input-container {
      background: var(--state-disabled-bg);
      cursor: var(--state-disabled-cursor);
    }

    .base-input-label {
      color: var(--state-disabled-color);
    }
  }

  /* Readonly state */
  .base-input-group--readonly .base-input-container {
    background: var(--color-background-secondary);
  }

  /* =============================================================================
     MESSAGE STYLES
     ============================================================================= */

  .base-input-message {
    margin-top: calc(var(--space-xs) / 2);
  }

  .base-input-error {
    display: flex;
    align-items: center;
    gap: calc(var(--space-xs) / 2);
    font-size: var(--font-size-sm);
    color: var(--form-error-color);
  }

  .base-input-helper {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  /* Character count */
  .base-input-count {
    margin-top: calc(var(--space-xs) / 2);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    text-align: right;
    transition: color var(--transition-fast);
  }

  .base-input-count--over {
    color: var(--color-error);
    font-weight: var(--font-weight-medium);
  }

  /* =============================================================================
     SIZE ADJUSTMENTS
     ============================================================================= */

  .base-input-group--sm {
    .base-input-icon {
      font-size: 16px;
    }
  }

  .base-input-group--lg {
    .base-input-icon {
      font-size: 20px;
    }
  }

  /* =============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================= */

  @media (max-width: 640px) {
    .base-input-group--lg {
      .base-input {
        height: var(--input-height-md);
        padding: var(--input-padding-md);
        font-size: var(--font-size-base);
      }
    }
  }
</style>
