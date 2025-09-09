<template>
  <BaseCard :loading="loading" v-bind="$attrs">
    <form
      :class="formClasses"
      :id="id"
      :data-testid="testId"
      @submit.prevent="handleSubmit"
      novalidate>
      <!-- Form Title -->
      <header v-if="title || subtitle" class="mb-6">
        <h2
          v-if="title"
          class="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-base text-gray-600 leading-normal">
          {{ subtitle }}
        </p>
      </header>

      <!-- Form Fields (Dynamic) -->
      <div v-if="fields && fields.length > 0" class="space-y-6">
        <div v-for="field in fields" :key="field.name" class="space-y-2">
          <!-- Input Field -->
          <BaseInput
            v-if="field.type === 'input'"
            v-model="formData[field.name]"
            :label="field.label"
            :type="getInputType(field)"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="field.disabled || loading"
            :error="getFieldError(field.name)"
            :maxlength="field.validation?.maxLength"
            :minlength="field.validation?.minLength"
            :pattern="field.validation?.pattern"
            @blur="validateField(field.name)" />

          <!-- Textarea Field -->
          <div v-else-if="field.type === 'textarea'" class="space-y-2">
            <label
              v-if="field.label"
              :for="`${field.name}-textarea`"
              class="block text-sm font-medium text-gray-900">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </label>
            <textarea
              :id="`${field.name}-textarea`"
              v-model="formData[field.name]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical min-h-24 text-gray-900 placeholder-gray-400"
              :class="{
                'border-red-500': getFieldError(field.name),
              }"
              :placeholder="field.placeholder"
              :required="field.required"
              :disabled="field.disabled || loading"
              :maxlength="field.validation?.maxLength"
              :minlength="field.validation?.minLength"
              rows="4"
              @blur="validateField(field.name)">
            </textarea>
            <span
              v-if="getFieldError(field.name)"
              class="text-sm text-red-600 flex items-center gap-1">
              <Icon icon="mdi:alert-circle" />
              {{ getFieldError(field.name) }}
            </span>
          </div>

          <!-- Select Field -->
          <div v-else-if="field.type === 'select'" class="space-y-2">
            <label
              v-if="field.label"
              :for="`${field.name}-select`"
              class="block text-sm font-medium text-gray-900">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </label>
            <select
              :id="`${field.name}-select`"
              v-model="formData[field.name]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              :class="{ 'border-red-500': getFieldError(field.name) }"
              :required="field.required"
              :disabled="field.disabled || loading"
              @change="validateField(field.name)">
              <option value="">
                {{ field.placeholder || 'Seleccionar...' }}
              </option>
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <span
              v-if="getFieldError(field.name)"
              class="text-sm text-red-600 flex items-center gap-1">
              <Icon icon="mdi:alert-circle" />
              {{ getFieldError(field.name) }}
            </span>
          </div>

          <!-- Checkbox Field -->
          <div v-else-if="field.type === 'checkbox'" class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="formData[field.name]"
                class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                :required="field.required"
                :disabled="field.disabled || loading"
                @change="validateField(field.name)" />
              <span class="text-sm text-gray-900">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500 ml-1">*</span>
              </span>
            </label>
            <span
              v-if="getFieldError(field.name)"
              class="text-sm text-red-600 flex items-center gap-1">
              <Icon icon="mdi:alert-circle" />
              {{ getFieldError(field.name) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Custom Form Content (Slot) -->
      <div v-if="!fields || fields.length === 0" class="flex-1">
        <slot />
      </div>

      <!-- Form Actions -->
      <footer
        class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"
        v-if="showSubmit || showCancel || $slots.actions">
        <slot name="actions">
          <BaseButton
            v-if="showCancel"
            type="button"
            variant="ghost"
            :disabled="loading"
            @click="handleCancel">
            {{ cancelText }}
          </BaseButton>

          <BaseButton
            v-if="showSubmit"
            type="submit"
            variant="primary"
            :loading="loading"
            :disabled="!isFormValid">
            {{ submitText }}
          </BaseButton>
        </slot>
      </footer>
    </form>
  </BaseCard>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import BaseCard from './BaseCard.vue'
  import BaseButton from './BaseButton.vue'
  import BaseInput from './BaseInput.vue'
  import type { FormProps, FormField, InputType } from '../../types'

  interface Props extends FormProps {
    title?: string
    subtitle?: string
    modelValue?: Record<string, any>
  }

  const props = withDefaults(defineProps<Props>(), {
    layout: 'vertical',
    loading: false,
    showSubmit: true,
    submitText: 'Enviar',
    showCancel: false,
    cancelText: 'Cancelar',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: Record<string, any>]
    'submit': [data: Record<string, any>]
    'cancel': []
    'field-change': [fieldName: string, value: any]
    'field-error': [fieldName: string, error: string | null]
  }>()

  const formData = reactive<Record<string, any>>({})
  const fieldErrors = ref<Record<string, string>>({})
  const touchedFields = ref<Set<string>>(new Set())

  // Initialize form data
  if (props.modelValue) {
    Object.assign(formData, props.modelValue)
  }

  // Initialize empty fields
  if (props.fields) {
    props.fields.forEach((field) => {
      if (!(field.name in formData)) {
        formData[field.name] = getDefaultValue(field)
      }
    })
  }

  // Computed properties
  const formClasses = computed(() => [
    'space-y-6',
    {
      'opacity-50 pointer-events-none': props.loading,
    },
  ])

  const isFormValid = computed(() => {
    if (!props.fields) return true

    // Check required fields
    const hasRequiredFields = props.fields.some((field) => field.required)
    if (!hasRequiredFields) return true

    // Validate all required fields are filled and have no errors
    return props.fields
      .filter((field) => field.required)
      .every((field) => {
        const value = formData[field.name]
        const hasValue = value !== null && value !== undefined && value !== ''
        const hasError = fieldErrors.value[field.name]
        return hasValue && !hasError
      })
  })

  // Watch for external model changes
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue && newValue !== formData) {
        Object.assign(formData, newValue)
      }
    },
    { deep: true },
  )

  // Watch for internal form changes
  watch(
    formData,
    (newData) => {
      emit('update:modelValue', { ...newData })
    },
    { deep: true },
  )

  // Helper functions
  function getDefaultValue(field: FormField) {
    switch (field.type) {
      case 'checkbox':
        return false
      case 'select':
        return ''
      default:
        return ''
    }
  }

  function getInputType(field: FormField): InputType {
    // Map field validation to input types
    if (field.validation?.pattern) {
      const pattern = field.validation.pattern
      if (pattern.includes('@')) return 'email'
      if (pattern.includes('\\d')) return 'tel'
    }
    return 'text'
  }

  function getFieldError(fieldName: string): string | boolean | undefined {
    const error = fieldErrors.value[fieldName]
    return error || undefined
  }

  function validateField(fieldName: string): boolean {
    if (!props.fields) return true

    const field = props.fields.find((f) => f.name === fieldName)
    if (!field) return true

    touchedFields.value.add(fieldName)
    const value = formData[fieldName]
    let error: string | null = null

    // Required validation
    if (
      field.required &&
      (value === null || value === undefined || value === '')
    ) {
      error = `${field.label || fieldName} es requerido`
    }

    // Length validations
    if (value && field.validation) {
      const validation = field.validation
      const valueLength = String(value).length

      if (validation.minLength && valueLength < validation.minLength) {
        error = `Mínimo ${validation.minLength} caracteres`
      }

      if (validation.maxLength && valueLength > validation.maxLength) {
        error = `Máximo ${validation.maxLength} caracteres`
      }

      if (validation.min && Number(value) < validation.min) {
        error = `Valor mínimo: ${validation.min}`
      }

      if (validation.max && Number(value) > validation.max) {
        error = `Valor máximo: ${validation.max}`
      }

      // Pattern validation
      if (validation.pattern && value) {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(String(value))) {
          error = 'Formato no válido'
        }
      }

      // Custom validation
      if (validation.custom) {
        const customResult = validation.custom(value)
        if (typeof customResult === 'string') {
          error = customResult
        }
      }
    }

    if (error) {
      fieldErrors.value[fieldName] = error
    } else {
      delete fieldErrors.value[fieldName]
    }

    emit('field-error', fieldName, error)
    return !error
  }

  function validateForm(): boolean {
    if (!props.fields) return true

    let isValid = true
    props.fields.forEach((field) => {
      const fieldValid = validateField(field.name)
      if (!fieldValid) isValid = false
    })

    return isValid
  }

  // Event handlers
  function handleSubmit() {
    if (!validateForm()) return

    emit('submit', { ...formData })
  }

  function handleCancel() {
    emit('cancel')
  }

  // Public methods
  const resetForm = () => {
    if (props.fields) {
      props.fields.forEach((field) => {
        formData[field.name] = getDefaultValue(field)
      })
    }
    fieldErrors.value = {}
    touchedFields.value.clear()
  }

  const setFieldValue = (fieldName: string, value: any) => {
    formData[fieldName] = value
    emit('field-change', fieldName, value)
  }

  const setFieldError = (fieldName: string, error: string | null) => {
    if (error) {
      fieldErrors.value[fieldName] = error
    } else {
      delete fieldErrors.value[fieldName]
    }
  }

  defineExpose({
    resetForm,
    validateForm,
    setFieldValue,
    setFieldError,
    formData: computed(() => formData),
    isValid: isFormValid,
  })
</script>

<script lang="ts">
  export default {
    name: 'BaseForm',
    inheritAttrs: false,
  }
</script>
