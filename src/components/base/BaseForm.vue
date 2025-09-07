<template>
  <BaseCard
    :loading="loading"
    v-bind="$attrs">
    <form
      :class="formClasses"
      :id="id"
      :data-testid="testId"
      @submit.prevent="handleSubmit"
      novalidate
    >
      <!-- Form Title -->
      <header
        v-if="title || subtitle"
        class="base-form-header">
        <h2
          v-if="title"
          class="base-form-title">
          {{ title }}
        </h2>
        <p
          v-if="subtitle"
          class="base-form-subtitle">
          {{ subtitle }}
        </p>
      </header>

      <!-- Form Fields (Dynamic) -->
      <div
        v-if="fields && fields.length > 0"
        class="base-form-fields">
        <div
          v-for="field in fields"
          :key="field.name"
          class="base-form-field">
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
            @blur="validateField(field.name)"
          />

          <!-- Textarea Field -->
          <div
            v-else-if="field.type === 'textarea'"
            class="base-form-textarea-group"
          >
            <label
              v-if="field.label"
              :for="`${field.name}-textarea`"
              class="base-form-label"
            >
              {{ field.label }}
              <span
                v-if="field.required"
                class="base-form-required"
              >*</span
              >
            </label>
            <textarea
              :id="`${field.name}-textarea`"
              v-model="formData[field.name]"
              class="base-form-textarea"
              :class="{
                'base-form-textarea--error': getFieldError(field.name),
              }"
              :placeholder="field.placeholder"
              :required="field.required"
              :disabled="field.disabled || loading"
              :maxlength="field.validation?.maxLength"
              :minlength="field.validation?.minLength"
              rows="4"
              @blur="validateField(field.name)"
            >
            </textarea>
            <span
              v-if="getFieldError(field.name)"
              class="base-form-error">
              {{ getFieldError(field.name) }}
            </span>
          </div>

          <!-- Select Field -->
          <div
            v-else-if="field.type === 'select'"
            class="base-form-select-group"
          >
            <label
              v-if="field.label"
              :for="`${field.name}-select`"
              class="base-form-label"
            >
              {{ field.label }}
              <span
                v-if="field.required"
                class="base-form-required"
              >*</span
              >
            </label>
            <select
              :id="`${field.name}-select`"
              v-model="formData[field.name]"
              class="base-form-select"
              :class="{ 'base-form-select--error': getFieldError(field.name) }"
              :required="field.required"
              :disabled="field.disabled || loading"
              @change="validateField(field.name)"
            >
              <option value="">
                {{ field.placeholder || 'Seleccionar...' }}
              </option>
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span
              v-if="getFieldError(field.name)"
              class="base-form-error">
              {{ getFieldError(field.name) }}
            </span>
          </div>

          <!-- Checkbox Field -->
          <div
            v-else-if="field.type === 'checkbox'"
            class="base-form-checkbox-group"
          >
            <label class="base-form-checkbox-label">
              <input
                type="checkbox"
                v-model="formData[field.name]"
                class="base-form-checkbox"
                :required="field.required"
                :disabled="field.disabled || loading"
                @change="validateField(field.name)"
              />
              <span class="base-form-checkbox-text">
                {{ field.label }}
                <span
                  v-if="field.required"
                  class="base-form-required"
                >*</span
                >
              </span>
            </label>
            <span
              v-if="getFieldError(field.name)"
              class="base-form-error">
              {{ getFieldError(field.name) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Custom Form Content (Slot) -->
      <div
        v-if="!fields || fields.length === 0"
        class="base-form-content">
        <slot />
      </div>

      <!-- Form Actions -->
      <footer
        class="base-form-actions"
        v-if="showSubmit || showCancel || $slots.actions"
      >
        <slot name="actions">
          <BaseButton
            v-if="showCancel"
            type="button"
            variant="ghost"
            :disabled="loading"
            @click="handleCancel"
          >
            {{ cancelText }}
          </BaseButton>

          <BaseButton
            v-if="showSubmit"
            type="submit"
            variant="primary"
            :loading="loading"
            :disabled="!isFormValid"
          >
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
  'base-form',
  `base-form--${props.layout}`,
  {
    'base-form--loading': props.loading,
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
  if (field.required && (value === null || value === undefined || value === '')) {
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

<style scoped>
.base-form-container {
  width: 100%;
}

.base-form {
  display: flex;
  flex-direction: column;
  gap: var(--form-gap);
}

/* =============================================================================
     FORM HEADER
     ============================================================================= */

.base-form-header {
  margin-bottom: var(--space-lg);
  text-align: center;
}

.base-form-title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.base-form-subtitle {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

/* =============================================================================
     FORM FIELDS
     ============================================================================= */

.base-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--form-gap);
}

.base-form-field {
  width: 100%;
}

.base-form-content {
  display: flex;
  flex-direction: column;
  gap: var(--form-gap);
}

/* Layout variants */
.base-form--horizontal .base-form-fields {
  gap: var(--space-lg);
}

.base-form--horizontal .base-form-field {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: start;
  gap: var(--space-md);
}

.base-form--inline .base-form-fields {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.base-form--inline .base-form-field {
  flex: 1;
  min-width: 200px;
}

/* =============================================================================
     FORM ELEMENTS
     ============================================================================= */

.base-form-label {
  display: block;
  margin-bottom: var(--form-label-spacing);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.base-form-required {
  color: var(--form-error-color);
  margin-left: 2px;
}

/* Textarea */
.base-form-textarea {
  width: 100%;
  padding: var(--input-padding-md);
  border: 1px solid var(--input-border-color);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  resize: vertical;
  min-height: 100px;
  transition: border-color var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--input-border-color-focus);
    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
}

.base-form-textarea--error {
  border-color: var(--input-border-color-error);
}

/* Select */
.base-form-select {
  width: 100%;
  height: var(--input-height-md);
  padding: var(--input-padding-md);
  border: 1px solid var(--input-border-color);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--input-border-color-focus);
    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
  }
}

.base-form-select--error {
  border-color: var(--input-border-color-error);
}

/* Checkbox */
.base-form-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.base-form-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.base-form-checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.base-form-checkbox-text {
  color: var(--color-text-primary);
}

/* Error message */
.base-form-error {
  display: block;
  margin-top: calc(var(--space-xs) / 2);
  font-size: var(--font-size-sm);
  color: var(--form-error-color);
}

/* =============================================================================
     FORM ACTIONS
     ============================================================================= */

.base-form-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.base-form--horizontal .base-form-actions {
  justify-content: flex-end;
}

.base-form--vertical .base-form-actions {
  justify-content: center;
}

/* =============================================================================
     RESPONSIVE DESIGN
     ============================================================================= */

@media (max-width: 768px) {
  .base-form--horizontal .base-form-field {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }

  .base-form--inline .base-form-fields {
    flex-direction: column;
  }

  .base-form--inline .base-form-field {
    min-width: unset;
  }

  .base-form-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

/* =============================================================================
     LOADING STATE
     ============================================================================= */

.base-form--loading {
  pointer-events: none;
  user-select: none;
}
</style>
