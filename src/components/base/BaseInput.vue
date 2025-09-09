<template>
  <div class="base-input-group" :class="groupClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block mb-1 text-sm font-medium text-gray-900 transition-colors duration-200"
      :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Input Container -->
    <div class="base-input-container" :class="containerClasses">
      <!-- Left Icon -->
      <Icon
        v-if="icon && iconPosition === 'left'"
        :icon="icon"
        class="text-gray-400 text-base mr-2 flex-shrink-0 z-10" />

      <!-- PrimeVue InputText -->
      <InputText
        :id="inputId"
        ref="inputRef"
        :class="inputClasses"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :model-value="String(modelValue)"
        :data-testid="testId"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        v-bind="$attrs"
        class="primevue-input-override" />

      <!-- Right Icon / Clear Button / Password Toggle -->
      <div
        v-if="showRightIcon || (clearable && modelValue) || showPasswordToggle"
        class="flex items-center gap-2 z-10">
        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="flex items-center justify-center p-0.5 rounded-sm bg-transparent text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
          @click="handleClear"
          :tabindex="-1">
          <Icon icon="mdi:close-circle" />
        </button>

        <!-- Password Toggle Button -->
        <button
          v-if="showPasswordToggle"
          type="button"
          class="flex items-center justify-center p-0.5 rounded-sm bg-transparent text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
          @click="togglePasswordVisibility"
          :tabindex="-1"
          :aria-label="
            showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
          ">
          <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
        </button>

        <!-- Right Icon -->
        <Icon
          v-else-if="icon && iconPosition === 'right'"
          :icon="icon"
          class="text-gray-400 text-base ml-2 flex-shrink-0" />
      </div>
    </div>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="mt-1">
      <span
        v-if="errorMessage"
        class="flex items-center gap-1 text-sm text-red-600"
        :id="`${inputId}-error`"
        role="alert">
        <Icon icon="mdi:alert-circle" />
        {{ errorMessage }}
      </span>
      <span
        v-else-if="helperText"
        class="text-sm text-gray-600"
        :id="`${inputId}-helper`">
        {{ helperText }}
      </span>
    </div>

    <!-- Character Count (if maxlength is set) -->
    <div
      v-if="maxlength && showCharacterCount"
      class="mt-1 text-xs text-gray-400 text-right transition-colors duration-200"
      :class="{ 'text-red-500 font-medium': isOverLimit }">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, nextTick } from 'vue'
  import { Icon } from '@iconify/vue'
  import InputText from 'primevue/inputtext'
  import type { InputProps } from '../../types'

  interface Props extends InputProps {
    modelValue?: string | number
    label?: string
    helperText?: string
    showCharacterCount?: boolean
    showPasswordToggle?: boolean
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
  const isFocused = ref(false)
  const showPassword = ref(false)
  const inputId = ref(`base-input-${Math.random().toString(36).substr(2, 9)}`)

  // Computed properties
  const hasError = computed(
    () => Boolean(props.error) || Boolean(errorMessage.value),
  )
  const hasSuccess = computed(() => props.success && !hasError.value)
  const showRightIcon = computed(
    () =>
      props.icon && props.iconPosition === 'right' && !props.showPasswordToggle,
  )
  const characterCount = computed(() => String(props.modelValue || '').length)
  const isOverLimit = computed(() =>
    props.maxlength ? characterCount.value > props.maxlength : false,
  )
  const inputType = computed(() => {
    if (props.showPasswordToggle && props.type === 'password') {
      return showPassword.value ? 'text' : 'password'
    }
    return props.type
  })
  const showPasswordToggle = computed(
    () =>
      props.showPasswordToggle &&
      props.type === 'password' &&
      !props.disabled &&
      !props.readonly,
  )

  const errorMessage = computed(() => {
    if (typeof props.error === 'string') return props.error
    return props.error ? 'Este campo contiene errores' : ''
  })

  // CSS Classes
  const groupClasses = computed(() => [
    'flex flex-col w-full',
    {
      'opacity-50': props.disabled,
      'opacity-50 cursor-not-allowed': props.readonly,
      '': hasError.value,
      '': hasSuccess.value,
    },
    props.class,
  ])

  const containerClasses = computed(() => [
    'relative flex items-center border border-gray-300 rounded-md bg-white transition-all duration-200 overflow-hidden',
    {
      'pl-2': props.icon && props.iconPosition === 'left',
      'pr-2':
        showRightIcon.value ||
        (props.clearable && props.modelValue) ||
        showPasswordToggle.value,
      'border-orange-500 shadow-sm shadow-orange-500/15': isFocused.value,
      'border-red-500': hasError.value,
      'border-green-500': hasSuccess.value,
      'hover:border-orange-500': !props.disabled && !props.readonly,
      'bg-gray-50 cursor-not-allowed': props.disabled,
      'bg-gray-100': props.readonly,
    },
  ])

  const inputClasses = computed(() => [
    'flex-1 border-0 outline-none bg-transparent text-gray-900 font-normal transition-all duration-200',
    {
      // Size variants
      'h-8 px-3 text-sm': props.size === 'md',
      'h-9 px-4 text-base': props.size === 'lg',
      // Placeholder color
      'placeholder:text-gray-400': true,
      // Disabled state
      'text-gray-400 cursor-not-allowed': props.disabled,
    },
  ])

  const labelClasses = computed(() => ({
    'text-red-500': props.required,
  }))

  // Event handlers
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    const finalValue = props.type === 'number' ? Number(value) : value
    emit('update:modelValue', finalValue)
    emit('input', value)
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
      inputRef.value?.$el?.focus()
    })
  }

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }

  // Public methods
  const focus = () => {
    inputRef.value?.$el?.focus()
  }

  const blur = () => {
    inputRef.value?.$el?.blur()
  }

  const select = () => {
    inputRef.value?.$el?.select()
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
  /* Override PrimeVue default styles */
  ::v-deep(.primevue-input-override) {
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
    width: 100% !important;
    font-size: inherit !important;
    line-height: inherit !important;
  }

  ::v-deep(.primevue-input-override:focus) {
    box-shadow: none !important;
    outline: none !important;
  }

  /* Size variants for PrimeVue input */
  ::v-deep(.primevue-input-override.h-8) {
    height: 2rem !important;
    padding: 0 0.75rem !important;
    font-size: 0.875rem !important;
  }

  ::v-deep(.primevue-input-override.h-9) {
    height: 2.25rem !important;
    padding: 0 1rem !important;
    font-size: 1rem !important;
  }

  /* Disabled state */
  ::v-deep(.primevue-input-override:disabled) {
    background: transparent !important;
    color: rgb(156 163 175) !important;
    cursor: not-allowed !important;
  }

  /* Placeholder color */
  ::v-deep(.primevue-input-override::placeholder) {
    color: rgb(156 163 175) !important;
  }
</style>
