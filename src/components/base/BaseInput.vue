<template>
  <div class="base-input-wrapper" :class="wrapperClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="base-input-label"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Group para inputs con iconos -->
    <InputGroup v-if="hasInputGroup" class="base-input-group">
      <!-- Left Icon Addon -->
      <InputGroupAddon v-if="icon && iconPosition === 'left'">
        <Icon :icon="icon" />
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
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        v-bind="inputProps" />

      <!-- Right Icon Addon -->
      <InputGroupAddon v-if="icon && iconPosition === 'right'">
        <Icon :icon="icon" />
      </InputGroupAddon>

      <!-- Clear Button Addon -->
      <InputGroupAddon v-if="clearable && modelValue && !disabled && !readonly">
        <Button
          icon="pi pi-times"
          severity="secondary"
          variant="text"
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
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
      v-bind="inputProps" />

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="base-input-help">
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
        class="base-input-helper"
        :id="`${inputId}-helper`">
        {{ helperText }}
      </small>
    </div>

    <!-- Character Count -->
    <div
      v-if="maxlength && showCharacterCount"
      class="base-input-count"
      :class="{ 'text-red-500': isOverLimit }">
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
  import Button from 'primevue/button'
  import Message from 'primevue/message'
  import type { InputProps } from '../../types'

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
  const inputProps = computed(() => {
    const baseProps = { ...useAttrs() }

    if (props.type === 'textarea') {
      baseProps.rows = baseProps.rows || 4
    }

    return baseProps
  })

  // CSS Classes
  const wrapperClasses = computed(() => [
    'base-input-wrapper',
    {
      'opacity-75': props.disabled,
      'base-input-error': hasError.value,
      'base-input-success': hasSuccess.value,
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

<style scoped>
  /* Usar el diseño nativo de PrimeVue, solo agregar espaciado y utilidades */
  .base-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .base-input-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--p-text-color);
    margin-bottom: 0.25rem;
    transition: color 0.2s;
  }

  .base-input-group {
    width: 100%;
  }

  .base-input-help {
    margin-top: 0.25rem;
  }

  .base-input-helper {
    font-size: 0.75rem;
    color: var(--p-text-muted-color);
    display: block;
  }

  .base-input-count {
    font-size: 0.75rem;
    color: var(--p-text-muted-color);
    text-align: right;
    margin-top: 0.25rem;
    transition: color 0.2s;
  }

  /* Estados de error y éxito */
  .base-input-error .base-input-label {
    color: var(--p-red-500);
  }

  .base-input-success .base-input-label {
    color: var(--p-green-500);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-input-label {
      font-size: 0.8125rem;
    }

    .base-input-helper,
    .base-input-count {
      font-size: 0.6875rem;
    }
  }
</style>
